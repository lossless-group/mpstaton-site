<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { formatDuration } from '../../lib/youtube-playlist-types';
  import type { PlaylistItem } from '../../lib/youtube-playlist-types';

  export let items: PlaylistItem[] = [];
  export let playlistId: string;
  export let iframeId: string;
  export let initialIndex: number = 0;
  export let totalCount: number = 0;
  export let overflow: boolean = false;

  let activeIndex = initialIndex;
  let player: any = null;
  let pollHandle: number | null = null;

  // Loads the YouTube IFrame API script (idempotent across instances).
  function ensureYouTubeApi(): Promise<void> {
    return new Promise((resolve) => {
      const w = window as any;
      if (w.YT && w.YT.Player) { resolve(); return; }
      // Multiple sidebars on one page share the readiness event
      const prev = w.onYouTubeIframeAPIReady;
      w.onYouTubeIframeAPIReady = () => {
        if (typeof prev === 'function') prev();
        resolve();
      };
      if (!document.querySelector('script[data-yt-iframe-api]')) {
        const s = document.createElement('script');
        s.src = 'https://www.youtube.com/iframe_api';
        s.dataset.ytIframeApi = '';
        document.head.appendChild(s);
      }
    });
  }

  function attachPlayer() {
    const w = window as any;
    if (!w.YT?.Player) return;
    const iframe = document.getElementById(iframeId);
    if (!iframe) return;
    player = new w.YT.Player(iframeId, {
      events: {
        onReady: syncFromPlayer,
        onStateChange: syncFromPlayer,
      },
    });
  }

  // The IFrame API doesn't fire a dedicated "playlist index changed" event,
  // so on every state change (and on a slow poll) we read getPlaylistIndex().
  function syncFromPlayer() {
    if (!player?.getPlaylistIndex) return;
    try {
      const idx = player.getPlaylistIndex();
      if (typeof idx === 'number' && idx >= 0 && idx < items.length) {
        activeIndex = idx;
      }
    } catch {/* iframe not ready yet */}
  }

  function handleClick(i: number) {
    if (items[i]?.unavailable) return;
    if (player?.playVideoAt) {
      player.playVideoAt(i);
      activeIndex = i;
    } else {
      // Pre-hydration fallback: navigate to the YouTube page
      const item = items[i];
      window.open(
        `https://www.youtube.com/watch?v=${item.videoId}&list=${playlistId}&index=${i + 1}`,
        '_blank',
        'noopener'
      );
    }
  }

  onMount(async () => {
    await ensureYouTubeApi();
    attachPlayer();
    // Poll every 2s as a backstop — onStateChange covers most transitions
    // but a user clicking inside the iframe (on YouTube's own next-button)
    // doesn't always fire onStateChange in the parent.
    pollHandle = window.setInterval(syncFromPlayer, 2000);
  });

  onDestroy(() => {
    if (pollHandle != null) clearInterval(pollHandle);
    if (player?.destroy) try { player.destroy(); } catch {}
  });
</script>

<div class="playlist-sidebar">
  <ol class="playlist-sidebar__list" aria-label="Playlist videos">
    {#each items as item, i (item.videoId + '-' + item.position)}
      <li
        class="playlist-sidebar__item"
        class:active={activeIndex === i}
        class:unavailable={item.unavailable}
      >
        <button
          type="button"
          on:click={() => handleClick(i)}
          disabled={item.unavailable}
          aria-current={activeIndex === i ? 'true' : undefined}
        >
          <span class="playlist-sidebar__position">{i + 1}</span>
          <img
            class="playlist-sidebar__thumb"
            src={item.thumbnail}
            alt=""
            loading="lazy"
            width="80"
            height="45"
          />
          <span class="playlist-sidebar__meta">
            <span class="playlist-sidebar__title">{item.title}</span>
            {#if item.duration}
              <span class="playlist-sidebar__duration">{formatDuration(item.duration)}</span>
            {/if}
          </span>
        </button>
      </li>
    {/each}
  </ol>
  {#if overflow}
    <a
      class="playlist-sidebar__overflow"
      href={`https://www.youtube.com/playlist?list=${playlistId}`}
      target="_blank"
      rel="noopener"
    >
      Show all {totalCount} videos on YouTube →
    </a>
  {/if}
</div>

<style>
  .playlist-sidebar {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
    background: var(--card, rgba(255, 255, 255, 0.04));
    border: 1px solid var(--border, rgba(145, 56, 224, 0.18));
    border-radius: 12px;
    overflow: hidden;
  }
  .playlist-sidebar__list {
    list-style: none;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex: 1;
  }
  .playlist-sidebar__item {
    border-bottom: 1px solid var(--border, rgba(145, 56, 224, 0.08));
  }
  .playlist-sidebar__item:last-child {
    border-bottom: none;
  }
  .playlist-sidebar__item button {
    display: grid;
    grid-template-columns: 1.6rem 80px 1fr;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    padding: 0.55rem 0.75rem;
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    color: var(--foreground, #e2e8f0);
    font-family: inherit;
    transition: background-color 0.12s;
  }
  .playlist-sidebar__item button:hover:not(:disabled),
  .playlist-sidebar__item button:focus-visible:not(:disabled) {
    background: rgba(4, 229, 229, 0.07);
    outline: none;
  }
  .playlist-sidebar__item.active button {
    background: rgba(4, 229, 229, 0.14);
    border-left: 3px solid var(--brand-aqua, #04E5E5);
    padding-left: calc(0.75rem - 3px);
  }
  .playlist-sidebar__item.unavailable button {
    opacity: 0.45;
    cursor: not-allowed;
  }
  .playlist-sidebar__item.unavailable .playlist-sidebar__title {
    text-decoration: line-through;
  }
  .playlist-sidebar__position {
    color: var(--muted-foreground, #94a3b8);
    font-size: 0.75rem;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .playlist-sidebar__thumb {
    width: 80px;
    height: 45px;
    object-fit: cover;
    border-radius: 4px;
    background: #000;
  }
  .playlist-sidebar__meta {
    display: flex;
    flex-direction: column;
    gap: 0.2rem;
    min-width: 0;
  }
  .playlist-sidebar__title {
    font-size: 0.85rem;
    line-height: 1.25;
    color: var(--foreground, #e2e8f0);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .playlist-sidebar__duration {
    font-size: 0.72rem;
    color: var(--muted-foreground, #94a3b8);
    font-variant-numeric: tabular-nums;
  }
  .playlist-sidebar__overflow {
    display: block;
    padding: 0.6rem 0.9rem;
    text-align: center;
    color: var(--brand-aqua, #04E5E5);
    font-size: 0.85rem;
    text-decoration: none;
    border-top: 1px solid var(--border, rgba(145, 56, 224, 0.18));
    flex-shrink: 0;
  }
  .playlist-sidebar__overflow:hover,
  .playlist-sidebar__overflow:focus-visible {
    background: rgba(4, 229, 229, 0.08);
    text-decoration: underline;
  }
</style>

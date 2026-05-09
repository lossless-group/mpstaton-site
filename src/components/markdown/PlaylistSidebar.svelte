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

  let sidebarEl: HTMLDivElement | null = null;
  let listEl: HTMLOListElement | null = null;
  let scrollEl: HTMLElement | null = null;
  let isAtTop = true;
  let isAtBottom = false;
  const SCROLL_BY_ITEMS = 5;

  // Loads the YouTube IFrame API script (idempotent across instances).
  function ensureYouTubeApi(): Promise<void> {
    return new Promise((resolve) => {
      const w = window as any;
      if (w.YT && w.YT.Player) { resolve(); return; }
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
      const item = items[i];
      window.open(
        `https://www.youtube.com/watch?v=${item.videoId}&list=${playlistId}&index=${i + 1}`,
        '_blank',
        'noopener'
      );
    }
  }

  // Walks up from the sidebar root looking for the nearest scrollable ancestor.
  // For inline desktop the answer is `.yt-pl-scroller`; inside the mobile
  // full-screen panel it's `.mfp__panel-body`. Either works as the scroll target.
  function findScrollContainer(el: HTMLElement | null): HTMLElement | null {
    let current: HTMLElement | null = el?.parentElement ?? null;
    while (current && current !== document.body) {
      const style = getComputedStyle(current);
      const oy = style.overflowY;
      if (oy === 'auto' || oy === 'scroll') return current;
      current = current.parentElement;
    }
    return null;
  }

  function updateEdges() {
    if (!scrollEl) return;
    isAtTop = scrollEl.scrollTop < 4;
    isAtBottom =
      scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4;
  }

  function scrollByN(n: number) {
    if (!scrollEl || !listEl) return;
    const firstItem = listEl.querySelector('li');
    const itemHeight = firstItem?.getBoundingClientRect().height ?? 64;
    scrollEl.scrollBy({ top: n * itemHeight, behavior: 'smooth' });
  }

  onMount(async () => {
    scrollEl = findScrollContainer(sidebarEl);
    if (scrollEl) {
      scrollEl.addEventListener('scroll', updateEdges, { passive: true });
      // Defer initial measurement until layout settles
      requestAnimationFrame(() => requestAnimationFrame(updateEdges));
    }
    await ensureYouTubeApi();
    attachPlayer();
    pollHandle = window.setInterval(syncFromPlayer, 2000);
  });

  onDestroy(() => {
    if (scrollEl) scrollEl.removeEventListener('scroll', updateEdges);
    if (pollHandle != null) clearInterval(pollHandle);
    if (player?.destroy) try { player.destroy(); } catch {}
  });
</script>

<div class="playlist-sidebar" bind:this={sidebarEl}>
  <div class="playlist-sidebar__btn-bar playlist-sidebar__btn-bar--top">
    <button
      type="button"
      class="playlist-sidebar__scroll-btn"
      on:click={() => scrollByN(-SCROLL_BY_ITEMS)}
      disabled={isAtTop}
      aria-label={`Scroll up ${SCROLL_BY_ITEMS} videos`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="18 15 12 9 6 15" />
      </svg>
      <span>Up {SCROLL_BY_ITEMS}</span>
    </button>
  </div>

  <ol class="playlist-sidebar__list" bind:this={listEl} aria-label="Playlist videos">
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

  <div class="playlist-sidebar__btn-bar playlist-sidebar__btn-bar--bottom">
    <button
      type="button"
      class="playlist-sidebar__scroll-btn"
      on:click={() => scrollByN(SCROLL_BY_ITEMS)}
      disabled={isAtBottom}
      aria-label={`Scroll down ${SCROLL_BY_ITEMS} videos`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="6 9 12 15 18 9" />
      </svg>
      <span>Down {SCROLL_BY_ITEMS}</span>
    </button>
  </div>

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
  /* The wrapper component (.yt-pl-scroller) is the scroll container — it has
     `overflow-y: auto` and the `max-height` cap. This sidebar lays out as a
     normal block; the buttons use `position: sticky` to pin to the top and
     bottom of the wrapper's scroll viewport, the list flows naturally between
     them, and wheel/touchpad scroll just works. */
  .playlist-sidebar {
    display: block;
  }

  .playlist-sidebar__btn-bar {
    position: sticky;
    z-index: 2;
    display: flex;
    justify-content: center;
    padding: 0.4rem;
    background: var(--card, rgba(20, 18, 30, 0.92));
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  .playlist-sidebar__btn-bar--top {
    top: 0;
    border-bottom: 1px solid var(--border, rgba(145, 56, 224, 0.18));
  }
  .playlist-sidebar__btn-bar--bottom {
    bottom: 0;
    border-top: 1px solid var(--border, rgba(145, 56, 224, 0.18));
  }
  .playlist-sidebar__scroll-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.35rem 0.85rem;
    background: transparent;
    border: 1px solid var(--border, rgba(145, 56, 224, 0.22));
    border-radius: 6px;
    color: var(--foreground, #e2e8f0);
    font-size: 0.78rem;
    font-weight: 500;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.12s, border-color 0.12s, opacity 0.12s;
  }
  .playlist-sidebar__scroll-btn:hover:not(:disabled),
  .playlist-sidebar__scroll-btn:focus-visible:not(:disabled) {
    background: rgba(4, 229, 229, 0.1);
    border-color: var(--brand-aqua, #04E5E5);
    outline: none;
  }
  .playlist-sidebar__scroll-btn:disabled {
    opacity: 0.32;
    cursor: not-allowed;
  }

  .playlist-sidebar__list {
    list-style: none;
    margin: 0;
    padding: 0;
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
  }
  .playlist-sidebar__overflow:hover,
  .playlist-sidebar__overflow:focus-visible {
    background: rgba(4, 229, 229, 0.08);
    text-decoration: underline;
  }
</style>

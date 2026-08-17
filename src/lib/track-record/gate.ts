import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

/**
 * Passcode gate for the markup columns of the /portfolio track record.
 *
 * Deliberately a sibling of lib/promote/gate.ts rather than a refactor of it:
 * the two gates protect unrelated surfaces, and coupling them would mean a
 * change to the opportunity gate could silently widen or narrow this one.
 * Distinct cookie, distinct path, distinct salt, distinct code.
 */

const COOKIE_NAME = 'track_record_markups';
const COOKIE_PATH = '/portfolio';
const TTL_SECONDS = 7 * 24 * 60 * 60;
const SCRYPT_SALT = 'mpstaton-track-record-salt';
const SCRYPT_KEY_LEN = 64;

export type MarkupsSession = {
  unlocked: true;
  exp: number;
};

function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess != null && fromProcess !== '') return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  return fromMeta != null && fromMeta !== '' ? fromMeta : undefined;
}

function getSecret(): string {
  // Its own key if configured, otherwise the promote signing key — one less
  // env var to get wrong in production, and rotating either only costs
  // everyone their 7-day session.
  const secret = readEnv('PORTFOLIO_SESSION_SECRET') ?? readEnv('PROMOTE_SESSION_SECRET');
  if (!secret || secret === 'replace-me-with-a-32-byte-hex-string') {
    if (import.meta.env.DEV) return 'dev-only-insecure-secret';
    throw new Error('PORTFOLIO_SESSION_SECRET (or PROMOTE_SESSION_SECRET) is not configured');
  }
  return secret;
}

function sign(payload: MarkupsSession): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token: string): MarkupsSession | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as MarkupsSession;
    if (!payload.unlocked || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashCode(plain: string): string {
  return scryptSync(plain, SCRYPT_SALT, SCRYPT_KEY_LEN).toString('hex');
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function checkMarkupsCode(plain: string): boolean {
  // Unlike the promote gate, the bypass is honoured ONLY in dev. A stray
  // `=1` in a production environment cannot open this surface.
  if (import.meta.env.DEV && readEnv('PORTFOLIO_DEV_BYPASS') === '1') return true;

  const stored = readEnv('PORTFOLIO_MARKUPS_CODE_HASH');
  if (!stored || stored === 'replace-me-with-a-scrypt-hash') return false;
  return constantTimeEquals(hashCode(plain), stored);
}

export function readMarkupsSession(cookieHeader: string | null | undefined): MarkupsSession | null {
  if (!cookieHeader) return null;
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies[COOKIE_NAME];
  if (!token) return null;
  return verify(token);
}

export function buildMarkupsCookie(): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const token = sign({ unlocked: true, exp });
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    `Path=${COOKIE_PATH}`,
    `Max-Age=${TTL_SECONDS}`,
    'HttpOnly',
    'SameSite=Lax',
  ];
  if (!import.meta.env.DEV) attrs.push('Secure');
  return attrs.join('; ');
}

export function buildMarkupsClearCookie(): string {
  return `${COOKIE_NAME}=; Path=${COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export const MARKUPS_TTL_SECONDS = TTL_SECONDS;
export const MARKUPS_COOKIE_NAME = COOKIE_NAME;

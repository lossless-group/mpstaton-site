import { createHmac, scryptSync, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'promote_session';
const COOKIE_PATH = '/promote';
const TTL_SECONDS = 7 * 24 * 60 * 60;
const SCRYPT_SALT = 'mpstaton-promote-salt';
const SCRYPT_KEY_LEN = 64;

export type SessionPayload = {
  unlocked: true;
  exp: number;
  scope: 'master' | string;
};

// Read server-side env vars. process.env is always populated on Node;
// import.meta.env is a fallback for build-time inlined values.
function readEnv(key: string): string | undefined {
  const fromProcess = typeof process !== 'undefined' ? process.env?.[key] : undefined;
  if (fromProcess != null && fromProcess !== '') return fromProcess;
  const fromMeta = (import.meta.env as Record<string, string | undefined>)[key];
  return fromMeta != null && fromMeta !== '' ? fromMeta : undefined;
}

function getSecret(): string {
  const secret = readEnv('PROMOTE_SESSION_SECRET');
  if (!secret || secret === 'replace-me-with-a-32-byte-hex-string') {
    if (import.meta.env.DEV) return 'dev-only-insecure-secret';
    throw new Error('PROMOTE_SESSION_SECRET is not configured');
  }
  return secret;
}

function sign(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const mac = createHmac('sha256', getSecret()).update(body).digest('base64url');
  return `${body}.${mac}`;
}

function verify(token: string): SessionPayload | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, mac] = parts;
  const expected = createHmac('sha256', getSecret()).update(body).digest('base64url');
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as SessionPayload;
    if (!payload.unlocked || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashCode(plain: string): string {
  return scryptSync(plain, SCRYPT_SALT, SCRYPT_KEY_LEN).toString('hex');
}

function constantTimeEquals(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export function checkCode(slug: string, plain: string): { ok: true; scope: 'master' | string } | { ok: false } {
  if (readEnv('PROMOTE_DEV_BYPASS') === '1') {
    return { ok: true, scope: 'master' };
  }
  const provided = hashCode(plain);

  const overridesRaw = readEnv('PROMOTE_OVERRIDE_CODES_JSON');
  if (overridesRaw) {
    try {
      const overrides = JSON.parse(overridesRaw) as Record<string, string>;
      const stored = overrides[slug];
      if (stored && constantTimeEquals(provided, stored)) {
        return { ok: true, scope: slug };
      }
    } catch {
      // fall through to master
    }
  }

  const masterHash = readEnv('PROMOTE_MASTER_CODE_HASH');
  if (masterHash && masterHash !== 'replace-me-with-a-scrypt-hash' && constantTimeEquals(provided, masterHash)) {
    return { ok: true, scope: 'master' };
  }

  return { ok: false };
}

export function readSessionFromRequest(cookieHeader: string | null | undefined): SessionPayload | null {
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

export function buildSessionCookie(scope: 'master' | string): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const token = sign({ unlocked: true, exp, scope });
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

export function buildClearCookie(): string {
  return `${COOKIE_NAME}=; Path=${COOKIE_PATH}; Max-Age=0; HttpOnly; SameSite=Lax`;
}

export const GATE_TTL_SECONDS = TTL_SECONDS;
export const GATE_COOKIE_NAME = COOKIE_NAME;

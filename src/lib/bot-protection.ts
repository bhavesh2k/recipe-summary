import { NextRequest } from 'next/server';

export interface BotVerificationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * Option 3: Origin & Referer Validation
 * Ensures requests to the extraction API originate from authorized cook.ai domains
 * or local development environments, preventing hotlinking and unauthorized remote scripts.
 */
export function validateOriginAndReferer(req: NextRequest): BotVerificationResult {
  const origin = req.headers.get('origin');
  const referer = req.headers.get('referer');
  const host = req.headers.get('host'); // e.g. cook-ai-web.vercel.app or localhost:3000

  // If both origin and referer are absent (e.g. direct curl/script), check user agent
  if (!origin && !referer) {
    const userAgent = (req.headers.get('user-agent') || '').toLowerCase();
    if (
      userAgent.includes('python-requests') ||
      userAgent.includes('aiohttp') ||
      userAgent.includes('scrapy') ||
      userAgent.includes('urllib') ||
      userAgent.includes('go-http-client')
    ) {
      return { allowed: false, reason: 'Automated scraping client rejected.' };
    }
    // Allow legitimate requests where browser may omit referer
    return { allowed: true };
  }

  const checkUrl = origin || referer || '';
  try {
    const parsed = new URL(checkUrl);
    const hostname = parsed.hostname.toLowerCase();

    // Allowed domains
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.endsWith('.vercel.app') ||
      hostname.includes('cook-ai') ||
      hostname.includes('cookai') ||
      (host && hostname === host.split(':')[0].toLowerCase())
    ) {
      return { allowed: true };
    }

    return { allowed: false, reason: `Unauthorized request origin (${hostname}).` };
  } catch {
    return { allowed: false, reason: 'Invalid request origin header.' };
  }
}

/**
 * Option 1: Cloudflare Turnstile Verification
 * Validates the cryptographic token issued by Cloudflare's invisible challenge.
 *
 * Designed to fail open if Cloudflare is unreachable or if TURNSTILE_SECRET_KEY is not set,
 * guaranteeing zero disruption to authentic visitors.
 */
export async function verifyTurnstileToken(
  token: string | undefined,
  remoteIp?: string
): Promise<BotVerificationResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  // If secret key is not set in environment, gracefully pass so the app works seamlessly
  if (!secretKey) {
    return { allowed: true };
  }

  // If Turnstile is active in environment but no token was sent
  if (!token) {
    return {
      allowed: false,
      reason: 'Security verification token required. Please refresh the page and try again.',
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (remoteIp) {
      formData.append('remoteip', remoteIp);
    }

    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData,
      signal: AbortSignal.timeout(5000),
    });

    if (!res.ok) {
      console.warn('Turnstile verify HTTP warning:', res.status);
      return { allowed: true }; // Fail-open to protect user experience if Cloudflare has service hiccups
    }

    const data = await res.json();
    if (data.success) {
      return { allowed: true };
    }

    console.warn('Turnstile verification failed for token:', data['error-codes']);
    return {
      allowed: false,
      reason: 'Security verification challenge failed. Please refresh the page and try again.',
    };
  } catch (err) {
    console.warn('Turnstile verification network error (failing open for user continuity):', err);
    return { allowed: true };
  }
}

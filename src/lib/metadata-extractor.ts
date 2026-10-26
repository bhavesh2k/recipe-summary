export interface MediaMetadata {
  title?: string;
  description?: string;
  authorName?: string;
  thumbnailUrl?: string;
  platform: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | 'other';
}

export function detectPlatform(url: string): MediaMetadata['platform'] {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com')) return 'instagram';
  if (lower.includes('tiktok.com')) return 'tiktok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('facebook.com') || lower.includes('fb.watch')) return 'facebook';
  if (lower.includes('pinterest.com') || lower.includes('pin.it')) return 'pinterest';
  return 'other';
}

export function cleanSocialUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    // Keep clean pathname for Instagram and TikTok
    if (parsed.hostname.includes('instagram.com') || parsed.hostname.includes('tiktok.com')) {
      return `${parsed.origin}${parsed.pathname}`;
    }
    return rawUrl;
  } catch {
    return rawUrl;
  }
}

export async function fetchSocialMetadata(rawUrl: string): Promise<MediaMetadata> {
  const url = cleanSocialUrl(rawUrl);
  const platform = detectPlatform(url);
  const metadata: MediaMetadata = { platform };

  try {
    // 1. YouTube oEmbed
    if (platform === 'youtube') {
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
      const res = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        metadata.title = data.title;
        metadata.authorName = data.author_name;
        metadata.thumbnailUrl = data.thumbnail_url;
      }
      return metadata;
    }

    // 2. TikTok oEmbed
    if (platform === 'tiktok') {
      const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
      const res = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(4000),
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RecipeBot/1.0)' },
      });
      if (res.ok) {
        const data = await res.json();
        metadata.title = data.title;
        metadata.authorName = data.author_name;
        metadata.thumbnailUrl = data.thumbnail_url;
      }
      return metadata;
    }

    // 3. Fallback: Fetch OpenGraph meta tags with a strict 4-second timeout
    const res = await fetch(url, {
      signal: AbortSignal.timeout(4000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (res.ok) {
      const html = await res.text();

      // Extract og:title
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["'](.*?)["']/i) ||
                         html.match(/<meta\s+name=["']title["']\s+content=["'](.*?)["']/i);
      if (titleMatch) metadata.title = decodeHtmlEntities(titleMatch[1]);

      // Extract og:description
      const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      if (descMatch) metadata.description = decodeHtmlEntities(descMatch[1]);

      // Extract og:image
      const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["'](.*?)["']/i);
      if (imgMatch) metadata.thumbnailUrl = imgMatch[1];
    }
  } catch (err) {
    console.warn('Metadata fetch warning (non-fatal):', err);
  }

  return metadata;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

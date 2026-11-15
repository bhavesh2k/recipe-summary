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

export function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#064;/g, '@')
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => {
      try {
        return String.fromCodePoint(parseInt(hex, 16));
      } catch {
        return '';
      }
    });
}

function cleanInstagramCaption(rawDesc: string): string {
  if (!rawDesc) return rawDesc;
  // Format: "1,689 likes, 13 comments - author on Date: \"...\""
  const match = rawDesc.match(/likes,\s*\d+\s*comments\s*-[^:]+:\s*["“]([\s\S]*?)["”]\s*\.?\s*$/i);
  if (match) {
    return match[1].trim();
  }
  return rawDesc.trim();
}

function cleanInstagramTitle(rawTitle: string): string {
  if (!rawTitle) return rawTitle;
  // Format: "Author on Instagram: \"Eggless Banana cake...\""
  const match = rawTitle.match(/on\s+Instagram:\s*["“]([\s\S]*?)["”]/i);
  if (match) {
    const firstLine = match[1].split('\n')[0].trim();
    if (firstLine) return firstLine;
  }
  return rawTitle.replace(/\s*•\s*Instagram.*$/i, '').trim();
}

export async function fetchSocialMetadata(rawUrl: string): Promise<MediaMetadata> {
  const url = cleanSocialUrl(rawUrl);
  const platform = detectPlatform(url);
  const metadata: MediaMetadata = { platform };

  try {
    // 1. YouTube oEmbed
    if (platform === 'youtube') {
      let cleanYtUrl = url;
      if (cleanYtUrl.includes('/shorts/')) {
        const id = cleanYtUrl.split('/shorts/')[1].split('?')[0].split('/')[0];
        cleanYtUrl = `https://www.youtube.com/watch?v=${id}`;
      }
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(cleanYtUrl)}&format=json`;
      const res = await fetch(oembedUrl, {
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
        },
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
        signal: AbortSignal.timeout(5000),
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

    // 3. Instagram & Social Scraper using social crawler User-Agent
    // Note: Instagram strictly blocks desktop Chrome with a login wall redirect, but serves full
    // OpenGraph meta tags (og:title, og:description, og:image) to Facebook & Twitter crawler User-Agents.
    const userAgent = platform === 'instagram'
      ? 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'
      : 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36';

    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (res.ok) {
      const html = await res.text();

      // Extract og:title (multiline dotAll)
      const titleMatch = html.match(/<meta\s+property=["']og:title["']\s+content=["']([\s\S]*?)["']/i) ||
                         html.match(/<meta\s+name=["']title["']\s+content=["']([\s\S]*?)["']/i) ||
                         html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([\s\S]*?)["']/i);
      if (titleMatch) {
        const rawTitle = decodeHtmlEntities(titleMatch[1]);
        metadata.title = platform === 'instagram' ? cleanInstagramTitle(rawTitle) : rawTitle;
      }

      // Extract og:description (multiline dotAll)
      const descMatch = html.match(/<meta\s+property=["']og:description["']\s+content=["']([\s\S]*?)["']/i) ||
                        html.match(/<meta\s+name=["']description["']\s+content=["']([\s\S]*?)["']/i) ||
                        html.match(/<meta\s+name=["']twitter:description["']\s+content=["']([\s\S]*?)["']/i);
      if (descMatch) {
        const rawDesc = decodeHtmlEntities(descMatch[1]);
        metadata.description = platform === 'instagram' ? cleanInstagramCaption(rawDesc) : rawDesc;

        // Extract authorName if present in description
        if (platform === 'instagram' && !metadata.authorName && rawDesc.includes(' - ')) {
          const authorPart = rawDesc.split(' - ')[1]?.split(' on ')[0]?.trim();
          if (authorPart) metadata.authorName = authorPart;
        }
      }

      // Extract og:image
      const imgMatch = html.match(/<meta\s+property=["']og:image["']\s+content=["']([\s\S]*?)["']/i);
      if (imgMatch) metadata.thumbnailUrl = decodeHtmlEntities(imgMatch[1]);
    }
  } catch (err) {
    console.warn('Metadata fetch warning (non-fatal):', err);
  }

  return metadata;
}

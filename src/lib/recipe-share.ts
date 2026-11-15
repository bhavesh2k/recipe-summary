import { Recipe } from '@/types/recipe';
import { SAMPLE_RECIPES } from '@/lib/sample-recipes';

/**
 * Base64 URL-safe encoding & decoding helpers
 */
function uint8ArrayToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof window !== 'undefined' ? btoa(binary) : Buffer.from(bytes).toString('base64');
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToUint8Array(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = typeof window !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Clean recipe before URL compression to minimize link length
 */
function stripForShare(recipe: Recipe): Partial<Recipe> {
  return {
    title: recipe.title,
    description: recipe.description,
    servings: recipe.servings,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    totalTimeMinutes: recipe.totalTimeMinutes,
    difficulty: recipe.difficulty,
    dietaryTags: recipe.dietaryTags,
    nutrition: recipe.nutrition,
    ingredients: recipe.ingredients,
    steps: recipe.steps,
    chefTips: recipe.chefTips,
    sourceUrl: recipe.sourceUrl,
    platform: recipe.platform,
    creatorName: recipe.creatorName,
  };
}

/**
 * Generate a shareable URL for a recipe
 */
export async function generateRecipeShareUrl(recipe: Recipe): Promise<string> {
  const origin = typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : 'https://cook-ai-web.vercel.app';

  // 1. If it's one of the built-in sample recipes, use a clean query param
  if (recipe.id && recipe.id.startsWith('sample-')) {
    return `${origin}/?recipe=${encodeURIComponent(recipe.id)}`;
  }

  // 2. Custom recipe: Compress and encode into URL hash
  const minimal = stripForShare(recipe);
  const jsonStr = JSON.stringify(minimal);

  // Modern browser with CompressionStream (gzip)
  if (typeof CompressionStream !== 'undefined') {
    try {
      const cs = new CompressionStream('gzip');
      const writer = cs.writable.getWriter();
      writer.write(new TextEncoder().encode(jsonStr));
      writer.close();

      const chunks: Uint8Array[] = [];
      const reader = cs.readable.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) chunks.push(value);
      }

      // Merge chunks into single Uint8Array
      const totalLen = chunks.reduce((acc, c) => acc + c.byteLength, 0);
      const merged = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }

      const encoded = uint8ArrayToBase64Url(merged);
      return `${origin}/#recipe=gz_${encoded}`;
    } catch (e) {
      console.warn('Gzip compression failed, falling back to base64url:', e);
    }
  }

  // Fallback: UTF-8 -> base64url
  const encoded = uint8ArrayToBase64Url(new TextEncoder().encode(jsonStr));
  return `${origin}/#recipe=b64_${encoded}`;
}

/**
 * Decode a recipe from a URL search param or URL hash
 */
export async function decodeRecipeFromLocation(
  search: string,
  hash: string
): Promise<Recipe | null> {
  try {
    // 1. Check for sample recipe query param (?recipe=sample-...)
    if (search) {
      const params = new URLSearchParams(search);
      const recipeId = params.get('recipe');
      if (recipeId) {
        const found = SAMPLE_RECIPES.find((r) => r.id === recipeId);
        if (found) return found;
      }
    }

    // 2. Check for hash (#recipe=...)
    if (!hash || !hash.includes('#recipe=')) {
      return null;
    }

    const raw = hash.replace(/^#recipe=/, '').trim();
    if (!raw) return null;

    let jsonStr = '';

    // Gzip compressed format: gz_<base64url>
    if (raw.startsWith('gz_')) {
      const payload = raw.slice(3);
      const bytes = base64UrlToUint8Array(payload);

      if (typeof DecompressionStream !== 'undefined') {
        const ds = new DecompressionStream('gzip');
        const writer = ds.writable.getWriter();
        writer.write(bytes as any);
        writer.close();

        const chunks: Uint8Array[] = [];
        const reader = ds.readable.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) chunks.push(value);
        }

        const totalLen = chunks.reduce((acc, c) => acc + c.byteLength, 0);
        const merged = new Uint8Array(totalLen);
        let offset = 0;
        for (const chunk of chunks) {
          merged.set(chunk, offset);
          offset += chunk.byteLength;
        }

        jsonStr = new TextDecoder().decode(merged);
      }
    } else if (raw.startsWith('b64_')) {
      const payload = raw.slice(4);
      const bytes = base64UrlToUint8Array(payload);
      jsonStr = new TextDecoder().decode(bytes);
    } else {
      // Direct base64url
      const bytes = base64UrlToUint8Array(raw);
      jsonStr = new TextDecoder().decode(bytes);
    }

    if (!jsonStr) return null;

    const parsed = JSON.parse(jsonStr);

    // Validate essential recipe shape
    if (!parsed || !parsed.title || !Array.isArray(parsed.ingredients) || !Array.isArray(parsed.steps)) {
      return null;
    }

    const reconstructed: Recipe = {
      id: `shared-${Date.now()}`,
      title: parsed.title,
      description: parsed.description || '',
      servings: typeof parsed.servings === 'number' ? parsed.servings : 2,
      prepTimeMinutes: parsed.prepTimeMinutes || 0,
      cookTimeMinutes: parsed.cookTimeMinutes || 0,
      totalTimeMinutes: parsed.totalTimeMinutes || 0,
      difficulty: parsed.difficulty || 'Easy',
      dietaryTags: Array.isArray(parsed.dietaryTags) ? parsed.dietaryTags : [],
      nutrition: parsed.nutrition || { calories: 0, protein: 0, carbs: 0, fat: 0 },
      ingredients: parsed.ingredients,
      steps: parsed.steps,
      chefTips: Array.isArray(parsed.chefTips) ? parsed.chefTips : [],
      sourceUrl: parsed.sourceUrl,
      platform: parsed.platform || 'other',
      creatorName: parsed.creatorName,
      createdAt: new Date().toISOString(),
    };

    return reconstructed;
  } catch (err) {
    console.error('Failed to decode shared recipe from URL:', err);
    return null;
  }
}

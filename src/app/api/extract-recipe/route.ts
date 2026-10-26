import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeWithGemini } from '@/lib/gemini';
import { fetchSocialMetadata } from '@/lib/metadata-extractor';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, rawText, mediaBase64, mediaMimeType } = body;
    const customApiKey = req.headers.get('x-gemini-api-key') || undefined;
    const requestedModel = req.headers.get('x-gemini-model') || undefined;

    if (!url && !rawText && !mediaBase64) {
      return NextResponse.json(
        { success: false, error: 'Please provide a video URL, uploaded media, or recipe text.' },
        { status: 400 }
      );
    }

    let metadata;
    if (url) {
      metadata = await fetchSocialMetadata(url);
    }

    const recipe = await extractRecipeWithGemini({
      url,
      rawText,
      mediaBase64,
      mediaMimeType,
      metadata,
      customApiKey,
      model: requestedModel,
    });

    return NextResponse.json({ success: true, recipe });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

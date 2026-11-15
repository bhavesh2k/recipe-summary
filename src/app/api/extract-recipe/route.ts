import { NextRequest, NextResponse } from 'next/server';
import { extractRecipeWithGemini } from '@/lib/gemini';
import { fetchSocialMetadata } from '@/lib/metadata-extractor';

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            'Failed to parse request payload. If you uploaded a file, it may exceed Vercel serverless payload limits (4.5MB). Please use a shorter video clip or paste the recipe link/caption.',
        },
        { status: 413 }
      );
    }

    const { url, rawText, mediaBase64, mediaMimeType } = body;

    // Guard against oversized base64 payloads that could exceed serverless memory or timeouts
    if (mediaBase64 && typeof mediaBase64 === 'string' && mediaBase64.length > 4.5 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Uploaded media exceeds the 4.5MB serverless payload limit. Please upload a smaller clip under 3.5MB or paste the recipe link/text instead.',
        },
        { status: 413 }
      );
    }

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
    });

    return NextResponse.json({ success: true, recipe });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

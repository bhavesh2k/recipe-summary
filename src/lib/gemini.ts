import { GoogleGenAI } from '@google/genai';
import { Recipe } from '@/types/recipe';
import { MediaMetadata } from './metadata-extractor';

export const RECIPE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    title: { type: 'string', description: 'Clear, appealing recipe title' },
    description: { type: 'string', description: '1-2 sentence appetizing description of the dish' },
    servings: { type: 'integer', description: 'Number of servings, e.g. 2 or 4' },
    prepTimeMinutes: { type: 'integer', description: 'Estimated preparation time in minutes' },
    cookTimeMinutes: { type: 'integer', description: 'Estimated active cooking/baking time in minutes' },
    totalTimeMinutes: { type: 'integer', description: 'Total time in minutes' },
    difficulty: {
      type: 'string',
      enum: ['Easy', 'Medium', 'Hard'],
      description: 'Skill difficulty level',
    },
    dietaryTags: {
      type: 'array',
      items: { type: 'string' },
      description: 'Relevant tags such as Vegetarian, Vegan, High Protein, Gluten-Free, Keto, Dairy-Free, Low Carb, Quick',
    },
    nutrition: {
      type: 'object',
      properties: {
        calories: { type: 'integer', description: 'Estimated kcal per serving' },
        protein: { type: 'integer', description: 'Estimated protein in grams per serving' },
        carbs: { type: 'integer', description: 'Estimated carbohydrates in grams per serving' },
        fat: { type: 'integer', description: 'Estimated fat in grams per serving' },
        fiber: { type: 'integer', description: 'Estimated dietary fiber in grams per serving' },
      },
      required: ['calories', 'protein', 'carbs', 'fat'],
    },
    ingredients: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: { type: 'string', description: 'Name of the ingredient (e.g. Garlic, Chicken thighs, Heavy cream)' },
          amount: { type: 'number', description: 'Numeric quantity (e.g. 2, 250, 0.5)' },
          unit: { type: 'string', description: 'Unit of measurement (e.g. g, ml, cups, tbsp, tsp, cloves, pieces, pinch)' },
          category: {
            type: 'string',
            enum: ['Produce', 'Dairy & Refrigerated', 'Meat & Seafood', 'Pantry & Spices', 'Bakery & Grains', 'Other'],
            description: 'Grocery aisle category',
          },
          notes: { type: 'string', description: 'Preparation notes like diced, room temperature, melted, to taste' },
        },
        required: ['item', 'amount', 'unit', 'category'],
      },
    },
    steps: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          stepNumber: { type: 'integer', description: 'Sequential step index starting at 1' },
          instruction: { type: 'string', description: 'Clear, concise, step-by-step cooking instruction' },
          timerSeconds: {
            type: 'integer',
            description: 'Duration in seconds if this step requires a specific cooking/resting time (e.g. 600 for 10 min), or 0 if none',
          },
          tip: { type: 'string', description: 'Visual or verbal chef tip for this step' },
        },
        required: ['stepNumber', 'instruction'],
      },
    },
    chefTips: {
      type: 'array',
      items: { type: 'string' },
      description: 'Useful chef tips, substitutions, or serving suggestions',
    },
  },
  required: [
    'title',
    'description',
    'servings',
    'prepTimeMinutes',
    'cookTimeMinutes',
    'totalTimeMinutes',
    'difficulty',
    'dietaryTags',
    'nutrition',
    'ingredients',
    'steps',
  ],
};

interface ExtractParams {
  url?: string;
  rawText?: string;
  mediaBase64?: string;
  mediaMimeType?: string;
  metadata?: MediaMetadata;
}

export async function extractRecipeWithGemini(params: ExtractParams): Promise<Recipe> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  const selectedModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite';

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('MISSING_API_KEY: Please set your GEMINI_API_KEY in .env.local.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an elite culinary expert and recipe extraction AI.
Your job is to transform cooking videos, reels, photos, captions, and links into beautifully structured, professional recipes.

Instructions:
1. Parse all ingredients with reasonable amounts and standard culinary units (grams, ml, cups, tbsp, tsp, pieces).
2. If quantities are missing or phrased loosely ("some salt", "a glug of oil"), estimate sensible culinary defaults.
3. Automatically calculate realistic nutritional estimations (Calories, Protein, Carbs, Fat per serving).
4. For steps that specify time (e.g. "boil for 8 minutes", "bake at 375 for 25 mins"), extract the exact duration in timerSeconds.
5. Identify chef tips, visual cues, and helpful technique notes.
6. Even if a video is silent or has only background music, accurately detect what is happening visually.`;

  const inputParts: Array<
    | { type: 'text'; text: string }
    | { type: 'video'; uri?: string; data?: string; mime_type?: string }
    | { type: 'image'; uri?: string; data?: string; mime_type?: string }
  > = [];

  // 1. If uploaded image or video data is present
  if (params.mediaBase64 && params.mediaMimeType) {
    const isVideo = params.mediaMimeType.startsWith('video/');
    inputParts.push({
      type: isVideo ? 'video' : 'image',
      data: params.mediaBase64,
      mime_type: params.mediaMimeType,
    });
  }

  // 2. Assemble text instructions & metadata
  let promptText = `Extract the complete, structured recipe according to the schema.\n`;

  if (params.url) {
    promptText += `Source URL: ${params.url}\n`;
    promptText += `Note: If this URL is from a social platform (e.g. Instagram, TikTok, YouTube) and no video media, caption text, or title was provided or accessible, set title to "RECIPE_NOT_ACCESSIBLE" and describe the blockage in description.\n`;
  }
  if (params.metadata?.title) {
    promptText += `Video / Recipe Title: ${params.metadata.title}\n`;
  }
  if (params.metadata?.authorName) {
    promptText += `Creator: ${params.metadata.authorName}\n`;
  }
  if (params.metadata?.description) {
    promptText += `Post Description / Caption:\n${params.metadata.description}\n`;
  }
  if (params.rawText) {
    promptText += `User Provided Text / Notes:\n${params.rawText}\n`;
  }

  inputParts.push({
    type: 'text',
    text: promptText,
  });

  try {
    const interaction = await ai.interactions.create({
      model: selectedModel,
      system_instruction: systemInstruction,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      input: inputParts as any,
      response_format: {
        type: 'text',
        mime_type: 'application/json',
        schema: RECIPE_JSON_SCHEMA,
      },
    });

    const outputText = interaction.output_text;
    if (!outputText) {
      throw new Error('Gemini did not return any output text.');
    }

    const parsedData = JSON.parse(outputText);

    if (parsedData.title === 'RECIPE_NOT_ACCESSIBLE') {
      throw new Error(
        'LINK_BLOCKED: Social media platforms (Instagram, TikTok, YouTube) prevent automatic server-side video scraping. You can easily convert this recipe by copying the caption text and pasting it in the "Paste Caption" tab, or by dropping a screen recording in the "Video / Photo Upload" tab!'
      );
    }

    if (!parsedData.ingredients || parsedData.ingredients.length === 0 || !parsedData.steps || parsedData.steps.length === 0) {
      throw new Error(
        'NO_RECIPE_FOUND: No recipe ingredients or cooking steps could be detected. Please provide a recipe caption, food ingredients list, or cooking video clip.'
      );
    }

    // Form final recipe object with ID and metadata
    const recipe: Recipe = {
      ...parsedData,
      id: `recipe-${Date.now()}`,
      sourceUrl: params.url,
      platform: params.metadata?.platform || (params.url ? 'other' : 'upload'),
      creatorName: params.metadata?.authorName,
      thumbnailUrl: params.metadata?.thumbnailUrl,
      createdAt: new Date().toISOString(),
    };

    return recipe;
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error('Gemini extraction error:', msg);
    throw new Error(`Recipe extraction failed: ${msg}`);
  }
}

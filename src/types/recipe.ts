export interface Ingredient {
  item: string;
  amount: number; // Base quantity for default servings
  unit: string;   // 'g', 'ml', 'cups', 'tbsp', 'tsp', 'cloves', 'pieces', etc.
  category: 'Produce' | 'Dairy & Refrigerated' | 'Meat & Seafood' | 'Pantry & Spices' | 'Bakery & Grains' | 'Other';
  notes?: string; // e.g. "minced", "room temperature", "divided"
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  timerSeconds?: number; // In seconds, e.g. 600 for 10 minutes
  tip?: string;          // Chef's verbal or visual cue
}

export interface NutritionInfo {
  calories: number; // kcal per serving
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  sourceUrl?: string;
  platform?: 'instagram' | 'tiktok' | 'youtube' | 'facebook' | 'pinterest' | 'upload' | 'sample';
  creatorName?: string;
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  dietaryTags: string[];
  nutrition: NutritionInfo;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  chefTips?: string[];
  createdAt: string;
}

export type UnitSystem = 'metric' | 'imperial';

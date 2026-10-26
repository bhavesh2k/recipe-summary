import { UnitSystem } from '@/types/recipe';

// Helper to format decimal numbers to fractions or clean decimals
export function formatAmount(val: number): string {
  if (val <= 0) return '';
  
  // Round to 2 decimal places to avoid floating point weirdness
  const rounded = Math.round(val * 100) / 100;
  const whole = Math.floor(rounded);
  const remainder = rounded - whole;

  let fraction = '';
  if (Math.abs(remainder - 0.25) < 0.05) fraction = '¼';
  else if (Math.abs(remainder - 0.33) < 0.05) fraction = '⅓';
  else if (Math.abs(remainder - 0.5) < 0.05) fraction = '½';
  else if (Math.abs(remainder - 0.66) < 0.05) fraction = '⅔';
  else if (Math.abs(remainder - 0.75) < 0.05) fraction = '¾';

  if (fraction) {
    return whole > 0 ? `${whole} ${fraction}` : fraction;
  }

  // Otherwise return standard number rounded to 1 decimal place if needed
  if (rounded === Math.floor(rounded)) {
    return rounded.toString();
  }
  return rounded.toFixed(1).replace(/\.0$/, '');
}

export function convertAndScale(
  baseAmount: number,
  baseUnit: string,
  scaleFactor: number,
  targetSystem: UnitSystem
): { amount: string; unit: string } {
  const scaled = baseAmount * scaleFactor;
  const unitLower = baseUnit.toLowerCase().trim();

  if (targetSystem === 'imperial') {
    // Convert Metric to Imperial
    if (unitLower === 'g' || unitLower === 'grams' || unitLower === 'gram') {
      const oz = scaled / 28.35;
      if (oz >= 16) {
        return { amount: formatAmount(oz / 16), unit: 'lb' };
      }
      return { amount: formatAmount(oz), unit: 'oz' };
    }

    if (unitLower === 'ml' || unitLower === 'milliliters' || unitLower === 'millilitres') {
      if (scaled >= 240) {
        return { amount: formatAmount(scaled / 240), unit: 'cups' };
      } else if (scaled >= 15) {
        return { amount: formatAmount(scaled / 15), unit: 'tbsp' };
      } else if (scaled >= 5) {
        return { amount: formatAmount(scaled / 5), unit: 'tsp' };
      }
      return { amount: formatAmount(scaled / 29.57), unit: 'fl oz' };
    }

    if (unitLower === 'kg' || unitLower === 'kilograms') {
      return { amount: formatAmount(scaled * 2.20462), unit: 'lbs' };
    }

    if (unitLower === 'l' || unitLower === 'liters' || unitLower === 'litres') {
      return { amount: formatAmount(scaled * 4.22675), unit: 'cups' };
    }
  } else {
    // Convert Imperial to Metric
    if (unitLower === 'oz' || unitLower === 'ounce' || unitLower === 'ounces') {
      const g = scaled * 28.35;
      return { amount: formatAmount(g), unit: 'g' };
    }

    if (unitLower === 'lb' || unitLower === 'lbs' || unitLower === 'pound' || unitLower === 'pounds') {
      const g = scaled * 453.592;
      if (g >= 1000) {
        return { amount: formatAmount(g / 1000), unit: 'kg' };
      }
      return { amount: formatAmount(g), unit: 'g' };
    }

    if (unitLower === 'cup' || unitLower === 'cups') {
      return { amount: formatAmount(scaled * 240), unit: 'ml' };
    }

    if (unitLower === 'tbsp' || unitLower === 'tablespoon' || unitLower === 'tablespoons') {
      return { amount: formatAmount(scaled * 15), unit: 'ml' };
    }

    if (unitLower === 'tsp' || unitLower === 'teaspoon' || unitLower === 'teaspoons') {
      return { amount: formatAmount(scaled * 5), unit: 'ml' };
    }

    if (unitLower === 'fl oz') {
      return { amount: formatAmount(scaled * 29.57), unit: 'ml' };
    }
  }

  // If no conversion needed or unit is non-standard (e.g. cloves, pieces, pinch)
  return { amount: formatAmount(scaled), unit: baseUnit };
}

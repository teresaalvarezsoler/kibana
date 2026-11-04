/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { generateBrandPalettes, type BrandPalettes } from '@kbn/palettes';

export interface BrandPaletteSettings {
  brandColors: readonly string[];
  categorical: readonly string[];
  lineOptimized: readonly string[];
}

/**
 * Returns the brand palettes to use: the edited palettes when saved, otherwise the palettes
 * generated from the brand colors, or `undefined` when there are no brand colors.
 */
export const resolveBrandPalettes = ({
  brandColors,
  categorical,
  lineOptimized,
}: BrandPaletteSettings): BrandPalettes | undefined => {
  if (brandColors.length === 0) return undefined;

  const generated = generateBrandPalettes(brandColors);
  return {
    categorical: categorical.length > 0 ? categorical : generated.categorical,
    lineOptimized: lineOptimized.length > 0 ? lineOptimized : generated.lineOptimized,
  };
};

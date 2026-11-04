/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { KbnPalettes } from '../classes/palettes';
import type { IKbnPalette } from '../classes/types';
import type { BrandPalettes } from './brand';
import { createBrandPalettes, getBrandPalettes } from './brand';
import {
  elasticPalette,
  elasticLineOptimizedPalette,
  getNeutralPalette,
  severityPalette,
} from './categorical';
import { elasticClassicPalette, kibana4Palette, kibana7Palette } from './legacy/categorical';
import {
  compareToPalette,
  complementaryPalette,
  coolPalette,
  grayPalette,
  greenPalette,
  redPalette,
  statusPalette,
  temperaturePalette,
  warmPalette,
} from './gradient';
export { logLevelPalette } from './semantic';

const buildKbnPalettes = (
  darkMode: boolean,
  defaultPalette: IKbnPalette,
  lineOptimizedPalette: IKbnPalette
) =>
  new KbnPalettes(
    [
      defaultPalette,
      lineOptimizedPalette,
      severityPalette,
      kibana7Palette,
      kibana4Palette,
      getNeutralPalette(darkMode),
      complementaryPalette,
      coolPalette,
      grayPalette,
      greenPalette,
      redPalette,
      statusPalette,
      temperaturePalette,
      warmPalette,
      elasticClassicPalette,
      compareToPalette,
    ],
    defaultPalette
  );

const darkKbnPalettes = buildKbnPalettes(true, elasticPalette, elasticLineOptimizedPalette);
const lightKbnPalettes = buildKbnPalettes(false, elasticPalette, elasticLineOptimizedPalette);

const brandedKbnPalettesCache = new Map<string, KbnPalettes>();

const getBrandedKbnPalettes = (darkMode: boolean, brandPalettes: BrandPalettes) => {
  const cacheKey = `${darkMode}:${brandPalettes.categorical.join(
    ','
  )}:${brandPalettes.lineOptimized.join(',')}`;
  const cached = brandedKbnPalettesCache.get(cacheKey);
  if (cached) return cached;

  const { brandPalette, brandLineOptimizedPalette } = createBrandPalettes(brandPalettes, {
    defaultPalette: elasticPalette,
    lineOptimizedPalette: elasticLineOptimizedPalette,
  });
  const brandedKbnPalettes = buildKbnPalettes(darkMode, brandPalette, brandLineOptimizedPalette);
  brandedKbnPalettesCache.set(cacheKey, brandedKbnPalettes);
  return brandedKbnPalettes;
};

export const getPalettes = (darkMode: boolean) => {
  const brandPalettes = getBrandPalettes();
  if (brandPalettes) return getBrandedKbnPalettes(darkMode, brandPalettes);

  return darkMode ? darkKbnPalettes : lightKbnPalettes;
};

export type { BrandPalettes } from './brand';
export { generateBrandPalettes, getBrandPalettes, getLightTone, setBrandPalettes } from './brand';
export { elasticPalette, elasticLineOptimizedPalette } from './categorical';
export * from './get_kbn_palettes';

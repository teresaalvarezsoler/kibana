/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import chroma from 'chroma-js';
import { i18n } from '@kbn/i18n';
import { KbnCategoricalPalette } from '../classes/categorical_palette';
import type { IKbnPalette } from '../classes/types';
import { KbnPalette } from '../constants';

export interface BrandPalettes {
  /** Colors of the default categorical palette, used by every chart except line charts. */
  readonly categorical: readonly string[];
  /** Colors of the line optimized palette, used by line charts. */
  readonly lineOptimized: readonly string[];
}

/**
 * This package is not a ui shared dependency, so every plugin bundle gets its own copy of
 * this module. The brand palettes live on `globalThis` so all copies read the same value.
 */
const BRAND_PALETTES_KEY = '__kbnPalettesBrandPalettes__';

type BrandPalettesStore = typeof globalThis & {
  [BRAND_PALETTES_KEY]?: BrandPalettes;
};

const brandPalettesStore: BrandPalettesStore = globalThis;

// Matches the lightness of the light tones in the Elastic palette (0.75 to 0.9).
const MIN_LIGHT_TONE_LIGHTNESS = 0.8;
const LIGHT_TONE_LIGHTNESS_STEP = 0.25;
const MAX_LIGHT_TONE_LIGHTNESS = 0.9;

/**
 * Returns a light tone of the same hue as `color`, used to pair it with its dark tone.
 */
export const getLightTone = (color: string): string => {
  const [hue, saturation, lightness] = chroma(color).hsl();
  const lightTone = Math.min(
    Math.max(lightness + LIGHT_TONE_LIGHTNESS_STEP, MIN_LIGHT_TONE_LIGHTNESS),
    MAX_LIGHT_TONE_LIGHTNESS
  );
  return chroma
    .hsl(Number.isNaN(hue) ? 0 : hue, saturation, lightTone)
    .hex()
    .toUpperCase();
};

/**
 * Generates the brand palettes from the brand colors, the same way the Elastic palettes are built:
 * the categorical palette pairs each dark tone with its light tone, and the line optimized
 * palette lists all dark tones before the light ones.
 */
export const generateBrandPalettes = (brandColors: readonly string[]): BrandPalettes => {
  const darkTones = brandColors.map((color) => chroma(color).hex().toUpperCase());
  const lightTones = darkTones.map(getLightTone);
  return {
    categorical: darkTones.flatMap((darkTone, index) => [darkTone, lightTones[index]]),
    lineOptimized: [...darkTones, ...lightTones],
  };
};

/**
 * Sets the organization brand palettes used in place of the default Elastic palettes.
 */
export const setBrandPalettes = (palettes: BrandPalettes | undefined): void => {
  brandPalettesStore[BRAND_PALETTES_KEY] =
    palettes && palettes.categorical.length > 0 && palettes.lineOptimized.length > 0
      ? { categorical: [...palettes.categorical], lineOptimized: [...palettes.lineOptimized] }
      : undefined;
};

/**
 * Returns the organization brand palettes, or `undefined` when none are configured.
 */
export const getBrandPalettes = (): BrandPalettes | undefined => {
  return brandPalettesStore[BRAND_PALETTES_KEY];
};

export const createBrandPalettes = (
  { categorical, lineOptimized }: BrandPalettes,
  {
    defaultPalette,
    lineOptimizedPalette,
  }: Record<'defaultPalette' | 'lineOptimizedPalette', IKbnPalette>
): Record<'brandPalette' | 'brandLineOptimizedPalette', IKbnPalette> => ({
  brandPalette: new KbnCategoricalPalette({
    id: KbnPalette.Default,
    aliases: defaultPalette.aliases,
    name: i18n.translate('palettes.brand.name', {
      defaultMessage: 'Brand',
    }),
    tag: defaultPalette.tag,
    colors: [...categorical],
  }),
  brandLineOptimizedPalette: new KbnCategoricalPalette({
    id: KbnPalette.ElasticLineOptimized,
    aliases: lineOptimizedPalette.aliases,
    name: i18n.translate('palettes.brandLineOptimized.name', {
      defaultMessage: 'Brand (line optimized)',
    }),
    colors: [...lineOptimized],
  }),
});

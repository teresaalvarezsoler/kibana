/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { KbnCategoricalPalette } from '../classes/categorical_palette';
import type { IKbnPalette } from '../classes/types';
import { KbnPalette } from '../constants';

/**
 * This package is not a ui shared dependency, so every plugin bundle gets its own copy of
 * this module. The brand colors live on `globalThis` so all copies read the same value.
 */
const BRAND_COLORS_KEY = '__kbnPalettesBrandColors__';

type BrandColorsStore = typeof globalThis & {
  [BRAND_COLORS_KEY]?: readonly string[];
};

const brandColorsStore: BrandColorsStore = globalThis;

/**
 * Sets the organization brand colors used in place of the default categorical palettes.
 */
export const setBrandColors = (colors: readonly string[] | undefined): void => {
  brandColorsStore[BRAND_COLORS_KEY] = colors && colors.length > 0 ? [...colors] : undefined;
};

/**
 * Returns the organization brand colors, or `undefined` when none are configured.
 */
export const getBrandColors = (): readonly string[] | undefined => {
  return brandColorsStore[BRAND_COLORS_KEY];
};

export const createBrandPalettes = (
  colors: readonly string[],
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
    colors: [...colors],
  }),
  brandLineOptimizedPalette: new KbnCategoricalPalette({
    id: KbnPalette.ElasticLineOptimized,
    aliases: lineOptimizedPalette.aliases,
    name: i18n.translate('palettes.brandLineOptimized.name', {
      defaultMessage: 'Brand (line optimized)',
    }),
    colors: [...colors],
  }),
});

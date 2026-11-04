/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { KbnPaletteId } from '@kbn/palettes';

type SystemPaletteId = KbnPaletteId | 'kibana_palette' | 'custom' | 'negative' | 'positive';

export const BRAND_PALETTE_SETTING = 'visualization:brandPalette';
export const BRAND_CATEGORICAL_PALETTE_SETTING = 'visualization:brandPalette:categorical';
export const BRAND_LINE_OPTIMIZED_PALETTE_SETTING = 'visualization:brandPalette:lineOptimized';
export const BRAND_LOGO_SETTING = 'visualization:brandLogo';
export const MAX_BRAND_COLORS = 20;
// Generated palettes hold a light tone for every brand color.
export const MAX_BRAND_PALETTE_COLORS = MAX_BRAND_COLORS * 2;
export const MAX_BRAND_LOGO_SIZE_IN_KB = 200;

// Currently supported palettes. This list might be extended dynamically in a later release
export const paletteIds: SystemPaletteId[] = [
  'default',
  'elastic_line_optimized',
  'kibana_palette',
  'custom',
  'status',
  'temperature',
  'complementary',
  'negative',
  'positive',
  'cool',
  'warm',
  'gray',
];

// This set of defaults originated in Canvas, which, at present, is the primary
// consumer of this function.  Changing this default requires a change in Canvas
// logic, which would likely be a breaking change in 7.x.
export const defaultCustomColors = [
  '#882E72',
  '#B178A6',
  '#D6C1DE',
  '#1965B0',
  '#5289C7',
  '#7BAFDE',
  '#4EB265',
  '#90C987',
  '#CAE0AB',
  '#F7EE55',
  '#F6C141',
  '#F1932D',
  '#E8601C',
  '#DC050C',
];

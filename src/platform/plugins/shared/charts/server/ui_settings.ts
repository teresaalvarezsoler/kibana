/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { schema } from '@kbn/config-schema';
import type { UiSettingsParams } from '@kbn/core/server';
import {
  BRAND_CATEGORICAL_PALETTE_SETTING,
  BRAND_LINE_OPTIMIZED_PALETTE_SETTING,
  BRAND_LOGO_SETTING,
  BRAND_PALETTE_SETTING,
  MAX_BRAND_COLORS,
  MAX_BRAND_LOGO_SIZE_IN_KB,
  MAX_BRAND_PALETTE_COLORS,
} from '../common';

const BRAND_CATEGORY = 'brand';
const MAX_LOGO_SIZE_IN_BASE64 = Math.floor((MAX_BRAND_LOGO_SIZE_IN_KB * 1024 * 8) / 6);

const hexColorRegex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const imageDataUrlRegex = /^data:image\/(?:svg\+xml|jpeg|png|gif);base64,/;

const validateBrandColor = (color: string) => {
  if (!hexColorRegex.test(color)) {
    return i18n.translate('charts.uiSettings.brandPalette.invalidColor', {
      defaultMessage: '{color} is not a valid hex color, such as #0B64DD.',
      values: { color },
    });
  }
};

// The Brand section of the global settings page edits these settings, so hide their rows.
const hiddenFromAdvancedSettings = { readonly: true, readonlyMode: 'ui' } as const;

const brandColorsSchema = (maxSize: number) =>
  schema.arrayOf(schema.string({ maxLength: 7, validate: validateBrandColor }), { maxSize });

const validateBrandLogo = (logo: string) => {
  if (!imageDataUrlRegex.test(logo)) {
    return i18n.translate('charts.uiSettings.brandLogo.invalidFile', {
      defaultMessage: 'Use an SVG, PNG, JPEG or GIF image.',
    });
  }
};

export const getUiSettings = (): Record<string, UiSettingsParams> => ({
  [BRAND_PALETTE_SETTING]: {
    name: i18n.translate('charts.uiSettings.brandPalette.name', {
      defaultMessage: 'Brand colors',
    }),
    description: i18n.translate('charts.uiSettings.brandPalette.description', {
      defaultMessage:
        'Hex colors, separated by commas, used to generate the brand palettes that replace the default Elastic palettes in all charts. Charts that already use another palette keep it. Leave empty to use the Elastic palettes.',
    }),
    value: [],
    type: 'array',
    order: 1,
    ...hiddenFromAdvancedSettings,
    category: [BRAND_CATEGORY],
    schema: brandColorsSchema(MAX_BRAND_COLORS),
  },
  [BRAND_CATEGORICAL_PALETTE_SETTING]: {
    name: i18n.translate('charts.uiSettings.brandCategoricalPalette.name', {
      defaultMessage: 'Brand palette',
    }),
    description: i18n.translate('charts.uiSettings.brandCategoricalPalette.description', {
      defaultMessage:
        'Hex colors of the brand palette used by all charts except line charts. Leave empty to generate it from the brand colors, pairing each color with a light tone.',
    }),
    value: [],
    type: 'array',
    order: 2,
    ...hiddenFromAdvancedSettings,
    category: [BRAND_CATEGORY],
    schema: brandColorsSchema(MAX_BRAND_PALETTE_COLORS),
  },
  [BRAND_LINE_OPTIMIZED_PALETTE_SETTING]: {
    name: i18n.translate('charts.uiSettings.brandLineOptimizedPalette.name', {
      defaultMessage: 'Brand palette (line optimized)',
    }),
    description: i18n.translate('charts.uiSettings.brandLineOptimizedPalette.description', {
      defaultMessage:
        'Hex colors of the brand palette used by line charts. Leave empty to generate it from the brand colors, with all brand colors before their light tones.',
    }),
    value: [],
    type: 'array',
    order: 3,
    ...hiddenFromAdvancedSettings,
    category: [BRAND_CATEGORY],
    schema: brandColorsSchema(MAX_BRAND_PALETTE_COLORS),
  },
  [BRAND_LOGO_SETTING]: {
    name: i18n.translate('charts.uiSettings.brandLogo.name', {
      defaultMessage: 'Brand logo',
    }),
    description: i18n.translate('charts.uiSettings.brandLogo.description', {
      defaultMessage:
        'Your organization logo, for use in dashboards. The image must be smaller than {maxSize} KB. Logos look best with a transparent background.',
      values: { maxSize: MAX_BRAND_LOGO_SIZE_IN_KB },
    }),
    value: null,
    type: 'image',
    order: 4,
    requiresPageReload: true,
    ...hiddenFromAdvancedSettings,
    category: [BRAND_CATEGORY],
    schema: schema.nullable(
      schema.string({ maxLength: MAX_LOGO_SIZE_IN_BASE64, validate: validateBrandLogo })
    ),
  },
});

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
import { BRAND_LOGO_SETTING, BRAND_PALETTE_SETTING } from '../common';

const BRAND_CATEGORY = 'brand';
const MAX_BRAND_COLORS = 20;
const MAX_LOGO_SIZE_IN_KB = 200;
const MAX_LOGO_SIZE_IN_BASE64 = Math.floor((MAX_LOGO_SIZE_IN_KB * 1024 * 8) / 6);

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
        'Hex colors, separated by commas, that replace the default Elastic palette in all charts. Charts that already use another palette keep it. Leave empty to use the Elastic palette.',
    }),
    value: [],
    type: 'array',
    order: 1,
    requiresPageReload: true,
    category: [BRAND_CATEGORY],
    schema: schema.arrayOf(schema.string({ maxLength: 7, validate: validateBrandColor }), {
      maxSize: MAX_BRAND_COLORS,
    }),
  },
  [BRAND_LOGO_SETTING]: {
    name: i18n.translate('charts.uiSettings.brandLogo.name', {
      defaultMessage: 'Brand logo',
    }),
    description: i18n.translate('charts.uiSettings.brandLogo.description', {
      defaultMessage:
        'Your organization logo, for use in dashboards. The image must be smaller than {maxSize} KB. Logos look best with a transparent background.',
      values: { maxSize: MAX_LOGO_SIZE_IN_KB },
    }),
    value: null,
    type: 'image',
    order: 2,
    requiresPageReload: true,
    category: [BRAND_CATEGORY],
    schema: schema.nullable(
      schema.string({ maxLength: MAX_LOGO_SIZE_IN_BASE64, validate: validateBrandLogo })
    ),
  },
});

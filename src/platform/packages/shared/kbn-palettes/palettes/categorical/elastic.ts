/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { euiPaletteColorBlind } from '@elastic/eui';
import { KbnPalette } from '../../constants';
import { KbnColorFnPalette } from '../../classes/color_fn_palette';
import type { IKbnPalette } from '../../classes/types';

const elasticName = i18n.translate('palettes.elastic.name', {
  defaultMessage: 'Elastic',
});

// Return exact colors requested given enough rotations
const elasticColorFn = (n: number) =>
  euiPaletteColorBlind({ rotations: Math.ceil(n / 10) }).slice(0, n);

/**
 * This is not correctly returning the updated vis colors from eui.
 * All gradient function work correctly.
 */
export const elasticPalette = new KbnColorFnPalette({
  id: KbnPalette.Default,
  type: 'categorical',
  aliases: [
    KbnPalette.Default, // needed when switching between new and old themes
    'elastic_borealis', // placeholder - not yet used
    KbnPalette.Amsterdam, // to assign to existing default palettes
    KbnPalette.Elastic, // charts that picked the Elastic option while a brand palette was set
  ],
  colorCount: 10,
  defaultNumberOfColors: 30,
  name: elasticName,
  tag: i18n.translate('palettes.elastic.tag', {
    defaultMessage: 'Default',
  }),
  colorFn: elasticColorFn,
});

/**
 * The Elastic palette as a selectable option while a brand palette replaces the Default palette.
 */
export const elasticOptionPalette: IKbnPalette = new KbnColorFnPalette({
  id: KbnPalette.Elastic,
  type: 'categorical',
  aliases: [],
  colorCount: 10,
  defaultNumberOfColors: 30,
  name: elasticName,
  colorFn: elasticColorFn,
});

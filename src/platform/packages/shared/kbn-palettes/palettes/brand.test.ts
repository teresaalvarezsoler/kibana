/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { KbnPalette } from '../constants';
import { getPalettes, setBrandColors, elasticPalette } from '.';

const brandColors = ['#112233', '#445566', '#778899'];

describe('brand palette', () => {
  afterEach(() => {
    setBrandColors(undefined);
  });

  it('uses the Elastic palette when no brand colors are set', () => {
    expect(getPalettes(false).get(KbnPalette.Default)).toBe(elasticPalette);
  });

  it('replaces the default palettes with the brand colors', () => {
    setBrandColors(brandColors);
    const palettes = getPalettes(false);

    expect(palettes.get(KbnPalette.Default).colors()).toEqual(brandColors);
    expect(palettes.get(KbnPalette.ElasticLineOptimized).colors()).toEqual(brandColors);
    expect(palettes.get(KbnPalette.Amsterdam).colors()).toEqual(brandColors);
  });

  it('falls back to the brand palette for unknown palette ids', () => {
    setBrandColors(brandColors);

    expect(getPalettes(true).get('unknown_palette').colors()).toEqual(brandColors);
  });

  it('keeps other palettes unchanged', () => {
    const coolColors = getPalettes(false).get(KbnPalette.Cool).colors();
    setBrandColors(brandColors);

    expect(getPalettes(false).get(KbnPalette.Cool).colors()).toEqual(coolColors);
  });

  it('ignores an empty list of brand colors', () => {
    setBrandColors([]);

    expect(getPalettes(false).get(KbnPalette.Default)).toBe(elasticPalette);
  });
});

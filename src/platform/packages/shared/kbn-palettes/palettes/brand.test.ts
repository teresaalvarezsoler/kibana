/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import chroma from 'chroma-js';
import { KbnPalette } from '../constants';
import {
  elasticPalette,
  generateBrandPalettes,
  getLightTone,
  getPalettes,
  setBrandPalettes,
} from '.';

const brandPalettes = {
  categorical: ['#112233', '#AABBCC', '#445566', '#DDEEFF'],
  lineOptimized: ['#112233', '#445566', '#AABBCC', '#DDEEFF'],
};

describe('brand palette', () => {
  afterEach(() => {
    setBrandPalettes(undefined);
  });

  describe('getLightTone', () => {
    it('keeps the hue and lightens the color', () => {
      const lightTone = getLightTone('#091C5A');

      expect(chroma(lightTone).get('hsl.h')).toBeCloseTo(chroma('#091C5A').get('hsl.h'), 0);
      expect(chroma(lightTone).get('hsl.l')).toBeCloseTo(0.8, 2);
    });

    it('never goes above the maximum lightness', () => {
      expect(chroma(getLightTone('#FFB27F')).get('hsl.l')).toBeCloseTo(0.9, 2);
    });

    it('lightens grays without a hue', () => {
      expect(getLightTone('#8C8C8C')).toBe('#CCCCCC');
    });
  });

  describe('generateBrandPalettes', () => {
    it('pairs each dark tone with its light tone in the categorical palette', () => {
      const { categorical } = generateBrandPalettes(['#ff6600', '#091C5A']);

      expect(categorical).toEqual([
        '#FF6600',
        getLightTone('#FF6600'),
        '#091C5A',
        getLightTone('#091C5A'),
      ]);
    });

    it('lists all dark tones before the light tones in the line optimized palette', () => {
      const { lineOptimized } = generateBrandPalettes(['#FF6600', '#091C5A']);

      expect(lineOptimized).toEqual([
        '#FF6600',
        '#091C5A',
        getLightTone('#FF6600'),
        getLightTone('#091C5A'),
      ]);
    });
  });

  describe('getPalettes', () => {
    it('uses the Elastic palette when no brand palettes are set', () => {
      expect(getPalettes(false).get(KbnPalette.Default)).toBe(elasticPalette);
    });

    it('replaces the default palettes with the brand palettes', () => {
      setBrandPalettes(brandPalettes);
      const palettes = getPalettes(false);

      expect(palettes.get(KbnPalette.Default).colors()).toEqual(brandPalettes.categorical);
      expect(palettes.get(KbnPalette.ElasticLineOptimized).colors()).toEqual(
        brandPalettes.lineOptimized
      );
      expect(palettes.get(KbnPalette.Amsterdam).colors()).toEqual(brandPalettes.categorical);
    });

    it('falls back to the brand palette for unknown palette ids', () => {
      setBrandPalettes(brandPalettes);

      expect(getPalettes(true).get('unknown_palette').colors()).toEqual(brandPalettes.categorical);
    });

    it('keeps other palettes unchanged', () => {
      const coolColors = getPalettes(false).get(KbnPalette.Cool).colors();
      setBrandPalettes(brandPalettes);

      expect(getPalettes(false).get(KbnPalette.Cool).colors()).toEqual(coolColors);
    });

    it('ignores empty brand palettes', () => {
      setBrandPalettes({ categorical: [], lineOptimized: [] });

      expect(getPalettes(false).get(KbnPalette.Default)).toBe(elasticPalette);
    });
  });
});

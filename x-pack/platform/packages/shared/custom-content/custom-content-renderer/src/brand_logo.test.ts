/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getBrandLogoSvg, inlineBrandLogo } from './brand_logo';
import { sanitizeHtml } from './prepare_html';

const svg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M0 0h10v10z"/></svg>';
const BRAND_LOGO_HTML = '<html><body><kbn-brand-logo></kbn-brand-logo></body></html>';
const toDataUrl = (markup: string, type = 'image/svg+xml') =>
  `data:${type};base64,${Buffer.from(markup).toString('base64')}`;

describe('brand logo', () => {
  describe('getBrandLogoSvg', () => {
    it('decodes an SVG data URL', () => {
      expect(getBrandLogoSvg(toDataUrl(svg))).toBe(svg);
    });

    it('drops the XML declaration and doctype', () => {
      const markup = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE svg>${svg}`;

      expect(getBrandLogoSvg(toDataUrl(markup))).toBe(svg);
    });

    it('decodes UTF-8 text', () => {
      const markup = '<svg><title>Café</title></svg>';

      expect(getBrandLogoSvg(toDataUrl(markup))).toBe(markup);
    });

    it('ignores logos that are not SVG', () => {
      expect(getBrandLogoSvg(toDataUrl('png bytes', 'image/png'))).toBeUndefined();
      expect(getBrandLogoSvg(null)).toBeUndefined();
    });
  });

  describe('inlineBrandLogo', () => {
    it('replaces every placeholder with the logo', () => {
      const html = '<header><kbn-brand-logo></kbn-brand-logo></header><kbn-brand-logo/>';

      expect(inlineBrandLogo(html, toDataUrl(svg))).toBe(
        `<header><span class="cc-brand-logo">${svg}</span></header><span class="cc-brand-logo">${svg}</span>`
      );
    });

    it('removes the placeholders when there is no logo', () => {
      expect(inlineBrandLogo('<div><kbn-brand-logo></kbn-brand-logo></div>', null)).toBe(
        '<div></div>'
      );
    });

    it('leaves HTML without placeholders unchanged', () => {
      expect(inlineBrandLogo('<p>Hello</p>', toDataUrl(svg))).toBe('<p>Hello</p>');
    });

    it('is still sanitized after inlining', () => {
      const unsafe = '<svg><script>alert(1)</script><path onclick="alert(1)" d="M0 0"/></svg>';
      const html = sanitizeHtml(inlineBrandLogo(BRAND_LOGO_HTML, toDataUrl(unsafe)));

      expect(html).toContain('<path d="M0 0"');
      expect(html).not.toContain('script');
      expect(html).not.toContain('onclick');
    });
  });
});

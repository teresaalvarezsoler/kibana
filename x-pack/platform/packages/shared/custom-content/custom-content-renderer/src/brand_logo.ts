/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/** Placeholder a template writes where the organization's brand logo goes. */
export const BRAND_LOGO_PLACEHOLDER = '<kbn-brand-logo></kbn-brand-logo>';

/** Class of the element that wraps the inlined brand logo, for templates to size it. */
export const BRAND_LOGO_CLASS = 'cc-brand-logo';

const SVG_DATA_URL_PREFIX = 'data:image/svg+xml;base64,';
const placeholderRegex = /<kbn-brand-logo\b[^>]*?\/?>(?:\s*<\/kbn-brand-logo>)?/gi;

const decodeBase64 = (base64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)));

/**
 * Returns the SVG markup of a brand logo stored as an SVG data URL, or `undefined` for any other
 * logo. The panel's CSP blocks every image source, so the logo can only be shown as inline SVG.
 */
export const getBrandLogoSvg = (brandLogo: string | null | undefined): string | undefined => {
  if (!brandLogo?.startsWith(SVG_DATA_URL_PREFIX)) return undefined;

  try {
    const svg = decodeBase64(brandLogo.slice(SVG_DATA_URL_PREFIX.length))
      .replace(/<\?xml[^>]*\?>/gi, '')
      .replace(/<!DOCTYPE[^>]*>/gi, '')
      .trim();
    return svg.toLowerCase().startsWith('<svg') ? svg : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Replaces every brand logo placeholder in the HTML with the brand logo as inline SVG, or removes
 * the placeholders when there is no SVG logo. Runs before sanitizing, so the SVG is sanitized too.
 */
export const inlineBrandLogo = (html: string, brandLogo: string | null | undefined): string => {
  if (!placeholderRegex.test(html)) return html;
  placeholderRegex.lastIndex = 0;

  const svg = getBrandLogoSvg(brandLogo);
  const replacement = svg ? `<span class="${BRAND_LOGO_CLASS}">${svg}</span>` : '';
  return html.replace(placeholderRegex, () => replacement);
};

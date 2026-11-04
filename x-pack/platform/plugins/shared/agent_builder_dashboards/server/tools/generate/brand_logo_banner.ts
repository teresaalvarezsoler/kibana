/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  isSection,
  type AttachmentPanel,
  type DashboardAttachmentData,
} from '@kbn/agent-builder-dashboards-common';
import {
  BRAND_LOGO_EMBEDDABLE_TYPE,
  BRAND_LOGO_PANEL_HEIGHT,
  BRAND_LOGO_PANEL_WIDTH,
} from '@kbn/image-embeddable-plugin/common';

type DashboardWidget = DashboardAttachmentData['panels'][number];

const isBrandLogoBanner = (widget: DashboardWidget): widget is AttachmentPanel =>
  !isSection(widget) && widget.type === BRAND_LOGO_EMBEDDABLE_TYPE;

const shiftWidget = (widget: DashboardWidget, offset: number): DashboardWidget =>
  isSection(widget)
    ? { ...widget, grid: { y: Math.max(0, widget.grid.y + offset) } }
    : { ...widget, grid: { ...widget.grid, y: Math.max(0, widget.grid.y + offset) } };

/**
 * Returns the brand logo banner at the top level of the dashboard, if any.
 */
export const findBrandLogoBanner = (
  panels: DashboardAttachmentData['panels']
): AttachmentPanel | undefined => panels.find(isBrandLogoBanner);

export const createBrandLogoBanner = (): AttachmentPanel => ({
  type: BRAND_LOGO_EMBEDDABLE_TYPE,
  id: uuidv4(),
  config: { hide_title: true, hide_border: true },
  grid: { x: 0, y: 0, w: BRAND_LOGO_PANEL_WIDTH, h: BRAND_LOGO_PANEL_HEIGHT },
});

/**
 * Removes the brand logo banner and moves the other top-level widgets up into its space, so the
 * layout step arranges the dashboard as if the banner was not there.
 */
export const removeBrandLogoBanner = (
  panels: DashboardAttachmentData['panels']
): DashboardAttachmentData['panels'] => {
  const banner = findBrandLogoBanner(panels);
  if (!banner) return panels;

  return panels
    .filter((widget) => !isBrandLogoBanner(widget))
    .map((widget) => shiftWidget(widget, -banner.grid.h));
};

/**
 * Pins the brand logo banner full width at the top of the dashboard, below which every other
 * top-level widget moves down.
 */
export const addBrandLogoBanner = (
  dashboardData: DashboardAttachmentData,
  banner: AttachmentPanel
): DashboardAttachmentData => {
  const pinnedBanner = {
    ...banner,
    grid: { x: 0, y: 0, w: BRAND_LOGO_PANEL_WIDTH, h: BRAND_LOGO_PANEL_HEIGHT },
  };
  return {
    ...dashboardData,
    panels: [
      pinnedBanner,
      ...dashboardData.panels.map((widget) => shiftWidget(widget, BRAND_LOGO_PANEL_HEIGHT)),
    ],
  };
};

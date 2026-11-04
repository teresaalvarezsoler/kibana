/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { DashboardAttachmentData } from '@kbn/agent-builder-dashboards-common';
import {
  addBrandLogoBanner,
  createBrandLogoBanner,
  findBrandLogoBanner,
  removeBrandLogoBanner,
} from './brand_logo_banner';

const lensPanel = {
  type: 'lens',
  id: 'lens-1',
  config: {},
  grid: { x: 0, y: 0, w: 24, h: 10 },
};

const section = {
  id: 'section-1',
  title: 'Details',
  collapsed: false,
  grid: { y: 10 },
  panels: [],
};

const dashboard: DashboardAttachmentData = {
  title: 'Sales',
  panels: [lensPanel, section],
};

describe('brand logo banner', () => {
  it('pins the banner full width at the top and moves the other widgets down', () => {
    const banner = createBrandLogoBanner();
    const { panels } = addBrandLogoBanner(dashboard, banner);

    expect(panels[0]).toEqual({ ...banner, grid: { x: 0, y: 0, w: 48, h: 5 } });
    expect(panels[1]).toEqual({ ...lensPanel, grid: { ...lensPanel.grid, y: 5 } });
    expect(panels[2]).toEqual({ ...section, grid: { y: 15 } });
  });

  it('finds the banner among the top-level panels', () => {
    const banner = createBrandLogoBanner();

    expect(findBrandLogoBanner(addBrandLogoBanner(dashboard, banner).panels)).toEqual(
      expect.objectContaining({ id: banner.id })
    );
    expect(findBrandLogoBanner(dashboard.panels)).toBeUndefined();
  });

  it('restores the original layout when the banner is removed', () => {
    const { panels } = addBrandLogoBanner(dashboard, createBrandLogoBanner());

    expect(removeBrandLogoBanner(panels)).toEqual(dashboard.panels);
  });

  it('keeps the layout stable across repeated edits', () => {
    const banner = createBrandLogoBanner();
    const firstRun = addBrandLogoBanner(dashboard, banner);
    const secondRun = addBrandLogoBanner(
      { ...firstRun, panels: removeBrandLogoBanner(firstRun.panels) },
      banner
    );

    expect(secondRun).toEqual(firstRun);
  });
});

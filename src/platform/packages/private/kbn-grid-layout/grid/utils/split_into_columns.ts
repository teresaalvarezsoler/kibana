/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { GridPanelData } from '../grid_panel';
import type { CollapsibleSection, MainSection } from '../grid_section';
import type { GridLayoutData, OrderedLayout } from '../types';
import { getGridLayout, getOrderedLayout } from './conversions';
import { getSectionsInOrder } from './resolve_grid_section';

/** Approximate height of a section header + footer, in grid rows. */
const SECTION_CHROME_ROWS = 2;

interface LayoutBlock {
  height: number;
  section: MainSection | CollapsibleSection;
}

interface LayoutColumn {
  height: number;
  sections: OrderedLayout;
}

const getPanelsHeight = (panels: GridPanelData[]): number =>
  panels.reduce((maxRow, { row, height }) => Math.max(maxRow, row + height), 0);

/**
 * Splits panels into horizontal bands: groups of rows that no panel crosses.
 * Each band is returned with its rows starting at 0.
 */
const splitIntoBands = (panels: GridPanelData[]): GridPanelData[][] => {
  const sortedPanels = [...panels].sort((a, b) => a.row - b.row || a.column - b.column);
  const bands: GridPanelData[][] = [];
  let currentBand: GridPanelData[] = [];
  let bandStart = 0;
  let bandEnd = 0;

  sortedPanels.forEach((panel) => {
    if (currentBand.length && panel.row >= bandEnd) {
      bands.push(currentBand);
      currentBand = [];
    }
    if (!currentBand.length) bandStart = panel.row;
    currentBand.push({ ...panel, row: panel.row - bandStart });
    bandEnd = Math.max(bandEnd, panel.row + panel.height);
  });
  if (currentBand.length) bands.push(currentBand);
  return bands;
};

const getLayoutBlocks = (layout: GridLayoutData): LayoutBlock[] =>
  getSectionsInOrder(getOrderedLayout(layout)).flatMap((section): LayoutBlock[] => {
    const panels = Object.values(section.panels);
    if (!section.isMainSection) {
      return [
        {
          height: SECTION_CHROME_ROWS + (section.isCollapsed ? 0 : getPanelsHeight(panels)),
          section,
        },
      ];
    }
    return splitIntoBands(panels).map((band, index) => ({
      height: getPanelsHeight(band),
      section: {
        ...section,
        id: `${section.id}-band-${index}`,
        panels: Object.fromEntries(band.map((panel) => [panel.id, panel])),
      },
    }));
  });

/**
 * Distributes a layout over several side-by-side columns for wide screens.
 * Collapsible sections and bands of ungrouped panels are kept whole and keep their
 * relative order; each one goes to the column that is currently the shortest.
 */
export const splitLayoutIntoColumns = (
  layout: GridLayoutData,
  columnCount: number
): GridLayoutData[] => {
  const columns: LayoutColumn[] = Array.from({ length: columnCount }, () => ({
    height: 0,
    sections: {},
  }));

  getLayoutBlocks(layout).forEach(({ height, section }) => {
    const target = columns.reduce((shortest, column) =>
      column.height < shortest.height ? column : shortest
    );
    target.sections[section.id] = { ...section, order: Object.keys(target.sections).length };
    target.height += height;
  });

  return columns.map(({ sections }) => getGridLayout(sections));
};

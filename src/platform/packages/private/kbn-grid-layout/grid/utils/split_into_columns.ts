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
 * Greedily fills columns in order without exceeding `capacity` rows per column.
 * Returns the index of the first block in each column.
 */
const packInOrder = (heights: number[], capacity: number): number[] => {
  const columnStarts = [0];
  let columnHeight = 0;
  heights.forEach((height, index) => {
    if (columnHeight > 0 && columnHeight + height > capacity) {
      columnStarts.push(index);
      columnHeight = 0;
    }
    columnHeight += height;
  });
  return columnStarts;
};

/**
 * Distributes a layout over several side-by-side columns for wide screens, read like the
 * pages of a book: the first column holds the top of the dashboard and later columns
 * continue where the previous one ends. Collapsible sections and bands of ungrouped panels
 * are kept whole; the split points are chosen so the tallest column is as short as possible,
 * which leaves the earlier columns as full as they can be, so the last blocks move first.
 */
export const splitLayoutIntoColumns = (
  layout: GridLayoutData,
  columnCount: number
): GridLayoutData[] => {
  const blocks = getLayoutBlocks(layout);
  const heights = blocks.map(({ height }) => height);

  // binary search for the smallest column height that fits all blocks in `columnCount` columns
  let low = Math.max(0, ...heights);
  let high = heights.reduce((sum, height) => sum + height, 0);
  while (low < high) {
    const capacity = Math.floor((low + high) / 2);
    if (packInOrder(heights, capacity).length <= columnCount) high = capacity;
    else low = capacity + 1;
  }
  const columnStarts = packInOrder(heights, low);

  return Array.from({ length: columnCount }, (_, columnIndex) => {
    const columnBlocks = blocks.slice(
      columnStarts[columnIndex] ?? blocks.length,
      columnStarts[columnIndex + 1] ?? blocks.length
    );
    const sections: OrderedLayout = {};
    columnBlocks.forEach(({ section }, order) => {
      sections[section.id] = { ...section, order };
    });
    return getGridLayout(sections);
  });
};

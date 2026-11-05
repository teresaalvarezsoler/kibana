/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { GridLayoutData } from '../types';
import { mergeColumnLayouts, splitLayoutIntoColumns } from './split_into_columns';

const panel = (id: string, row: number, column: number, width: number, height: number) => ({
  id,
  row,
  column,
  width,
  height,
  type: 'panel' as const,
});

describe('splitLayoutIntoColumns', () => {
  it('splits ungrouped panels into bands and balances them across columns', () => {
    const layout: GridLayoutData = {
      a: panel('a', 0, 0, 24, 10),
      b: panel('b', 0, 24, 24, 10),
      c: panel('c', 10, 0, 48, 10),
      d: panel('d', 20, 0, 48, 5),
    };
    const [left, right] = splitLayoutIntoColumns(layout, 2);

    expect(Object.keys(left).sort()).toEqual(['a', 'b']);
    expect(Object.keys(right).sort()).toEqual(['c', 'd']);
    expect(right.c).toMatchObject({ row: 0, column: 0, width: 48 });
    expect(right.d).toMatchObject({ row: 10 });
  });

  it('reads like a book: the first half stays left, the last blocks move right', () => {
    const layout: GridLayoutData = {
      first: panel('first', 0, 0, 48, 5),
      second: panel('second', 5, 0, 48, 5),
      third: panel('third', 10, 0, 48, 5),
      fourth: panel('fourth', 15, 0, 48, 5),
      fifth: panel('fifth', 20, 0, 48, 5),
    };
    const [left, right] = splitLayoutIntoColumns(layout, 2);

    expect(Object.keys(left)).toEqual(['first', 'second', 'third']);
    expect(Object.keys(right)).toEqual(['fourth', 'fifth']);
    expect(right.fourth).toMatchObject({ row: 0 });
    expect(right.fifth).toMatchObject({ row: 5 });
  });

  it('keeps panels that span several rows in the same band', () => {
    const layout: GridLayoutData = {
      tall: panel('tall', 0, 0, 24, 20),
      top: panel('top', 0, 24, 24, 10),
      bottom: panel('bottom', 10, 24, 24, 10),
    };
    const [left, right] = splitLayoutIntoColumns(layout, 2);

    expect(Object.keys(left).sort()).toEqual(['bottom', 'tall', 'top']);
    expect(right).toEqual({});
  });

  it('keeps collapsible sections whole and in order', () => {
    const layout: GridLayoutData = {
      memory: {
        id: 'memory',
        type: 'section',
        row: 0,
        title: 'Memory',
        isCollapsed: false,
        panels: { m1: panel('m1', 0, 0, 48, 10), m2: panel('m2', 10, 0, 48, 10) },
      },
      network: {
        id: 'network',
        type: 'section',
        row: 1,
        title: 'Network',
        isCollapsed: false,
        panels: { n1: panel('n1', 0, 0, 48, 10) },
      },
      cpu: {
        id: 'cpu',
        type: 'section',
        row: 2,
        title: 'CPU',
        isCollapsed: true,
        panels: { c1: panel('c1', 0, 0, 48, 10) },
      },
    };
    const [left, right] = splitLayoutIntoColumns(layout, 2);

    expect(Object.keys(left)).toEqual(['memory']);
    expect(Object.keys(right)).toEqual(['network', 'cpu']);
    expect(right.network).toMatchObject({ row: 0 });
    expect(right.cpu).toMatchObject({ row: 1, isCollapsed: true });
  });

  describe('mergeColumnLayouts', () => {
    const layout: GridLayoutData = {
      intro: panel('intro', 0, 0, 48, 6),
      trends: {
        id: 'trends',
        type: 'section',
        row: 6,
        title: 'Trends',
        isCollapsed: false,
        panels: { t1: panel('t1', 0, 0, 48, 10), t2: panel('t2', 10, 0, 24, 8) },
      },
      errors: {
        id: 'errors',
        type: 'section',
        row: 7,
        title: 'Errors',
        isCollapsed: false,
        panels: { e1: panel('e1', 0, 0, 48, 12) },
      },
      footer: panel('footer', 8, 0, 48, 4),
    };

    it('restores the original layout from its columns', () => {
      expect(mergeColumnLayouts(splitLayoutIntoColumns(layout, 2))).toEqual(layout);
    });

    it('keeps edits made inside a column', () => {
      const [left, right] = splitLayoutIntoColumns(layout, 2);
      const editedRight = {
        ...right,
        footer: { ...right.footer, height: 8 },
      };
      const merged = mergeColumnLayouts([left, editedRight]);

      expect(merged.footer).toMatchObject({ height: 8 });
      expect(Object.keys(merged).sort()).toEqual(Object.keys(layout).sort());
    });
  });
});

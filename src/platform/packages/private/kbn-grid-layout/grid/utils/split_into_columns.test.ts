/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import type { GridLayoutData } from '../types';
import { splitLayoutIntoColumns } from './split_into_columns';

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

    expect(Object.keys(left).sort()).toEqual(['a', 'b', 'd']);
    expect(left.d).toMatchObject({ row: 10 });
    expect(Object.keys(right)).toEqual(['c']);
    expect(right.c).toMatchObject({ row: 0, column: 0, width: 48 });
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
});

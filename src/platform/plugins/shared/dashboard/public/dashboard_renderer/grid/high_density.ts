/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject } from 'rxjs';

/**
 * Minimum grid width, in pixels, at which the high density layout kicks in. Each column then
 * stays at least as wide as a dashboard on a typical laptop, so laptops keep the normal layout.
 */
export const HIGH_DENSITY_MIN_WIDTH = 1800;

/** Number of side-by-side columns used by the high density layout. */
export const HIGH_DENSITY_COLUMN_COUNT = 2;

const STORAGE_KEY = 'dashboard:highDensityOnWideScreens';

const readPreference = (): boolean => {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    // storage can be unavailable (private mode, blocked site data); fall back to the default
    return true;
  }
};

/**
 * The viewer's "Increase density on wide screens" preference. It is on by default and is
 * stored per browser, since it describes the viewer's screen rather than the dashboard.
 */
export const highDensity$ = new BehaviorSubject<boolean>(readPreference());

/** Updates the viewer's high density preference. */
export const setHighDensity = (enabled: boolean): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(enabled));
  } catch {
    // the preference still applies to the current page when it can't be stored
  }
  highDensity$.next(enabled);
};

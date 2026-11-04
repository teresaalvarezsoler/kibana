/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { Suspense, lazy } from 'react';
import { EuiLoadingSpinner } from '@elastic/eui';
import type { IUiSettingsClient } from '@kbn/core/public';
import type { AdvancedSettingsSetup } from '@kbn/advanced-settings-plugin/public';

const LazyBrandSettingsSection = lazy(() =>
  import('./brand_settings_section').then(({ BrandSettingsSection }) => ({
    default: BrandSettingsSection,
  }))
);

const SEARCH_TERMS = ['custom colors for dashboards', 'brand', 'palette', 'logo'];

/**
 * Adds the Brand section to the global settings page.
 */
export const registerBrandSettingsSection = (
  advancedSettings: AdvancedSettingsSetup,
  globalClient: IUiSettingsClient
): void => {
  advancedSettings.addGlobalSection(
    (props) => (
      <Suspense fallback={<EuiLoadingSpinner />}>
        <LazyBrandSettingsSection {...props} globalClient={globalClient} />
      </Suspense>
    ),
    (query) => SEARCH_TERMS.some((term) => term.includes(query.toLowerCase()))
  );
};

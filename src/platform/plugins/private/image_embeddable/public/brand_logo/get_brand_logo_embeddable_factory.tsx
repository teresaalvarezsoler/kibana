/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import type {
  DefaultEmbeddableApi,
  EmbeddablePublicDefinition,
} from '@kbn/embeddable-plugin/public';
import { PlacementStrategy } from '@kbn/embeddable-plugin/public';
import { BRAND_LOGO_SETTING } from '@kbn/charts-plugin/common';
import {
  initializeStateApi,
  initializeTitleManager,
  titleComparators,
} from '@kbn/presentation-publishing';
import type { BrandLogoEmbeddableState } from '../../server';
import {
  BRAND_LOGO_EMBEDDABLE_TYPE,
  BRAND_LOGO_PANEL_HEIGHT,
  BRAND_LOGO_PANEL_WIDTH,
} from '../../common/constants';
import { coreServices } from '../services/kibana_services';
import { BrandLogoPanel } from './brand_logo_panel';

export const getBrandLogoEmbeddableFactory = () => {
  const brandLogoEmbeddableFactory: EmbeddablePublicDefinition<
    BrandLogoEmbeddableState,
    DefaultEmbeddableApi<BrandLogoEmbeddableState>
  > = {
    type: BRAND_LOGO_EMBEDDABLE_TYPE,
    getPlacementHints: () => ({
      strategy: PlacementStrategy.placeAtTop,
      width: BRAND_LOGO_PANEL_WIDTH,
      height: BRAND_LOGO_PANEL_HEIGHT,
    }),
    buildEmbeddable: async ({ initialState, finalizeApi, uuid, parentApi }) => {
      const titleManager = initializeTitleManager(initialState);

      const stateApi = initializeStateApi<BrandLogoEmbeddableState>({
        uuid,
        parentApi,
        serializeState: () => titleManager.getLatestState(),
        anyStateChange$: titleManager.anyStateChange$,
        getComparators: () => titleComparators,
        applySerializedState: (nextState) => titleManager.reinitializeState(nextState),
      });

      const api = finalizeApi({
        ...titleManager.api,
        ...stateApi,
      });

      const logo = coreServices.settings.globalClient.get<string | null>(BRAND_LOGO_SETTING, null);

      return {
        api,
        Component: () => <BrandLogoPanel logo={logo} />,
      };
    },
  };

  return brandLogoEmbeddableFactory;
};

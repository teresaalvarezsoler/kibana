/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { i18n } from '@kbn/i18n';
import { apiCanAddNewPanel } from '@kbn/presentation-publishing';
import type { EmbeddableApiContext } from '@kbn/presentation-publishing';
import { ADD_PANEL_ANNOTATION_GROUP } from '@kbn/embeddable-plugin/public';
import { BRAND_LOGO_SETTING } from '@kbn/charts-plugin/common';
import { IncompatibleActionError } from '@kbn/ui-actions-plugin/public';
import type { ActionDefinition } from '@kbn/ui-actions-plugin/public/actions';
import type { BrandLogoEmbeddableState } from '../../server';
import {
  ADD_BRAND_LOGO_EMBEDDABLE_ACTION_ID,
  BRAND_LOGO_EMBEDDABLE_TYPE,
} from '../../common/constants';
import { coreServices } from '../services/kibana_services';

const hasBrandLogo = () =>
  Boolean(coreServices.settings.globalClient.get<string | null>(BRAND_LOGO_SETTING, null));

export const createBrandLogoAction: ActionDefinition<EmbeddableApiContext> = {
  id: ADD_BRAND_LOGO_EMBEDDABLE_ACTION_ID,
  getIconType: () => 'image',
  order: 19,
  isCompatible: async ({ embeddable: parentApi }) => apiCanAddNewPanel(parentApi) && hasBrandLogo(),
  execute: async ({ embeddable: parentApi }) => {
    if (!apiCanAddNewPanel(parentApi)) throw new IncompatibleActionError();

    parentApi.addNewPanel<BrandLogoEmbeddableState>(
      {
        panelType: BRAND_LOGO_EMBEDDABLE_TYPE,
        serializedState: { hide_title: true, hide_border: true },
      },
      { displaySuccessMessage: true }
    );
  },
  grouping: [ADD_PANEL_ANNOTATION_GROUP],
  getDisplayName: () =>
    i18n.translate('imageEmbeddable.brandLogo.displayName', {
      defaultMessage: 'Brand logo',
    }),
};

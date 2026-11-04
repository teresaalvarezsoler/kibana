/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import { css } from '@emotion/react';
import { EuiEmptyPrompt, useEuiTheme } from '@elastic/eui';
import { i18n } from '@kbn/i18n';

interface BrandLogoPanelProps {
  logo: string | null;
}

/**
 * Shows the brand logo, or a hint to add one when no logo is configured.
 */
export const BrandLogoPanel = ({ logo }: BrandLogoPanelProps) => {
  const { euiTheme } = useEuiTheme();

  if (!logo) {
    return (
      <EuiEmptyPrompt
        iconType="image"
        titleSize="xxs"
        title={
          <h3>
            {i18n.translate('imageEmbeddable.brandLogo.noLogoTitle', {
              defaultMessage: 'No brand logo',
            })}
          </h3>
        }
        body={i18n.translate('imageEmbeddable.brandLogo.noLogoBody', {
          defaultMessage:
            'Add your logo in Stack Management > Advanced Settings > Global Settings.',
        })}
      />
    );
  }

  return (
    <div
      data-test-subj="brandLogoPanel"
      css={css`
        display: flex;
        align-items: center;
        height: 100%;
        width: 100%;
        padding: ${euiTheme.size.s} ${euiTheme.size.m};
      `}
    >
      <img
        src={logo}
        alt={i18n.translate('imageEmbeddable.brandLogo.alt', { defaultMessage: 'Brand logo' })}
        css={css`
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
        `}
      />
    </div>
  );
};

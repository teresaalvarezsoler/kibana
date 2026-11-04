/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { z, lazySchema } from '@kbn/zod';
import { serializedTitlesSchema } from '@kbn/presentation-publishing-schemas';

/**
 * The brand logo panel stores no image: it shows the logo from the global brand settings.
 */
export const brandLogoEmbeddableSchema = lazySchema(() =>
  z
    .object({
      ...serializedTitlesSchema.shape,
    })
    .strict()
    .meta({
      description: 'Brand logo embeddable schema',
    })
);

export type BrandLogoEmbeddableState = z.output<typeof brandLogoEmbeddableSchema>;

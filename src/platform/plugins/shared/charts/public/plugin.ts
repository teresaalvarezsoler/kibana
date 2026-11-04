/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import { BehaviorSubject, Subscription, filter } from 'rxjs';
import type { Plugin, CoreSetup, IUiSettingsClient } from '@kbn/core/public';
import type { ExpressionsSetup } from '@kbn/expressions-plugin/public';
import type { AdvancedSettingsSetup } from '@kbn/advanced-settings-plugin/public';
import { setBrandPalettes } from '@kbn/palettes';
import {
  palette,
  systemPalette,
  resolveBrandPalettes,
  BRAND_PALETTE_SETTING,
  BRAND_CATEGORICAL_PALETTE_SETTING,
  BRAND_LINE_OPTIMIZED_PALETTE_SETTING,
} from '../common';

import { ThemeService } from './services';
import { PaletteService } from './services/palettes/service';
import { ActiveCursor } from './services/active_cursor';
import { registerBrandSettingsSection } from './brand_settings';

const BRAND_PALETTE_SETTINGS: readonly string[] = [
  BRAND_PALETTE_SETTING,
  BRAND_CATEGORICAL_PALETTE_SETTING,
  BRAND_LINE_OPTIMIZED_PALETTE_SETTING,
];

const readBrandPalettes = (globalClient: IUiSettingsClient) =>
  resolveBrandPalettes({
    brandColors: globalClient.get<string[]>(BRAND_PALETTE_SETTING, []),
    categorical: globalClient.get<string[]>(BRAND_CATEGORICAL_PALETTE_SETTING, []),
    lineOptimized: globalClient.get<string[]>(BRAND_LINE_OPTIMIZED_PALETTE_SETTING, []),
  });

interface SetupDependencies {
  expressions: ExpressionsSetup;
  advancedSettings?: AdvancedSettingsSetup;
}

/** @public */
export interface ChartsPluginSetup {
  theme: Omit<ThemeService, 'init'>;
  palettes: ReturnType<PaletteService['setup']>;
}

/** @public */
export type ChartsPluginStart = ChartsPluginSetup & {
  activeCursor: ActiveCursor;
};

/** @public */
export class ChartsPlugin implements Plugin<ChartsPluginSetup, ChartsPluginStart> {
  private readonly themeService = new ThemeService();
  private readonly paletteService = new PaletteService();
  private readonly activeCursor = new ActiveCursor();

  private readonly subscriptions = new Subscription();

  private palettes: undefined | ReturnType<PaletteService['setup']>;

  public setup(core: CoreSetup, dependencies: SetupDependencies): ChartsPluginSetup {
    dependencies.expressions.registerFunction(palette);
    dependencies.expressions.registerFunction(systemPalette);
    const { globalClient } = core.settings;
    // The brand palettes are set before any palette is built, and again whenever the brand
    // settings are saved, so charts use them without a page reload.
    const brandPalettes$ = new BehaviorSubject(readBrandPalettes(globalClient));
    this.subscriptions.add(brandPalettes$.subscribe(setBrandPalettes));
    this.subscriptions.add(
      globalClient
        .getUpdate$()
        .pipe(filter(({ key }) => BRAND_PALETTE_SETTINGS.includes(key)))
        .subscribe(() => brandPalettes$.next(readBrandPalettes(globalClient)))
    );
    if (dependencies.advancedSettings) {
      registerBrandSettingsSection(dependencies.advancedSettings, globalClient);
    }
    this.themeService.init(core.theme);
    this.palettes = this.paletteService.setup(core.theme.theme$, brandPalettes$);
    this.activeCursor.setup();

    return {
      theme: this.themeService,
      palettes: this.palettes,
    };
  }

  public start(): ChartsPluginStart {
    return {
      theme: this.themeService,
      palettes: this.palettes!,
      activeCursor: this.activeCursor,
    };
  }

  public stop() {
    this.subscriptions.unsubscribe();
  }
}

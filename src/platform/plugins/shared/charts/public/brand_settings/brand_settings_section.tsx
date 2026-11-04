/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React, { useMemo, useState } from 'react';
import {
  EuiBadge,
  EuiButton,
  EuiButtonEmpty,
  EuiColorPaletteDisplay,
  EuiDescribedFormGroup,
  EuiFilePicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiImage,
  EuiPanel,
  EuiSpacer,
  EuiText,
  EuiTitle,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import type { IUiSettingsClient } from '@kbn/core/public';
import type { RegistryComponentProps } from '@kbn/management-settings-section-registry';
import { generateBrandPalettes } from '@kbn/palettes';
import {
  BRAND_CATEGORICAL_PALETTE_SETTING,
  BRAND_LINE_OPTIMIZED_PALETTE_SETTING,
  BRAND_LOGO_SETTING,
  BRAND_PALETTE_SETTING,
  MAX_BRAND_COLORS,
  MAX_BRAND_LOGO_SIZE_IN_KB,
  MAX_BRAND_PALETTE_COLORS,
} from '../../common';
import { ColorListEditor } from './color_list_editor';

export interface BrandSettingsSectionProps extends RegistryComponentProps {
  globalClient: IUiSettingsClient;
}

interface BrandSettings {
  brandColors: string[];
  categorical: string[];
  lineOptimized: string[];
  logo: string | null;
}

const hexColorRegex = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const supportedLogoTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/gif'];

const readSettings = (globalClient: IUiSettingsClient): BrandSettings => ({
  brandColors: globalClient.get<string[]>(BRAND_PALETTE_SETTING, []),
  categorical: globalClient.get<string[]>(BRAND_CATEGORICAL_PALETTE_SETTING, []),
  lineOptimized: globalClient.get<string[]>(BRAND_LINE_OPTIMIZED_PALETTE_SETTING, []),
  logo: globalClient.get<string | null>(BRAND_LOGO_SETTING, null),
});

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

interface PaletteRowProps {
  title: string;
  description: string;
  generated: readonly string[];
  customized: string[];
  onChange: (colors: string[]) => void;
  disabled: boolean;
}

const PaletteRow = ({
  title,
  description,
  generated,
  customized,
  onChange,
  disabled,
}: PaletteRowProps) => {
  const isCustomized = customized.length > 0;
  const colors = isCustomized ? customized : generated;

  return (
    <EuiDescribedFormGroup
      fullWidth
      title={
        <h4>
          {title}{' '}
          <EuiBadge color={isCustomized ? 'primary' : 'hollow'}>
            {isCustomized
              ? i18n.translate('charts.brandSettings.customizedBadge', {
                  defaultMessage: 'Customized',
                })
              : i18n.translate('charts.brandSettings.generatedBadge', {
                  defaultMessage: 'Generated',
                })}
          </EuiBadge>
        </h4>
      }
      description={description}
    >
      <EuiFormRow fullWidth>
        <>
          <EuiColorPaletteDisplay type="fixed" palette={[...colors]} size="m" />
          <EuiSpacer size="s" />
          {isCustomized ? (
            <>
              <ColorListEditor
                colors={customized}
                maxColors={MAX_BRAND_PALETTE_COLORS}
                onChange={onChange}
                disabled={disabled}
              />
              <EuiButtonEmpty
                size="xs"
                iconType="refresh"
                disabled={disabled}
                onClick={() => onChange([])}
              >
                {i18n.translate('charts.brandSettings.resetPalette', {
                  defaultMessage: 'Reset to generated palette',
                })}
              </EuiButtonEmpty>
            </>
          ) : (
            <EuiButtonEmpty
              size="xs"
              iconType="pencil"
              disabled={disabled || generated.length === 0}
              onClick={() => onChange([...generated])}
            >
              {i18n.translate('charts.brandSettings.customizePalette', {
                defaultMessage: 'Customize palette',
              })}
            </EuiButtonEmpty>
          )}
        </>
      </EuiFormRow>
    </EuiDescribedFormGroup>
  );
};

/**
 * Global settings section to manage the organization brand colors, palettes and logo.
 */
export const BrandSettingsSection = ({
  globalClient,
  toasts,
  enableSaving,
}: BrandSettingsSectionProps) => {
  const [saved, setSaved] = useState<BrandSettings>(() => readSettings(globalClient));
  const [draft, setDraft] = useState<BrandSettings>(saved);
  const [logoError, setLogoError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const canSave = enableSaving.global;
  const isDirty = JSON.stringify(saved) !== JSON.stringify(draft);
  const validBrandColors = useMemo(
    () => draft.brandColors.filter((color) => hexColorRegex.test(color)),
    [draft.brandColors]
  );
  const generated = useMemo(() => generateBrandPalettes(validBrandColors), [validBrandColors]);

  const update = (changes: Partial<BrandSettings>) => setDraft({ ...draft, ...changes });

  const onLogoChange = async (files: FileList | null) => {
    const file = files?.[0];
    setLogoError(undefined);
    if (!file) return;

    if (!supportedLogoTypes.includes(file.type)) {
      setLogoError(
        i18n.translate('charts.brandSettings.logoTypeError', {
          defaultMessage: 'Use an SVG, PNG, JPEG or GIF image.',
        })
      );
      return;
    }
    if (file.size > MAX_BRAND_LOGO_SIZE_IN_KB * 1024) {
      setLogoError(
        i18n.translate('charts.brandSettings.logoSizeError', {
          defaultMessage: 'The image must be smaller than {maxSize} KB.',
          values: { maxSize: MAX_BRAND_LOGO_SIZE_IN_KB },
        })
      );
      return;
    }
    update({ logo: await readFileAsDataUrl(file) });
  };

  const save = async () => {
    setIsSaving(true);
    const toSave: BrandSettings = { ...draft, brandColors: validBrandColors };
    try {
      await Promise.all([
        globalClient.set(BRAND_PALETTE_SETTING, toSave.brandColors),
        globalClient.set(BRAND_CATEGORICAL_PALETTE_SETTING, toSave.categorical),
        globalClient.set(BRAND_LINE_OPTIMIZED_PALETTE_SETTING, toSave.lineOptimized),
        globalClient.set(BRAND_LOGO_SETTING, toSave.logo),
      ]);
      setSaved(toSave);
      setDraft(toSave);
      toasts.addSuccess(
        i18n.translate('charts.brandSettings.saved', {
          defaultMessage: 'Brand settings saved. Reload the page to apply them.',
        })
      );
    } catch (error) {
      toasts.addError(error, {
        title: i18n.translate('charts.brandSettings.saveError', {
          defaultMessage: 'Unable to save the brand settings',
        }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const disabled = !canSave || isSaving;

  return (
    <EuiPanel hasBorder paddingSize="l" data-test-subj="brandSettingsSection">
      <EuiTitle size="s">
        <h2>{i18n.translate('charts.brandSettings.title', { defaultMessage: 'Brand' })}</h2>
      </EuiTitle>
      <EuiSpacer size="s" />
      <EuiText size="s" color="subdued">
        <p>
          {i18n.translate('charts.brandSettings.description', {
            defaultMessage:
              'Use your brand colors and logo across Kibana. The brand palettes replace the default Elastic palettes in all charts, except charts that already use another palette. Changes apply after you reload the page.',
          })}
        </p>
      </EuiText>
      <EuiSpacer size="l" />

      <EuiDescribedFormGroup
        fullWidth
        title={
          <h4>
            {i18n.translate('charts.brandSettings.brandColorsTitle', {
              defaultMessage: 'Brand colors',
            })}
          </h4>
        }
        description={i18n.translate('charts.brandSettings.brandColorsDescription', {
          defaultMessage:
            'Your main brand colors, in order of importance. The palettes below are generated from them. Leave empty to use the Elastic palettes.',
        })}
      >
        <EuiFormRow fullWidth>
          <>
            {validBrandColors.length > 0 && (
              <>
                <EuiColorPaletteDisplay type="fixed" palette={validBrandColors} size="m" />
                <EuiSpacer size="s" />
              </>
            )}
            <ColorListEditor
              colors={draft.brandColors}
              maxColors={MAX_BRAND_COLORS}
              onChange={(brandColors) => update({ brandColors })}
              disabled={disabled}
            />
          </>
        </EuiFormRow>
      </EuiDescribedFormGroup>

      {validBrandColors.length > 0 && (
        <>
          <PaletteRow
            title={i18n.translate('charts.brandSettings.categoricalTitle', {
              defaultMessage: 'Chart palette',
            })}
            description={i18n.translate('charts.brandSettings.categoricalDescription', {
              defaultMessage:
                'Used by all charts except line charts. Each brand color is followed by a light tone of the same color.',
            })}
            generated={generated.categorical}
            customized={draft.categorical}
            onChange={(categorical) => update({ categorical })}
            disabled={disabled}
          />
          <PaletteRow
            title={i18n.translate('charts.brandSettings.lineOptimizedTitle', {
              defaultMessage: 'Line chart palette',
            })}
            description={i18n.translate('charts.brandSettings.lineOptimizedDescription', {
              defaultMessage:
                'Used by line charts. All brand colors come first, then their light tones, so the first lines are easy to tell apart.',
            })}
            generated={generated.lineOptimized}
            customized={draft.lineOptimized}
            onChange={(lineOptimized) => update({ lineOptimized })}
            disabled={disabled}
          />
        </>
      )}

      <EuiDescribedFormGroup
        fullWidth
        title={
          <h4>
            {i18n.translate('charts.brandSettings.logoTitle', { defaultMessage: 'Brand logo' })}
          </h4>
        }
        description={i18n.translate('charts.brandSettings.logoDescription', {
          defaultMessage:
            'Shown in a banner at the top of dashboards. Use an image smaller than {maxSize} KB, ideally with a transparent background.',
          values: { maxSize: MAX_BRAND_LOGO_SIZE_IN_KB },
        })}
      >
        <EuiFormRow fullWidth isInvalid={Boolean(logoError)} error={logoError}>
          <>
            {draft.logo && (
              <>
                <EuiImage
                  src={draft.logo}
                  alt={i18n.translate('charts.brandSettings.logoAlt', {
                    defaultMessage: 'Brand logo',
                  })}
                  size="m"
                />
                <EuiSpacer size="s" />
              </>
            )}
            <EuiFilePicker
              accept={supportedLogoTypes.join(',')}
              display="default"
              disabled={disabled}
              onChange={onLogoChange}
              initialPromptText={
                draft.logo
                  ? i18n.translate('charts.brandSettings.replaceLogo', {
                      defaultMessage: 'Select or drag a new logo',
                    })
                  : i18n.translate('charts.brandSettings.uploadLogo', {
                      defaultMessage: 'Select or drag your logo',
                    })
              }
            />
            {draft.logo && (
              <EuiButtonEmpty
                size="xs"
                color="danger"
                iconType="trash"
                disabled={disabled}
                onClick={() => update({ logo: null })}
              >
                {i18n.translate('charts.brandSettings.removeLogo', {
                  defaultMessage: 'Remove logo',
                })}
              </EuiButtonEmpty>
            )}
          </>
        </EuiFormRow>
      </EuiDescribedFormGroup>

      <EuiSpacer size="m" />
      <EuiFlexGroup justifyContent="flexEnd" gutterSize="s" responsive={false}>
        <EuiFlexItem grow={false}>
          <EuiButtonEmpty disabled={!isDirty || isSaving} onClick={() => setDraft(saved)}>
            {i18n.translate('charts.brandSettings.cancel', { defaultMessage: 'Cancel' })}
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <EuiButton
            fill
            isLoading={isSaving}
            disabled={!isDirty || !canSave}
            onClick={save}
            data-test-subj="brandSettingsSave"
          >
            {i18n.translate('charts.brandSettings.save', { defaultMessage: 'Save brand settings' })}
          </EuiButton>
        </EuiFlexItem>
      </EuiFlexGroup>
    </EuiPanel>
  );
};

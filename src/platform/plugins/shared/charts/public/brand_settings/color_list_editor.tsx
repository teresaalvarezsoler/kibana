/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import React from 'react';
import {
  EuiButtonEmpty,
  EuiButtonIcon,
  EuiColorPicker,
  EuiFlexGroup,
  EuiFlexItem,
  EuiSpacer,
  EuiToolTip,
  type EuiButtonIconProps,
} from '@elastic/eui';
import { i18n } from '@kbn/i18n';

interface ColorListEditorProps {
  colors: readonly string[];
  maxColors: number;
  onChange: (colors: string[]) => void;
  disabled?: boolean;
}

interface ColorActionButtonProps {
  label: string;
  iconType: EuiButtonIconProps['iconType'];
  color?: EuiButtonIconProps['color'];
  disabled: boolean;
  onClick: () => void;
}

const NEW_COLOR = '#000000';

const ColorActionButton = ({
  label,
  iconType,
  color,
  disabled,
  onClick,
}: ColorActionButtonProps) => (
  <EuiFlexItem grow={false}>
    <EuiToolTip content={label} disableScreenReaderOutput>
      <EuiButtonIcon
        iconType={iconType}
        color={color}
        disabled={disabled}
        onClick={onClick}
        aria-label={label}
      />
    </EuiToolTip>
  </EuiFlexItem>
);

/**
 * Edits an ordered list of colors with a color picker per color.
 */
export const ColorListEditor = ({
  colors,
  maxColors,
  onChange,
  disabled = false,
}: ColorListEditorProps) => {
  const updateColor = (index: number, color: string) =>
    onChange(colors.map((current, currentIndex) => (currentIndex === index ? color : current)));

  const removeColor = (index: number) =>
    onChange(colors.filter((_, currentIndex) => currentIndex !== index));

  const moveColor = (index: number, offset: number) => {
    const reordered = [...colors];
    [reordered[index], reordered[index + offset]] = [reordered[index + offset], reordered[index]];
    onChange(reordered);
  };

  return (
    <>
      {colors.map((color, index) => {
        const position = index + 1;
        return (
          <EuiFlexGroup key={index} gutterSize="xs" alignItems="center" responsive={false}>
            <EuiFlexItem>
              <EuiColorPicker
                compressed
                color={color}
                disabled={disabled}
                onChange={(text) => updateColor(index, text.toUpperCase())}
                aria-label={i18n.translate('charts.brandSettings.colorLabel', {
                  defaultMessage: 'Color {position}',
                  values: { position },
                })}
              />
            </EuiFlexItem>
            <ColorActionButton
              iconType="sortUp"
              disabled={disabled || index === 0}
              onClick={() => moveColor(index, -1)}
              label={i18n.translate('charts.brandSettings.moveColorUp', {
                defaultMessage: 'Move color {position} up',
                values: { position },
              })}
            />
            <ColorActionButton
              iconType="sortDown"
              disabled={disabled || index === colors.length - 1}
              onClick={() => moveColor(index, 1)}
              label={i18n.translate('charts.brandSettings.moveColorDown', {
                defaultMessage: 'Move color {position} down',
                values: { position },
              })}
            />
            <ColorActionButton
              iconType="trash"
              color="danger"
              disabled={disabled}
              onClick={() => removeColor(index)}
              label={i18n.translate('charts.brandSettings.removeColor', {
                defaultMessage: 'Remove color {position}',
                values: { position },
              })}
            />
          </EuiFlexGroup>
        );
      })}
      <EuiSpacer size="xs" />
      <EuiButtonEmpty
        size="xs"
        iconType="plusCircle"
        disabled={disabled || colors.length >= maxColors}
        onClick={() => onChange([...colors, NEW_COLOR])}
      >
        {i18n.translate('charts.brandSettings.addColor', { defaultMessage: 'Add color' })}
      </EuiButtonEmpty>
    </>
  );
};

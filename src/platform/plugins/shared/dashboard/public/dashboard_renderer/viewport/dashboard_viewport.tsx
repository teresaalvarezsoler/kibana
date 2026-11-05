/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the "Elastic License
 * 2.0", the "GNU Affero General Public License v3.0 only", and the "Server Side
 * Public License v 1"; you may not use this file except in compliance with, at
 * your election, the "Elastic License 2.0", the "GNU Affero General Public
 * License v3.0 only", or the "Server Side Public License, v 1".
 */

import classNames from 'classnames';
import React, { useCallback, useMemo, useState } from 'react';

import { EuiPortal, useResizeObserver, type UseEuiTheme } from '@elastic/eui';
import { ExitFullScreenButton } from '@kbn/shared-ux-button-exit-full-screen';
import {
  useBatchedPublishingSubjects,
  useStateFromPublishingSubject,
} from '@kbn/presentation-publishing';
import { useMemoCss } from '@kbn/css-utils/public/use_memo_css';
import { useDashboardApi } from '../../dashboard_api/use_dashboard_api';
import { useDashboardInternalApi } from '../../dashboard_api/use_dashboard_internal_api';
import { DashboardGrid } from '../grid';
import { DASHBOARD_MAX_WIDTH } from '../grid/constants';
import { HIGH_DENSITY_MIN_WIDTH, highDensity$ } from '../grid/high_density';
import { DashboardEmptyScreen } from './empty_screen/dashboard_empty_screen';

export const DashboardViewport = () => {
  const dashboardApi = useDashboardApi();
  const dashboardInternalApi = useDashboardInternalApi();
  const [
    dashboardTitle,
    description,
    expandedPanelId,
    layout,
    viewMode,
    useMargins,
    fullWidth,
    fullScreenMode,
  ] = useBatchedPublishingSubjects(
    dashboardApi.title$,
    dashboardApi.description$,
    dashboardApi.expandedPanelId$,
    dashboardApi.layout$,
    dashboardApi.viewMode$,
    dashboardApi.settings.useMargins$,
    dashboardApi.settings.fullWidth$,
    dashboardApi.fullScreenMode$
  );
  const highDensity = useStateFromPublishingSubject(highDensity$);
  const [wrapperElement, setWrapperElement] = useState<HTMLDivElement | null>(null);
  const { width: availableWidth } = useResizeObserver(wrapperElement, 'width');

  // a maximized panel and print layouts always use the available width
  const canAdaptWidth = !expandedPanelId && viewMode !== 'print';
  const showColumns = canAdaptWidth && highDensity && availableWidth >= HIGH_DENSITY_MIN_WIDTH;
  const isFixedWidth = canAdaptWidth && !showColumns && !fullWidth;

  const onExit = useCallback(() => {
    dashboardApi.setFullScreenMode(false);
  }, [dashboardApi]);

  const { panelCount, visiblePanelCount, sectionCount } = useMemo(() => {
    const panels = Object.values(layout.panels);
    const visiblePanels = panels.filter(({ grid }) => {
      return !dashboardInternalApi.isSectionCollapsed(grid.sectionId);
    });
    return {
      panelCount: panels.length,
      visiblePanelCount: visiblePanels.length,
      sectionCount: Object.keys(layout.sections).length,
    };
  }, [layout, dashboardInternalApi]);

  const classes = classNames('dshDashboardViewport', {
    'dshDashboardViewport--empty': panelCount === 0 && sectionCount === 0,
    'dshDashboardViewport--print': viewMode === 'print',
    'dshDashboardViewport--panelExpanded': Boolean(expandedPanelId),
    'dshDashboardViewport--fixedWidth': isFixedWidth,
  });

  const styles = useMemoCss(dashboardViewportStyles);

  return (
    <div
      ref={setWrapperElement}
      className={classNames('dshDashboardViewportWrapper', {
        'dshDashboardViewportWrapper--defaultBg': !useMargins,
        'dshDashboardViewportWrapper--isFullscreen': fullScreenMode,
      })}
      css={styles.wrapper}
    >
      {fullScreenMode && (
        <EuiPortal>
          <ExitFullScreenButton onExit={onExit} toggleChrome={!dashboardApi.isEmbeddedExternally} />
        </EuiPortal>
      )}
      <div
        className={classes}
        css={styles.viewport}
        data-shared-items-container
        data-title={dashboardTitle}
        data-description={description}
        data-shared-items-count={visiblePanelCount}
        data-view-mode={viewMode}
        data-test-subj={'dshDashboardViewport'}
      >
        {panelCount === 0 && sectionCount === 0 ? (
          <DashboardEmptyScreen />
        ) : (
          <DashboardGrid showColumns={showColumns} />
        )}
      </div>
    </div>
  );
};

const dashboardViewportStyles = {
  wrapper: ({ euiTheme }: UseEuiTheme) => ({
    flex: 'auto',
    display: 'flex',
    flexDirection: 'column' as 'column',
    width: '100%',
    backgroundColor: euiTheme.colors.backgroundBaseRecessed,
    '&.dshDashboardViewportWrapper--defaultBg': {
      backgroundColor: euiTheme.colors.backgroundBaseSubdued,
    },
    '.dshDashboardViewport-controls': {
      margin: `0 ${euiTheme.size.s}`,
      paddingTop: euiTheme.size.s,
    },
  }),
  viewport: {
    width: '100%',
    '&.dshDashboardViewport--fixedWidth': {
      maxWidth: DASHBOARD_MAX_WIDTH,
      marginInline: 'auto',
    },
    '&.dshDashboardViewport--empty': {
      height: '100%',
    },
    '&.dshDashboardViewport--panelExpanded': {
      flex: 1,
    },
    '&.dshDashboardViewport--print': {
      '.kbnGrid': {
        display: 'block !important',
      },
      '.kbnGridSectionHeader, .kbnGridSectionFooter': {
        display: 'none',
      },
      '.kbnGridPanel': {
        height: '100% !important',
      },
    },
  },
};

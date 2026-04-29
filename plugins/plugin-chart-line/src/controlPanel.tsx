import React from 'react';

export const controlPanel = {
  controlPanelSections: [
    {
      label: 'Query',
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['groupby'],
        ['limit'],
      ],
    },
    {
      label: 'Chart Options',
      expanded: true,
      controlSetRows: [
        ['line_type'],
        ['color_scheme'],
        ['show_legend'],
      ],
    },
  ],
};

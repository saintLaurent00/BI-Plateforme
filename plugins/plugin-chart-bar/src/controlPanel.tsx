import React from 'react';

export const controlPanel = {
  controlPanelSections: [
    {
      label: 'Query',
      expanded: true,
      controlSetRows: [
        ['metrics'],
        ['groupby'],
        ['row_limit'],
      ],
    },
    {
      label: 'Chart Options',
      expanded: true,
      controlSetRows: [
        ['color_scheme'],
        ['show_legend'],
      ],
    },
  ],
};

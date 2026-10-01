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
        ['pie_type'],
        ['color_scheme'],
        ['show_labels'],
        ['show_legend'],
      ],
    },
  ],
};

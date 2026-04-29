import React from 'react';

export const Styles = ({ children, height, width }: any) => (
  <div style={{ height, width, position: 'relative' }}>
    {children}
  </div>
);

declare module 'react-resizable-panels' {
  import * as React from 'react';

  export const PanelGroup: React.ComponentType<Record<string, unknown>>;
  export const Panel: React.ComponentType<Record<string, unknown>>;
  export const PanelResizeHandle: React.ComponentType<Record<string, unknown>>;

  export default PanelGroup;
}

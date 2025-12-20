// Declarations for importing styles and static assets in TypeScript
// Fixes: "Cannot find module or type declarations for side-effect import of '*.css'"

declare module '*.css';
declare module '*.scss';
declare module '*.module.css';
declare module '*.module.scss';

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<
    React.SVGProps<SVGSVGElement> & { title?: string }
  >;
  const src: string;
  export default src;
}

declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.webp';

declare module 'react-map-interaction' {
  import * as React from 'react';

  export interface MapInteractionCSSProps {
    value?: {
      scale: number;
      translation: { x: number; y: number };
    };
    onChange?: (value: { scale: number; translation: { x: number; y: number } }) => void;
    children?: React.ReactNode;
  }

  export class MapInteractionCSS extends React.Component<MapInteractionCSSProps> {}
}
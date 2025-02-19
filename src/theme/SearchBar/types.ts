import React from 'react';

export type SearchMetadata = {
  title: string;
  path: string;
  level: number;
  type: string;
  content: string;
  documentTitle: string;
  [key: string]: string | number;
};

export interface SearchResult {
  id: string;
  data: string;
  metadata: SearchMetadata;
}

export interface TypewriterTextProps {
  text: string;
  children: (typedText: string) => React.JSX.Element;
}

export interface LoadingDotsProps {
  text?: string;
}

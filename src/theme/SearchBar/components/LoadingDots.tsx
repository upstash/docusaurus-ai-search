import React from 'react';
import { LoadingDotsProps } from '../types';
import styles from '../styles.module.css';

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  text = 'Thinking',
}) => (
  <span className={styles.loadingDots}>
    {text}
    <span className={styles.dots}>
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </span>
  </span>
);

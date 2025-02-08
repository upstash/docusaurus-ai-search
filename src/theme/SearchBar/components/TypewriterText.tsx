import React, { useState, useEffect } from 'react';
import { TypewriterTextProps } from '../types';

export const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  children,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }
    }, 8);
    return () => clearTimeout(timer);
  }, [text, currentIndex]);

  return children(displayedText);
};

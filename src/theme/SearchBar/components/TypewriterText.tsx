import React, { useState, useEffect } from 'react';
import { TypewriterTextProps } from '../types';

export const TypewriterText: React.FC<TypewriterTextProps> = ({ text, children }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setDisplayedText(text);
      return;
    }

    const timer = setTimeout(() => {
      if (currentIndex < text.length) {
        setDisplayedText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      } else {
        setIsComplete(true);
      }
    }, 8);
    return () => clearTimeout(timer);
  }, [text, currentIndex, isComplete]);

  return children(displayedText);
};

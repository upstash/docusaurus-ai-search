import React, { useState, useEffect, useRef, useCallback } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { useHistory } from '@docusaurus/router';
import { useColorMode } from '@docusaurus/theme-common';
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './styles.module.css';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

interface SearchResult {
  id: string;
  data: string;
  metadata: {
    title: string;
    path: string;
    level: number;
    type: string;
    content: string;
    documentTitle: string;
    [key: string]: string | number;
  };
}

const TypewriterText = ({ 
  text, 
  children 
}: { 
  text: string;
  children: (typedText: string) => JSX.Element;
}) => {
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

const LoadingDots = ({ text = "Thinking" }: { text?: string }) => (
  <span className={styles.loadingDots}>
    {text}
    <span className={styles.dots}>
      <span>.</span><span>.</span><span>.</span>
    </span>
  </span>
);

// Custom hook for debouncing values
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

const SearchBarContent = (): JSX.Element => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const history = useHistory();
  const {siteConfig} = useDocusaurusContext();
  const { colorMode } = useColorMode();

  const enableAiChat = siteConfig.customFields?.enableAiChat as boolean;

  // Debounce search query
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Clear all search related state
  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setAiResponse(null);
    setError(null);
  }, []);

  // Search function
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/query-index', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error('Search request failed');
      }

      const results = await response.json();
      console.log("results: ", results);
      
      // Map the query results to match SearchResult type
      const mappedResults: SearchResult[] = results.map(result => ({
        id: String(result.id),
        data: result.data,
        metadata: {
          title: result.metadata.title,
          path: result.metadata.path,
          level: result.metadata.level,
          type: result.metadata.type,
          content: result.metadata.content,
          documentTitle: result.metadata.documentTitle,
        },
      }));
      
      setSearchResults(mappedResults);
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Effect to trigger search when debounced query changes
  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  // Handle search input changes
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Clear AI response when search query changes
  useEffect(() => {
    setAiResponse(null);
  }, [searchQuery]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Press Escape or Command+K to close the search modal
      if ((e.key === 'Escape' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) && isModalOpen) {
        e.preventDefault();
        setIsModalOpen(false);
        clearSearch();
      }
      // Press Command/K to open the search modal
      if (e.key === 'k' && (e.metaKey || e.ctrlKey) && !isModalOpen) {
        e.preventDefault();
        setIsModalOpen(true);
        setTimeout(() => searchInputRef.current?.focus(), 100);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, clearSearch]);

  // Handle result click
  const handleResultClick = (result: SearchResult) => {
    history.push('/' + result.id);
    setIsModalOpen(false);
    clearSearch();
  };

  const handleClearClick = () => {
    clearSearch();
  };

  const handleAiQuestion = async (question: string) => {
    setIsAiLoading(true);
    setAiResponse(null);
    setError(null);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question,
          context: searchResults.map(result => ({
            content: result.data,
            metadata: result.metadata
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      setAiResponse(data.response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className={styles.searchContainer}>
      <button 
        className={styles.searchButton} 
        onClick={() => setIsModalOpen(true)}
        aria-label="Search"
      >
        <svg
          className={styles.searchIcon}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span className={styles.searchButtonText}>Search</span>
        <span className={styles.searchShortcut}>⌘K</span>
      </button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => {
          setIsModalOpen(false);
        }}>
          <div 
            ref={modalRef}
            className={styles.modalContent}
            onClick={e => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <form className={styles.searchForm} onSubmit={(e) => e.preventDefault()}>
                <div className={styles.inputWrapper}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search documentation..."
                    value={searchQuery}
                    onChange={handleSearchInput}
                    className={styles.searchInput}
                    autoFocus
                  />
                  <div className={styles.inputActions}>
                    {searchQuery && (
                      <button
                        type="button"
                        className={styles.clearButton}
                        onClick={handleClearClick}
                        aria-label="Clear search"
                      >
                        <svg 
                          viewBox="0 0 24 24" 
                          className={styles.clearIcon}
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    )}
                    <div className={styles.divider}></div>
                    <button 
                      className={styles.closeButton}
                      onClick={() => {
                        setIsModalOpen(false);
                        clearSearch();
                      }}
                      aria-label="Close search"
                    >
                      <span className={styles.escKey}>ESC</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <div ref={searchResultsRef} className={styles.searchResults}>
              {isLoading ? (
                <div className={styles.loadingText}>
                  <LoadingDots text="Loading" />
                </div>
              ) : error ? (
                <div className={styles.error}>{error}</div>
              ) : searchResults.length > 0 ? (
                <>
                  {enableAiChat && (
                    <div 
                      className={`${styles.aiSection} ${aiResponse ? styles.aiSectionResponded : ''}`}
                      onClick={() => !isAiLoading && !aiResponse && handleAiQuestion(searchQuery)}
                    >
                      <div className={styles.aiQueryWrapper}>
                        <div className={styles.aiQueryInfo}>
                          <span className={styles.aiLabel}>AI</span>
                          <div className={styles.aiQueryTextWrapper}>
                            <span className={styles.aiQueryText}>
                              Tell me about <span className={styles.aiQueryHighlight}>{searchQuery}</span>
                            </span>
                          </div>
                        </div>
                        <span className={styles.aiStatus}>
                          {isAiLoading ? <LoadingDots /> : (aiResponse ? 'Response →' : 'Ask →')}
                        </span>
                      </div>
                      {aiResponse && (
                        <div className={styles.aiResponseWrapper}>
                          <div className={styles.aiResponse}>
                            <React.Suspense fallback={<LoadingDots />}>
                              <TypewriterText text={aiResponse}>
                                {(typedText) => <ReactMarkdown>{typedText}</ReactMarkdown>}
                              </TypewriterText>
                            </React.Suspense>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className={styles.searchResultItem}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className={styles.resultTitle}>
                        {result.metadata.title}
                      </div>
                      <div className={styles.resultPath}>
                        {result.metadata.documentTitle} • {result.metadata.type}
                      </div>
                      <div className={styles.resultPreview}>
                        {result.metadata.content}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className={styles.searchResultsPlaceholder}>
                  Start typing to search...
                </div>
              )}
            </div>
            
            <div className={styles.modalFooter}>
              <div className={styles.poweredBy}>
                <span>Powered by</span>
                <img 
                  src={colorMode === 'dark' ? "/img/upstash/logo-dark.svg" : "/img/upstash/logo.svg"}
                  alt="Upstash Logo" 
                  className={styles.searchLogo}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function SearchBar(): JSX.Element {
  return (
    <BrowserOnly>
      {() => <SearchBarContent />}
    </BrowserOnly>
  );
}

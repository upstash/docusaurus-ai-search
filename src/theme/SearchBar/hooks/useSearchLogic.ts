import { useState, useCallback, useEffect, useMemo } from 'react';
import { SearchResult } from '../types';
import { useDebounce } from './useDebounce';
import { Index } from '@upstash/vector';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export function useSearchLogic() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { siteConfig } = useDocusaurusContext();

  const { index, namespace } = useMemo(() => {
    return {
      index: new Index({
        url: siteConfig.customFields.upstashVectorRestUrl as string,
        token: siteConfig.customFields.upstashVectorReadOnlyRestToken as string,
      }),
      namespace: siteConfig.customFields.upstashVectorIndexNamespace as string || 'docusaurus-ai-search-upstash'
    };
  }, [siteConfig.customFields.upstashVectorRestUrl, siteConfig.customFields.upstashVectorReadOnlyRestToken, siteConfig.customFields.upstashVectorIndexNamespace]);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await index.query({
        topK: 15,
        data: query,
        includeMetadata: true,
        includeData: true,
        includeVectors: false,
      }, { namespace });

      setSearchResults(
        results.map((result: any) => ({
          id: String(result.id),
          data: result.data,
          metadata: result.metadata,
        }))
      );
    } catch (error) {
      console.error('Search error:', error);
      setError('An error occurred while searching. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [index, namespace]);

  useEffect(() => {
    performSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, performSearch]);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoading,
    error,
    setSearchResults,
    setError,
  };
}

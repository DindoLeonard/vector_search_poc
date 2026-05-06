"use client";

import { useState, useEffect } from "react";

type SearchResult = {
  userId: number;
  userName: string;
  userEmail: string;
  contentTitle: string;
  content: string;
  rank: number;
};

export default function SearchWinnerPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  console.log("results", results);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `/api/search-winner?query=${encodeURIComponent(query.trim())}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch results");
        }
        const data = await response.json();
        setResults(data);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search for better performance

    return () => clearTimeout(searchTimeout);
  }, [query]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search Winner</h1>

      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for users or content..."
          className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {isSearching && (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}

      {!isSearching && results.length === 0 && query.trim().length >= 2 && (
        <div className="text-center py-8 text-gray-500">
          No results found for &quot;{query}&quot;
        </div>
      )}

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={`${result.userId}-${result.contentTitle}`}
            className="p-4 border rounded-lg"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{result.contentTitle}</h2>
              <span className="text-xs px-2 py-1 rounded-full">
                {`${result.userName} (${result.userEmail})`}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{result.content}</p>
            <div className="mt-2 text-xs text-gray-400">
              Relevance score: {result.rank.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { searchUsers, searchContent } from "@/app/actions";

type SearchResult = {
  id: number;
  type: "user" | "content";
  title: string;
  subtitle: string;
  rank: number;
};

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Fetch results from both sources
        const [userResults, contentResults] = await Promise.all([
          searchUsers(query.trim()),
          searchContent(query.trim()),
        ]);

        // Process user results
        const processedUserResults: SearchResult[] = userResults.ftResults.map(
          (user) => ({
            id: user.id,
            type: "user",
            title: user.name,
            subtitle: user.email,
            // Calculate rank based on how well it matches (simplified)
            rank: calculateRank(query, [user.name, user.email]),
          })
        );

        console.log(userResults);
        console.log(contentResults);

        // Process content results
        const processedContentResults: SearchResult[] =
          contentResults.ftResults.map((content) => ({
            id: content.id,
            type: "content",
            title: content.title,
            subtitle:
              content.content.substring(0, 100) +
              (content.content.length > 100 ? "..." : ""),
            // Calculate rank based on how well it matches
            rank: calculateRank(query, [content.title, content.content]),
          }));

        // Combine and sort by rank
        const combinedResults = [
          ...processedUserResults,
          ...processedContentResults,
        ].sort((a, b) => b.rank - a.rank);

        setResults(combinedResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300); // Debounce search for better performance

    return () => clearTimeout(searchTimeout);
  }, [query]);

  // Simple ranking algorithm based on exact matches and partial matches
  function calculateRank(query: string, fields: string[]): number {
    const queryTerms = query.toLowerCase().split(/\s+/);
    let score = 0;

    fields.forEach((field) => {
      if (!field) return;
      const fieldLower = field.toLowerCase();

      // Exact match bonus
      if (fieldLower === query.toLowerCase()) {
        score += 10;
      }

      // Contains whole query bonus
      if (fieldLower.includes(query.toLowerCase())) {
        score += 5;
      }

      // Individual terms matching
      queryTerms.forEach((term) => {
        if (term.length < 2) return;

        // Exact word match
        const wordMatch = new RegExp(`\\b${term}\\b`, "i");
        if (wordMatch.test(fieldLower)) {
          score += 3;
        }

        // Partial match
        if (fieldLower.includes(term)) {
          score += 1;
        }
      });
    });

    return score;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

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
            key={`${result.type}-${result.id}`}
            className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{result.title}</h2>
              <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">
                {result.type === "user" ? "User" : "Content"}
              </span>
            </div>
            <p className="text-gray-600 mt-1">{result.subtitle}</p>
            <div className="mt-2 text-xs text-gray-400">
              Relevance score: {result.rank}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

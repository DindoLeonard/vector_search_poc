"use client";

import { useEffect, useState } from "react";

interface User {
  id: number;
  name: string;
  age: number;
  email: string;
  createdAt: string | null;
  searchVector: string;
}

interface Content {
  id: number;
  userId: number | null;
  title: string;
  content: string;
  createdAt: string | null;
  searchVector: string;
}

interface AllData {
  users: User[];
  contents: Content[];
  total: {
    users: number;
    contents: number;
  };
}

export default function AllPage() {
  const [data, setData] = useState<AllData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/all");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Combine contents with their associated users
  const combinedData =
    data?.contents.map((content) => {
      const user = data.users.find((u) => u.id === content.userId);
      return {
        contentId: content.id,
        contentTitle: content.title,
        contentText: content.content,
        contentCreatedAt: content.createdAt,
        userId: user?.id || null,
        userName: user?.name || "Unknown User",
        userEmail: user?.email || "N/A",
        userAge: user?.age || null,
      };
    }) || [];

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">All Data</h1>

      <p className="text-gray-600 mb-4">
        Total: {data?.total.contents || 0} contents by {data?.total.users || 0}{" "}
        users
      </p>

      <div className="space-y-4">
        {combinedData.length > 0 ? (
          combinedData.map((item) => (
            <div
              key={`${item.userId}-${item.contentId}`}
              className="p-4 border rounded-lg"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{item.contentTitle}</h2>
                <span className="text-xs px-2 py-1 rounded-full">
                  {`${item.userName} (${item.userEmail})`}
                </span>
              </div>
              <p className="text-gray-600 mt-1">{item.contentText}</p>
              <div className="mt-2 text-xs text-gray-400">
                Content ID: {item.contentId} • User ID: {item.userId || "N/A"} •{" "}
                {item.contentCreatedAt
                  ? new Date(item.contentCreatedAt).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No data found</p>
        )}
      </div>
    </div>
  );
}

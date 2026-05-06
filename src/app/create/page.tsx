"use client";

import { useState } from "react";
import { createUser, createContent } from "@/app/actions";

export default function CreatePage() {
  // User form state
  const [userName, setUserName] = useState("");
  const [userAge, setUserAge] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // Content form state
  const [contentTitle, setContentTitle] = useState("");
  const [contentBody, setContentBody] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // UI state
  const [users, setUsers] = useState<
    Array<{ id: number; name: string; email: string }>
  >([]);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isCreatingContent, setIsCreatingContent] = useState(false);
  const [userMessage, setUserMessage] = useState({ type: "", text: "" });
  const [contentMessage, setContentMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState<"user" | "content">("user");

  // Handle user creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userEmail || !userAge) {
      setUserMessage({ type: "error", text: "All fields are required" });
      return;
    }

    const age = parseInt(userAge);
    if (isNaN(age) || age <= 0) {
      setUserMessage({ type: "error", text: "Age must be a positive number" });
      return;
    }

    setIsCreatingUser(true);
    setUserMessage({ type: "", text: "" });

    try {
      const newUser = await createUser({
        name: userName,
        age,
        email: userEmail,
      });

      // Add the new user to our local state
      if (newUser && newUser[0]) {
        setUsers([...users, newUser[0]]);
        setUserMessage({ type: "success", text: "User created successfully!" });

        // Reset form
        setUserName("");
        setUserAge("");
        setUserEmail("");

        // Switch to content tab if this is the first user
        if (users.length === 0) {
          setActiveTab("content");
          setSelectedUserId(newUser[0].id);
        }
      }
    } catch (error: any) {
      setUserMessage({
        type: "error",
        text: error.message || "Failed to create user. Please try again.",
      });
    } finally {
      setIsCreatingUser(false);
    }
  };

  // Handle content creation
  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contentTitle || !contentBody || !selectedUserId) {
      setContentMessage({ type: "error", text: "All fields are required" });
      return;
    }

    setIsCreatingContent(true);
    setContentMessage({ type: "", text: "" });

    try {
      await createContent({
        userId: selectedUserId,
        title: contentTitle,
        content: contentBody,
      });

      setContentMessage({
        type: "success",
        text: "Content created successfully!",
      });

      // Reset form
      setContentTitle("");
      setContentBody("");
    } catch (error: any) {
      setContentMessage({
        type: "error",
        text: error.message || "Failed to create content. Please try again.",
      });
    } finally {
      setIsCreatingContent(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create User & Content</h1>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "user"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("user")}
        >
          Create User
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === "content"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
          onClick={() => setActiveTab("content")}
          disabled={users.length === 0}
        >
          Create Content
        </button>
      </div>

      {/* User Creation Form */}
      {activeTab === "user" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>

          {userMessage.text && (
            <div
              className={`p-3 mb-4 rounded ${
                userMessage.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {userMessage.text}
            </div>
          )}

          <form onSubmit={handleCreateUser} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Name
              </label>
              <input
                type="text"
                id="name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter name"
              />
            </div>

            <div>
              <label
                htmlFor="age"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Age
              </label>
              <input
                type="number"
                id="age"
                value={userAge}
                onChange={(e) => setUserAge(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter age"
                min="1"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter email"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingUser}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isCreatingUser ? "Creating..." : "Create User"}
            </button>
          </form>

          {users.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Created Users</h3>
              <ul className="divide-y">
                {users.map((user) => (
                  <li key={user.id} className="py-3">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Content Creation Form */}
      {activeTab === "content" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Create New Content</h2>

          {contentMessage.text && (
            <div
              className={`p-3 mb-4 rounded ${
                contentMessage.type === "error"
                  ? "bg-red-100 text-red-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {contentMessage.text}
            </div>
          )}

          <form onSubmit={handleCreateContent} className="space-y-4">
            <div>
              <label
                htmlFor="userId"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select User
              </label>
              <select
                id="userId"
                value={selectedUserId || ""}
                onChange={(e) => setSelectedUserId(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a user</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter content title"
              />
            </div>

            <div>
              <label
                htmlFor="content"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Content
              </label>
              <textarea
                id="content"
                value={contentBody}
                onChange={(e) => setContentBody(e.target.value)}
                rows={6}
                className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter content body"
              />
            </div>

            <button
              type="submit"
              disabled={isCreatingContent || !selectedUserId}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isCreatingContent ? "Creating..." : "Create Content"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

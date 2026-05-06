"use server";

import { db } from "@/db";
import { usersTable, contentTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// DEPRECATED FILE

// User CRUD operations
export async function getUsers() {
  return await db.select().from(usersTable);
}

export async function getUserById(id: number) {
  const results = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, id));
  return results[0] || null;
}

export async function createUser(data: {
  name: string;
  age: number;
  email: string;
}) {
  return await db.insert(usersTable).values(data).returning();
}

export async function updateUser(
  id: number,
  data: Partial<{ name: string; age: number; email: string }>
) {
  return await db
    .update(usersTable)
    .set(data)
    .where(eq(usersTable.id, id))
    .returning();
}

export async function deleteUser(id: number) {
  return await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
}

// Content CRUD operations
export async function getContents() {
  return await db.select().from(contentTable);
}

export async function getContentById(id: number) {
  const results = await db
    .select()
    .from(contentTable)
    .where(eq(contentTable.id, id));
  return results[0] || null;
}

export async function createContent(data: {
  userId: number;
  title: string;
  content: string;
}) {
  return await db.insert(contentTable).values(data).returning();
}

export async function updateContent(
  id: number,
  data: Partial<{ title: string; content: string }>
) {
  return await db
    .update(contentTable)
    .set(data)
    .where(eq(contentTable.id, id))
    .returning();
}

export async function deleteContent(id: number) {
  return await db
    .delete(contentTable)
    .where(eq(contentTable.id, id))
    .returning();
}

// Search operations
export async function searchUsers(query: string) {
  // Basic search using ILIKE (case-insensitive pattern matching)
  const basicResults = await db
    .select()
    .from(usersTable)
    .where(
      sql`${usersTable.name} ILIKE ${`%${query}%`} OR ${
        usersTable.email
      } ILIKE ${`%${query}%`}`
    );

  // Full-text search using the searchVector column
  const ftResults = await db
    .select()
    .from(usersTable)
    .where(
      sql`${usersTable.searchVector} @@ to_tsquery('english', ${query
        .split(" ")
        .join(" & ")})`
    );

  return {
    basicResults,
    ftResults,
  };
}

export async function searchContent(query: string) {
  // Basic search using ILIKE
  const basicResults = await db
    .select()
    .from(contentTable)
    .where(
      sql`${contentTable.title} ILIKE ${`%${query}%`} OR ${
        contentTable.content
      } ILIKE ${`%${query}%`}`
    );

  // Full-text search using the searchVector column
  const ftResults = await db
    .select()
    .from(contentTable)
    .where(
      sql`${contentTable.searchVector} @@ to_tsquery('english', ${query
        .split(" ")
        .join(" & ")})`
    );

  return {
    basicResults,
    ftResults,
  };
}

// Combined search across both tables
export async function searchAll(query: string) {
  const userResults = await searchUsers(query);
  const contentResults = await searchContent(query);

  return {
    users: userResults.ftResults,
    content: contentResults.ftResults,
  };
}

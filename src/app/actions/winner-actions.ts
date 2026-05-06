import { db } from "@/db";
import { contentTable, usersTable } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function searchBothUserAndContentWINNER(query: string) {
  // join both tables and search for query
  const results = await db
    .select({
      userId: usersTable.id,
      userName: usersTable.name,
      userEmail: usersTable.email,
      contentTitle: contentTable.title,
      content: contentTable.content,
      rank: sql`ts_rank(${usersTable.searchVector} || ${contentTable.searchVector}, websearch_to_tsquery('english', ${query}))`,
    })
    .from(contentTable)
    .leftJoin(usersTable, eq(usersTable.id, contentTable.userId))
    .where(
      sql`(${contentTable.searchVector} || ${usersTable.searchVector}) @@ websearch_to_tsquery('english', ${query})`
    );

  return results;
}

/**
 * @deprecated gamita ang search winner
 */
export async function searchBothUserAndContent(query: string) {
  // join both tables and search for query
  const results = await db
    .select({
      userId: usersTable.id,
      userName: usersTable.name,
      contentTitle: contentTable.title,
      content: contentTable.content,
    })
    .from(contentTable)
    .leftJoin(usersTable, eq(usersTable.id, contentTable.userId))
    .where(
      sql`to_tsvector('english',
        coalesce(${usersTable.name}, '') || ' ' ||
        coalesce(${usersTable.email}, '') || ' ' ||
        coalesce(${contentTable.title}, '') || ' ' ||
        coalesce(${contentTable.content}, '')
      ) @@ websearch_to_tsquery(${query})`
    );
  // .where(sql`${usersTable.searchVector} @@ websearch_to_tsquery(${query})`);

  return results;
}

/**
 * @deprecated gamita ang search winner
 */
export async function searchBothUserAndContent3(query: string) {
  // join both tables and search for query
  const results = await db
    .select({
      userId: usersTable.id,
      userName: usersTable.name,
      contentTitle: contentTable.title,
      content: contentTable.content,
    })
    .from(contentTable)
    .leftJoin(usersTable, eq(usersTable.id, contentTable.userId))
    .where(
      sql`to_tsvector('english',
        coalesce(${usersTable.name}, 'B') || ' ' ||
        coalesce(${usersTable.email}, 'D') || ' ' ||
        coalesce(${contentTable.title}, 'B') || ' ' ||
        coalesce(${contentTable.content}, 'A')
      ) @@ websearch_to_tsquery('english', ${query})`
    );

  return results;
}

/**
 * @deprecated gamita ang search winner
 */
export async function searchContent(query: string) {
  // search for query in content table
  const results = await db
    .select()
    .from(contentTable)
    .where(
      sql`${contentTable.searchVector} @@ websearch_to_tsquery('english', ${query})`
    );

  return results;
}

/**
 * @deprecated gamita ang search winner
 */
export async function searchUser(query: string) {
  // search for query in user table
  const results = await db
    .select()
    .from(usersTable)
    .where(sql`${usersTable.searchVector} @@ websearch_to_tsquery(${query})`);

  return results;
}

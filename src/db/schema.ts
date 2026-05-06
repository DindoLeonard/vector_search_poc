import {
  integer,
  pgTable,
  varchar,
  text,
  timestamp,
  customType,
  index,
} from "drizzle-orm/pg-core";
import { sql, SQL } from "drizzle-orm";

const tsVector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// export const usersTable = pgTable(
//   "users",
//   {
//     id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     name: varchar({ length: 255 }).notNull(),
//     age: integer().notNull(),
//     email: varchar({ length: 255 }).notNull().unique(),
//     createdAt: timestamp("created_at").defaultNow(),

//     // There are two main approaches for tsvector:

//     // 1. Using sql template literal with column references:
//     // searchVector: tsVector("search_vector").generatedAlwaysAs(
//     //   sql`to_tsvector('english', ${usersTable.name} || ' ' || ${usersTable.email})`
//     // ),

//     // 2. Using coalesce in raw SQL (current approach):
//     searchVector: tsVector("search_vector").generatedAlwaysAs(
//       (): SQL =>
//         sql`to_tsvector('english', coalesce(name, '') || ' ' || coalesce(email, ''))`
//     ),

//     // The second approach (current) is better because:
//     // 1. It handles NULL values explicitly with coalesce
//     // 2. It's more readable and maintainable
//     // 3. It's computed entirely in PostgreSQL
//     // 4. The first approach can potentially cause issues with column references
//     //    since the table isn't fully defined when referenced
//   },
//   (t) => [index("idx_users_search").using("gin", t.searchVector)]
// );

// export const contentTable = pgTable(
//   "content",
//   {
//     id: integer().primaryKey().generatedAlwaysAsIdentity(),
//     userId: integer().references(() => usersTable.id),
//     title: varchar({ length: 255 }).notNull(),
//     content: text().notNull(),
//     createdAt: timestamp("created_at").defaultNow(),
//     searchVector: tsVector("search_vector").generatedAlwaysAs(
//       (): SQL =>
//         sql`to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))`
//     ),
//   },
//   (t) => [index("idx_content_search").using("gin", t.searchVector)]
// );

export const usersTable = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    createdAt: timestamp("created_at").defaultNow(),

    searchVector: tsVector("search_vector")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
      setweight(to_tsvector('english', coalesce(name, '')), 'A') || 
      setweight(to_tsvector('english', coalesce(email, '')), 'C')
    `
      ),
  },
  (t) => [index("idx_users_search").using("gin", t.searchVector)]
);

export const contentTable = pgTable(
  "content",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: integer("user_id").references(() => usersTable.id),
    title: varchar("title", { length: 255 }).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow(),

    // Weighted ts_vector for better ranking in full-text search
    searchVector: tsVector("search_vector")
      .notNull()
      .generatedAlwaysAs(
        (): SQL => sql`
          setweight(to_tsvector('english', coalesce(title, '')), 'A') || 
          setweight(to_tsvector('english', coalesce(content, '')), 'B')
        `
      ),
  },
  (t) => [index("idx_content_search").using("gin", t.searchVector)]
);

import { db } from "@/db";
import { usersTable, contentTable } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const users = await db.select().from(usersTable);
    const contents = await db.select().from(contentTable);

    return NextResponse.json({
      users,
      contents,
      total: {
        users: users.length,
        contents: contents.length,
      },
    });
  } catch (error) {
    console.error("Error fetching all data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}

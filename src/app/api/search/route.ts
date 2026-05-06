import {
  // searchBothUserAndContent
  searchContent,
} from "@/app/actions/winner-actions";
import { NextResponse } from "next/server";

/**
 * @deprecated gamita ang search winner
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  if (!query) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }
  const results = await searchContent(query);
  return NextResponse.json(results);
}

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "servers.json");

interface McpServer {
  name: string;
  description: string;
  stars: number;
  language: string;
  topics: string[];
  categories: string[];
}

function loadServers(): { servers: McpServer[]; total: number } {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { servers: [], total: 0 };
  }
}

export async function GET() {
  const data = loadServers();
  const { servers } = data;

  // Count languages
  const langCount: Record<string, number> = {};
  for (const s of servers) {
    if (s.language) {
      langCount[s.language] = (langCount[s.language] || 0) + 1;
    }
  }

  // Top languages
  const topLanguages = Object.entries(langCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([language, count]) => ({ language, count }));

  // Count unique categories
  const allCategories = new Set<string>();
  for (const s of servers) {
    for (const c of s.categories || []) {
      allCategories.add(c);
    }
  }

  const totalStars = servers.reduce((sum, s) => sum + (s.stars || 0), 0);

  return NextResponse.json({
    totalServers: data.total || servers.length,
    totalStars,
    totalCategories: allCategories.size,
    topLanguages,
  });
}

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

const DATA_PATH = join(process.cwd(), "data", "servers.json");

interface McpServer {
  id: string;
  name: string;
  description: string;
  github_url: string;
  stars: number;
  license: string;
  language: string;
  topics: string[];
  categories: string[];
  install_cmd: string;
  last_push_at: string;
}

function loadServers(): { servers: McpServer[] } {
  try {
    const raw = readFileSync(DATA_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return { servers: [] };
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "stars";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  const { servers } = loadServers();
  let filtered = [...servers];

  // Search filter
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.id.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.topics?.some((t) => t.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (category) {
    filtered = filtered.filter((s) => s.categories?.includes(category));
  }

  // Sort
  if (sort === "stars") {
    filtered.sort((a, b) => b.stars - a.stars);
  } else if (sort === "name") {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  } else if (sort === "forks") {
    filtered.sort((a, b) => (b as any).forks - (a as any).forks);
  } else if (sort === "updated") {
    filtered.sort((a, b) => (b.last_push_at || "").localeCompare(a.last_push_at || ""));
  }

  // Paginate
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return NextResponse.json({
    servers: paginated,
    total: filtered.length,
    page,
    limit,
    totalPages: Math.ceil(filtered.length / limit),
  });
}

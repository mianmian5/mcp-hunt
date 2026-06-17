"use client";

import { useState, useEffect, useCallback } from "react";

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

interface Stats {
  totalServers: number;
  totalStars: number;
  totalCategories: number;
  topLanguages: { language: string; count: number }[];
}

const CATEGORIES = [
  { id: "", name: "All", icon: "🔮" },
  { id: "database", name: "Database", icon: "🗄️" },
  { id: "filesystem", name: "File System", icon: "📁" },
  { id: "browser", name: "Browser", icon: "🌐" },
  { id: "developer-tools", name: "Dev Tools", icon: "🛠️" },
  { id: "communication", name: "Communication", icon: "💬" },
  { id: "ai-ml", name: "AI & ML", icon: "🤖" },
  { id: "cloud", name: "Cloud & DevOps", icon: "☁️" },
  { id: "search", name: "Search", icon: "🔍" },
  { id: "monitoring", name: "Monitoring", icon: "📊" },
  { id: "productivity", name: "Productivity", icon: "⚡" },
];

const LANG_COLORS: Record<string, string> = {
  python: "#3572A5",
  typescript: "#3178C6",
  javascript: "#F7DF1E",
  rust: "#DEA584",
  go: "#00ADD8",
  java: "#B07219",
  c: "#555555",
  "c++": "#F34B7D",
  ruby: "#701516",
  shell: "#89E051",
};

export default function HomePage() {
  const [servers, setServers] = useState<McpServer[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  const fetchServers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (query) params.set("q", query);
      if (category) params.set("category", category);
      params.set("limit", "50");
      const res = await fetch(`/api/servers?${params}`);
      const data = await res.json();
      setServers(data.servers || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [query, category]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { fetchServers(); }, [fetchServers]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar sticky top-0 z-50 px-8 sm:px-10 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏪</span>
            <span className="text-lg font-bold gradient-text">mcp-hunt</span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="/submit"
              className="px-3 py-1.5 rounded-lg font-medium"
              style={{ background: "var(--accent)", color: "white" }}
            >
              + Submit
            </a>
            <a
              href="https://github.com/mianmian5/mcp-hunt"
              target="_blank"
              rel="noopener"
              className="hover:text-[var(--text)] transition"
              style={{ color: "var(--text-secondary)" }}
            >
              GitHub
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="max-w-5xl mx-auto px-10 pt-20 pb-12 text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-4">
          The App Store for <span className="gradient-text">AI Agents</span>
        </h1>
        <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto mb-8">
          Discover, browse, and install MCP Servers — the tools that give AI agents superpowers.
          One platform to find anything your AI needs.
        </p>

        {/* Stats */}
        <div className="flex justify-center gap-6 md:gap-16 text-center mb-12">
          <div className="stat">
            <div className="text-3xl font-bold gradient-text">
              {stats?.totalServers?.toLocaleString() || "..."}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">MCP Servers</div>
          </div>
          <div className="stat">
            <div className="text-3xl font-bold gradient-text">
              {stats ? `${(stats.totalStars / 1000).toFixed(1)}k` : "..."}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Total ⭐</div>
          </div>
          <div className="stat">
            <div className="text-3xl font-bold gradient-text">
              {stats?.totalCategories || "..."}
            </div>
            <div className="text-sm text-[var(--text-secondary)]">Categories</div>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="max-w-4xl mx-auto px-10 pb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchServers();
          }}
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg">🔍</span>
            <input
              className="search-input pl-12 pr-4 py-3"
              placeholder="Search MCP Servers... (e.g. database, browser, filesystem)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-10 pb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                setQuery("");
              }}
              className={`badge cursor-pointer transition-all ${
                category === cat.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface-2)] text-[var(--text-secondary)] hover:text-[var(--text)] hover:border-[var(--accent)]"
              }`}
              style={category === cat.id ? {} : { border: "1px solid var(--border)" }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Server List */}
      <main className="max-w-7xl mx-auto pl-14 pr-10 pb-20">
        {loading ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">
            <div className="text-4xl mb-4 animate-pulse">🔮</div>
            <p>Summoning MCP Servers...</p>
          </div>
        ) : servers.length === 0 ? (
          <div className="text-center py-20 text-[var(--text-secondary)]">
            <div className="text-4xl mb-4">🔍</div>
            <p className="text-lg">No servers found. Try a different search!</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-[var(--text-secondary)]">
                Showing <strong className="text-[var(--text)]">{servers.length}</strong> of{" "}
                <strong className="text-[var(--text)]">{total}</strong> servers
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {servers.map((s) => (
                <a
                  key={s.id}
                  href={s.github_url}
                  target="_blank"
                  rel="noopener"
                  className="card p-5 block cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">{s.name}</h3>
                      <p className="text-sm text-[var(--text-secondary)] line-clamp-2 mt-1">
                        {s.description || "No description"}
                      </p>
                    </div>
                  </div>

                  {s.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {s.topics.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="badge text-xs"
                          style={{
                            background: "var(--surface-2)",
                            color: "var(--text-secondary)",
                            border: "1px solid var(--border)",
                          }}
                        >
                          {t}
                        </span>
                      ))}
                      {s.topics.length > 4 && (
                        <span className="badge text-xs text-[var(--text-secondary)]">
                          +{s.topics.length - 4}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)] text-xs text-[var(--text-secondary)]">
                    <div className="flex items-center gap-3">
                      {s.language && (
                        <span className="flex items-center gap-1">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{
                              background:
                                LANG_COLORS[s.language.toLowerCase()] || "#888",
                            }}
                          />
                          {s.language}
                        </span>
                      )}
                      <span>⭐ {s.stars.toLocaleString()}</span>
                    </div>
                    {s.categories.length > 0 && s.categories[0] && (
                      <span
                        className="badge"
                        style={{
                          background: "var(--accent-glow)",
                          color: "var(--accent)",
                        }}
                      >
                        {CATEGORIES.find((c) => c.id === s.categories[0])?.icon || "📦"}
                      </span>
                    )}
                  </div>
                </a>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer
        className="border-t border-[var(--border)] py-8 text-center text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        <p>🏪 mcp-hunt · MCP Server Discovery Platform</p>
        <div className="flex items-center justify-center gap-4 mt-2">
          <a href="/submit" className="hover:underline" style={{ color: "var(--accent)" }}>
            Submit a Server
          </a>
          <span>·</span>
          <a
            href="https://github.com/mianmian5/mcp-hunt"
            target="_blank"
            rel="noopener"
            className="hover:underline"
            style={{ color: "var(--accent)" }}
          >
            GitHub
          </a>
          <span>·</span>
          <span>MIT License</span>
        </div>
        <p className="mt-2">
          Data sourced from GitHub · {stats?.totalServers?.toLocaleString() || "..."} servers indexed
        </p>
      </footer>
    </div>
  );
}

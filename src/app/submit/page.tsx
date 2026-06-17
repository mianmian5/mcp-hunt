"use client";

import { useState } from "react";

export default function SubmitPage() {
  const [form, setForm] = useState({
    name: "",
    description: "",
    github_url: "",
    category: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const title = encodeURIComponent(`New MCP Server: ${form.name}`);
    const body = encodeURIComponent(
      `## Server\n\n**Name:** ${form.name}\n**Description:** ${form.description}\n**GitHub URL:** ${form.github_url}\n**Category:** ${form.category || "Uncategorized"}\n\n---\n*Submitted via mcp-hunt*`
    );
    window.open(
      `https://github.com/mianmian5/mcp-hunt/issues/new?title=${title}&body=${body}`,
      "_blank"
    );
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <nav className="navbar sticky top-0 z-50 px-10 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a
            href="/"
            className="flex items-center gap-2 no-underline"
            style={{ color: "var(--text)" }}
          >
            <span className="text-2xl">🏪</span>
            <span className="text-lg font-bold gradient-text">mcp-hunt</span>
          </a>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Submit a Server
          </span>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-10 pt-16 pb-20">
        <h1 className="text-3xl font-bold mb-2">Submit an MCP Server</h1>
        <p className="mb-8" style={{ color: "var(--text-secondary)" }}>
          Know a great MCP server that is not in our index? Let us know — it will be added in the
          next crawl.
        </p>

        {submitted ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">🎉</div>
            <h2 className="text-xl font-semibold mb-2">Thanks for the submission!</h2>
            <p style={{ color: "var(--text-secondary)" }}>
              A GitHub issue has been opened. The server will be indexed in the next crawl.
            </p>
            <a
              href="/"
              className="inline-block mt-6 px-10 py-2 rounded-lg font-medium"
              style={{ background: "var(--accent)", color: "white" }}
            >
              Back to Browse
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Server Name *
              </label>
              <input
                className="search-input"
                placeholder="e.g. postgres-mcp"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                GitHub URL *
              </label>
              <input
                className="search-input"
                placeholder="https://github.com/owner/repo"
                value={form.github_url}
                onChange={(e) => setForm({ ...form, github_url: e.target.value })}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Description
              </label>
              <textarea
                className="search-input min-h-[80px] resize-y"
                placeholder="What does this MCP server do?"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: "var(--text-secondary)" }}
              >
                Category
              </label>
              <select
                className="search-input"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Auto-detect</option>
                <option value="database">Database</option>
                <option value="browser">Browser</option>
                <option value="filesystem">File System</option>
                <option value="developer-tools">Dev Tools</option>
                <option value="ai-ml">AI & ML</option>
                <option value="cloud">Cloud & DevOps</option>
                <option value="communication">Communication</option>
                <option value="search">Search</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-medium text-white transition-all"
              style={{ background: "var(--accent)" }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.9")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
            >
              Submit Server
            </button>
          </form>
        )}

        {/* How it works */}
        <div className="mt-16">
          <h2 className="text-lg font-semibold mb-4">How it works</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { step: "1", title: "Submit", desc: "Fill in the details about the MCP server." },
              { step: "2", title: "Review", desc: "Our crawler verifies and indexes the repository." },
              { step: "3", title: "Published", desc: "The server appears in search within 24 hours." },
            ].map((item) => (
              <div key={item.step} className="card p-4 text-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)" }}
                >
                  {item.step}
                </div>
                <h3 className="font-medium text-sm">{item.title}</h3>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

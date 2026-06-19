"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

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

const CLIENTS = [
  { id: "claude", name: "Claude Desktop", icon: "🤖", configPath: "~/Library/Application Support/Claude/claude_desktop_config.json" },
  { id: "cursor", name: "Cursor", icon: "🖍️", configPath: ".cursor/mcp.json" },
  { id: "windsurf", name: "Windsurf", icon: "🏄", configPath: ".windsurf/mcp.json" },
  { id: "openclaw", name: "OpenClaw", icon: "🐱", configPath: "~/.openclaw/openclaw.json" },
  { id: "cline", name: "Cline", icon: "🧠", configPath: "cline_mcp_settings.json" },
  { id: "generic", name: "Generic JSON", icon: "📋", configPath: "mcp-config.json" },
];

const LANG_COLORS: Record<string, string> = {
  python: "#3572A5", typescript: "#3178C6", javascript: "#F7DF1E",
  rust: "#DEA584", go: "#00ADD8", java: "#B07219",
  c: "#555", "c++": "#F34B7D", ruby: "#701516", shell: "#89E051",
};

const CATEGORY_ICONS: Record<string, string> = {
  database: "🗄️", browser: "🌐", "filesystem": "📁", "developer-tools": "🛠️",
  communication: "💬", "ai-ml": "🤖", cloud: "☁️", search: "🔍",
  monitoring: "📊", productivity: "⚡",
};

function getInstallCmd(server: McpServer): { cmd: string; args: string[] } {
  if (server.install_cmd) {
    const parts = server.install_cmd.split(/\s+/);
    return { cmd: parts[0] || "npx", args: parts.slice(1) };
  }
  const lang = (server.language || "").toLowerCase();
  if (lang === "python") return { cmd: "uvx", args: ["-y", server.name] };
  if (lang === "go") return { cmd: "go", args: ["run", "github.com/" + server.id] };
  if (lang === "rust") return { cmd: "cargo", args: ["install", server.name] };
  return { cmd: "npx", args: ["-y", server.name] };
}

export default function ServerDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [server, setServer] = useState<McpServer | null>(null);
  const [loading, setLoading] = useState(true);
  const [envVars, setEnvVars] = useState<{ key: string; value: string }[]>([]);
  const [selectedClient, setSelectedClient] = useState("claude");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // First try exact ID match, then fall back to search APIs
    fetch(`/api/servers?q=${encodeURIComponent(id.replace(/[\/]/g, " "))}&limit=50`).then(r => r.json()).then(data => {
      const all = data.servers || [];
      // Try matching by id first, then by name
      const found = all.find((s: McpServer) => s.id === id)
        || all.find((s: McpServer) => s.github_url?.includes(id))
        || all.find((s: McpServer) => s.name.toLowerCase() === id.toLowerCase())
        || all.find((s: McpServer) => s.id.includes(id) || id.includes(s.id))
        || all[0];
      setServer(found || null);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const generateConfig = useCallback(() => {
    if (!server) return "";
    const cmd = getInstallCmd(server);
    const envObj: Record<string, string> = {};
    envVars.filter(e => e.key.trim()).forEach(e => { envObj[e.key.trim()] = e.value.trim(); });
    const serverEntry: any = { command: cmd.cmd, args: cmd.args };
    if (Object.keys(envObj).length > 0) serverEntry.env = envObj;
    const client = CLIENTS.find(c => c.id === selectedClient) || CLIENTS[0];
    let config: any;
    if (client.id === "openclaw") {
      config = { "tools": { [server.name]: serverEntry } };
    } else if (client.id === "generic") {
      config = serverEntry;
    } else {
      config = { "mcpServers": { [server.name]: serverEntry } };
    }
    return JSON.stringify(config, null, 2);
  }, [server, envVars, selectedClient]);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generateConfig());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadConfig = () => {
    const blob = new Blob([generateConfig()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${server?.name || "mcp"}-config.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="text-center py-40">
          <div className="text-4xl mb-4 animate-pulse">🔮</div>
          <p style={{ color: "var(--text-secondary)" }}>Loading server details...</p>
        </div>
      </div>
    );
  }

  if (!server) {
    return (
      <div className="min-h-screen" style={{ background: "var(--bg)" }}>
        <div className="max-w-4xl mx-auto px-10 py-20 text-center">
          <div className="text-5xl mb-6">🔍</div>
          <h1 className="text-2xl font-bold mb-2">Server Not Found</h1>
          <p style={{ color: "var(--text-secondary)" }} className="mb-6">
            Could not find server with ID: {id}
          </p>
          <a href="/" className="px-4 py-2 rounded-lg font-medium inline-block"
            style={{ background: "var(--accent)", color: "white" }}>
            ← Back to Browse
          </a>
        </div>
      </div>
    );
  }

  const cmd = getInstallCmd(server);
  const configJson = generateConfig();

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      {/* Nav */}
      <nav className="navbar sticky top-0 z-50 px-8 sm:px-10 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 no-underline" style={{ color: "var(--text)" }}>
            <span className="text-2xl">🏪</span>
            <span className="text-lg font-bold gradient-text">mcp-hunt</span>
          </a>
          <a href="/" className="text-sm hover:underline" style={{ color: "var(--accent)" }}>
            ← Browse All
          </a>
        </div>
      </nav>

      {/* Server Info */}
      <header className="max-w-5xl mx-auto px-10 pt-12 pb-8">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-2">{server.name}</h1>
            <p className="text-base leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
              {server.description || "No description available."}
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {server.categories.map(c => (
                <span key={c} className="badge text-xs"
                  style={{ background: "var(--accent-glow)", color: "var(--accent)" }}>
                  {CATEGORY_ICONS[c] || "📦"} {c}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              {server.language && (
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full inline-block"
                    style={{ background: LANG_COLORS[server.language.toLowerCase()] || "#888" }} />
                  {server.language}
                </span>
              )}
              <span>⭐ {server.stars.toLocaleString()}</span>
              {server.license && <span>{server.license}</span>}
            </div>
          </div>
          <a href={server.github_url} target="_blank" rel="noopener"
            className="px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            🐙 View on GitHub →
          </a>
        </div>
      </header>

      {/* Config Generator */}
      <main className="max-w-5xl mx-auto px-10 pb-20">
        <div className="rounded-2xl p-6 sm:p-8" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
          <h2 className="text-lg font-semibold mb-6">⚡ One-Click Install</h2>

          {/* Client selector */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              AI Client
            </label>
            <div className="flex flex-wrap gap-2">
              {CLIENTS.map(c => (
                <button key={c.id} onClick={() => setSelectedClient(c.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all cursor-pointer ${selectedClient === c.id ? "font-medium" : ""}`}
                  style={{
                    background: selectedClient === c.id ? "var(--accent)" : "var(--surface-2)",
                    color: selectedClient === c.id ? "white" : "var(--text-secondary)",
                    border: selectedClient === c.id ? "none" : "1px solid var(--border)",
                  }}>
                  {c.icon} {c.name}
                </button>
              ))}
            </div>
            <p className="text-xs mt-1.5" style={{ color: "var(--text-secondary)" }}>
              Config path: <code className="font-mono">{CLIENTS.find(c => c.id === selectedClient)?.configPath}</code>
            </p>
          </div>

          {/* Install command */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Quick Install
            </label>
            <div className="flex gap-2 items-center">
              <code className="flex-1 rounded-xl px-3 py-2 text-sm font-mono"
                style={{ background: "var(--surface-2)", color: "var(--accent)" }}>
                {cmd.cmd} {cmd.args.join(" ")}
              </code>
              <button onClick={() => {
                navigator.clipboard.writeText(cmd.cmd + " " + cmd.args.join(" "));
              }}
                className="px-2.5 py-2 rounded-lg cursor-pointer text-sm"
                style={{ background: "var(--surface-2)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}>
                📋
              </button>
            </div>
          </div>

          {/* Environment variables */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              🌿 Environment Variables <span className="font-normal">(optional)</span>
            </label>
            <div className="space-y-2 mb-2">
              {envVars.map((ev, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input placeholder="KEY"
                    value={ev.key} onChange={e => {
                      const n = [...envVars]; n[i].key = e.target.value; setEnvVars(n);
                    }}
                    className="flex-1 px-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <input placeholder="VALUE"
                    value={ev.value} onChange={e => {
                      const n = [...envVars]; n[i].value = e.target.value; setEnvVars(n);
                    }}
                    className="flex-[2] px-3 py-2 rounded-lg text-sm outline-none font-mono"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}
                  />
                  <button onClick={() => setEnvVars(envVars.filter((_, j) => j !== i))}
                    className="px-2 rounded-lg cursor-pointer text-sm"
                    style={{ color: "var(--red)" }}>✕</button>
                </div>
              ))}
              <button onClick={() => setEnvVars([...envVars, { key: "", value: "" }])}
                className="text-sm cursor-pointer hover:underline"
                style={{ color: "var(--accent)" }}>+ Add variable</button>
            </div>
          </div>

          {/* Config JSON */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block" style={{ color: "var(--text-secondary)" }}>
              Config JSON <span className="font-normal">(paste into your AI client)</span>
            </label>
            <pre className="rounded-xl p-4 text-sm overflow-x-auto font-mono leading-relaxed max-h-80 overflow-y-auto"
              style={{ background: "var(--surface-2)", color: "var(--text)" }}>
              {configJson}
            </pre>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={copyToClipboard}
              className="flex-1 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ background: "var(--accent)", color: "white" }}>
              {copied ? "✅ Copied!" : "📋 Copy Config"}
            </button>
            <button onClick={downloadConfig}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
              ⬇️ Download JSON
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

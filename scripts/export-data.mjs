#!/usr/bin/env node
// mcp-hunt data export script
// Fetches MCP servers from GitHub and saves to data/servers.json
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const GITHUB_TOKEN = '';
const DATA_DIR = path.join(__dirname, '..', 'data');
const OUTPUT = path.join(DATA_DIR, 'servers.json');

async function fetchGraphQL(query, variables = {}) {
  const headers = { 'Content-Type': 'application/json', 'User-Agent': 'mcp-hunt' };
  if (GITHUB_TOKEN) headers['Authorization'] = '***' + GITHUB_TOKEN;
  const r = await fetch('https://api.github.com/graphql', {
    method: 'POST', headers,
    body: JSON.stringify({ query, variables }),
  });
  return r.json();
}

// Fetch repos from multiple MCP topic searches
const TOPICS = ['mcp-server', 'mcp', 'model-context-protocol', 'mcp-servers', 'mcp-tools'];

async function searchRepos(query, cursor = null) {
  const q = `query searchRepos($query: String!, $cursor: String) {
    search(query: $query, type: REPOSITORY, first: 100, after: $cursor) {
      repositoryCount
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          ... on Repository {
            nameWithOwner description stargazerCount languages(first:1){nodes{name}}
            repositoryTopics(first:10){nodes{topic{name}}}
            primaryLanguage { name }
            url
          }
        }
      }
    }
  }`;
  const data = await fetchGraphQL(q, { query: `${query} sort:stars-desc`, cursor });
  return data?.data?.search || { edges: [], pageInfo: { hasNextPage: false } };
}

async function main() {
  console.log('🔍 Fetching MCP servers from GitHub...');
  
  let allServers = new Map();
  
  for (const topic of TOPICS) {
    let cursor = null;
    let hasNext = true;
    let page = 0;
    
    while (hasNext && page < 5) { // max 5 pages per topic
      const result = await searchRepos(`topic:${topic}`, cursor);
      for (const edge of result.edges || []) {
        const n = edge.node;
        if (!n || !n.nameWithOwner) continue;
        const key = n.nameWithOwner.toLowerCase();
        if (!allServers.has(key)) {
          allServers.set(key, {
            id: n.nameWithOwner,
            name: n.nameWithOwner.split('/')[1],
            owner: n.nameWithOwner.split('/')[0],
            github_url: n.url || `https://github.com/${n.nameWithOwner}`,
            description: (n.description || '').slice(0, 500),
            stars: n.stargazerCount || 0,
            language: n.primaryLanguage?.name || n.languages?.nodes?.[0]?.name || '',
            topics: (n.repositoryTopics?.nodes || []).map(t => t.topic.name).filter(Boolean),
            categories: [],
          });
        }
      }
      hasNext = result?.pageInfo?.hasNextPage || false;
      cursor = result?.pageInfo?.endCursor;
      page++;
      console.log(`  ${topic}: page ${page}, ${allServers.size} unique servers`);
    }
  }
  
  const servers = Array.from(allServers.values())
    .sort((a, b) => b.stars - a.stars);
  
  // Assign categories based on topics
  const CATEGORY_MAP = {
    database: ['database', 'db', 'sql', 'postgres', 'mysql', 'sqlite', 'redis'],
    browser: ['browser', 'web', 'chrome', 'puppeteer', 'playwright'],
    filesystem: ['file', 'filesystem', 'fs', 'storage', 's3'],
    'developer-tools': ['developer', 'dev', 'api', 'cli', 'git', 'github'],
    communication: ['slack', 'discord', 'telegram', 'email', 'chat', 'communication'],
    'ai-ml': ['ai', 'ml', 'llm', 'gpt', 'openai', 'anthropic', 'claude', 'rag', 'embedding'],
    cloud: ['aws', 'gcp', 'azure', 'cloud', 'docker', 'kubernetes'],
    search: ['search', 'elasticsearch', 'algolia', 'meilisearch'],
    monitoring: ['monitor', 'logging', 'metric', 'observability', 'grafana'],
    productivity: ['note', 'calendar', 'task', 'todo', 'productivity'],
  };
  
  for (const s of servers) {
    const allText = `${s.name} ${s.description} ${s.topics.join(' ')}`.toLowerCase();
    for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
      if (keywords.some(k => allText.includes(k))) {
        s.categories.push(cat);
      }
    }
  }
  
  const output = {
    exportedAt: new Date().toISOString(),
    total: servers.length,
    servers,
  };
  
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\n✅ Exported ${servers.length} servers to ${OUTPUT}`);
}

main().catch(console.error);

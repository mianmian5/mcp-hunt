#!/bin/bash
# Fetch MCP servers from GitHub
set -e
cd "$(dirname "$0")/.."

TOPICS=("mcp-server" "mcp" "model-context-protocol" "mcp-servers" "mcp-tools")
TMP="/tmp/mcp-servers-$$.json"
echo "[" > "$TMP"

first=true
for topic in "${TOPICS[@]}"; do
  for page in 1 2 3 4 5; do
    url="https://api.github.com/search/repositories?q=topic:${topic}&sort=stars&order=desc&per_page=100&page=${page}"
    echo "  Fetching ${topic} page ${page}..." >&2
    data=$(curl -s --connect-timeout 10 "$url")
    items=$(echo "$data" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d.get('items',[])))" 2>/dev/null || echo "0")
    if [ "$items" = "0" ]; then
      echo "  ${topic} page ${page}: done (rate limit?)" >&2
      break
    fi
    echo "$data" | python3 -c "
import sys, json, math
data = json.load(sys.stdin)
for r in data.get('items', []):
    print(json.dumps(r))
" >> /tmp/mcp-items-$$.json 2>/dev/null
    echo "    got ${items} items" >&2
    [ "$items" -lt 100 ] && break
    sleep 0.5
  done
done

echo "Processing ${total} items..." >&2

python3 -c "
import json, subprocess

# Read all items from temp file
items = []
try:
    with open('/tmp/mcp-items-$$.json') as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    items.append(json.loads(line))
                except:
                    pass
except:
    pass

# Dedup by full_name
seen = {}
for r in items:
    key = r['full_name'].lower()
    if key not in seen:
        seen[key] = {
            'id': r['full_name'],
            'name': r['name'],
            'description': (r.get('description') or '')[:500],
            'github_url': r['html_url'],
            'stars': r['stargazers_count'],
            'license': (r.get('license') or {}).get('spdx_id') or '',
            'language': r.get('language') or '',
            'topics': r.get('topics', []),
            'categories': [],
            'install_cmd': '',
            'last_push_at': (r.get('pushed_at') or '')[:-1] + 'Z',
        }
    else:
        # Merge topics from duplicate entries
        existing = seen[key]
        existing_topics = set(existing['topics'])
        for t in r.get('topics', []):
            if t not in existing_topics:
                existing['topics'].append(t)
                existing_topics.add(t)

servers = sorted(seen.values(), key=lambda s: -s['stars'])

CATEGORY_MAP = {
    'ai-ml': ['ai','ml','llm','gpt','openai','anthropic','claude','rag','embedding','gemini','deepseek','agent'],
    'database': ['database','db','sql','postgres','mysql','sqlite','redis','mongodb','vector'],
    'browser': ['browser','web','chrome','puppeteer','playwright','scraping'],
    'filesystem': ['file','filesystem','fs','storage','s3','pdf'],
    'developer-tools': ['developer','dev','api','cli','git','github','sdk','tool','code','plugin','lsp'],
    'communication': ['slack','discord','telegram','email','chat','communication','sms','notify'],
    'cloud': ['aws','gcp','azure','cloud','docker','kubernetes','deploy'],
    'search': ['search','semantic-search','vector-search','retrieval'],
    'monitoring': ['monitor','logging','metric','observability','grafana'],
    'productivity': ['note','calendar','task','todo','productivity','project'],
}

for s in servers:
    all_text = f\"{s['name']} {s.get('description','')} {' '.join(s['topics'])}\".lower()
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in all_text for k in keywords):
            s['categories'].append(cat)

ts = subprocess.run(['date','-u','+%Y-%m-%dT%H:%M:%S.000Z'], capture_output=True, text=True).stdout.strip()
output = {'exportedAt': ts, 'total': len(servers), 'servers': servers}

with open('data/servers.json', 'w') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f'Exported {len(servers)} servers')
" 2>&1

rm -f /tmp/mcp-items-$$.json /tmp/mcp-servers-$$.json

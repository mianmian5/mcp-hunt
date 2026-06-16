#!/usr/bin/env python3
"""Fetch MCP servers from GitHub REST API"""
import json, subprocess, time, sys

TOPICS = ['mcp-server', 'mcp', 'model-context-protocol', 'mcp-servers', 'mcp-tools']
all_servers = {}

for topic in TOPICS:
    page = 1
    while page <= 5:
        url = f'https://api.github.com/search/repositories?q=topic:{topic}&sort=stars&order=desc&per_page=100&page={page}'
        print(f'  {topic} page {page}...', file=sys.stderr)
        result = subprocess.run(['curl', '-s', url], capture_output=True, text=True, timeout=20)
        data = json.loads(result.stdout)
        if 'items' not in data:
            print(f'  {topic} page {page}: {data.get("message","no items")}', file=sys.stderr)
            break
        for r in data['items']:
            key = r['full_name'].lower()
            if key not in all_servers:
                all_servers[key] = {
                    'id': r['full_name'], 'name': r['name'],
                    'description': (r.get('description') or '')[:500],
                    'github_url': r['html_url'],
                    'stars': r['stargazers_count'],
                    'license': (r.get('license') or {}).get('spdx_id') or '',
                    'language': r.get('language') or '',
                    'topics': r.get('topics', []),
                    'categories': [], 'install_cmd': '',
                    'last_push_at': (r.get('pushed_at') or '')[:-1] + 'Z',
                }
        has_next = len(data.get('items', [])) == 100
        page += 1
        time.sleep(0.3)
        if not has_next:
            break
    print(f'  {topic}: {sum(1 for s in all_servers.values())} unique', file=sys.stderr)

servers = sorted(all_servers.values(), key=lambda s: -s['stars'])

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
    all_text = f"{s['name']} {s.get('description','')} {' '.join(s['topics'])}".lower()
    for cat, keywords in CATEGORY_MAP.items():
        if any(k in all_text for k in keywords):
            s['categories'].append(cat)

ts = subprocess.run(['date','-u','+%Y-%m-%dT%H:%M:%S.000Z'], capture_output=True, text=True).stdout.strip()
output = {'exportedAt': ts, 'total': len(servers), 'servers': servers}

with open('data/servers.json', 'w') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f'\n✅ Exported {len(servers)} servers to data/servers.json', file=sys.stderr)

#!/usr/bin/env python3 -I
# usage: coverr-search.py "query" [n]  -- lists Coverr videos (name, duration, description, contentUrl)
import sys, re, json, urllib.request, urllib.parse
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) Chrome/124"}
def get(u):
    return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=40).read().decode("utf8", "replace")
q = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 8
html = get("https://coverr.co/s?q=" + urllib.parse.quote_plus(q))
slugs = []
for s in re.findall(r'href="/videos/([^"]+)"', html):
    if s != "null" and s not in slugs: slugs.append(s)
for s in slugs[:n]:
    try:
        h = get("https://coverr.co/videos/" + s)
    except Exception as e:
        print(s, "ERR", e); continue
    m = re.search(r'<script class="structured-data-video" type="application/ld\+json">(.*?)</script>', h, re.S)
    if not m: print(s, "no ld"); continue
    d = json.loads(m.group(1))
    print(f"{s} | {d['duration']} | {d['description'].strip()[:90]} | {d['contentUrl']}")

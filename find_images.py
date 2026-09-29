import urllib.request
import json
import urllib.parse

def search_wiki(query):
    api = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json&srlimit=15"
    req = urllib.request.Request(api, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
    return [item['title'] for item in res['query']['search']]

def get_url(title):
    api = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url&format=json"
    req = urllib.request.Request(api, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode('utf-8'))
    for p in res['query']['pages'].values():
        if 'imageinfo' in p:
            return p['imageinfo'][0]['url']
    return None

print("T-SHIRTS:")
for t in search_wiki('white t-shirt isolated')[:8]:
    print(t, "->", get_url(t))

print("\nMUGS:")
for t in search_wiki('white mug isolated')[:5]:
    print(t, "->", get_url(t))

print("\nTUMBLER / BOTTLE / CUP:")
for t in search_wiki('white thermos OR tumbler OR "travel mug" OR "water bottle" isolated')[:8]:
    print(t, "->", get_url(t))

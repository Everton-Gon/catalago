import urllib.request
import json
import urllib.parse
import os

headers = {'User-Agent': 'LojaFeProposito/1.0 (https://example.com; dev@loja.com)'}

def search_files(query, limit=10):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&list=search&srsearch={urllib.parse.quote(query)}&srnamespace=6&format=json&srlimit={limit}"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    return [item['title'] for item in data['query']['search']]

def get_file_url(title):
    url = f"https://commons.wikimedia.org/w/api.php?action=query&titles={urllib.parse.quote(title)}&prop=imageinfo&iiprop=url|mime&format=json"
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
    for page in data['query']['pages'].values():
        if 'imageinfo' in page and page['imageinfo']:
            info = page['imageinfo'][0]
            if 'image' in info.get('mime', ''):
                return info['url']
    return None

def download_file(url, out_path):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req) as resp, open(out_path, 'wb') as f:
        f.write(resp.read())
    print(f"Downloaded {out_path} ({os.path.getsize(out_path)} bytes)")

print("Mug URL for Taza Blanca:")
mug_url = get_file_url('File:Taza Blanca.jpg')
print(mug_url)
if mug_url:
    download_file(mug_url, 'raw_mug.jpg')

# Search for t-shirt
print("Searching for t-shirt...")
ts_files = search_files('filetype:bitmap "white t-shirt" product OR flat OR isolated')
for t in ts_files:
    try:
        u = get_file_url(t)
        if u and any(ext in u.lower() for ext in ['.jpg', '.jpeg', '.png']):
            print(t.encode('ascii', 'ignore').decode(), u)
    except Exception as e:
        pass

# Search for tumbler/bottle
print("\nSearching for tumbler/thermos...")
tb_files = search_files('filetype:bitmap "thermos" OR "travel mug" OR "tumbler" OR "water bottle" white isolated')
for t in tb_files:
    try:
        u = get_file_url(t)
        if u and any(ext in u.lower() for ext in ['.jpg', '.jpeg', '.png']):
            print(t.encode('ascii', 'ignore').decode(), u)
    except Exception as e:
        pass

#!/usr/bin/env python3
"""
Extrae los blobs base64 del HTML monolítico a archivos .jpg reales.
Uso: python3 extract-images.py
"""
import re, base64, os, sys

src = 'micomapa-latest.html'
out_dir = 'assets/images'
os.makedirs(out_dir, exist_ok=True)

html = open(src, encoding='utf-8').read()
lines = html.split('\n')

def find_esp_id(lines, from_line, lookback=80):
    for j in range(from_line, max(0, from_line - lookback), -1):
        m = re.search(r"id:\s*['\"]?(esp-\d+)['\"]?", lines[j])
        if m:
            return m.group(1)
    return None

main_count = 0
gallery_counts = {}
gallery_count = 0

for i, line in enumerate(lines):
    if 'foto_url' in line and 'base64' in line:
        esp_id = find_esp_id(lines, i)
        if not esp_id:
            print(f'  WARNING: no esp_id found near line {i+1}', file=sys.stderr)
            continue
        b64 = re.search(r'data:image/\w+;base64,([A-Za-z0-9+/=\s]+)', line)
        if b64:
            raw = b64.group(1).replace('\n','').replace(' ','')
            filename = os.path.join(out_dir, f'{esp_id}-main.jpg')
            img_bytes = base64.b64decode(raw)
            with open(filename, 'wb') as f:
                f.write(img_bytes)
            print(f'  {filename}  ({len(img_bytes)//1024} KB)')
            main_count += 1

    elif "url: 'data:image" in line or 'url: "data:image' in line:
        esp_id = find_esp_id(lines, i)
        if not esp_id:
            continue
        b64 = re.search(r'data:image/\w+;base64,([A-Za-z0-9+/=\s]+)', line)
        if b64:
            raw = b64.group(1).replace('\n','').replace(' ','')
            count = gallery_counts.get(esp_id, 0) + 1
            gallery_counts[esp_id] = count
            filename = os.path.join(out_dir, f'{esp_id}-foto{count}.jpg')
            img_bytes = base64.b64decode(raw)
            with open(filename, 'wb') as f:
                f.write(img_bytes)
            print(f'  {filename}  ({len(img_bytes)//1024} KB)')
            gallery_count += 1

total = main_count + gallery_count
print(f'\nTotal: {main_count} main + {gallery_count} gallery = {total} archivos extraídos')

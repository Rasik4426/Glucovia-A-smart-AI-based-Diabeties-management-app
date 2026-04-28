import os

fixes = [
    ("from './components/", "from '@/components/"),
    ("from './lib/", "from '@/lib/"),
    ('from "./components/', 'from "@/components/'),
    ('from "./lib/', 'from "@/lib/'),
]

for fname in os.listdir('.'):
    if not fname.endswith('.jsx'):
        continue
    with open(fname, 'r', encoding='utf-8') as f:
        content = f.read()
    changed = False
    for old, new in fixes:
        if old in content:
            content = content.replace(old, new)
            changed = True
    if changed:
        with open(fname, 'w', encoding='utf-8') as f:
            f.write(content)
        print('Fixed: ' + fname)
    else:
        print('OK: ' + fname)

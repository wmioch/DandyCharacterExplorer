"""Check for any suspicious trinket effects."""
import json

with open('data/trinkets.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

suspicious = []
for t in data['trinkets']:
    effect = t['effect']
    # Check for very short effects, HTML/wiki markup, or other issues
    if (len(effect) < 15 or 
        '|' in effect or 
        '{' in effect or
        'rowspan' in effect or
        'colspan' in effect or
        'style=' in effect or
        effect.startswith('100%')):
        suspicious.append(t)

print(f"Found {len(suspicious)} suspicious effects:\n")
if suspicious:
    for t in suspicious:
        print(f"{t['name']}:")
        print(f"  Effect: {t['effect']}")
        print()
else:
    print("No issues found!")


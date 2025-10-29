import json

# Read the toons file
with open('data/toons.json', 'r') as f:
    data = json.load(f)

# Extraction speed mapping based on stars
extraction_speed_map = {
    1: 0.75,
    2: 0.85,
    3: 1.0,
    4: 1.2,
    5: 1.5,
    6: 1.6
}

# Update each toon
for toon in data['toons']:
    stars = toon['starRatings']['extractionSpeed']
    old_value = toon['baseStats']['extractionSpeed']
    new_value = extraction_speed_map.get(stars, 1.0)
    toon['baseStats']['extractionSpeed'] = new_value
    print(f"{toon['name']:20} {stars} star{'s' if stars != 1 else ''} -> {old_value} to {new_value}")

# Write back
with open('data/toons.json', 'w') as f:
    json.dump(data, f, indent=2)

print('\nAll extraction speeds updated!')

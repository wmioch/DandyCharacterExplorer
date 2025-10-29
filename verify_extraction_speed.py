import json

with open('data/toons.json', 'r') as f:
    data = json.load(f)

test_cases = [
    ('pebble', 1, 0.75),      # 1 star
    ('bassie', 2, 0.85),      # 2 stars
    ('astro', 3, 1.0),        # 3 stars
    ('brightney', 4, 1.2),    # 4 stars
    ('glisten', 5, 1.5),      # 5 stars
    ('razzle_dazzle', 6, 1.6) # 6 stars
]

print("Verification Results:")
print("-" * 70)
all_pass = True
for toon_id, expected_stars, expected_speed in test_cases:
    toon = next(t for t in data['toons'] if t['id'] == toon_id)
    actual_stars = toon['starRatings']['extractionSpeed']
    actual_speed = toon['baseStats']['extractionSpeed']
    status = 'PASS' if actual_stars == expected_stars and actual_speed == expected_speed else 'FAIL'
    if status == 'FAIL':
        all_pass = False
    print(f"{status}: {toon['name']:20} {actual_stars} stars -> {actual_speed} (expected {expected_stars} -> {expected_speed})")

print("-" * 70)
print(f"Overall: {'ALL TESTS PASSED' if all_pass else 'SOME TESTS FAILED'}")

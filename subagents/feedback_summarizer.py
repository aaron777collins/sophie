import os
import json

# Load feedback data
with open('/home/ubuntu/clawd/data/customer_feedback.json', 'r') as f:
    feedback = json.load(f)

# Summarize feedback
num_responses = len(feedback)
avg_rating = sum(response['rating'] for response in feedback) / num_responses
common_themes = {}
for response in feedback:
    for theme in response['themes']:
        common_themes[theme] = common_themes.get(theme, 0) + 1

# Print summary
print(f"Latest customer feedback summary:")
print(f"  - Number of responses: {num_responses}")
print(f"  - Average rating: {avg_rating:.2f}")
print(f"  - Common themes:")
for theme, count in sorted(common_themes.items(), key=lambda x: x[1], reverse=True):
    print(f"    - {theme}: {count} mentions")
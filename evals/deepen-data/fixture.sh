#!/usr/bin/env bash
set -euo pipefail
mkdir -p data analysis
python3 - <<'EOF'
import csv, random
random.seed(7)
with open('data/orders.csv','w',newline='') as f:
    w=csv.writer(f); w.writerow(['order_id','date','region','channel','amount'])
    i=0
    for m in range(1,10):
        for d in range(1,29):
            for _ in range(20):
                i+=1; ch=random.choice(['web','app','partner'])
                if m==9 and ch=='app' and random.random()<0.6: continue
                w.writerow([i,f'2026-{m:02d}-{d:02d}',random.choice(['north','south','east']),ch,round(random.uniform(5,120),2)])
EOF
printf 'pandas
scipy
' > analysis/requirements.txt

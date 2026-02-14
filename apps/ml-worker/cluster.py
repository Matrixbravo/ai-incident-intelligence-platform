import json
import random
import sys
from collections import Counter, defaultdict
from datetime import datetime, timedelta

def parse_ts(ts: str) -> datetime:
    return datetime.fromisoformat(ts.replace("Z", "+00:00"))

def categorize(text: str):
    t = text.lower()
    if "timeout" in t or "sql" in t or "connection pool" in t:
        return ("Dependency/DB Timeout", 0.78)
    if "unauthorized" in t or "jwt" in t or "token" in t:
        return ("Auth/Token", 0.66)
    if "throttle" in t or "rate limit" in t or "429" in t or "quota" in t:
        return ("Throttling/Quota", 0.70)
    if "outofmemory" in t or "oom" in t or "killed" in t:
        return ("Resource Exhaustion", 0.75)
    return ("Unknown", 0.50)

def make_logs(scenario: str, seed: int):
    random.seed(seed)

    base = datetime(2026, 2, 14, 8, 0, 0)

    timeout_msgs = [
        "Timeout expired. The timeout period elapsed prior to obtaining a connection from the pool.",
        "SqlException: Execution Timeout Expired.",
        "Timeout while connecting to SQL endpoint",
        "Connection pool exhausted. Timeout expired.",
    ]
    auth_msgs = [
        "401 Unauthorized: JWT expired",
        "Unauthorized: token expired for user abc",
        "Auth failed: invalid signature in JWT",
        "401 Unauthorized: Bearer token invalid",
    ]
    throttle_msgs = [
        "429 Too Many Requests: rate limit exceeded",
        "Throttled by downstream API due to quota limit",
        "Rate limit hit. Retry-After: 30",
        "Quota exceeded on dependency service",
    ]

    if scenario == "timeout":
        msgs = timeout_msgs
    elif scenario == "auth":
        msgs = auth_msgs
    elif scenario == "throttle":
        msgs = throttle_msgs
    else:
        msgs = timeout_msgs + auth_msgs + throttle_msgs

    # Bursty per minute (spike then cool down) -> nicer line chart
    burst_counts = [2, 3, 6, 9, 7, 4, 3, 2, 2, 1]

    logs = []
    for minute, count in enumerate(burst_counts):
        for _ in range(count):
            sec = random.randint(0, 59)
            ts = (base + timedelta(minutes=minute, seconds=sec)).strftime("%Y-%m-%dT%H:%M:%SZ")
            logs.append({
                "ts": ts,
                "service": "payments-api",
                "message": random.choice(msgs)
            })

    random.shuffle(logs)
    return logs

def build_signature(blob: str):
    words = blob.lower().replace(":", " ").replace(".", " ").split()
    common = [w for w, _ in Counter(words).most_common(6)]
    return " ".join(common[:6])

def cluster_with_sklearn(messages):
    # Import inside function so we can fallback cleanly if sklearn/numpy crashes/missing
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.cluster import DBSCAN

    vectorizer = TfidfVectorizer(stop_words="english")
    X = vectorizer.fit_transform(messages)
    model = DBSCAN(eps=0.8, min_samples=2, metric="cosine")
    labels = model.fit_predict(X)
    return labels

def cluster_fallback(messages):
    """
    Pure-Python fallback clustering:
    group by category first, then split into signature buckets.
    This is not “ML”, but keeps your demo working even if sklearn breaks.
    """
    buckets = defaultdict(list)
    for i, msg in enumerate(messages):
        cat, _ = categorize(msg)
        key = (cat, " ".join(msg.lower().split()[:3]))  # cheap signature bucket
        buckets[key].append(i)

    labels = [-1] * len(messages)
    current = 0
    for _, idxs in buckets.items():
        if len(idxs) < 2:
            continue
        for i in idxs:
            labels[i] = current
        current += 1
    return labels

def main():
    scenario = "mixed"
    seed = 42  # default stable output

    # Args:
    #   python cluster.py mixed 123
    if len(sys.argv) > 1:
        scenario = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            seed = int(sys.argv[2])
        except:
            seed = 42

    logs = make_logs(scenario, seed)

    messages = [x["message"] for x in logs]

    # Try sklearn, fallback if anything goes wrong
    try:
        labels = cluster_with_sklearn(messages)
        engine = "sklearn"
    except Exception:
        labels = cluster_fallback(messages)
        engine = "fallback"

    groups = defaultdict(list)
    for log, label in zip(logs, labels):
        groups[label].append(log)

    # Build clusters, sorted by count desc so chart order is stable
    raw_clusters = []
    for label, items in groups.items():
        if label == -1:
            continue
        blob = " ".join(x["message"] for x in items)
        category, conf = categorize(blob)

        raw_clusters.append({
            "count": len(items),
            "category": category,
            "confidence": conf,
            "signature": build_signature(blob),
            "sample": items[0]["message"]
        })

    raw_clusters.sort(key=lambda c: (-c["count"], c["category"], c["signature"]))

    clusters = []
    for i, c in enumerate(raw_clusters, start=1):
        clusters.append({
            "clusterId": f"CL-{i}",
            **c
        })

    per_min = Counter(parse_ts(x["ts"]).replace(second=0, microsecond=0) for x in logs)
    trend = [{"ts": dt.strftime("%Y-%m-%dT%H:%M:%SZ"), "errors": v} for dt, v in sorted(per_min.items())]

    print(json.dumps({
        "service": "payments-api",
        "scenario": scenario,
        "seed": seed,
        "engine": engine,   # helps debugging on UI/API
        "trend": trend,
        "clusters": clusters
    }))

if __name__ == "__main__":
    main()

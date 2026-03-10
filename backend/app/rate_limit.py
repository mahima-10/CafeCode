import time
from fastapi import HTTPException, Request

# In-memory store: { ip_address: [timestamp, timestamp, ...] }
_request_log: dict[str, list[float]] = {}

MAX_REQUESTS = 5
WINDOW_SECONDS = 3600  # 1 hour


def rate_limit(request: Request):
    """Dependency that enforces 5 POST requests per hour per IP."""
    client_ip = request.client.host if request.client else "unknown"
    now = time.time()
    cutoff = now - WINDOW_SECONDS

    # Get existing timestamps and prune expired ones
    timestamps = _request_log.get(client_ip, [])
    timestamps = [t for t in timestamps if t > cutoff]

    if len(timestamps) >= MAX_REQUESTS:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can make 5 requests per hour. Please try again later.",
        )

    timestamps.append(now)
    _request_log[client_ip] = timestamps

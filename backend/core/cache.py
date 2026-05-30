import json
import os
from typing import Any, Optional

import redis as redis_lib

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379")

_client: Optional[redis_lib.Redis] = None


def get_redis() -> Optional[redis_lib.Redis]:
    global _client
    if _client is None:
        try:
            _client = redis_lib.from_url(
                REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2,
                socket_timeout=2,
            )
            _client.ping()
        except Exception:
            _client = None
    return _client


def cache_get(key: str) -> Any:
    r = get_redis()
    if r is None:
        return None
    try:
        data = r.get(key)
        return json.loads(data) if data is not None else None
    except Exception:
        return None


def cache_set(key: str, value: Any, ttl: int = 300) -> None:
    r = get_redis()
    if r is None:
        return
    try:
        r.setex(key, ttl, json.dumps(value, default=str))
    except Exception:
        pass


def cache_delete(*keys: str) -> None:
    r = get_redis()
    if r is None:
        return
    try:
        r.delete(*keys)
    except Exception:
        pass


def cache_delete_pattern(pattern: str) -> None:
    r = get_redis()
    if r is None:
        return
    try:
        keys = r.keys(pattern)
        if keys:
            r.delete(*keys)
    except Exception:
        pass

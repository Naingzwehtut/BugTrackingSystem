"""
app/services/realtime.py
--------------------------
In-process publish/subscribe used for LIVE notifications.

Each open browser tab holds one Server-Sent Events connection
(GET /api/notifications/stream). That connection subscribes a Queue here;
when a notification is created, `publish()` drops it into every queue of
that user, and the stream sends it to the browser immediately.

Because the queues live in memory, run the server as ONE process with
threads (see Procfile: `--workers 1 --threads 32`). The frontend also
re-syncs over plain HTTP whenever the stream reconnects, so nothing is lost
if a connection drops.
"""

import queue
import threading
from collections import defaultdict


class NotificationBus:
    def __init__(self, max_queue_size=100):
        self._lock = threading.Lock()
        self._subscribers = defaultdict(set)  # user_id -> {Queue, ...}
        self._max = max_queue_size

    def subscribe(self, user_id):
        q = queue.Queue(maxsize=self._max)
        with self._lock:
            self._subscribers[user_id].add(q)
        return q

    def unsubscribe(self, user_id, q):
        with self._lock:
            self._subscribers[user_id].discard(q)
            if not self._subscribers[user_id]:
                del self._subscribers[user_id]

    def publish(self, user_id, payload):
        with self._lock:
            targets = list(self._subscribers.get(user_id, ()))
        for q in targets:
            try:
                q.put_nowait(payload)
            except queue.Full:
                pass  # a stalled tab; it re-syncs over HTTP when it reconnects

    def subscriber_count(self, user_id):
        with self._lock:
            return len(self._subscribers.get(user_id, ()))


bus = NotificationBus()

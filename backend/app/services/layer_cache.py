"""Remembers the answers of the map layers while the data they come from has not changed.

A layer answer depends on the day, the stored climate, and the species. It costs seconds to
compute (the excellent edibles together ~3 s) and is asked again by everyone who opens the layer
or moves the day slider, so the last few answers are kept in memory (per server process). The key
carries a signature of the stored data (SqlCellStore.data_signature), so new climate rows, a
reloaded cell or an edited species make a new key and the old answers simply age out.
"""

from collections import OrderedDict
from collections.abc import Hashable

MAX_ENTRIES = 64  # a day slider of ~40 positions per species fills 24 at once


class LayerCache:
    def __init__(self, max_entries: int = MAX_ENTRIES) -> None:
        self._max = max_entries
        self._items: OrderedDict[Hashable, dict] = OrderedDict()

    def get(self, key: Hashable) -> dict | None:
        value = self._items.get(key)
        if value is not None:
            self._items.move_to_end(key)
        return value

    def put(self, key: Hashable, value: dict) -> dict:
        self._items[key] = value
        self._items.move_to_end(key)
        while len(self._items) > self._max:
            self._items.popitem(last=False)
        return value

    def clear(self) -> None:
        self._items.clear()


answers = LayerCache()

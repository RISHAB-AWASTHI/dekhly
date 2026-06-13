import { useState, useEffect, useCallback } from "react";
import type { Title } from "./data";

const WATCH_LATER_KEY = "dekhly_watch_later";

export function useWatchLater() {
  const [savedTitles, setSavedTitles] = useState<Title[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const loadSaved = () => {
      try {
        const item = window.localStorage.getItem(WATCH_LATER_KEY);
        if (item) {
          setSavedTitles(JSON.parse(item));
        }
      } catch (error) {
        console.error("Failed to load watch later from local storage:", error);
      }
      setIsLoaded(true);
    };

    loadSaved();

    // Listen for cross-tab or component storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === WATCH_LATER_KEY && e.newValue) {
        setSavedTitles(JSON.parse(e.newValue));
      }
    };
    
    // Custom event for intra-tab communication
    const handleCustomEvent = () => loadSaved();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("watch-later-updated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("watch-later-updated", handleCustomEvent);
    };
  }, []);

  const saveToStorage = (newTitles: Title[]) => {
    try {
      window.localStorage.setItem(WATCH_LATER_KEY, JSON.stringify(newTitles));
      setSavedTitles(newTitles);
      // Dispatch custom event so other components in the same tab update
      window.dispatchEvent(new Event("watch-later-updated"));
    } catch (error) {
      console.error("Failed to save to local storage:", error);
    }
  };

  const addTitle = useCallback(
    (title: Title) => {
      if (savedTitles.some((t) => t.id === title.id)) return;
      const next = [title, ...savedTitles];
      saveToStorage(next);
    },
    [savedTitles]
  );

  const removeTitle = useCallback(
    (id: string) => {
      const next = savedTitles.filter((t) => t.id !== id);
      saveToStorage(next);
    },
    [savedTitles]
  );

  const toggleWatchLater = useCallback(
    (title: Title) => {
      const exists = savedTitles.some((t) => t.id === title.id);
      const next = exists
        ? savedTitles.filter((t) => t.id !== title.id)
        : [title, ...savedTitles];
      saveToStorage(next);
    },
    [savedTitles]
  );

  const hasTitle = useCallback(
    (id: string) => {
      return savedTitles.some((t) => t.id === id);
    },
    [savedTitles]
  );

  return {
    savedTitles,
    addTitle,
    removeTitle,
    toggleWatchLater,
    hasTitle,
    isLoaded,
  };
}

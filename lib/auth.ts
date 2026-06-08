"use client";

import { useEffect, useState } from "react";

export type User = {
  email: string;
  name: string;
  initial: string;
};

const KEY = "dekhly:user";
const EVENT = "dekhly:auth";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function signIn(email: string): User {
  const handle = email.split("@")[0] || "Guest";
  const name = handle.charAt(0).toUpperCase() + handle.slice(1);
  const user: User = { email, name, initial: name.charAt(0).toUpperCase() };
  localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(EVENT));
  return user;
}

export function signOut() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new Event(EVENT));
}

/** Reactive auth state. `ready` flips true once localStorage has been read. */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    sync();
    setReady(true);
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { user, ready };
}

import { redirect } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface StoredUserProfile {
  userId?: string;
  email?: string;
  phone?: string | null;
  role?: string;
  accountStatus?: string;
  emailVerified?: boolean;
  profile?: {
    fullName?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    city?: string | null;
    district?: string | null;
    occupation?: string | null;
  };
}

const STORAGE_KEY = 'shohojrin_user';

function readStoredUser(): StoredUserProfile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredUserProfile;
  } catch {
    return null;
  }
}

export function getStoredUser(): StoredUserProfile | null {
  return readStoredUser();
}

export function storeUser(user: StoredUserProfile) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function useStoredUser() {
  const [user, setUser] = useState<StoredUserProfile | null>(null);

  useEffect(() => {
    setUser(readStoredUser());

    const handleStorage = () => {
      setUser(readStoredUser());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  return { user, setUser };
}

export function getDisplayName(user: StoredUserProfile | null, fallback: string) {
  const fullName = user?.profile?.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  if (user?.email) {
    return user.email.split('@')[0];
  }

  return fallback;
}

export function useRequireAuth(redirectTo: string = '/auth') {
  const { user } = useStoredUser();
  const router = useRouter();

  useEffect(() => {
    // If not SSR, and user state has been resolved as null
    if (typeof window !== 'undefined') {
      const stored = readStoredUser();
      if (!stored) {
        router.replace(redirectTo);
      }
    }
  }, [user, router, redirectTo]);

  return { user };
}

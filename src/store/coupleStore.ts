import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Partner {
  id: string;
  name: string;
  avatar: string | null;
  timeZone: string;
  location: { lat: number; lng: number } | null;
}

export interface User {
  id: string;
  name: string;
  avatar: string | null;
  timeZone: string;
  location: { lat: number; lng: number } | null;
}

export interface CoupleStore {
  isAuthenticated: boolean;
  isLinked: boolean;
  user: User | null;
  partner: Partner | null;
  coupleId: string | null;
  reunionDate: Date | null;
  goodbyeDate: Date | null;
  togetherMode: boolean;
  distanceMiles: number | null;
  hasSeenOnboarding: boolean;

  setUser: (user: User) => void;
  setPartner: (partner: Partner) => void;
  setCoupleId: (id: string | null) => void;
  setReunionDate: (date: Date | null) => void;
  setGoodbyeDate: (date: Date | null) => void;
  setTogetherMode: (together: boolean) => void;
  setDistance: (miles: number) => void;
  setHasSeenOnboarding: (seen: boolean) => void;
  login: (user: User) => void;
  logout: () => void;
  linkPartner: (partner: Partner, coupleId?: string) => void;
}

export const useCoupleStore = create<CoupleStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      isLinked: false,
      user: null,
      partner: null,
      coupleId: null,
      reunionDate: null,
      goodbyeDate: null,
      togetherMode: false,
      distanceMiles: null,
      hasSeenOnboarding: false,

      setUser: (user) => set({ user }),
      setPartner: (partner) => set({ partner }),
      setCoupleId: (coupleId) => set({ coupleId }),
      setReunionDate: (reunionDate) => set({ reunionDate }),
      setGoodbyeDate: (goodbyeDate) => set({ goodbyeDate }),
      setTogetherMode: (togetherMode) => set({ togetherMode }),
      setDistance: (distanceMiles) => set({ distanceMiles }),
      setHasSeenOnboarding: (hasSeenOnboarding) => set({ hasSeenOnboarding }),

      login: (user) => set({ isAuthenticated: true, user }),
      logout: () =>
        set({
          isAuthenticated: false,
          isLinked: false,
          user: null,
          partner: null,
          coupleId: null,
          reunionDate: null,
          goodbyeDate: null,
          togetherMode: false,
          distanceMiles: null,
          // Keep hasSeenOnboarding so users who logged out & back in
          // don't see the tutorial twice. (Reset only on logout if you
          // want re-onboarding for testing.)
        }),
      linkPartner: (partner, coupleId) =>
        set((s) => ({
          partner,
          coupleId: coupleId ?? s.coupleId,
          isLinked: true,
        })),
    }),
    {
      name: 'miles-couple-store',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist UX-state that should survive restart. Auth/link state
      // is rehydrated from Supabase on launch (AppNavigator's useEffect).
      partialize: (state) => ({
        togetherMode: state.togetherMode,
        hasSeenOnboarding: state.hasSeenOnboarding,
        reunionDate: state.reunionDate,
      }),
      // Dates round-trip through JSON as strings; revive them.
      onRehydrateStorage: () => (state) => {
        if (state?.reunionDate && typeof state.reunionDate === 'string') {
          state.reunionDate = new Date(state.reunionDate);
        }
      },
    }
  )
);

// Demo seed data for development
export const DEMO_USER: User = {
  id: 'amit-001',
  name: 'Amit',
  avatar: null,
  timeZone: 'Asia/Jerusalem',
  location: { lat: 32.0853, lng: 34.7818 },
};

export const DEMO_PARTNER: Partner = {
  id: 'haley-001',
  name: 'Haley',
  avatar: null,
  timeZone: 'America/New_York',
  location: { lat: 40.7128, lng: -74.006 },
};

import { create } from 'zustand';

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
  reunionDate: Date | null;
  goodbyeDate: Date | null;
  togetherMode: boolean;
  distanceMiles: number | null;

  setUser: (user: User) => void;
  setPartner: (partner: Partner) => void;
  setReunionDate: (date: Date | null) => void;
  setGoodbyeDate: (date: Date | null) => void;
  setTogetherMode: (together: boolean) => void;
  setDistance: (miles: number) => void;
  login: (user: User) => void;
  logout: () => void;
  linkPartner: (partner: Partner) => void;
}

export const useCoupleStore = create<CoupleStore>((set) => ({
  isAuthenticated: false,
  isLinked: false,
  user: null,
  partner: null,
  reunionDate: null,
  goodbyeDate: null,
  togetherMode: false,
  distanceMiles: null,

  setUser: (user) => set({ user }),
  setPartner: (partner) => set({ partner }),
  setReunionDate: (reunionDate) => set({ reunionDate }),
  setGoodbyeDate: (goodbyeDate) => set({ goodbyeDate }),
  setTogetherMode: (togetherMode) => set({ togetherMode }),
  setDistance: (distanceMiles) => set({ distanceMiles }),

  login: (user) => set({ isAuthenticated: true, user }),
  logout: () =>
    set({
      isAuthenticated: false,
      isLinked: false,
      user: null,
      partner: null,
      reunionDate: null,
      goodbyeDate: null,
      togetherMode: false,
      distanceMiles: null,
    }),
  linkPartner: (partner) => set({ partner, isLinked: true }),
}));

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

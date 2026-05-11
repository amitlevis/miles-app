/**
 * Entitlements (subscriptions, add-ons). Hydrated from RevenueCat on app
 * launch and after every purchase. Used by feature gates throughout the
 * app — e.g. `useEntitlements().premium` decides whether the AI Date
 * Planner is unlocked.
 *
 * When IAPs are not configured (e.g. running in Expo Go, or before keys
 * are added), everyone gets the free tier.
 */

import { create } from 'zustand';
import {
  EntitlementState,
  fetchEntitlements,
  initPurchases,
  restorePurchases,
} from '../services/purchases';

interface EntitlementsStore extends EntitlementState {
  loading: boolean;
  /** Initialize for a logged-in user. Safe to call repeatedly. */
  init: (userId: string) => Promise<void>;
  /** Manually pull fresh entitlement state from RevenueCat. */
  refresh: () => Promise<void>;
  /** Trigger "Restore purchases" on Settings / Shop. */
  restore: () => Promise<void>;
  /** Replace state directly (after a successful purchase). */
  apply: (state: EntitlementState) => void;
}

const FREE_TIER: EntitlementState = {
  premium: false,
  duo: false,
  coach: false,
};

export const useEntitlementsStore = create<EntitlementsStore>((set) => ({
  ...FREE_TIER,
  loading: false,

  init: async (userId) => {
    set({ loading: true });
    await initPurchases(userId);
    const fresh = await fetchEntitlements();
    set({ ...fresh, loading: false });
  },

  refresh: async () => {
    const fresh = await fetchEntitlements();
    set({ ...fresh });
  },

  restore: async () => {
    set({ loading: true });
    const restored = await restorePurchases();
    set({ ...restored, loading: false });
  },

  apply: (state) => set({ ...state }),
}));

/** Returns just the entitlement flags (no setters). */
export function useEntitlements(): EntitlementState {
  return useEntitlementsStore((s) => ({
    premium: s.premium,
    duo: s.duo,
    coach: s.coach,
  }));
}

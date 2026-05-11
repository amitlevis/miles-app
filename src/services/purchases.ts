/**
 * RevenueCat / In-App Purchases.
 *
 * **Setup checklist** (Miles team — must complete before this works):
 *  1. Create a RevenueCat account (https://app.revenuecat.com).
 *  2. Add iOS + Android apps; paste the bundle/app IDs from app.json.
 *  3. In App Store Connect, create products with IDs:
 *       - miles.premium.monthly       ($4.99)
 *       - miles.premium.yearly        ($39.99)
 *       - miles.duo.monthly           ($7.99)
 *       - miles.coach.monthly         ($2.99 add-on)
 *     Group them into entitlements 'premium', 'duo', 'coach'.
 *  4. Copy your iOS + Android Public SDK Keys into the constants below
 *     (or move them into .env with expo-constants).
 *  5. Build with EAS (`eas build --profile development`) — RevenueCat
 *     requires native modules and will not work inside Expo Go.
 *
 * While the keys are placeholder strings, every public method becomes a
 * no-op that resolves with the free-tier entitlements so the rest of the
 * app keeps running fine.
 */

import { Platform } from 'react-native';
import type {
  PurchasesPackage,
  CustomerInfo,
} from 'react-native-purchases';

// TODO: replace with real keys (or pull from expo-constants extra)
const REVENUECAT_IOS_KEY = '';
const REVENUECAT_ANDROID_KEY = '';

export type EntitlementKey = 'premium' | 'duo' | 'coach';
export interface EntitlementState {
  premium: boolean;
  duo: boolean;
  coach: boolean;
}

const FREE_TIER: EntitlementState = {
  premium: false,
  duo: false,
  coach: false,
};

let configured = false;
let PurchasesModule: typeof import('react-native-purchases').default | null = null;

async function loadPurchases() {
  if (PurchasesModule) return PurchasesModule;
  try {
    const mod = await import('react-native-purchases');
    PurchasesModule = mod.default;
    return PurchasesModule;
  } catch {
    return null; // running in Expo Go or unsupported environment
  }
}

function hasKey(): boolean {
  return Platform.OS === 'ios'
    ? REVENUECAT_IOS_KEY.length > 0
    : Platform.OS === 'android'
      ? REVENUECAT_ANDROID_KEY.length > 0
      : false;
}

/**
 * Initialize the SDK with the current user. Safe to call multiple times;
 * subsequent calls just identify the user.
 */
export async function initPurchases(userId: string): Promise<void> {
  if (!hasKey()) return; // keys not set yet — no-op
  const Purchases = await loadPurchases();
  if (!Purchases) return;

  if (!configured) {
    const apiKey =
      Platform.OS === 'ios' ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
    Purchases.configure({ apiKey, appUserID: userId });
    configured = true;
  } else {
    await Purchases.logIn(userId);
  }
}

export async function fetchEntitlements(): Promise<EntitlementState> {
  if (!hasKey()) return FREE_TIER;
  const Purchases = await loadPurchases();
  if (!Purchases) return FREE_TIER;
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    return entitlementsFromInfo(info);
  } catch {
    return FREE_TIER;
  }
}

function entitlementsFromInfo(info: CustomerInfo): EntitlementState {
  const active = info?.entitlements?.active ?? {};
  return {
    premium: 'premium' in active || 'duo' in active,
    duo: 'duo' in active,
    coach: 'coach' in active,
  };
}

/**
 * Returns the available offering's packages (Monthly / Annual / etc.) for
 * a given entitlement key. Returns null if RevenueCat isn't configured.
 */
export async function fetchOffering(
  offeringId: string = 'default'
): Promise<PurchasesPackage[] | null> {
  if (!hasKey()) return null;
  const Purchases = await loadPurchases();
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const offering = offerings.all[offeringId] ?? offerings.current;
    if (!offering) return null;
    return offering.availablePackages;
  } catch {
    return null;
  }
}

/**
 * Purchase a package. Returns the new entitlements after the purchase
 * completes, or throws if cancelled / failed.
 */
export async function purchasePackage(
  pkg: PurchasesPackage
): Promise<EntitlementState> {
  if (!hasKey()) throw new Error('In-app purchases are not configured yet.');
  const Purchases = await loadPurchases();
  if (!Purchases) {
    throw new Error('In-app purchases need a dev build (not Expo Go).');
  }
  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return entitlementsFromInfo(customerInfo);
}

export async function restorePurchases(): Promise<EntitlementState> {
  if (!hasKey()) return FREE_TIER;
  const Purchases = await loadPurchases();
  if (!Purchases) return FREE_TIER;
  try {
    const info = await Purchases.restorePurchases();
    return entitlementsFromInfo(info);
  } catch {
    return FREE_TIER;
  }
}

/**
 * Convenience: are IAPs actually wired up? UI can read this to decide
 * whether to show real purchase buttons vs a "Coming soon" state.
 */
export function isConfigured(): boolean {
  return hasKey();
}

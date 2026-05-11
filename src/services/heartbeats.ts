/**
 * Heartbeat pulses — partner feels them as a vibration when the home screen
 * "Hold to send" button is pressed.
 *
 * Client-side rate limit so a 1-second hold doesn't insert 60 rows; partner
 * realtime listener still receives the pulse and triggers a haptic.
 */

import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert } from '../lib/database.types';

export type Heartbeat = Tables<'heartbeats'>;
export type HeartbeatInsert = TablesInsert<'heartbeats'>;

const MIN_INSERT_INTERVAL_MS = 750;
let lastSentAt = 0;

export async function sendHeartbeat(args: {
  coupleId: string;
  senderId: string;
}): Promise<Heartbeat | null> {
  const now = Date.now();
  if (now - lastSentAt < MIN_INSERT_INTERVAL_MS) return null;
  lastSentAt = now;

  const { data, error } = await supabase
    .from('heartbeats')
    .insert({
      couple_id: args.coupleId,
      sender_id: args.senderId,
    })
    .select()
    .single();

  if (error) {
    // Don't throw — heartbeats are fire-and-forget
    console.warn('[heartbeats] insert failed:', error.message);
    return null;
  }
  return data;
}

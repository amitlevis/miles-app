/**
 * Realtime channel manager for a couple's shared activity.
 *
 * Usage (typically wired in App.tsx or AppNavigator after couple-linking):
 *
 *   const channel = subscribeToCouple({
 *     coupleId,
 *     selfId,
 *     onMood: (m) => ...,
 *     onHeartbeat: () => triggerHaptic(),
 *     onPhoto: (p) => refreshLatestPhoto(),
 *     onNote: (n) => bumpJarBadge(),
 *     onTogetherStateChange: (t) => useCoupleStore.getState().setTogetherMode(t.active),
 *   });
 *   // later:
 *   channel.unsubscribe();
 *
 * Filters: each table is filtered by `couple_id=eq.<id>` so we only get
 * events for this couple. Inserts from the current user are ignored
 * client-side (we don't want our own sends to fire our own haptics).
 */

import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { Tables } from '../lib/database.types';

export interface CoupleRealtimeHandlers {
  onMood?: (mood: Tables<'moods'>) => void;
  onHeartbeat?: (hb: Tables<'heartbeats'>) => void;
  onPhoto?: (photo: Tables<'photos'>) => void;
  onDrawing?: (drawing: Tables<'drawings'>) => void;
  onNote?: (note: Tables<'memory_jar_notes'>) => void;
  onCapsuleUnsealed?: (capsule: Tables<'time_capsules'>) => void;
  onTogetherStateChange?: (state: Tables<'together_state'>) => void;
}

export interface SubscribeArgs extends CoupleRealtimeHandlers {
  coupleId: string;
  /** Used to filter out events caused by the current user. */
  selfId: string;
}

export function subscribeToCouple(args: SubscribeArgs): RealtimeChannel {
  const { coupleId, selfId } = args;
  const filter = `couple_id=eq.${coupleId}`;

  const channel = supabase
    .channel(`couple:${coupleId}`)

    // Moods (INSERT only)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'moods', filter },
      (payload) => {
        const row = payload.new as Tables<'moods'>;
        if (row.sender_id === selfId) return;
        args.onMood?.(row);
      }
    )

    // Heartbeats (INSERT only)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'heartbeats', filter },
      (payload) => {
        const row = payload.new as Tables<'heartbeats'>;
        if (row.sender_id === selfId) return;
        args.onHeartbeat?.(row);
      }
    )

    // Photos (INSERT only)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'photos', filter },
      (payload) => {
        const row = payload.new as Tables<'photos'>;
        if (row.sender_id === selfId) return;
        args.onPhoto?.(row);
      }
    )

    // Drawings (INSERT only)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'drawings', filter },
      (payload) => {
        const row = payload.new as Tables<'drawings'>;
        if (row.sender_id === selfId) return;
        args.onDrawing?.(row);
      }
    )

    // Memory jar notes (INSERT only — the recipient's badge)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'memory_jar_notes', filter },
      (payload) => {
        const row = payload.new as Tables<'memory_jar_notes'>;
        if (row.sender_id === selfId) return;
        args.onNote?.(row);
      }
    )

    // Time capsules unsealing — INSERT (only visible when open_at <= now)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'time_capsules', filter },
      (payload) => {
        const row = payload.new as Tables<'time_capsules'>;
        args.onCapsuleUnsealed?.(row);
      }
    )

    // Together state — both INSERT and UPDATE; either partner should know
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'together_state', filter },
      (payload) => {
        const row = payload.new as Tables<'together_state'>;
        if (!row || !('couple_id' in row)) return;
        args.onTogetherStateChange?.(row);
      }
    )

    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.warn('[realtime] channel error for couple', coupleId, status);
      }
    });

  return channel;
}

export async function unsubscribeChannel(channel: RealtimeChannel | null) {
  if (!channel) return;
  await supabase.removeChannel(channel);
}

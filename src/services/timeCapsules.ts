/**
 * Time Capsules — sealed messages that only become readable after `open_at`.
 * RLS enforces this server-side: sender can always see their own, but the
 * recipient only sees rows where open_at <= now().
 */

import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type TimeCapsule = Tables<'time_capsules'>;

export async function sealCapsule(args: {
  coupleId: string;
  senderId: string;
  body: string;
  openAt: Date;
}): Promise<TimeCapsule> {
  if (!args.body.trim()) throw new Error('Time Capsule body cannot be empty.');
  if (args.openAt.getTime() <= Date.now()) {
    throw new Error('Time Capsule open date must be in the future.');
  }

  const { data, error } = await supabase
    .from('time_capsules')
    .insert({
      couple_id: args.coupleId,
      sender_id: args.senderId,
      body: args.body.trim(),
      open_at: args.openAt.toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function fetchOpenedCapsules(coupleId: string): Promise<TimeCapsule[]> {
  const { data, error } = await supabase
    .from('time_capsules')
    .select('*')
    .eq('couple_id', coupleId)
    .order('open_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

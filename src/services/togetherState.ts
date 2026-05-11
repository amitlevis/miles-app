/**
 * Together state — single row per couple. When one partner toggles "We're
 * together", we upsert here so the other partner's app also flips theme.
 */

import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type TogetherState = Tables<'together_state'>;

export async function fetchTogetherState(coupleId: string): Promise<TogetherState | null> {
  const { data, error } = await supabase
    .from('together_state')
    .select('*')
    .eq('couple_id', coupleId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function setTogetherStateRemote(args: {
  coupleId: string;
  selfId: string;
  active: boolean;
}): Promise<TogetherState> {
  const payload = {
    couple_id: args.coupleId,
    active: args.active,
    since: args.active ? new Date().toISOString() : null,
    updated_by: args.selfId,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('together_state')
    .upsert(payload, { onConflict: 'couple_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

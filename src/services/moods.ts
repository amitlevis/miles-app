/**
 * Mood sends — the "send a vibe" feature on the home screen mood ring.
 * Writes to the moods table; partner sees it via Realtime + optional push.
 */

import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert } from '../lib/database.types';

export type Mood = Tables<'moods'>;
export type MoodInsert = TablesInsert<'moods'>;

export async function sendMood(args: {
  coupleId: string;
  senderId: string;
  mood: string;
  emoji?: string;
}): Promise<Mood> {
  const { data, error } = await supabase
    .from('moods')
    .insert({
      couple_id: args.coupleId,
      sender_id: args.senderId,
      mood: args.mood,
      emoji: args.emoji ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function fetchRecentMoods(coupleId: string, limit = 20): Promise<Mood[]> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('couple_id', coupleId)
    .order('sent_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

export async function fetchLatestMoodFromPartner(args: {
  coupleId: string;
  selfId: string;
}): Promise<Mood | null> {
  const { data, error } = await supabase
    .from('moods')
    .select('*')
    .eq('couple_id', args.coupleId)
    .neq('sender_id', args.selfId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

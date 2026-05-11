/**
 * Memory Jar notes — small surprise messages from one partner to the other.
 * Either partner can mark a note as opened.
 */

import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert } from '../lib/database.types';

export type MemoryJarNote = Tables<'memory_jar_notes'>;
export type MemoryJarNoteInsert = TablesInsert<'memory_jar_notes'>;

export async function leaveNote(args: {
  coupleId: string;
  senderId: string;
  body: string;
}): Promise<MemoryJarNote> {
  const trimmed = args.body.trim();
  if (!trimmed) throw new Error('Note body cannot be empty.');

  const { data, error } = await supabase
    .from('memory_jar_notes')
    .insert({
      couple_id: args.coupleId,
      sender_id: args.senderId,
      body: trimmed,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Notes addressed to the current user (i.e. sent by the partner). Includes
 * both unopened and opened so the UI can show history if desired.
 */
export async function fetchPartnerNotes(args: {
  coupleId: string;
  selfId: string;
}): Promise<MemoryJarNote[]> {
  const { data, error } = await supabase
    .from('memory_jar_notes')
    .select('*')
    .eq('couple_id', args.coupleId)
    .neq('sender_id', args.selfId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function markNoteOpened(noteId: string): Promise<MemoryJarNote> {
  const { data, error } = await supabase
    .from('memory_jar_notes')
    .update({ opened_at: new Date().toISOString() })
    .eq('id', noteId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

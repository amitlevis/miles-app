/**
 * Per-user widget configuration. Saved via upsert keyed by user_id.
 */

import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert } from '../lib/database.types';

export type WidgetConfig = Tables<'widget_config'>;
export type WidgetConfigInsert = TablesInsert<'widget_config'>;

export async function fetchWidgetConfig(userId: string): Promise<WidgetConfig | null> {
  const { data, error } = await supabase
    .from('widget_config')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveWidgetConfig(
  config: WidgetConfigInsert
): Promise<WidgetConfig> {
  const { data, error } = await supabase
    .from('widget_config')
    .upsert(
      { ...config, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
    .select()
    .single();
  if (error) throw error;
  return data;
}

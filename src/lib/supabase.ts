import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import type { Database } from './database.types';

const SUPABASE_URL = 'https://zowwuzepcttifosnjxki.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpvd3d1emVwY3R0aWZvc25qeGtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwNzYyOTQsImV4cCI6MjA5MzY1MjI5NH0._tyHclJqyX4MSKONNIZb5RvZqr1xhLv_-Jjzwvq_pKs';

const storage =
  Platform.OS === 'web'
    ? undefined
    : {
        getItem: (key: string) => SecureStore.getItemAsync(key),
        setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
        removeItem: (key: string) => SecureStore.deleteItemAsync(key),
      };

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Profile = {
  id: string;
  name: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Couple = {
  id: string;
  user1_id: string;
  user2_id: string;
  reunion_date: string | null;
  created_at: string;
};

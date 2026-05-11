/**
 * Photo sharing — picks/captures a photo, uploads it to the couple-photos
 * Supabase Storage bucket, and inserts a row in `photos`. Partner sees
 * the new photo via Realtime and renders the latest in the home grid.
 */

import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import type { Tables } from '../lib/database.types';

export type Photo = Tables<'photos'>;
export type PhotoTag = 'good_morning' | 'thinking_of_you' | 'good_night';

const BUCKET = 'couple-photos';

/**
 * Uploads a local image URI to the couple's Storage folder, then writes the
 * pointer row. Returns the inserted row + the public-ish (signed) display URL.
 */
export async function uploadAndSharePhoto(args: {
  coupleId: string;
  senderId: string;
  localUri: string;
  tag?: PhotoTag;
}): Promise<{ photo: Photo; displayUrl: string }> {
  const ext = guessExtension(args.localUri);
  const path = `${args.coupleId}/${crypto.randomUUID()}.${ext}`;

  // Convert the local file URI to a Blob (works in RN via fetch).
  const response = await fetch(args.localUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, {
      contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const { data: row, error: insertError } = await supabase
    .from('photos')
    .insert({
      couple_id: args.coupleId,
      sender_id: args.senderId,
      storage_path: path,
      tag: args.tag ?? null,
    })
    .select()
    .single();
  if (insertError) {
    // best-effort cleanup if the row failed
    await supabase.storage.from(BUCKET).remove([path]).catch(() => {});
    throw insertError;
  }

  const displayUrl = await getSignedUrl(path);
  return { photo: row, displayUrl };
}

export async function getSignedUrl(storagePath: string, expiresInSeconds = 60 * 60): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, expiresInSeconds);
  if (error) throw error;
  return data.signedUrl;
}

export async function fetchLatestPhotoFromPartner(args: {
  coupleId: string;
  selfId: string;
}): Promise<{ photo: Photo; displayUrl: string } | null> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .eq('couple_id', args.coupleId)
    .neq('sender_id', args.selfId)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const displayUrl = await getSignedUrl(data.storage_path);
  return { photo: data, displayUrl };
}

/**
 * Picks a photo from the gallery (or the camera if `useCamera`) and returns
 * the local URI. Returns null if the user cancels or permissions are denied.
 */
export async function pickOrCapturePhoto(useCamera: boolean): Promise<string | null> {
  if (useCamera) {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return null;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (result.canceled || !result.assets[0]) return null;
    return result.assets[0].uri;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });
  if (result.canceled || !result.assets[0]) return null;
  return result.assets[0].uri;
}

function guessExtension(uri: string): string {
  const m = uri.toLowerCase().match(/\.(jpg|jpeg|png|webp|heic)$/);
  if (!m) return 'jpg';
  return m[1] === 'jpeg' ? 'jpg' : m[1];
}

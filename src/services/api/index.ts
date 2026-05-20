/**
 * API Service Barrel
 *
 * Re-exports the Supabase client and any future API helpers.
 * UI code should NEVER import from this module directly —
 * always go through repositories or feature services.
 */

export { supabase } from './supabase';

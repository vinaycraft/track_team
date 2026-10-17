import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface User {
  id: number;
  name: string;
  role: 'admin' | 'team';
  created_at: string;
}

export interface Location {
  id: number;
  user_id: number;
  latitude: number;
  longitude: number;
  updated_at: string;
}

export const dbOperations = {
  // User operations
  getAllUsers: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as User[];
  },
  
  getUserById: async (id: number) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  },
  
  createUser: async (name: string, role: 'admin' | 'team') => {
    const { data, error } = await supabase
      .from('users')
      .insert([{ name, role }])
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  },

  // Location operations
  updateLocation: async (userId: number, latitude: number, longitude: number) => {
    const { error } = await supabase
      .from('locations')
      .upsert({
        user_id: userId,
        latitude,
        longitude,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      });
    
    if (error) throw error;
  },

  getAllLocations: async () => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        users (
          name,
          role
        )
      `)
      .order('updated_at', { ascending: false });
    
    if (error) throw error;
    
    return data.map((loc: any) => ({
      ...loc,
      name: loc.users.name,
      role: loc.users.role
    })) as (Location & { name: string; role: string })[];
  },

  getLocationByUserId: async (userId: number) => {
    const { data, error } = await supabase
      .from('locations')
      .select(`
        *,
        users (
          name,
          role
        )
      `)
      .eq('user_id', userId)
      .single();
    
    if (error) return undefined;
    
    return {
      ...data,
      name: data.users.name,
      role: data.users.role
    } as Location & { name: string; role: string };
  },
};

export default supabase;

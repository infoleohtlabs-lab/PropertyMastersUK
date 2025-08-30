import { supabase } from '../lib/supabase';
import { UserRole } from '../types/auth';

export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateUserProfileData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

export async function createUserProfile(userData: CreateUserProfileData): Promise<UserProfile> {
  try {
    const profileData = {
      id: userData.id,
      email: userData.email,
      first_name: userData.firstName,
      last_name: userData.lastName,
      role: userData.role,
      phone: userData.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user profile: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in createUserProfile:', error);
    throw new Error(error.message || 'Failed to create user profile');
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`);
    }

    return data;
  } catch (error: any) {
    console.error('Error in updateUserProfile:', error);
    throw new Error(error.message || 'Failed to update user profile');
  }
}

export async function deleteUserProfile(userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to delete user profile: ${error.message}`);
    }
  } catch (error: any) {
    console.error('Error in deleteUserProfile:', error);
    throw new Error(error.message || 'Failed to delete user profile');
  }
}
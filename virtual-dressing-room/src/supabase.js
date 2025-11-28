// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// ============================================
// SUPABASE CLIENT INITIALIZATION
// ============================================

const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid (not placeholder values)
const isConfigured = supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key');

if (!isConfigured) {
    console.warn('⚠️ Supabase not configured - using demo mode');
    console.warn('To use real authentication, add your credentials to .env file');
}

// Create Supabase client (will work in demo mode with placeholder values)
export const supabase = createClient(
    supabaseUrl || 'https://demo.supabase.co',
    supabaseAnonKey || 'demo-key', {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
        },
    }
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get current authenticated user
 * @returns {Promise<Object|null>} User object or null
 */
export const getCurrentUser = async() => {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};

/**
 * Get current session
 * @returns {Promise<Object|null>} Session object or null
 */
export const getCurrentSession = async() => {
    try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        return session;
    } catch (error) {
        console.error('Error getting session:', error);
        return null;
    }
};

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} fullName - User full name
 * @returns {Promise<Object>} Auth response
 */
export const signUpWithEmail = async(email, password, fullName) => {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                },
            },
        });

        if (error) throw error;

        // Create user profile in users table
        if (data.user) {
            await createUserProfile(data.user.id, email, fullName, 'email');
        }

        return { data, error: null };
    } catch (error) {
        console.error('Signup error:', error);
        return { data: null, error };
    }
};

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Auth response
 */
export const signInWithEmail = async(email, password) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Sign in error:', error);
        return { data: null, error };
    }
};

/**
 * Sign in with Google OAuth
 * @returns {Promise<Object>} Auth response
 */
export const signInWithGoogle = async() => {
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/`,
            },
        });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Google sign in error:', error);
        return { data: null, error };
    }
};

/**
 * Sign out current user
 * @returns {Promise<Object>} Sign out response
 */
export const signOut = async() => {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Sign out error:', error);
        return { error };
    }
};

/**
 * Create user profile in users table
 * @param {string} userId - User ID from auth
 * @param {string} email - User email
 * @param {string} fullName - User full name
 * @param {string} provider - Auth provider (email, google, etc)
 * @returns {Promise<Object>} Database response
 */
export const createUserProfile = async(userId, email, fullName, provider = 'email') => {
    try {
        const { data, error } = await supabase
            .from('users')
            .insert([{
                id: userId,
                email,
                full_name: fullName,
                provider,
                created_at: new Date(),
            }, ])
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error creating user profile:', error);
        return { data: null, error };
    }
};

/**
 * Get user profile from database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async(userId) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return { data: null, error };
    }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated profile
 */
export const updateUserProfile = async(userId, updates) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                ...updates,
                updated_at: new Date(),
            })
            .eq('id', userId)
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error updating user profile:', error);
        return { data: null, error };
    }
};

/**
 * Test Supabase connection
 * @returns {Promise<boolean>} Connection status
 */
export const testSupabaseConnection = async() => {
    try {
        const { data, error } = await supabase.auth.getSession();
        if (error && error.message !== 'Auth session missing!') {
            throw error;
        }
        console.log('✅ Supabase connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection error:', error);
        return false;
    }
};

// ============================================
// STORAGE FUNCTIONS - TRY-ON RESULTS
// ============================================

/**
 * Upload try-on result image to Supabase Storage
 * @param {string} userId - User ID
 * @param {string} base64Image - Base64 encoded image
 * @param {Object} metadata - Optional metadata (clothing type, etc.)
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadTryOnResult = async(userId, base64Image, metadata = {}) => {
    try {
        if (!userId) {
            throw new Error('User ID is required for upload');
        }

        // Convert base64 to blob
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });

        // Generate unique filename
        const timestamp = new Date().getTime();
        const fileName = `tryon-${timestamp}.jpg`;
        const filePath = `${userId}/${fileName}`;

        // Upload to Supabase Storage (bucket: 'tryon-results')
        const { data, error } = await supabase.storage
            .from('tryon-results')
            .upload(filePath, blob, {
                contentType: 'image/jpeg',
                upsert: false,
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = supabase.storage
            .from('tryon-results')
            .getPublicUrl(filePath);

        // Save metadata to database
        const { error: dbError } = await supabase
            .from('tryon_history')
            .insert({
                user_id: userId,
                image_url: urlData.publicUrl,
                file_path: filePath,
                clothing_type: metadata.clothing_type || 'unknown',
                clothing_color: metadata.clothing_color || '',
                created_at: new Date().toISOString(),
                metadata: metadata,
            });

        if (dbError) console.warn('Warning: Failed to save metadata:', dbError);

        return {
            success: true,
            url: urlData.publicUrl,
            filePath,
            error: null
        };
    } catch (error) {
        console.error('Error uploading try-on result:', error);
        return { success: false, url: null, error };
    }
};

/**
 * Get user's try-on history/gallery
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of results (default: 20)
 * @returns {Promise<Array>} Array of try-on results
 */
export const getUserGallery = async(userId, limit = 20) => {
    try {
        if (!userId) {
            throw new Error('User ID is required');
        }

        const { data, error } = await supabase
            .from('tryon_history')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;

        return { data: data || [], error: null };
    } catch (error) {
        console.error('Error fetching user gallery:', error);
        return { data: [], error };
    }
};

/**
 * Delete a try-on result from storage and database
 * @param {string} userId - User ID
 * @param {string} filePath - File path in storage
 * @param {string} recordId - Database record ID
 * @returns {Promise<Object>} Delete result
 */
export const deleteTryOnResult = async(userId, filePath, recordId) => {
    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('tryon-results')
            .remove([filePath]);

        if (storageError) throw storageError;

        // Delete from database
        const { error: dbError } = await supabase
            .from('tryon_history')
            .delete()
            .eq('id', recordId)
            .eq('user_id', userId);

        if (dbError) throw dbError;

        return { success: true, error: null };
    } catch (error) {
        console.error('Error deleting try-on result:', error);
        return { success: false, error };
    }
};

export default supabase;
// Test Supabase Storage Connection
import { supabase } from './src/supabase.js';

async function testStorage() {
    console.log('🧪 Testing Supabase Storage...\n');

    // 1. Check if bucket exists
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
        console.error('❌ Error listing buckets:', bucketError);
        return;
    }

    console.log('📦 Available buckets:', buckets.map(b => b.name));

    const tryonBucket = buckets.find(b => b.name === 'tryon-results');
    if (tryonBucket) {
        console.log('✅ tryon-results bucket exists!');
        console.log('   Public:', tryonBucket.public);
    } else {
        console.log('❌ tryon-results bucket NOT found - run supabase-setup.sql');
    }

    // 2. Check if table exists
    const { data: tableData, error: tableError } = await supabase
        .from('tryon_history')
        .select('count');

    if (tableError) {
        console.log('❌ tryon_history table NOT found - run supabase-setup.sql');
    } else {
        console.log('✅ tryon_history table exists!');
    }

    // 3. Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
        console.log('\n👤 Current user:', user.email);

        // 4. Check user's gallery
        const { data: gallery, error: galleryError } = await supabase
            .from('tryon_history')
            .select('*')
            .eq('user_id', user.id);

        if (!galleryError) {
            console.log(`📸 User has ${gallery.length} saved try-ons`);
        }
    } else {
        console.log('\n⚠️  No user logged in');
    }
}

testStorage().catch(console.error);
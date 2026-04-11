// Debug script to check enrollment requests API
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debugEnrollments() {
  console.log('\n🔍 Debugging Enrollment Requests...\n');

  try {
    // Test 1: Direct query for all enrollments
    console.log('Test 1: Fetching all enrollments...');
    const { data: allEnrollments, error: allError } = await supabase
      .from('project_enrollments')
      .select('*')
      .order('created_at', { ascending: false });

    if (allError) {
      console.log('❌ Error fetching enrollments:', allError.message, allError.code);
    } else {
      console.log('✅ Total enrollments found:', allEnrollments?.length || 0);
      if (allEnrollments && allEnrollments.length > 0) {
        console.log('First enrollment:', JSON.stringify(allEnrollments[0], null, 2));
      }
    }

    // Test 2: Query with profile join
    console.log('\nTest 2: Fetching enrollments with profile join...');
    const { data: withProfiles, error: profileError } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles(*)')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.log('❌ Error with profile join:', profileError.message, profileError.code);
    } else {
      console.log('✅ Enrollments with profiles:', withProfiles?.length || 0);
      if (withProfiles && withProfiles.length > 0) {
        console.log('Profile data available:', !!withProfiles[0].profile);
      }
    }

    // Test 3: Query with project join
    console.log('\nTest 3: Fetching enrollments with project join...');
    const { data: withProjects, error: projectError } = await supabase
      .from('project_enrollments')
      .select('*, profile:profiles(*), project:properties(*)')
      .order('created_at', { ascending: false });

    if (projectError) {
      console.log('❌ Error with project join:', projectError.message, projectError.code);
    } else {
      console.log('✅ Enrollments with projects:', withProjects?.length || 0);
      if (withProjects && withProjects.length > 0) {
        console.log('Sample enrollment:');
        console.log('  - ID:', withProjects[0].id);
        console.log('  - Status:', withProjects[0].status);
        console.log('  - User ID:', withProjects[0].user_id);
        console.log('  - Profile:', withProjects[0].profile?.email || 'NOT FOUND');
        console.log('  - Project:', withProjects[0].project?.name || 'NOT FOUND');
        console.log('  - Total Price:', withProjects[0].total_price);
      }
    }

    // Test 4: Check RLS - attempt to update (should fail without admin role)
    console.log('\nTest 4: Checking RLS policies...');
    console.log('Note: Without admin auth, some operations may fail (expected)');

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

debugEnrollments();

// Quick diagnostic script to check current database schema
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Key exists:', !!supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('\n🔍 Checking current database schema...\n');

  try {
    // Test 1: Check if we can query with new columns
    console.log('Test 1: Checking for new columns...');
    const { data, error } = await supabase
      .from('project_enrollments')
      .select('selected_unit_type, selected_floor, selected_unit_number, unit_details')
      .limit(1);

    if (error) {
      console.log('❌ NEW COLUMNS DO NOT EXIST');
      console.log('Error:', error.message, error.code);
      console.log('\n🔧 Solution: You need to run the migration first!\n');
    } else {
      console.log('✅ NEW COLUMNS EXIST');
      console.log('Data returned:', data);
    }

    // Test 2: Check basic enrollment query
    console.log('\nTest 2: Checking basic enrollment query...');
    const { data: enrollments, error: basicError } = await supabase
      .from('project_enrollments')
      .select('*')
      .limit(1);

    if (basicError) {
      console.log('❌ Error:', basicError.message);
    } else {
      console.log('✅ Basic query works');
      if (enrollments && enrollments.length > 0) {
        console.log('Existing columns:', Object.keys(enrollments[0]).join(', '));
      } else {
        console.log('No enrollments exist yet (table is empty)');
      }
    }

    // Test 3: Check audit log table
    console.log('\nTest 3: Checking audit log table...');
    const { error: auditError } = await supabase
      .from('enrollment_audit_log')
      .select('id')
      .limit(1);

    if (auditError) {
      console.log('❌ AUDIT LOG TABLE DOES NOT EXIST');
      console.log('Error:', auditError.message);
    } else {
      console.log('✅ AUDIT LOG TABLE EXISTS');
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

checkSchema();

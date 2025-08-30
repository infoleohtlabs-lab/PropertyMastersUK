// Test script to verify Supabase authentication
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://himanwdawxstxwphimhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuth() {
  console.log('Testing Supabase Authentication...');
  
  try {
    // Test 1: Check connection
    console.log('\n1. Testing connection...');
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Connection error:', error.message);
    } else {
      console.log('✅ Connection successful');
    }
    
    // Test 2: Try to sign up a test user
    console.log('\n2. Testing user registration...');
    const testEmail = 'testuser@gmail.com';
    const testPassword = 'TestPassword123!';
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          firstName: 'Test',
          lastName: 'User',
          role: 'buyer'
        }
      }
    });
    
    if (signUpError) {
      if (signUpError.message.includes('already registered')) {
        console.log('✅ User already exists, proceeding to login test');
      } else {
        console.error('Sign up error:', signUpError.message);
      }
    } else {
      console.log('✅ User registration successful');
    }
    
    // Test 3: Try to sign in
    console.log('\n3. Testing user login...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.error('Sign in error:', signInError.message);
    } else {
      console.log('✅ User login successful');
      console.log('User ID:', signInData.user?.id);
      console.log('User Email:', signInData.user?.email);
    }
    
    // Test 4: Sign out
    console.log('\n4. Testing user logout...');
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('Sign out error:', signOutError.message);
    } else {
      console.log('✅ User logout successful');
    }
    
    console.log('\n🎉 All authentication tests completed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testAuth();
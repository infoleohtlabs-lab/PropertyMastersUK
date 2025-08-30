#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = 'https://himanwdawxstxwphimhw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSeedData() {
  console.log('🌱 Running seed data script...');
  
  try {
    // Sample inquiries data
    const inquiriesData = [
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        property_id: '650e8400-e29b-41d4-a716-446655440001',
        name: 'John Smith',
        email: 'john.smith@email.com',
        phone: '+44 7700 900123',
        message: 'I am interested in viewing this property. Could we arrange a viewing for this weekend?',
        inquiry_type: 'viewing_request',
        status: 'pending'
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        property_id: '650e8400-e29b-41d4-a716-446655440002',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '+44 7700 900124',
        message: 'What is the earliest move-in date for this property?',
        inquiry_type: 'general_inquiry',
        status: 'pending'
      }
    ];

    // Sample viewings data
    const viewingsData = [
      {
        id: '660e8400-e29b-41d4-a716-446655440001',
        property_id: '650e8400-e29b-41d4-a716-446655440001',
        inquiry_id: '550e8400-e29b-41d4-a716-446655440001',
        viewing_date: '2024-02-15',
        viewing_time: '14:00:00',
        status: 'scheduled',
        notes: 'First viewing appointment'
      },
      {
        id: '660e8400-e29b-41d4-a716-446655440002',
        property_id: '650e8400-e29b-41d4-a716-446655440002',
        inquiry_id: '550e8400-e29b-41d4-a716-446655440002',
        viewing_date: '2024-02-16',
        viewing_time: '10:30:00',
        status: 'scheduled',
        notes: 'Weekend viewing'
      }
    ];

    // Insert inquiries
    console.log('\n📝 Inserting inquiries data...');
    const { data: inquiriesResult, error: inquiriesError } = await supabase
      .from('inquiries')
      .insert(inquiriesData);
    
    if (inquiriesError) {
      console.error('❌ Error inserting inquiries:', inquiriesError.message);
    } else {
      console.log(`✅ Successfully inserted ${inquiriesData.length} inquiries`);
    }

    // Insert viewings
    console.log('\n👁️ Inserting viewings data...');
    const { data: viewingsResult, error: viewingsError } = await supabase
      .from('viewings')
      .insert(viewingsData);
    
    if (viewingsError) {
      console.error('❌ Error inserting viewings:', viewingsError.message);
    } else {
      console.log(`✅ Successfully inserted ${viewingsData.length} viewings`);
    }
    
    console.log('\n🎉 Seed data execution completed!');
    
  } catch (error) {
    console.error('❌ Error running seed data:', error.message);
    process.exit(1);
  }
}

// Run the seed data
runSeedData();
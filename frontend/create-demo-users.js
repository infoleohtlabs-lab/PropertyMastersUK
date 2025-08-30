import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://himanwdawxstxwphimhw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhpbWFud2Rhd3hzdHh3cGhpbWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMjUwNzAsImV4cCI6MjA3MTgwMTA3MH0.rStT7HNC8EsehqsCB_a6-9ovd3R0X8N0HyFO8fF97Vw';

const supabase = createClient(supabaseUrl, supabaseKey);

const demoUsers = [
  { email: 'admin.demo@gmail.com', password: 'PropertyTest2024!', role: 'admin' },
  { email: 'agent.demo@gmail.com', password: 'PropertyTest2024!', role: 'agent' },
  { email: 'landlord.demo@gmail.com', password: 'PropertyTest2024!', role: 'landlord' },
  { email: 'tenant.demo@gmail.com', password: 'PropertyTest2024!', role: 'tenant' },
  { email: 'solicitor.demo@gmail.com', password: 'PropertyTest2024!', role: 'solicitor' },
  { email: 'buyer.demo@gmail.com', password: 'PropertyTest2024!', role: 'buyer' }
];

async function createDemoUsers() {
  console.log('Creating demo users in Supabase...');
  
  for (const user of demoUsers) {
    try {
      console.log(`Creating ${user.role} user: ${user.email}`);
      
      const { data, error } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            role: user.role,
            full_name: `Demo ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`,
            email_verified: true
          }
        }
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          console.log(`✓ ${user.role} user already exists`);
        } else {
          console.error(`✗ Error creating ${user.role} user:`, error.message);
        }
      } else {
        console.log(`✓ ${user.role} user created successfully`);
      }
    } catch (err) {
      console.error(`✗ Unexpected error creating ${user.role} user:`, err);
    }
  }
  
  console.log('\nDemo user creation completed!');
  console.log('Note: Users may need to verify their email addresses before logging in.');
}

createDemoUsers().catch(console.error);
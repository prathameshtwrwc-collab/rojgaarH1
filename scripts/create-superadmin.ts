import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createSuperadmin() {
  const email = 'superadmin@gmail.com';
  const password = 'Superadmin@12';
  const fullName = 'Super Admin';

  console.log('Signing in to get user ID...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError || !signInData.user) {
    console.error('Error signing in:', signInError?.message || 'Unknown error');
    console.log('User may not exist or password is wrong. Trying to create user...');
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'superadmin',
          full_name: fullName,
        },
      },
    });

    if (error) {
      console.error('Error creating user:', error.message);
      process.exit(1);
    }

    console.log('User created successfully:', data.user!.id);
    console.log('Updating profile...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: data.user!.id,
        role: 'superadmin',
        full_name: fullName,
      });

    if (profileError) {
      console.error('Error updating profile:', profileError.message);
    } else {
      console.log('Profile created successfully');
    }
  } else {
    console.log('User found with ID:', signInData.user.id);
    console.log('Updating profile with superadmin role...');
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: signInData.user.id,
        role: 'superadmin',
        full_name: fullName,
      });

    if (profileError) {
      console.error('Error updating profile:', profileError.message);
      process.exit(1);
    }

    console.log('Profile updated successfully');
  }

  console.log('You can now login with:', email, '/', password);
}

createSuperadmin();

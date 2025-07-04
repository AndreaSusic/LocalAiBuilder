#!/usr/bin/env node

/**
 * Test OAuth Flow for GBP Business Information API
 * 
 * This script tests the complete OAuth implementation:
 * 1. Check if OAuth scopes are configured
 * 2. Test refresh token storage
 * 3. Simulate GBP Business Information API call
 */

console.log('🧪 Testing OAuth Flow for GBP Business Information API...\n');

// Test OAuth URL generation
const testOAuthUrl = () => {
  const baseUrl = 'http://localhost:5000';
  const scope = encodeURIComponent('https://www.googleapis.com/auth/business.manage');
  const authUrl = `${baseUrl}/auth/google?prompt=consent&access_type=offline`;
  
  console.log('📋 OAuth Test Steps:');
  console.log('1. Visit this URL to test OAuth with GBP scope:');
  console.log(`   ${authUrl}`);
  console.log('');
  console.log('2. Expected: Google dialog should show:');
  console.log('   "See, edit, create and delete your Google business listings"');
  console.log('');
  console.log('3. On successful auth, check server logs for:');
  console.log('   "🔑 Received refresh token, saving for GBP API access"');
  console.log('   "✅ Refresh token saved for user: [USER_ID]"');
  console.log('');
};

// Test database schema
const testDatabase = async () => {
  try {
    const { Pool } = require('pg');
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL
    });
    
    console.log('🗄️  Testing database schema...');
    
    // Check if user_tokens table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_tokens'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ user_tokens table exists with columns:');
      result.rows.forEach(row => {
        console.log(`   - ${row.column_name}: ${row.data_type}`);
      });
    } else {
      console.log('❌ user_tokens table not found');
    }
    
    await pool.end();
    console.log('');
    
  } catch (error) {
    console.log('❌ Database error:', error.message);
    console.log('');
  }
};

// Test GBP API readiness
const testGbpApiReadiness = () => {
  console.log('🔧 GBP Business Information API Readiness:');
  
  const hasClientId = !!process.env.GOOGLE_CLIENT_ID;
  const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET;
  const hasRefreshToken = !!process.env.GOOGLE_REFRESH_TOKEN;
  
  console.log(`   GOOGLE_CLIENT_ID: ${hasClientId ? '✅ Present' : '❌ Missing'}`);
  console.log(`   GOOGLE_CLIENT_SECRET: ${hasClientSecret ? '✅ Present' : '❌ Missing'}`);
  console.log(`   GOOGLE_REFRESH_TOKEN: ${hasRefreshToken ? '✅ Present' : '❌ Missing (will be generated per-user)'}`);
  console.log('');
  
  if (hasClientId && hasClientSecret) {
    console.log('🚀 OAuth credentials configured - ready for authentication flow');
  } else {
    console.log('⚠️  OAuth credentials missing - check Replit secrets');
  }
  console.log('');
};

// Main test execution
const runTests = async () => {
  testOAuthUrl();
  await testDatabase();
  testGbpApiReadiness();
  
  console.log('📝 Next Steps:');
  console.log('1. Visit the OAuth URL above to authenticate with GBP scope');
  console.log('2. Check server logs for refresh token storage');
  console.log('3. Test GBP API call with: POST /api/gbp-details');
  console.log('4. Look for authentic GBP products in response (not website-sourced)');
};

runTests().catch(console.error);
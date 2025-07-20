const { Pool } = require('pg');
require('dotenv').config();

async function fixDatabaseIssues() {
  // Check if DATABASE_URL is available
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL environment variable is not set');
    console.log('Please ensure you have a .env file with your database connection string');
    console.log('Example DATABASE_URL: postgresql://username:password@host:port/database');
    process.exit(1);
  }

  console.log('Database URL found:', process.env.DATABASE_URL.replace(/:[^:@]*@/, ':****@'));

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    // Add connection timeout and retry options
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1 // Use only one connection for this script
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Fixing properties roles column...');
    
    // First, update any invalid JSON data to NULL
    const updateResult = await client.query(`
      UPDATE "public"."properties" 
      SET "roles" = NULL 
      WHERE "roles" IS NOT NULL 
        AND "roles" != '' 
        AND "roles"::jsonb IS NULL
    `);
    
    console.log(`Updated ${updateResult.rowCount} rows with invalid JSON data`);
    
    // Now alter the column type to JSONB
    await client.query(`
      ALTER TABLE "public"."properties" 
      ALTER COLUMN "roles" TYPE jsonb 
      USING CASE 
        WHEN "roles" IS NULL THEN NULL
        ELSE "roles"::jsonb 
      END
    `);
    
    console.log('Successfully converted roles column to JSONB');
    
    client.release();
    console.log('Database issues fixed successfully!');
  } catch (error) {
    console.error('Error fixing database issues:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixDatabaseIssues()
    .then(() => {
      console.log('Script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}

module.exports = { fixDatabaseIssues }; 
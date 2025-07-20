const { Pool } = require('pg');
require('dotenv').config();

async function fixDatabaseIssues() {
  // Check for required environment variables
  const requiredEnvVars = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USERNAME', 'DATABASE_PASSWORD'];
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    console.log('Please ensure you have the following in your .env file:');
    console.log('DATABASE_HOST=your_host');
    console.log('DATABASE_NAME=your_database');
    console.log('DATABASE_USERNAME=your_username');
    console.log('DATABASE_PASSWORD=your_password');
    console.log('DATABASE_PORT=5432 (optional, defaults to 5432)');
    console.log('DATABASE_SSL=false (optional, defaults to false)');
    process.exit(1);
  }

  const config = {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT) || 5432,
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 1
  };

  console.log('Connecting to database with config:', {
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    ssl: !!config.ssl
  });

  const pool = new Pool(config);

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Fixing properties roles column...');
    
    // First, check if the properties table exists
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'properties'
      );
    `);
    
    if (!tableExists.rows[0].exists) {
      console.log('Properties table does not exist. Skipping migration.');
      client.release();
      return;
    }
    
    // Check if roles column exists
    const columnExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'properties' 
        AND column_name = 'roles'
      );
    `);
    
    if (!columnExists.rows[0].exists) {
      console.log('Roles column does not exist. Skipping migration.');
      client.release();
      return;
    }
    
    // Check current column type
    const columnType = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'properties' 
      AND column_name = 'roles';
    `);
    
    console.log('Current roles column type:', columnType.rows[0]?.data_type);
    
    if (columnType.rows[0]?.data_type === 'jsonb') {
      console.log('Roles column is already JSONB. No migration needed.');
      client.release();
      return;
    }
    
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
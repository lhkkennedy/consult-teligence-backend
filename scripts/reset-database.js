const { Pool } = require('pg');
require('dotenv').config();

async function resetDatabase() {
  console.log('🔄 Resetting database...');
  
  // Check if we have the required environment variables
  const hasConnectionString = !!process.env.DATABASE_URL;
  const hasIndividualParams = !!(process.env.DATABASE_HOST && process.env.DATABASE_NAME && process.env.DATABASE_USERNAME && process.env.DATABASE_PASSWORD);
  
  if (!hasConnectionString && !hasIndividualParams) {
    console.error('❌ No database configuration found!');
    console.log('Please set up your .env file with database credentials.');
    console.log('See ENVIRONMENT_SETUP.md for detailed instructions.');
    process.exit(1);
  }
  
  let config;
  
  if (hasConnectionString) {
    console.log('Using connection string...');
    config = {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
  } else {
    console.log('Using individual parameters...');
    config = {
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      database: process.env.DATABASE_NAME,
      user: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
    };
  }

  const pool = new Pool(config);

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    // Get all tables in the public schema
    const tablesResult = await client.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);
    
    const tables = tablesResult.rows.map(row => row.tablename);
    
    if (tables.length === 0) {
      console.log('✅ Database is already empty');
      client.release();
      return;
    }
    
    console.log(`Found ${tables.length} tables to drop:`, tables.join(', '));
    
    // Disable foreign key checks temporarily
    await client.query('SET session_replication_role = replica;');
    
    // Drop all tables
    for (const table of tables) {
      console.log(`Dropping table: ${table}`);
      await client.query(`DROP TABLE IF EXISTS "${table}" CASCADE`);
    }
    
    // Re-enable foreign key checks
    await client.query('SET session_replication_role = DEFAULT;');
    
    console.log('✅ All tables dropped successfully');
    console.log('🔄 Database reset complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm run develop');
    console.log('2. Strapi will automatically create all tables with the correct schema');
    console.log('3. Your database will be fresh and ready to use');
    
    client.release();
  } catch (error) {
    console.error('❌ Error resetting database:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the reset if this script is executed directly
if (require.main === module) {
  resetDatabase();
}

module.exports = { resetDatabase }; 
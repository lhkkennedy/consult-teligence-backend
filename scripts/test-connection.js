const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
  console.log('Testing database connection...');
  
  // Check if we have the required environment variables
  const hasConnectionString = !!process.env.DATABASE_URL;
  const hasIndividualParams = !!(process.env.DATABASE_HOST && process.env.DATABASE_NAME && process.env.DATABASE_USERNAME && process.env.DATABASE_PASSWORD);
  
  if (!hasConnectionString && !hasIndividualParams) {
    console.error('❌ No database configuration found!');
    console.log('Please set up your .env file with either:');
    console.log('  - DATABASE_URL (connection string)');
    console.log('  - DATABASE_HOST, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD (individual parameters)');
    console.log('\nSee ENVIRONMENT_SETUP.md for detailed instructions.');
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
    
    console.log('Connection config:', {
      host: config.host,
      port: config.port,
      database: config.database,
      user: config.user,
      ssl: !!config.ssl
    });
  }

  const pool = new Pool(config);

  try {
    console.log('Attempting to connect...');
    const client = await pool.connect();
    
    // Test a simple query
    const result = await client.query('SELECT version()');
    console.log('✅ Database connection successful!');
    console.log('PostgreSQL version:', result.rows[0].version.split(' ')[0]);
    
    // Check if properties table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'properties'
      );
    `);
    
    if (tableCheck.rows[0].exists) {
      console.log('✅ Properties table exists');
      
      // Check roles column
      const columnCheck = await client.query(`
        SELECT data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'properties' 
        AND column_name = 'roles';
      `);
      
      if (columnCheck.rows.length > 0) {
        console.log('✅ Roles column exists, current type:', columnCheck.rows[0].data_type);
        
        if (columnCheck.rows[0].data_type === 'jsonb') {
          console.log('✅ Roles column is already JSONB - no migration needed!');
        } else {
          console.log('⚠️  Roles column needs migration to JSONB');
        }
      } else {
        console.log('⚠️  Roles column does not exist');
      }
    } else {
      console.log('⚠️  Properties table does not exist');
    }
    
    client.release();
    console.log('\n🎉 Database is ready for migration!');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('SASL')) {
      console.log('\n💡 This looks like an authentication issue. Try:');
      console.log('1. Check your password is correct');
      console.log('2. Use individual parameters instead of connection string');
      console.log('3. Ensure no special characters in password');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 This looks like a connection issue. Try:');
      console.log('1. Check if database server is running');
      console.log('2. Verify host and port are correct');
      console.log('3. Check firewall settings');
    } else if (error.message.includes('authentication failed')) {
      console.log('\n💡 This looks like an authentication issue. Try:');
      console.log('1. Verify username and password');
      console.log('2. Check if user has access to database');
      console.log('3. Ensure database exists');
    }
    
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  testConnection();
}

module.exports = { testConnection }; 
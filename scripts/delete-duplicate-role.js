const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1338';
const ADMIN_TOKEN = process.env.STRAPI_TOKEN;
console.log(ADMIN_TOKEN);
async function deleteDuplicateRole() {
  console.log('🔧 Deleting duplicate Public role...');
  console.log('Base URL:', BASE_URL);
  
  if (!ADMIN_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN environment variable is required');
    console.log('💡 Get your admin token from: Settings → API Tokens → Create new API Token');
    return;
  }

  try {
    // Get all roles
    console.log('\n📋 Fetching existing roles...');
    const rolesResponse = await fetch(`${BASE_URL}/admin/roles`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!rolesResponse.ok) {
      throw new Error(`Failed to fetch roles: ${rolesResponse.status}`);
    }

    const roles = await rolesResponse.json();
    console.log('Found roles:');
    roles.data.forEach((role, index) => {
      console.log(`   ${index + 1}. ID: ${role.id}, Name: "${role.name}", Description: "${role.description}"`);
    });

    // Find duplicate Public roles
    const publicRoles = roles.data.filter(r => r.name === 'Public');
    
    if (publicRoles.length <= 1) {
      console.log('✅ No duplicate Public roles found');
      return;
    }

    console.log(`\n⚠️  Found ${publicRoles.length} Public roles:`);
    publicRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ID: ${role.id}, Description: "${role.description}"`);
    });

    // Identify the duplicate (usually the one with custom description)
    const defaultPublicRole = publicRoles.find(r => r.description === 'Default role given to unauthenticated user.');
    const duplicatePublicRole = publicRoles.find(r => r.description !== 'Default role given to unauthenticated user.');

    if (!duplicatePublicRole) {
      console.log('✅ No duplicate Public role to delete');
      return;
    }

    console.log(`\n🗑️  Deleting duplicate Public role (ID: ${duplicatePublicRole.id})...`);
    
    // Try to delete the duplicate role
    const deleteResponse = await fetch(`${BASE_URL}/admin/roles/${duplicatePublicRole.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (deleteResponse.ok) {
      console.log('✅ Duplicate Public role deleted successfully');
    } else {
      console.log('⚠️  Could not delete via API, trying alternative method...');
      console.log('💡 You may need to delete it manually or use the Strapi console');
      
      // Alternative: Try to update the duplicate role to be different
      console.log('\n🔄 Attempting to rename duplicate role instead...');
      const updateResponse = await fetch(`${BASE_URL}/admin/roles/${duplicatePublicRole.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Public-Duplicate',
          description: 'Duplicate role to be deleted',
          permissions: {}
        })
      });

      if (updateResponse.ok) {
        console.log('✅ Duplicate role renamed to "Public-Duplicate"');
        console.log('💡 You can now delete it manually from the admin panel');
      } else {
        console.log('❌ Could not rename duplicate role');
      }
    }

  } catch (error) {
    console.error('❌ Error deleting duplicate role:', error.message);
  }
}

// Run the cleanup
deleteDuplicateRole().catch(console.error); 
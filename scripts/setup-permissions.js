const fetch = require('node-fetch');

// Configuration
const BASE_URL = process.env.STRAPI_URL || 'http://localhost:1338';
const ADMIN_TOKEN = process.env.STRAPI_ADMIN_TOKEN; // You'll need to get this from your admin panel

// Permission configurations
const PUBLIC_PERMISSIONS = {
  "auth": {
    "callback": true,
    "connect": true,
    "emailConfirmation": true,
    "forgotPassword": true,
    "register": true,
    "resetPassword": true,
    "sendEmailConfirmation": true
  },
  "user": {
    "me": false,
    "update": false,
    "updateMe": false
  },
  "consultant": {
    "find": true,
    "findOne": true
  },
  "property": {
    "find": true,
    "findOne": true
  },
  "post": {
    "find": true,
    "findOne": true
  },
  "timeline-item": {
    "find": true,
    "findOne": true
  },
  "tag": {
    "find": true,
    "findOne": true
  },
  "article": {
    "find": true,
    "findOne": true
  }
};

const AUTHENTICATED_PERMISSIONS = {
  "auth": {
    "callback": true,
    "connect": true,
    "emailConfirmation": true,
    "forgotPassword": true,
    "register": true,
    "resetPassword": true,
    "sendEmailConfirmation": true
  },
  "user": {
    "me": true,
    "update": false,
    "updateMe": true
  },
  "consultant": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "property": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "post": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "timeline-item": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "comment": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "reaction": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "save": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "share": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "view": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "friend-request": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "friends": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "tag": {
    "find": true,
    "findOne": true
  },
  "article": {
    "find": true,
    "findOne": true
  },
  "user-preferences": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  },
  "feed-analytics": {
    "find": true,
    "findOne": true,
    "create": true,
    "update": true,
    "delete": true
  }
};

async function setupPermissions() {
  console.log('🔧 Setting up Strapi permissions...');
  console.log('Base URL:', BASE_URL);
  
  if (!ADMIN_TOKEN) {
    console.error('❌ STRAPI_ADMIN_TOKEN environment variable is required');
    console.log('💡 Get your admin token from: Settings → API Tokens → Create new API Token');
    return;
  }

  try {
    // Get roles
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
    console.log('Found roles:', roles.data.map(r => r.name));

    // Find Public and Authenticated roles
    const publicRoles = roles.data.filter(r => r.name === 'Public');
    const authenticatedRole = roles.data.find(r => r.name === 'Authenticated');

    if (publicRoles.length === 0) {
      console.error('❌ Public role not found');
      return;
    }

    if (publicRoles.length > 1) {
      console.warn('⚠️  Multiple Public roles found:');
      publicRoles.forEach((role, index) => {
        console.warn(`   ${index + 1}. ID: ${role.id}, Description: "${role.description}"`);
      });
      console.warn('💡 Please delete duplicate Public roles and keep only the default one');
      return;
    }

    const publicRole = publicRoles[0];

    if (!authenticatedRole) {
      console.error('❌ Authenticated role not found');
      return;
    }

    // Update Public role
    console.log('\n🔓 Updating Public role permissions...');
    const publicUpdateResponse = await fetch(`${BASE_URL}/admin/roles/${publicRole.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: publicRole.name,
        description: publicRole.description,
        permissions: PUBLIC_PERMISSIONS
      })
    });

    if (!publicUpdateResponse.ok) {
      throw new Error(`Failed to update Public role: ${publicUpdateResponse.status}`);
    }

    console.log('✅ Public role updated successfully');

    // Update Authenticated role
    console.log('\n🔐 Updating Authenticated role permissions...');
    const authenticatedUpdateResponse = await fetch(`${BASE_URL}/admin/roles/${authenticatedRole.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: authenticatedRole.name,
        description: authenticatedRole.description,
        permissions: AUTHENTICATED_PERMISSIONS
      })
    });

    if (!authenticatedUpdateResponse.ok) {
      throw new Error(`Failed to update Authenticated role: ${authenticatedUpdateResponse.status}`);
    }

    console.log('✅ Authenticated role updated successfully');
    console.log('\n🎉 Permissions setup completed successfully!');

  } catch (error) {
    console.error('❌ Error setting up permissions:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. Strapi is running');
    console.log('2. You have a valid admin API token');
    console.log('3. The token has the necessary permissions');
  }
}

// Run the setup
setupPermissions().catch(console.error); 
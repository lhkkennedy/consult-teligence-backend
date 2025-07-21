// This script should be run in the Strapi console
// Run: npm run strapi console
// Then paste this code

async function deleteDuplicatePublicRole() {
  try {
    console.log('🔧 Looking for duplicate Public roles...');
    
    // Get all roles
    const roles = await strapi.db.query('plugin::users-permissions.role').findMany();
    
    console.log('Found roles:');
    roles.forEach((role, index) => {
      console.log(`   ${index + 1}. ID: ${role.id}, Name: "${role.name}", Description: "${role.description}"`);
    });
    
    // Find duplicate Public roles
    const publicRoles = roles.filter(r => r.name === 'Public');
    
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
    
    // Delete the duplicate role
    await strapi.db.query('plugin::users-permissions.role').delete({
      where: { id: duplicatePublicRole.id }
    });
    
    console.log('✅ Duplicate Public role deleted successfully!');
    
    // Verify deletion
    const remainingRoles = await strapi.db.query('plugin::users-permissions.role').findMany();
    console.log('\n📋 Remaining roles:');
    remainingRoles.forEach((role, index) => {
      console.log(`   ${index + 1}. ID: ${role.id}, Name: "${role.name}", Description: "${role.description}"`);
    });
    
  } catch (error) {
    console.error('❌ Error deleting duplicate role:', error.message);
  }
}

// Run the function
deleteDuplicatePublicRole(); 
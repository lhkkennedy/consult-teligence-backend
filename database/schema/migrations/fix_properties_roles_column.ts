export default async ({ strapi }: { strapi: any }) => {
  const knex = strapi.db.connection;
  
  try {
    // First, let's check what data exists in the roles column
    const properties = await knex('properties').select('id', 'roles');
    
    // Update invalid JSON data to null or empty object
    for (const property of properties) {
      if (property.roles) {
        try {
          // Try to parse the JSON to validate it
          JSON.parse(property.roles);
        } catch (error) {
          // If parsing fails, set to null
          await knex('properties')
            .where('id', property.id)
            .update({ roles: null });
        }
      }
    }
    
    // Now alter the column type to JSONB
    await knex.raw(`
      ALTER TABLE "public"."properties" 
      ALTER COLUMN "roles" TYPE jsonb 
      USING CASE 
        WHEN "roles" IS NULL THEN NULL
        ELSE "roles"::jsonb 
      END
    `);
    
    console.log('Successfully converted roles column to JSONB');
  } catch (error) {
    console.error('Error in migration:', error);
    throw error;
  }
}; 
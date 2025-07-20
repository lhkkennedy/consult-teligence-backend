const { createStrapi } = require('@strapi/strapi');

async function attachPropertiesDirect() {
  console.log('Attaching properties to posts using Document Service...');
  
  try {
    // Initialize Strapi
    const strapi = await createStrapi({
      appPath: process.cwd(),
      serveAdminPanel: false,
    });
    
    // Get all properties
    const properties = await strapi.db.query('api::property.property').findMany({
      populate: ['*']
    });
    
    if (!properties || properties.length === 0) {
      console.log('No properties found. Please create properties first.');
      await strapi.destroy();
      return;
    }
    
    console.log(`Found ${properties.length} properties`);
    
    // Get all posts
    const posts = await strapi.db.query('api::post.post').findMany({
      populate: ['*']
    });
    
    if (!posts || posts.length === 0) {
      console.log('No posts found. Please create posts first.');
      await strapi.destroy();
      return;
    }
    
    console.log(`Found ${posts.length} posts`);
    
    // Attach properties to every 3rd post
    let attachedCount = 0;
    for (let i = 0; i < posts.length; i++) {
      if (i % 3 === 0) {
        const post = posts[i];
        const propertyIndex = i % properties.length;
        const property = properties[propertyIndex];
        
        try {
          await strapi.db.query('api::post.post').update({
            where: { id: post.id },
            data: {
              property: property.id
            }
          });
          
          console.log(`✅ Attached property "${property.title}" to post "${post.body_md.substring(0, 50)}..."`);
          attachedCount++;
        } catch (error) {
          console.error(`❌ Failed to attach property to post ${post.id}:`, error.message);
        }
      }
    }
    
    console.log(`\n✅ Successfully attached properties to ${attachedCount} posts`);
    
    await strapi.destroy();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

attachPropertiesDirect().catch(console.error); 
const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

async function attachPropertiesToPosts() {
  console.log('Attaching properties to posts...');
  
  try {
    // Get all properties
    const propertiesResponse = await axios.get(`${API_BASE_URL}/properties`);
    const properties = propertiesResponse.data.data;
    
    if (!properties || properties.length === 0) {
      console.log('No properties found. Please create properties first.');
      return;
    }
    
    console.log(`Found ${properties.length} properties`);
    
    // Get all posts
    const postsResponse = await axios.get(`${API_BASE_URL}/posts`);
    const posts = postsResponse.data.data;
    
    if (!posts || posts.length === 0) {
      console.log('No posts found. Please create posts first.');
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
          await axios.put(`${API_BASE_URL}/posts/${post.id}`, {
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
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

attachPropertiesToPosts().catch(console.error); 
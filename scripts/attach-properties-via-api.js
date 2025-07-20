const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

async function attachPropertiesViaAPI() {
  console.log('Attaching properties to posts via API endpoint...');
  
  try {
    const response = await axios.post(`${API_BASE_URL}/posts/attach-properties`, {}, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data) {
      console.log('✅ Properties attached successfully!');
      console.log(`📊 Attached ${response.data.attachedCount} properties to posts`);
      console.log(`📊 Total posts: ${response.data.totalPosts}`);
      console.log(`📊 Total properties: ${response.data.totalProperties}`);
    }
  } catch (error) {
    console.error('❌ Failed to attach properties:');
    console.error(`Status: ${error.response?.status}`);
    console.error(`Message: ${error.message}`);
    if (error.response?.data) {
      console.error('Error details:', error.response.data);
    }
  }
}

attachPropertiesViaAPI().catch(console.error); 
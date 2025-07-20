const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:1337/api';

const sampleProperties = [
  {
    property_uid: 'PROP-001',
    title: 'Downtown Office Tower',
    address: '123 Main Street, New York, NY 10001',
    property_type: 'Office',
    status: 'Stabilised',
    headline_metric: '6.2% Cap Rate',
    media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    roles: 'Acquisition, Asset Management',
    deal_size: 75000000,
    irr: 12.3,
    completion_percentage: 100,
    tags: 'Prime Location, Class A, Downtown'
  },
  {
    property_uid: 'PROP-002',
    title: 'Riverside Development Complex',
    address: '456 River Road, Los Angeles, CA 90210',
    property_type: 'Residential',
    status: 'Under Construction',
    headline_metric: '75% Completion',
    media_urls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800'],
    roles: 'Development, Construction Management',
    deal_size: 150000000,
    irr: 15.7,
    completion_percentage: 75,
    tags: 'Mixed-Use, Waterfront, Luxury'
  },
  {
    property_uid: 'PROP-003',
    title: 'Harborview Retail Center',
    address: '789 Harbor Drive, Miami, FL 33101',
    property_type: 'Retail',
    status: 'Exited',
    headline_metric: '18.2% ROI',
    media_urls: ['https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'],
    roles: 'Acquisition, Disposition',
    deal_size: 120000000,
    irr: 18.2,
    completion_percentage: 100,
    tags: 'Retail, Waterfront, High Traffic'
  },
  {
    property_uid: 'PROP-004',
    title: 'Logistics Warehouse Complex',
    address: '321 Industrial Blvd, Dallas, TX 75201',
    property_type: 'Industrial',
    status: 'Stabilised',
    headline_metric: '5.8% Cap Rate',
    media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    roles: 'Acquisition, Leasing',
    deal_size: 45000000,
    irr: 11.5,
    completion_percentage: 100,
    tags: 'E-commerce, Distribution, Logistics'
  },
  {
    property_uid: 'PROP-005',
    title: 'Austin Multifamily Community',
    address: '555 Tech Lane, Austin, TX 78701',
    property_type: 'Residential',
    status: 'Stabilised',
    headline_metric: '8.5% Cap Rate',
    media_urls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800'],
    roles: 'Development, Property Management',
    deal_size: 35000000,
    irr: 8.5,
    completion_percentage: 100,
    tags: 'Multifamily, Tech Hub, Growth Market'
  },
  {
    property_uid: 'PROP-006',
    title: 'Seattle Luxury Condominiums',
    address: '888 Downtown Ave, Seattle, WA 98101',
    property_type: 'Residential',
    status: 'Under Construction',
    headline_metric: 'Foundation Complete',
    media_urls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800'],
    roles: 'Development, Sales',
    deal_size: 180000000,
    irr: 14.2,
    completion_percentage: 25,
    tags: 'Luxury, Downtown, Pre-sales'
  },
  {
    property_uid: 'PROP-007',
    title: 'Phoenix Medical Office Portfolio',
    address: '999 Healthcare Blvd, Phoenix, AZ 85001',
    property_type: 'Office',
    status: 'Exited',
    headline_metric: '9.8% ROI',
    media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    roles: 'Acquisition, Disposition',
    deal_size: 65000000,
    irr: 9.8,
    completion_percentage: 100,
    tags: 'Medical, Healthcare, Portfolio'
  },
  {
    property_uid: 'PROP-008',
    title: 'Miami Beach Waterfront Condos',
    address: '777 Ocean Drive, Miami Beach, FL 33139',
    property_type: 'Residential',
    status: 'Planning',
    headline_metric: '16.5% Projected IRR',
    media_urls: ['https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800'],
    roles: 'Development, Pre-Development',
    deal_size: 200000000,
    irr: 16.5,
    completion_percentage: 0,
    tags: 'Luxury, Waterfront, High-End'
  },
  {
    property_uid: 'PROP-009',
    title: 'Silicon Valley Data Center',
    address: '444 Tech Campus, San Jose, CA 95113',
    property_type: 'Industrial',
    status: 'Stabilised',
    headline_metric: '13.8% Cap Rate',
    media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    roles: 'Acquisition, Technology',
    deal_size: 95000000,
    irr: 13.8,
    completion_percentage: 100,
    tags: 'Data Center, Technology, Infrastructure'
  },
  {
    property_uid: 'PROP-010',
    title: 'Portland LEED Platinum Office',
    address: '222 Green Street, Portland, OR 97201',
    property_type: 'Office',
    status: 'Under Construction',
    headline_metric: 'LEED Platinum Certified',
    media_urls: ['https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800'],
    roles: 'Development, Sustainability',
    deal_size: 85000000,
    irr: 12.7,
    completion_percentage: 60,
    tags: 'Green Building, LEED, Sustainable'
  }
];

async function createSampleProperties() {
  console.log('Creating sample properties...');
  
  const createdProperties = [];
  
  for (const propertyData of sampleProperties) {
    try {
      console.log(`Creating property: ${propertyData.title}`);
      const response = await axios.post(`${API_BASE_URL}/properties`, {
        data: propertyData
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.data) {
        createdProperties.push(response.data);
        console.log(`✅ Created property: ${propertyData.title} (ID: ${response.data.data.id})`);
      }
    } catch (error) {
      console.error(`❌ Failed to create property ${propertyData.title}:`);
      console.error(`Status: ${error.response?.status}`);
      console.error(`Message: ${error.message}`);
      if (error.response?.data) {
        console.error(`Data:`, error.response.data);
      }
    }
  }
  
  console.log(`\n✅ Successfully created ${createdProperties.length} sample properties`);
  console.log('Sample properties creation completed!');
  
  return createdProperties;
}

// Run the script
createSampleProperties().catch(console.error); 
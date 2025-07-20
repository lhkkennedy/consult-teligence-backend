# Mock Data Generation System

A comprehensive, streamlined system for generating mock data for the ConsultTeligence Strapi application. This system consolidates and improves upon existing mock data scripts to provide a unified, easy-to-use solution.

## 🚀 Quick Start

### Prerequisites

1. **Strapi Application Running**: Make sure your Strapi application is running
2. **API Token**: You need a valid Strapi API token
3. **Environment Variables**: Set up your environment variables

```bash
# Set your Strapi API token
export STRAPI_TOKEN="your-api-token-here"

# Optional: Set custom Strapi URL (defaults to http://localhost:1337/api)
export STRAPI_URL="http://localhost:1337/api"
```

### Basic Usage

```bash
# Generate all mock data
node scripts/seed-database.js

# Quick generation for testing
node scripts/seed-database.js quick

# Full generation with comprehensive data
node scripts/seed-database.js full

# Generate only specific amounts
node scripts/seed-database.js --consultants=3 --properties=5 --posts=10

# Skip engagement data (reactions, comments, saves, views)
node scripts/seed-database.js --no-engagement

# Clear existing data before generation
node scripts/seed-database.js --clear
```

## 📁 File Structure

```
scripts/
├── seed-database.js              # Main CLI interface
├── generate-mock-data.js         # Basic mock data generator
├── generate-mock-data-enhanced.js # Enhanced generator with config
├── mock-data-config.js           # Configuration file
├── MOCK_DATA_README.md           # This file
└── data-import/
    ├── mockData/                 # Existing mock data files
    │   ├── mockProperties*.json
    │   ├── mockTimelinePosts*.json
    │   └── mockPortfolioStats*.json
    └── upload_experts.py         # Python expert upload script
```

## 🎯 Features

### Comprehensive Data Generation
- **Consultants/Experts**: 8 diverse real estate professionals with detailed profiles
- **Properties**: 8 different property types across various markets
- **Posts**: Multiple post types (NewListing, ProgressUpdate, Insight, Closing, Property)
- **Engagement**: Reactions, comments, saves, and views with realistic patterns

### Flexible Configuration
- **Configurable amounts**: Generate specific numbers of each content type
- **Engagement control**: Enable/disable different engagement types
- **Data validation**: Built-in validation for required fields
- **Error handling**: Comprehensive error tracking and reporting

### Multiple Generation Modes
- **Quick**: Minimal data for testing (2 consultants, 3 properties, 5 posts)
- **Standard**: Balanced data set for development
- **Full**: Comprehensive data set for demos

### Integration with Existing Data
- **Load existing files**: Can use existing mock data JSON files
- **Backward compatibility**: Works with existing scripts
- **Data relationships**: Proper linking between consultants, properties, and posts

## 📊 Generated Data

### Consultants
Each consultant includes:
- Personal information (name, email, phone)
- Professional details (title, company, location)
- Expertise areas and certifications
- Bio and LinkedIn profile
- Profile image (from Unsplash)

### Properties
Each property includes:
- Basic details (title, address, type)
- Financial metrics (deal size, IRR, cap rate)
- Status and completion percentage
- Description and images
- Roles and responsibilities

### Posts
Each post includes:
- Content type (NewListing, ProgressUpdate, Insight, Closing, Property)
- Rich markdown content with emojis and formatting
- Sentiment analysis (Bull, Bear, Neutral)
- Engagement metrics (views, shares, saves)
- Deal information (size, location, stage, ROI)
- Tags and trending status

### Engagement Data
- **Reactions**: Like, Love, Celebrate, Insightful, Helpful with weighted scoring
- **Comments**: Realistic comments from consultants
- **Saves**: Bookmarking with collections
- **Views**: View duration and completion tracking

## ⚙️ Configuration

### Environment Variables
```bash
STRAPI_TOKEN=your-api-token-here
STRAPI_URL=http://localhost:1337/api  # Optional
```

### Configuration File (`mock-data-config.js`)
The configuration file allows you to customize:
- API settings
- Generation amounts and probabilities
- Data sources and external integrations
- Content types and locations
- Relationship assignment strategies
- Output and logging preferences
- Validation rules
- Cleanup options

### Command Line Options
```bash
--consultants=N     # Number of consultants to create
--properties=N      # Number of properties to create
--posts=N           # Number of posts to create
--no-engagement     # Skip engagement data
--clear             # Clear existing data first
--config=FILE       # Use custom config file
```

## 🔧 Advanced Usage

### Custom Configuration
Create a custom configuration file:

```javascript
// custom-config.js
module.exports = {
  generation: {
    consultants: 5,
    properties: 10,
    posts: 20,
    reactions: {
      probability: 0.9,
      minPerPost: 5,
      maxPerPost: 12
    }
  },
  content: {
    locations: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL'],
    propertyTypes: ['Office', 'Industrial', 'Retail']
  }
};
```

Then use it:
```bash
node scripts/seed-database.js --config=custom-config.js
```

### Programmatic Usage
You can also use the generators programmatically:

```javascript
const { generateMockData } = require('./scripts/generate-mock-data-enhanced');

// Generate mock data
await generateMockData();
```

### Integration with Existing Scripts
The new system is designed to work alongside existing scripts:
- Can load existing mock data files
- Maintains compatibility with current data structure
- Can be used to supplement existing data

## 📈 Data Relationships

The system creates realistic relationships between data:

### Post Assignment
- **Random**: Posts randomly assigned to consultants
- **Round-robin**: Posts distributed evenly among consultants
- **Weighted**: Posts assigned based on consultant expertise

### Property Assignment
- **Matching**: Properties assigned to posts based on type
- **Random**: Random property assignment
- **None**: No property assignment

### Engagement Patterns
- Realistic reaction patterns based on post type and sentiment
- Comment frequency varies by post engagement
- Save patterns reflect consultant interests
- View patterns simulate real user behavior

## 🛠️ Troubleshooting

### Common Issues

**API Token Error**
```bash
❌ STRAPI_TOKEN environment variable is required
```
Solution: Set your API token:
```bash
export STRAPI_TOKEN="your-token-here"
```

**Connection Error**
```bash
❌ Error making POST request to /consultants
```
Solution: Ensure Strapi is running and accessible at the configured URL.

**Validation Error**
```bash
❌ Missing required field: firstName
```
Solution: Check your data structure matches the expected schema.

### Debug Mode
Enable detailed logging by modifying the config:
```javascript
output: {
  logLevel: 'debug',
  showProgress: true
}
```

### Error Recovery
The system tracks errors and continues processing. Check the final report for any failed items.

## 🔄 Migration from Existing Scripts

### From Node.js Scripts
The new system replaces these existing scripts:
- `create-sample-posts.js`
- `create-sample-properties.js`
- `create-extended-sample-posts.js`
- `attach-properties-to-posts.js`

### From Python Script
The Python expert upload script (`upload_experts.py`) can still be used for:
- Bulk expert uploads from Excel files
- Image handling and uploads
- Complex data transformations

### Recommended Migration Path
1. **Start with new system**: Use `seed-database.js` for basic data
2. **Supplement with existing**: Use Python script for additional experts
3. **Customize as needed**: Modify configuration for specific requirements

## 📝 Examples

### Quick Demo Setup
```bash
# Generate minimal data for quick demo
node scripts/seed-database.js quick
```

### Full Demo Setup
```bash
# Generate comprehensive data for full demo
node scripts/seed-database.js full
```

### Custom Development Setup
```bash
# Generate specific amounts for development
node scripts/seed-database.js --consultants=5 --properties=8 --posts=15
```

### Testing Setup
```bash
# Generate data without engagement for testing
node scripts/seed-database.js --no-engagement --consultants=2 --properties=3
```

## 🤝 Contributing

### Adding New Data Types
1. Add data to the `enhancedMockData` object
2. Create corresponding creation function
3. Update the main generation function
4. Add configuration options

### Customizing Content
1. Modify the mock data arrays in the generator files
2. Update the configuration file
3. Add new content types to the config

### Extending Functionality
1. Create new generator modules
2. Add new CLI commands
3. Extend the configuration system

## 📚 API Reference

### Main Functions
- `generateMockData()`: Main generation function
- `createConsultants()`: Create consultant records
- `createProperties()`: Create property records
- `createPosts()`: Create post records
- `createReactions()`: Create reaction records
- `createComments()`: Create comment records
- `createSaves()`: Create save records
- `createViews()`: Create view records

### Classes
- `ProgressTracker`: Track generation progress and errors
- `MockDataLoader`: Load existing mock data files

### Configuration
- `config.api`: API configuration
- `config.generation`: Generation settings
- `config.dataSources`: Data source configuration
- `config.content`: Content customization
- `config.relationships`: Relationship settings
- `config.output`: Output and logging
- `config.validation`: Validation rules
- `config.cleanup`: Cleanup options

## 🎉 Success!

You now have a comprehensive, streamlined mock data generation system that:
- ✅ Consolidates existing functionality
- ✅ Provides easy-to-use CLI interface
- ✅ Offers flexible configuration
- ✅ Creates realistic data relationships
- ✅ Includes comprehensive error handling
- ✅ Supports multiple generation modes
- ✅ Integrates with existing data

Happy data generation! 🚀
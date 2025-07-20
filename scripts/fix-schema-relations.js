const fs = require('fs');
const path = require('path');

function fixSchemaRelations() {
  const schemaDir = path.join(__dirname, '../src/api');
  const extensionsDir = path.join(__dirname, '../src/extensions');
  
  console.log('Fixing schema relations...');
  
  // Function to process a directory recursively
  function processDirectory(dir) {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Check if this is a content-types directory
        if (item === 'content-types') {
          processContentTypes(fullPath);
        } else {
          processDirectory(fullPath);
        }
      }
    });
  }
  
  // Function to process content-types directory
  function processContentTypes(contentTypesDir) {
    const items = fs.readdirSync(contentTypesDir);
    
    items.forEach(item => {
      const itemPath = path.join(contentTypesDir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        const schemaPath = path.join(itemPath, 'schema.json');
        if (fs.existsSync(schemaPath)) {
          fixSchemaFile(schemaPath);
        }
      }
    });
  }
  
  // Function to fix a single schema file
  function fixSchemaFile(schemaPath) {
    try {
      const content = fs.readFileSync(schemaPath, 'utf8');
      const schema = JSON.parse(content);
      
      let modified = false;
      
      if (schema.attributes) {
        Object.keys(schema.attributes).forEach(attrName => {
          const attr = schema.attributes[attrName];
          
          if (attr.type === 'relation' && attr.inversedBy) {
            // For manyToMany relations, change inversedBy to mappedBy
            // For manyToOne relations, keep inversedBy
            if (attr.relation === 'manyToMany') {
              attr.mappedBy = attr.inversedBy;
              delete attr.inversedBy;
              modified = true;
              console.log(`Fixed ${attrName} in ${schemaPath} (manyToMany)`);
            } else if (attr.relation === 'manyToOne') {
              // Keep inversedBy for manyToOne relations
              console.log(`Keeping inversedBy for ${attrName} in ${schemaPath} (manyToOne)`);
            }
          }
        });
      }
      
      if (modified) {
        fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
        console.log(`Updated schema file: ${schemaPath}`);
      }
    } catch (error) {
      console.error(`Error processing ${schemaPath}:`, error.message);
    }
  }
  
  // Process both API and extensions directories
  processDirectory(schemaDir);
  processDirectory(extensionsDir);
  
  console.log('Schema relations fix completed!');
}

// Run the fix if this script is executed directly
if (require.main === module) {
  fixSchemaRelations();
}

module.exports = { fixSchemaRelations }; 
const fs = require('fs');
const path = require('path');

// Function to recursively find all .controller.ts files
function findControllerFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findControllerFiles(fullPath, files);
    } else if (item.endsWith('.controller.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Function to fix swagger decorators in a file
function fixSwaggerDecorators(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Check if getSchemaPath is already imported
  const hasGetSchemaPath = content.includes('getSchemaPath');
  
  // Add getSchemaPath import if not present
  if (!hasGetSchemaPath && content.includes('@ApiResponse')) {
    const swaggerImportRegex = /(import\s*{[^}]*)(}\s*from\s*['"]@nestjs\/swagger['"];)/;
    const match = content.match(swaggerImportRegex);
    
    if (match) {
      const importList = match[1];
      if (!importList.includes('getSchemaPath')) {
        const newImportList = importList.trim().endsWith(',') 
          ? importList + '\n  getSchemaPath,'
          : importList + ',\n  getSchemaPath,';
        content = content.replace(swaggerImportRegex, newImportList + match[2]);
        modified = true;
      }
    }
  }
  
  // Fix @ApiResponse decorators with single entity types
  const singleTypeRegex = /@ApiResponse\(\{([^}]*),\s*type:\s*([A-Za-z][A-Za-z0-9_]*)\s*\}\)/g;
  content = content.replace(singleTypeRegex, (match, beforeType, entityType) => {
    modified = true;
    return `@ApiResponse({${beforeType}, schema: { $ref: getSchemaPath(${entityType}) } })`;
  });
  
  // Fix @ApiResponse decorators with array types
  const arrayTypeRegex = /@ApiResponse\(\{([^}]*),\s*type:\s*\[([A-Za-z][A-Za-z0-9_]*)\]\s*\}\)/g;
  content = content.replace(arrayTypeRegex, (match, beforeType, entityType) => {
    modified = true;
    return `@ApiResponse({${beforeType}, schema: { type: 'array', items: { $ref: getSchemaPath(${entityType}) } } })`;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed: ${filePath}`);
    return true;
  }
  
  return false;
}

// Main execution
const srcDir = path.join(__dirname, 'src');
const controllerFiles = findControllerFiles(srcDir);

console.log(`Found ${controllerFiles.length} controller files`);

let fixedCount = 0;
for (const file of controllerFiles) {
  if (fixSwaggerDecorators(file)) {
    fixedCount++;
  }
}

console.log(`Fixed ${fixedCount} files`);
console.log('Done!');
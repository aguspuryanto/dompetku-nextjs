const fs = require('fs');
const path = require('path');

const DB_DIR = path.join(process.cwd(), 'db');

try {
  // Check if directory exists
  if (!fs.existsSync(DB_DIR)) {
    console.log('Creating db directory...');
    fs.mkdirSync(DB_DIR, { recursive: true });
    console.log('db directory created successfully');
  } else {
    console.log('db directory already exists');
  }
  
  // Check write permissions
  const testFile = path.join(DB_DIR, 'test-write.tmp');
  fs.writeFileSync(testFile, 'test');
  fs.unlinkSync(testFile);
  
  console.log('Write permissions are working correctly');
  
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}

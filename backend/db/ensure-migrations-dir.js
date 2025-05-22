// Create db/migrations directory if it doesn't exist
const fs = require('fs');
if (!fs.existsSync('./backend/db/migrations')) {
  fs.mkdirSync('./backend/db/migrations', { recursive: true });
  console.log('Created migrations directory');
}

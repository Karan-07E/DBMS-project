// Database migration script for e-commerce app
require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');
const { sequelize } = require('../config/database');

const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations');

// Create a new migration file
const createMigration = async () => {
  try {
    // Create migrations directory if it doesn't exist
    try {
      await fs.access(MIGRATIONS_DIR);
    } catch (error) {
      await fs.mkdir(MIGRATIONS_DIR, { recursive: true });
      console.log('Created migrations directory');
    }
    
    // Generate migration file name with timestamp
    const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, '');
    const migrationName = process.argv[3] || 'migration';
    const fileName = `${timestamp}_${migrationName}.js`;
    const filePath = path.join(MIGRATIONS_DIR, fileName);
    
    // Migration template
    const template = `// Migration: ${migrationName}
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add your migration logic here
    // Example:
    // await queryInterface.addColumn('users', 'newColumn', {
    //   type: Sequelize.STRING,
    //   defaultValue: 'default value'
    // });
  },
  
  down: async (queryInterface, Sequelize) => {
    // Add rollback logic here
    // Example:
    // await queryInterface.removeColumn('users', 'newColumn');
  }
};
`;
    
    // Write migration file
    await fs.writeFile(filePath, template);
    console.log(`Migration file created: ${fileName}`);
  } catch (error) {
    console.error('Error creating migration file:', error);
  }
};

// Run migrations
const runMigrations = async () => {
  try {
    // Read migration files
    let files;
    try {
      files = await fs.readdir(MIGRATIONS_DIR);
    } catch (error) {
      console.error('Migrations directory not found');
      return;
    }
    
    if (files.length === 0) {
      console.log('No migration files found');
      return;
    }
    
    // Sort files by timestamp
    files.sort();
    
    console.log('Running migrations...');
    
    // Import Sequelize QueryInterface
    const queryInterface = sequelize.getQueryInterface();
    
    // Run each migration
    for (const file of files) {
      if (file.endsWith('.js')) {
        try {
          const migration = require(path.join(MIGRATIONS_DIR, file));
          console.log(`Running migration: ${file}`);
          await migration.up(queryInterface, sequelize.Sequelize);
          console.log(`Migration completed: ${file}`);
        } catch (error) {
          console.error(`Error running migration ${file}:`, error);
          break;
        }
      }
    }
    
    console.log('Migrations completed');
  } catch (error) {
    console.error('Error running migrations:', error);
  }
};

// Main
const main = async () => {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      await createMigration();
      break;
    case 'run':
      await runMigrations();
      break;
    default:
      console.log('Usage: npm run migrate:[create|run]');
      break;
  }
  
  // Close connection
  await sequelize.close();
  process.exit(0);
};

main();


import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';
import fs from 'fs';

// Set up a local database using lowdb
// This is for development/demonstration purposes
// In a production environment, you would use a more robust database

let db;
let isInitialized = false;
// Default data that will be used if db.json doesn't exist or can't be written to
const defaultData = {
  users: [
    {
      id: 'admin-1',
      username: 'admin',
      password: '$2a$10$VjqiGSrNL6.k9NVzP/hQ.O2G.owrQPVRyYQQUH2Oz9JE4TiwdvCFi', // admin123
      name: 'Admin User',
      email: 'admin@elementalsound.com',
      role: 'Facility Manager',
      created: new Date().toISOString()
    }
  ],
  rooms: [
    {
      id: 'room-1',
      name: 'Room 1 (Large)',
      status: 'Ready',
      description: 'Large rehearsal room with full PA system',
      lastCleaned: new Date().toISOString()
    },
    {
      id: 'room-2',
      name: 'Room 2 (Medium)',
      status: 'Ready',
      description: 'Medium rehearsal room with basic PA system',
      lastCleaned: new Date().toISOString()
    },
    {
      id: 'room-3',
      name: 'Room 3 (Small)',
      status: 'Ready',
      description: 'Small rehearsal room for practice',
      lastCleaned: new Date().toISOString()
    }
  ],
  equipment: [
    {
      id: 'ES-1-MIX-01',
      description: 'Mixer',
      manufacturer: 'Yamaha',
      model: 'MG16XU',
      status: 'Working',
      condition: 'Good',
      roomId: 'room-1',
      category: 'Mixers',
      serialNumber: 'YM2039485',
      purchaseDate: '2022-06-15',
      warrantyExpiration: '2025-06-15',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ES-1-CAB-01',
      description: 'Main Speaker Left',
      manufacturer: 'Yamaha',
      model: 'DXR15',
      status: 'Working',
      condition: 'Good',
      roomId: 'room-1',
      category: 'Speakers',
      serialNumber: 'YS4058293',
      purchaseDate: '2022-06-15',
      warrantyExpiration: '2025-06-15',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ES-2-MIX-01',
      description: 'Mixer',
      manufacturer: 'Behringer',
      model: 'X32 Compact',
      status: 'Working',
      condition: 'Good',
      roomId: 'room-2',
      category: 'Mixers',
      serialNumber: 'BH3049582',
      purchaseDate: '2022-05-10',
      warrantyExpiration: '2025-05-10',
      lastChecked: new Date().toISOString()
    },
    {
      id: 'ES-3-MIX-01',
      description: 'Mixer',
      manufacturer: 'Mackie',
      model: '1202VLZ4',
      status: 'Working',
      condition: 'Good',
      roomId: 'room-3',
      category: 'Mixers',
      serialNumber: 'MC2059483',
      purchaseDate: '2022-07-05',
      warrantyExpiration: '2025-07-05',
      lastChecked: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 'task-1',
      title: 'Room 1 Daily Cleaning',
      description: 'Perform daily cleaning routine for Room 1',
      assignedTo: 'admin-1',
      status: 'Pending',
      priority: 'Medium',
      dueDate: new Date(new Date().setHours(17, 0, 0, 0)).toISOString(),
      created: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Inventory Check - Room 2',
      description: 'Verify all equipment in Room 2 is present and functional',
      assignedTo: 'admin-1',
      status: 'Completed',
      priority: 'High',
      completedDate: new Date().toISOString(),
      dueDate: new Date(new Date().setHours(15, 0, 0, 0)).toISOString(),
      created: new Date(new Date().setHours(8, 0, 0, 0)).toISOString()
    }
  ],
  notifications: [],
  maintenanceLogs: [],
  forms: []
};

// Memory adapter for serverless environments (like Netlify Functions)
class MemoryAdapter {
  constructor(defaultData = {}) {
    this.data = defaultData;
  }

  async read() {
    return this.data;
  }

  async write(data) {
    this.data = data;
    return data;
  }
}

// Database initialization
export async function initializeDb() {
  // If already initialized, return the existing instance
  if (isInitialized && db) {
    return db;
  }

  try {
    const __dirname = process.cwd();
    const file = join(__dirname, 'src/data/db.json');
    let adapter;
    
    // Check if we can use file system
    try {
      // Try to access the file
      if (fs.existsSync(file)) {
        adapter = new JSONFile(file);
      } else {
        // In Netlify Functions environment or when file doesn't exist
        // Use in-memory database with default data
        console.log('Using in-memory database with default data');
        adapter = new MemoryAdapter(defaultData);
      }
    } catch (fsError) {
      // If any filesystem errors occur, fallback to memory adapter
      console.log('Filesystem error, using in-memory database:', fsError.message);
      adapter = new MemoryAdapter(defaultData);
    }
    
    db = new Low(adapter);

    // Read data from adapter
    await db.read();

    // If db.data is null, initialize with default data
    if (!db.data) {
      db.data = defaultData;
      
      try {
        await db.write();
      } catch (writeError) {
        console.log('Unable to write to database file, continuing with in-memory data:', writeError.message);
      }
    }

    isInitialized = true;
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    
    // As a last resort, create an in-memory database with default data
    if (!db) {
      console.log('Creating fallback in-memory database');
      db = new Low(new MemoryAdapter(defaultData));
      db.data = defaultData;
      isInitialized = true;
    }
    
    return db;
  }
}

// Get db instance (initialize if not already done)
export async function getDb() {
  if (!isInitialized || !db) {
    return await initializeDb();
  }
  return db;
}

// Refresh database from file (or memory in serverless context)
export async function refreshDb() {
  if (db) {
    try {
      await db.read();
    } catch (error) {
      console.error('Error refreshing database:', error);
    }
  } else {
    await initializeDb();
  }
  return db;
} 
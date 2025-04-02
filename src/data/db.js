import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import bcrypt from 'bcryptjs';

// Set up a local database using lowdb
// This is for development/demonstration purposes
// In a production environment, you would use a more robust database

let db;

// Database initialization
export async function initializeDb() {
  try {
    // Use a .json file for the database in the data directory
    const __dirname = process.cwd();
    const file = join(__dirname, 'src/data/db.json');
    const adapter = new JSONFile(file);
    db = new Low(adapter);

    // Read data from JSON file, this will set db.data content
    await db.read();

    // If db.data is null, means the database is empty
    if (!db.data) {
      // Default data structure
      db.data = {
        users: [],
        rooms: [],
        equipment: [],
        tasks: [],
        notifications: [],
        maintenanceLogs: [],
        forms: []
      };

      // Create default admin user
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      
      db.data.users.push({
        id: 'admin-1',
        username: 'admin',
        password: hashedPassword,
        name: 'Admin User',
        email: 'admin@elementalsound.com',
        role: 'Facility Manager',
        created: new Date().toISOString()
      });

      // Add basic room data
      db.data.rooms = [
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
      ];

      // Add example equipment items
      const equipment = [
        // Room 1 Equipment
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
        // Add more equipment for Room 1...
        
        // Room 2 Equipment
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
        
        // Room 3 Equipment
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
      ];
      
      db.data.equipment = equipment;

      // Add example tasks
      db.data.tasks = [
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
      ];

      // Save all the default data
      await db.write();
    }

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

// Get db instance (initialize if not already done)
export async function getDb() {
  if (!db) {
    return await initializeDb();
  }
  return db;
}

// Refresh database from file
export async function refreshDb() {
  if (db) {
    await db.read();
  } else {
    await initializeDb();
  }
  return db;
} 
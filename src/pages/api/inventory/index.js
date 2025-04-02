import { getDb } from '../../../data/db';

export default async function handler(req, res) {
  // Get all inventory items with optional filtering
  if (req.method === 'GET') {
    try {
      const db = await getDb();
      
      // Extract query parameters
      const { roomId, category, status, search } = req.query;
      
      // Filter equipment based on query parameters
      let equipment = [...db.data.equipment];
      
      if (roomId && roomId !== 'all') {
        equipment = equipment.filter(item => item.roomId === roomId);
      }
      
      if (category && category !== 'all') {
        equipment = equipment.filter(item => item.category === category);
      }
      
      if (status && status !== 'all') {
        equipment = equipment.filter(item => item.status === status);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        equipment = equipment.filter(item => 
          item.id.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower) ||
          item.manufacturer.toLowerCase().includes(searchLower) ||
          item.model.toLowerCase().includes(searchLower)
        );
      }
      
      // Get rooms for reference
      const rooms = db.data.rooms;
      
      // Get equipment stats
      const stats = {
        total: equipment.length,
        working: equipment.filter(item => item.status === 'Working').length,
        maintenance: equipment.filter(item => item.status === 'Maintenance').length,
        outOfService: equipment.filter(item => item.status === 'Out of Service').length
      };
      
      // Get categories for filtering
      const categories = [...new Set(db.data.equipment.map(item => item.category))];
      
      return res.status(200).json({ 
        equipment, 
        rooms, 
        stats,
        categories
      });
    } catch (error) {
      console.error('Inventory fetch error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  
  // Add new inventory item
  if (req.method === 'POST') {
    try {
      const equipment = req.body;
      
      if (!equipment.id || !equipment.description || !equipment.roomId) {
        return res.status(400).json({ 
          message: 'ID, description, and room are required' 
        });
      }
      
      const db = await getDb();
      
      // Check if ID already exists
      const existingItem = db.data.equipment.find(item => item.id === equipment.id);
      if (existingItem) {
        return res.status(400).json({ message: 'Equipment ID already exists' });
      }
      
      // Add timestamps
      equipment.lastChecked = new Date().toISOString();
      
      // Add to database
      db.data.equipment.push(equipment);
      await db.write();
      
      return res.status(201).json({
        message: 'Equipment added successfully',
        equipment
      });
    } catch (error) {
      console.error('Equipment add error:', error);
      return res.status(500).json({ message: 'Server error' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
} 
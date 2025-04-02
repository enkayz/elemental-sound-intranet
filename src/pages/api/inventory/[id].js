import { getDb } from '../../../data/db';

export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ message: 'Equipment ID is required' });
  }

  try {
    const db = await getDb();
    
    // GET - fetch single equipment item
    if (req.method === 'GET') {
      const equipment = db.data.equipment.find(item => item.id === id);
      
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      // Get room details
      const room = db.data.rooms.find(room => room.id === equipment.roomId);
      
      // Get maintenance logs for this equipment
      const maintenanceLogs = db.data.maintenanceLogs
        ? db.data.maintenanceLogs.filter(log => log.equipmentId === id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
        : [];
      
      return res.status(200).json({ 
        equipment,
        room,
        maintenanceLogs
      });
    }
    
    // PUT - update equipment
    if (req.method === 'PUT') {
      const updatedEquipment = req.body;
      
      if (!updatedEquipment) {
        return res.status(400).json({ message: 'Equipment data is required' });
      }
      
      const index = db.data.equipment.findIndex(item => item.id === id);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      // Update equipment
      db.data.equipment[index] = {
        ...db.data.equipment[index],
        ...updatedEquipment,
        lastChecked: new Date().toISOString()
      };
      
      // If status changed to maintenance or out of service, log the change
      if (
        updatedEquipment.status && 
        updatedEquipment.status !== 'Working' && 
        db.data.equipment[index].status !== updatedEquipment.status
      ) {
        // Initialize maintenanceLogs array if it doesn't exist
        if (!db.data.maintenanceLogs) {
          db.data.maintenanceLogs = [];
        }
        
        const log = {
          id: `log-${Date.now()}`,
          equipmentId: id,
          date: new Date().toISOString(),
          description: `Status changed to ${updatedEquipment.status}`,
          userId: updatedEquipment.userId || 'unknown',
          type: updatedEquipment.status === 'Maintenance' ? 'Maintenance' : 'Issue'
        };
        
        db.data.maintenanceLogs.push(log);
      }
      
      await db.write();
      
      return res.status(200).json({
        message: 'Equipment updated successfully',
        equipment: db.data.equipment[index]
      });
    }
    
    // DELETE - remove equipment
    if (req.method === 'DELETE') {
      const index = db.data.equipment.findIndex(item => item.id === id);
      
      if (index === -1) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      
      // Remove the equipment
      db.data.equipment.splice(index, 1);
      
      await db.write();
      
      return res.status(200).json({
        message: 'Equipment deleted successfully'
      });
    }
    
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    console.error(`Equipment ${req.method} error:`, error);
    return res.status(500).json({ message: 'Server error' });
  }
} 
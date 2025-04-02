import { getDb } from '../../data/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const db = await getDb();
    
    // Get tasks for this user
    const tasks = db.data.tasks
      .filter(task => task.assignedTo === userId)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    
    // Get recent tasks (limited to 5)
    const recentTasks = tasks.slice(0, 5);
    
    // Get room status
    const rooms = db.data.rooms;
    
    // Get recent notifications (limited to 5)
    const notifications = db.data.notifications
      .filter(notification => !notification.userIds || notification.userIds.includes(userId))
      .sort((a, b) => new Date(b.created) - new Date(a.created))
      .slice(0, 5);
    
    // Get equipment with issues
    const equipmentWithIssues = db.data.equipment
      .filter(equipment => equipment.status !== 'Working')
      .slice(0, 5);
    
    res.status(200).json({
      tasks: recentTasks,
      taskCount: tasks.length,
      rooms,
      notifications,
      equipmentWithIssues
    });
  } catch (error) {
    console.error('Dashboard data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 
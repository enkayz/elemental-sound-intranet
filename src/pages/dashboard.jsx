import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { format } from 'date-fns';
import { 
  ClipboardCheckIcon,
  ClockIcon,
  BellIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import Layout from '../components/Layout';

export default function Dashboard({ currentUser, isAuthenticated, logout }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentUser) return;

    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`/api/dashboard?userId=${currentUser.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setError('Failed to load dashboard data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]);

  const getRoomStatusColor = (status) => {
    switch (status) {
      case 'Ready':
        return 'bg-success';
      case 'Maintenance':
        return 'bg-warning';
      case 'Issue':
        return 'bg-danger';
      default:
        return 'bg-gray-400';
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Layout currentUser={currentUser} isAuthenticated={isAuthenticated} logout={logout}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  // Render error state
  if (error) {
    return (
      <Layout currentUser={currentUser} isAuthenticated={isAuthenticated} logout={logout}>
        <div className="bg-red-50 border-l-4 border-red-500 p-4 my-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout currentUser={currentUser} isAuthenticated={isAuthenticated} logout={logout}>
      <Head>
        <title>Dashboard | Elemental Sound Intranet</title>
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-primary">Welcome, {currentUser?.name || 'User'}</h1>
        <p className="text-gray-600 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} | {currentUser?.role || 'Role'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Today's Tasks */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary flex items-center">
              <ClipboardCheckIcon className="h-6 w-6 mr-2" />
              Today's Tasks
            </h2>
            <Link href="/tasks" className="text-secondary hover:text-secondary-dark text-sm font-medium flex items-center">
              View All Tasks <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {dashboardData?.tasks && dashboardData.tasks.length > 0 ? (
            <ul className="space-y-3">
              {dashboardData.tasks.map((task) => (
                <li key={task.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="checkbox"
                    checked={task.status === 'Completed'}
                    readOnly
                    className="mt-1 h-5 w-5 text-secondary border-gray-300 rounded"
                  />
                  <div className="ml-3 w-full">
                    <div className="flex justify-between">
                      <span className={`font-medium ${task.status === 'Completed' ? 'line-through text-gray-500' : ''}`}>
                        {task.title}
                      </span>
                      <span className="text-xs flex items-center text-gray-500">
                        <ClockIcon className="h-3 w-3 mr-1" />
                        {format(new Date(task.dueDate), 'h:mm a')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{task.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No tasks for today</p>
          )}
        </div>

        {/* Room Status */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary">Room Status</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {dashboardData?.rooms && dashboardData.rooms.map((room) => (
              <div key={room.id} className="flex flex-col items-center">
                <div className="text-center mb-2 font-medium">{room.name}</div>
                <Link href={`/inventory?roomId=${room.id}`}>
                  <div className={`w-24 h-24 rounded-lg flex items-center justify-center ${getRoomStatusColor(room.status)}`}>
                    <span className="text-white font-bold">{room.status}</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Recent Notifications */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary flex items-center">
              <BellIcon className="h-6 w-6 mr-2" />
              Recent Notifications
            </h2>
            <Link href="/notifications" className="text-secondary hover:text-secondary-dark text-sm font-medium flex items-center">
              View All <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {dashboardData?.notifications && dashboardData.notifications.length > 0 ? (
            <ul className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <li key={notification.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                  <div className="w-2 h-2 mt-2 rounded-full bg-secondary flex-shrink-0"></div>
                  <div className="ml-3">
                    <p className="text-sm">{notification.message}</p>
                    <span className="text-xs text-gray-500">
                      {format(new Date(notification.created), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No new notifications</p>
          )}
        </div>

        {/* Equipment Alerts */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-primary flex items-center">
              <ExclamationTriangleIcon className="h-6 w-6 mr-2" />
              Equipment Alerts
            </h2>
            <Link href="/inventory?status=issue" className="text-secondary hover:text-secondary-dark text-sm font-medium flex items-center">
              View All <ArrowRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>

          {dashboardData?.equipmentWithIssues && dashboardData.equipmentWithIssues.length > 0 ? (
            <ul className="space-y-3">
              {dashboardData.equipmentWithIssues.map((equipment) => (
                <li key={equipment.id} className="flex items-start p-2 hover:bg-gray-50 rounded-md">
                  <div className="w-5 h-5 mt-0.5 flex-shrink-0 text-warning">
                    <ExclamationTriangleIcon />
                  </div>
                  <div className="ml-3">
                    <Link href={`/inventory/${equipment.id}`} className="font-medium hover:text-primary">
                      {equipment.description} #{equipment.id}
                    </Link>
                    <p className="text-sm text-gray-600">
                      Status: <span className="font-medium">{equipment.status}</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      Last checked: {format(new Date(equipment.lastChecked), 'MMM d, yyyy')}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-4">No equipment issues</p>
          )}
        </div>
      </div>

      {/* Quick Access Tools */}
      <div className="card">
        <h2 className="text-xl font-semibold text-primary mb-4">Quick Access Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Link href="/forms/new" className="btn-primary text-center">Submit Form</Link>
          <Link href="/inventory/scan" className="btn-secondary text-center">Scan Equipment</Link>
          <Link href="/calendar" className="btn-accent text-center">View Schedule</Link>
          <Link href="/forms/issues/new" className="btn-primary text-center">Report Issue</Link>
          <Link href="/documents/recent" className="btn-secondary text-center">Recent Documents</Link>
        </div>
      </div>
    </Layout>
  );
} 
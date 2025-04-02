import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { format } from 'date-fns';
import { 
  ArrowUpIcon,
  ArrowDownIcon,
  PlusCircleIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import Layout from '../../components/Layout';

export default function Inventory({ currentUser, isAuthenticated, logout }) {
  const router = useRouter();
  const { roomId, category, status, search, page = '1' } = router.query;
  
  const [inventory, setInventory] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ total: 0, working: 0, maintenance: 0, outOfService: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(search || '');
  
  // Pagination
  const itemsPerPage = 10;
  const currentPage = parseInt(page) || 1;
  
  useEffect(() => {
    if (!currentUser) return;
    
    // Update the searchQuery state when the URL parameter changes
    if (search !== undefined) {
      setSearchQuery(search);
    }
    
    const fetchInventory = async () => {
      try {
        setLoading(true);
        
        let url = '/api/inventory?';
        if (roomId) url += `roomId=${roomId}&`;
        if (category) url += `category=${category}&`;
        if (status) url += `status=${status}&`;
        if (search) url += `search=${encodeURIComponent(search)}&`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch inventory data');
        }
        
        const data = await response.json();
        
        setInventory(data.equipment);
        setRooms(data.rooms);
        setCategories(data.categories);
        setStats(data.stats);
      } catch (error) {
        console.error('Inventory fetch error:', error);
        setError('Failed to load inventory data. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventory();
  }, [currentUser, roomId, category, status, search, page]);
  
  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Update URL with search query
    const query = { ...router.query };
    if (searchQuery) {
      query.search = searchQuery;
    } else {
      delete query.search;
    }
    query.page = '1'; // Reset to first page on new search
    
    router.push({
      pathname: router.pathname,
      query
    });
  };
  
  const handleFilterChange = (type, value) => {
    const query = { ...router.query };
    
    if (value === 'all') {
      delete query[type];
    } else {
      query[type] = value;
    }
    
    // Reset to page 1 when filters change
    query.page = '1';
    
    router.push({
      pathname: router.pathname,
      query
    });
  };
  
  const sortedInventory = [...inventory].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    
    // Handle string case-insensitive comparison
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedInventory = sortedInventory.slice(startIndex, startIndex + itemsPerPage);
  
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage.toString() }
    });
  };
  
  // Generate page numbers for pagination
  const pageNumbers = [];
  const maxPageButtons = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  if (endPage - startPage + 1 < maxPageButtons && startPage > 1) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pageNumbers.push(i);
  }
  
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
  
  return (
    <Layout currentUser={currentUser} isAuthenticated={isAuthenticated} logout={logout}>
      <Head>
        <title>Inventory Management | Elemental Sound Intranet</title>
      </Head>
      
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-primary">Inventory Management</h1>
        <Link href="/inventory/new" className="btn-primary flex items-center">
          <PlusCircleIcon className="h-5 w-5 mr-1" />
          Add Equipment
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-primary">{stats.total}</span>
          <span className="text-gray-600">Total Items</span>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-success">{stats.working}</span>
          <span className="text-gray-600">Working</span>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-warning">{stats.maintenance}</span>
          <span className="text-gray-600">Maintenance</span>
        </div>
        <div className="card p-4 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-danger">{stats.outOfService}</span>
          <span className="text-gray-600">Out of Service</span>
        </div>
      </div>
      
      {/* Search and Filter */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <form onSubmit={handleSearch} className="w-full md:w-1/2 mb-4 md:mb-0">
            <div className="relative">
              <input
                type="text"
                placeholder="Search inventory..."
                className="form-input pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-3 text-gray-500">
                <MagnifyingGlassIcon className="w-5 h-5" />
              </button>
            </div>
          </form>
          
          <button
            className="btn flex items-center"
            onClick={() => setShowFilters(!showFilters)}
          >
            <FunnelIcon className="w-5 h-5 mr-2" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
              <select
                className="form-input"
                value={roomId || 'all'}
                onChange={(e) => handleFilterChange('roomId', e.target.value)}
              >
                <option value="all">All Rooms</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                className="form-input"
                value={category || 'all'}
                onChange={(e) => handleFilterChange('category', e.target.value)}
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="form-input"
                value={status || 'all'}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Working">Working</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Out of Service">Out of Service</option>
              </select>
            </div>
          </div>
        )}
      </div>
      
      {/* Inventory Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {sortField === 'id' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('description')}
                >
                  <div className="flex items-center">
                    Description
                    {sortField === 'description' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('manufacturer')}
                >
                  <div className="flex items-center">
                    Manufacturer
                    {sortField === 'manufacturer' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('model')}
                >
                  <div className="flex items-center">
                    Model
                    {sortField === 'model' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('lastChecked')}
                >
                  <div className="flex items-center">
                    Last Checked
                    {sortField === 'lastChecked' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="w-4 h-4 ml-1" /> : 
                        <ArrowDownIcon className="w-4 h-4 ml-1" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedInventory.length > 0 ? (
                paginatedInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                      {item.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.manufacturer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Working' 
                            ? 'bg-green-100 text-green-800' 
                            : item.status === 'Maintenance' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(item.lastChecked), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/inventory/${item.id}`} className="text-primary hover:text-primary-dark">
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No equipment found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {paginatedInventory.length > 0 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(startIndex + itemsPerPage, sortedInventory.length)}
                </span>{' '}
                of <span className="font-medium">{sortedInventory.length}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded ${
                  currentPage === 1 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-primary hover:bg-light'
                }`}
              >
                <ChevronLeftIcon className="w-5 h-5" />
              </button>
              
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`px-3 py-1 rounded ${
                    number === currentPage 
                      ? 'bg-primary text-white' 
                      : 'text-primary hover:bg-light'
                  }`}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded ${
                  currentPage === totalPages 
                    ? 'text-gray-400 cursor-not-allowed' 
                    : 'text-primary hover:bg-light'
                }`}
              >
                <ChevronRightIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
} 
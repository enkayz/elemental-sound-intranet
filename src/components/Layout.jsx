import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { 
  HomeIcon, 
  DocumentTextIcon, 
  DocumentPlusIcon, 
  ServerIcon, 
  CalendarIcon, 
  AcademicCapIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  UserIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Layout = ({ children, currentUser, logout, isAuthenticated }) => {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [expandedItem, setExpandedItem] = useState(null);

  // If not authenticated, don't render the full layout
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-light">
        <Head>
          <title>Elemental Sound Intranet</title>
        </Head>
        <main>{children}</main>
      </div>
    );
  }

  const toggleExpand = (item) => {
    if (expandedItem === item) {
      setExpandedItem(null);
    } else {
      setExpandedItem(item);
    }
  };

  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const navItems = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <HomeIcon className="w-5 h-5" />
    },
    { 
      name: 'Documents', 
      path: '/documents', 
      icon: <DocumentTextIcon className="w-5 h-5" />,
      subitems: [
        { name: 'Procedures', path: '/documents/procedures' },
        { name: 'Guidelines', path: '/documents/guidelines' },
        { name: 'Manuals', path: '/documents/manuals' }
      ]
    },
    { 
      name: 'Forms', 
      path: '/forms', 
      icon: <DocumentPlusIcon className="w-5 h-5" />,
      subitems: [
        { name: 'Cleaning', path: '/forms/cleaning' },
        { name: 'Inventory', path: '/forms/inventory' },
        { name: 'Issues', path: '/forms/issues' }
      ]
    },
    { 
      name: 'Inventory', 
      path: '/inventory', 
      icon: <ServerIcon className="w-5 h-5" />,
      subitems: [
        { name: 'Room 1', path: '/inventory?roomId=room-1' },
        { name: 'Room 2', path: '/inventory?roomId=room-2' },
        { name: 'Room 3', path: '/inventory?roomId=room-3' },
        { name: 'All Rooms', path: '/inventory' }
      ]
    },
    { 
      name: 'Calendar', 
      path: '/calendar', 
      icon: <CalendarIcon className="w-5 h-5" /> 
    },
    { 
      name: 'Training', 
      path: '/training', 
      icon: <AcademicCapIcon className="w-5 h-5" />,
      subitems: [
        { name: 'Onboarding', path: '/training/onboarding' },
        { name: 'Tutorials', path: '/training/tutorials' },
        { name: 'References', path: '/training/references' }
      ]
    },
    { 
      name: 'Reports', 
      path: '/reports', 
      icon: <ChartBarIcon className="w-5 h-5" />,
      subitems: [
        { name: 'Inventory', path: '/reports/inventory' },
        { name: 'Equipment', path: '/reports/equipment' },
        { name: 'Maintenance', path: '/reports/maintenance' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-light flex flex-col">
      <Head>
        <title>Elemental Sound Intranet</title>
      </Head>
      
      {/* Top navigation */}
      <header className="bg-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              className="md:hidden mr-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
            <Link href="/dashboard" className="flex items-center">
              <span className="text-xl font-bold">ELEMENTAL SOUND</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm font-medium transition-colors hover:text-accent ${
                  isActive(item.path) ? 'text-accent' : 'text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
          
          <div className="flex items-center">
            <div className="relative mr-4">
              <input
                type="text"
                placeholder="Search..."
                className="bg-white bg-opacity-10 text-white text-sm rounded-md py-1 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <MagnifyingGlassIcon className="absolute right-2 top-1.5 w-4 h-4 text-white text-opacity-70" />
            </div>
            
            <div className="relative">
              <button
                className="flex items-center space-x-1 text-white focus:outline-none"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <UserIcon className="w-6 h-6" />
                <ChevronDownIcon className="w-4 h-4" />
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                  <div className="px-4 py-2 text-sm text-primary font-medium border-b">
                    {currentUser?.name || 'User'}
                    <div className="text-xs text-gray-500">{currentUser?.role || 'Role'}</div>
                  </div>
                  <Link href="/profile" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </Link>
                  <Link href="/settings" 
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Settings
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1">
        {/* Sidebar navigation */}
        <aside className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:block w-64 bg-white shadow-md transition-all`}>
          <nav className="px-4 py-6">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path} className="mb-1">
                  <div className="flex flex-col">
                    <div className="flex items-center">
                      <Link
                        href={item.path}
                        className={`flex items-center flex-1 px-4 py-2 text-sm font-medium rounded-md ${
                          isActive(item.path)
                            ? 'bg-primary text-white'
                            : 'text-dark hover:bg-light'
                        }`}
                      >
                        {item.icon}
                        <span className="ml-3">{item.name}</span>
                      </Link>
                      
                      {item.subitems && (
                        <button
                          onClick={() => toggleExpand(item.name)}
                          className={`p-1 ml-1 rounded-md ${
                            isActive(item.path)
                              ? 'text-white'
                              : 'text-dark hover:bg-light'
                          }`}
                        >
                          <ChevronDownIcon className={`w-4 h-4 transition-transform ${
                            expandedItem === item.name ? 'rotate-180' : ''
                          }`} />
                        </button>
                      )}
                    </div>
                    
                    {item.subitems && expandedItem === item.name && (
                      <ul className="ml-6 mt-1 space-y-1">
                        {item.subitems.map((subitem) => (
                          <li key={subitem.path}>
                            <Link
                              href={subitem.path}
                              className={`block px-4 py-1.5 text-sm rounded-md ${
                                isActive(subitem.path)
                                  ? 'bg-secondary text-white'
                                  : 'text-dark hover:bg-light'
                              }`}
                            >
                              {subitem.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 p-6 overflow-x-auto">
          {children}
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-primary text-white text-center p-4 text-xs">
        © {new Date().getFullYear()} Elemental Sound | <Link href="/help" className="underline">Help</Link> | <Link href="/contact" className="underline">Contact</Link>
      </footer>
    </div>
  );
};

export default Layout; 
import '../styles/globals.css';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on client-side
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
      setIsAuthenticated(true);
    } 
    setIsLoading(false);
  }, []);

  // Protected routes logic
  useEffect(() => {
    if (!isLoading) {
      const protectedRoutes = ['/dashboard', '/inventory', '/forms', '/documents', '/calendar', '/training'];
      const authRoutes = ['/login', '/register'];
      
      const pathIsProtected = protectedRoutes.some(route => 
        router.pathname === route || router.pathname.startsWith(route + '/')
      );
      
      if (pathIsProtected && !isAuthenticated) {
        router.push('/login');
      } else if (authRoutes.includes(router.pathname) && isAuthenticated) {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  const login = (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    setIsAuthenticated(false);
    router.push('/login');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Component 
      {...pageProps} 
      isAuthenticated={isAuthenticated}
      currentUser={currentUser}
      login={login}
      logout={logout}
    />
  );
}

export default MyApp; 
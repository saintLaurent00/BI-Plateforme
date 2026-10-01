import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Toaster } from 'sonner';
import { AuthenticatedRoutes, PublicRoutes } from './routes';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => setIsAuthenticated(false);

  return (
    <Router>
      {!isAuthenticated ? (
        <PublicRoutes onLogin={handleLogin} />
      ) : (
        <>
          <Toaster position="top-right" richColors />
          <Layout onLogout={handleLogout}>
            <AuthenticatedRoutes />
          </Layout>
        </>
      )}
    </Router>
  );
}

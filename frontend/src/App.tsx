import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Layout } from '@/ui/layout/Layout';
import { Toaster } from 'sonner';
import { AuthenticatedRoutes, PublicRoutes } from '@/platform/routing/routes';
import { supersetAuth } from '@/platform/api/superset-client';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(() => supersetAuth.isAuthenticated());

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => { supersetAuth.clear(); setIsAuthenticated(false); };

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

import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAdmin = () => {
      const token = localStorage.getItem('adminToken');
      const userStr = localStorage.getItem('adminUser');

      if (!token || !userStr) {
        setIsValidating(false);
        setIsAuthorized(false);
        return;
      }

      try {
        const user = JSON.parse(userStr);

        // Check if user has admin role
        if (user.role === 'admin' || user.role === 'super_admin') {
          setIsAuthorized(true);
        } else {
          setIsAuthorized(false);
        }
      } catch (error) {
        console.error('Error validating admin:', error);
        setIsAuthorized(false);
      }

      setIsValidating(false);
    };

    validateAdmin();
  }, []);

  if (isValidating) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
};

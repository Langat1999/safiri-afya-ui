import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  Building2,
  Stethoscope,
  Newspaper,
  Activity,
  Settings,
  FileText,
  LogOut,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Dashboard', path: '/admin/dashboard' },
  { icon: <Users className="w-5 h-5" />, label: 'Users', path: '/admin/users' },
  { icon: <Calendar className="w-5 h-5" />, label: 'Appointments', path: '/admin/appointments' },
  { icon: <Briefcase className="w-5 h-5" />, label: 'Bookings', path: '/admin/bookings' },
  { icon: <Building2 className="w-5 h-5" />, label: 'Clinics', path: '/admin/clinics' },
  { icon: <Stethoscope className="w-5 h-5" />, label: 'Doctors', path: '/admin/doctors' },
  { icon: <Newspaper className="w-5 h-5" />, label: 'Health News', path: '/admin/news' },
  { icon: <Activity className="w-5 h-5" />, label: 'Symptom Analytics', path: '/admin/analytics' },
  { icon: <FileText className="w-5 h-5" />, label: 'Activity Logs', path: '/admin/logs' },
  { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/admin/settings' },
];

export const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  const adminUser = JSON.parse(localStorage.getItem('adminUser') || '{}');

  return (
    <div className="h-full w-64 bg-card border-r flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg">Safiri Afya</h2>
            <p className="text-xs text-muted-foreground">Admin Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b bg-muted/30">
        <p className="text-sm font-medium">{adminUser.name || 'Admin'}</p>
        <p className="text-xs text-muted-foreground">{adminUser.email}</p>
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
            {adminUser.role === 'super_admin' ? 'Super Admin' : 'Admin'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {item.icon}
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Button>
      </div>
    </div>
  );
};

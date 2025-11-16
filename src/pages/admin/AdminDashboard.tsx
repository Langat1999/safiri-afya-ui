import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, Briefcase, DollarSign, Building2, Stethoscope, TrendingUp, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface DashboardStats {
  totalUsers: number;
  totalAdmins: number;
  totalAppointments: number;
  totalBookings: number;
  totalClinics: number;
  totalDoctors: number;
  totalRevenue: number;
  recentActivity: any[];
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch stats');
      }

      setStats(data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Total Admins',
      value: stats?.totalAdmins || 0,
      icon: <Users className="w-6 h-6" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Appointments',
      value: stats?.totalAppointments || 0,
      icon: <Calendar className="w-6 h-6" />,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Bookings',
      value: stats?.totalBookings || 0,
      icon: <Briefcase className="w-6 h-6" />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Clinics',
      value: stats?.totalClinics || 0,
      icon: <Building2 className="w-6 h-6" />,
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100',
    },
    {
      title: 'Doctors',
      value: stats?.totalDoctors || 0,
      icon: <Stethoscope className="w-6 h-6" />,
      color: 'text-pink-600',
      bgColor: 'bg-pink-100',
    },
    {
      title: 'Total Revenue',
      value: `KSH ${stats?.totalRevenue?.toLocaleString() || 0}`,
      icon: <DollarSign className="w-6 h-6" />,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
    {
      title: 'Activity Logs',
      value: stats?.recentActivity?.length || 0,
      icon: <Activity className="w-6 h-6" />,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of system statistics and activity</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor} ${stat.color}`}>
                {stat.icon}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest administrative actions</CardDescription>
        </CardHeader>
        <CardContent>
          {stats?.recentActivity && stats.recentActivity.length > 0 ? (
            <div className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{activity.action}</p>
                      <p className="text-sm text-muted-foreground">
                        User ID: {activity.userId}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Overall system status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Users</span>
              <span className="text-2xl font-bold text-blue-600">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Active Bookings</span>
              <span className="text-2xl font-bold text-green-600">{stats?.totalBookings || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Revenue</span>
              <span className="text-2xl font-bold text-emerald-600">
                KSH {stats?.totalRevenue?.toLocaleString() || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
            <CardDescription>Available healthcare resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Clinics</span>
              <span className="text-2xl font-bold text-cyan-600">{stats?.totalClinics || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Doctors</span>
              <span className="text-2xl font-bold text-pink-600">{stats?.totalDoctors || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Appointments</span>
              <span className="text-2xl font-bold text-orange-600">{stats?.totalAppointments || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

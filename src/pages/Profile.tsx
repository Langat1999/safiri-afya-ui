import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { profileAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Lock,
  Activity,
  Save,
  Loader2,
  CheckCircle,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  location: string;
  profilePicture: string;
  role: string;
  createdAt: string;
  lastLogin: string | null;
  stats: {
    totalAppointments: number;
    totalSymptomChecks: number;
    totalBookings: number;
    accountAge: number;
  };
}

const Profile = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    location: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const content = {
    en: {
      title: 'My Profile',
      subtitle: 'Manage your personal information and settings',
      personalInfo: 'Personal Information',
      activityStats: 'Activity Statistics',
      security: 'Security',
      settings: 'Settings',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      location: 'Location/County',
      language: 'Preferred Language',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm New Password',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      changePassword: 'Change Password',
      totalAppointments: 'Total Appointments',
      totalSymptomChecks: 'Symptom Checks',
      totalBookings: 'Hospital Bookings',
      accountAge: 'Account Age',
      days: 'days',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      preferNotToSay: 'Prefer not to say',
      english: 'English',
      swahili: 'Swahili',
    },
    sw: {
      title: 'Wasifu Wangu',
      subtitle: 'Dhibiti taarifa zako binafsi na mipangilio',
      personalInfo: 'Taarifa Binafsi',
      activityStats: 'Takwimu za Shughuli',
      security: 'Usalama',
      settings: 'Mipangilio',
      name: 'Jina Kamili',
      email: 'Barua Pepe',
      phone: 'Nambari ya Simu',
      dateOfBirth: 'Tarehe ya Kuzaliwa',
      gender: 'Jinsia',
      location: 'Mahali/Kaunti',
      language: 'Lugha Unayopendelea',
      currentPassword: 'Neno la Siri la Sasa',
      newPassword: 'Neno Jipya la Siri',
      confirmPassword: 'Thibitisha Neno Jipya la Siri',
      saveChanges: 'Hifadhi Mabadiliko',
      saving: 'Inahifadhi...',
      changePassword: 'Badilisha Neno la Siri',
      totalAppointments: 'Miadi Yote',
      totalSymptomChecks: 'Ukaguzi wa Dalili',
      totalBookings: 'Kuhifadhi Hospitali',
      accountAge: 'Umri wa Akaunti',
      days: 'siku',
      male: 'Mwanaume',
      female: 'Mwanamke',
      other: 'Nyingine',
      preferNotToSay: 'Sipendi kusema',
      english: 'Kiingereza',
      swahili: 'Kiswahili',
    },
  };

  const t = content[language];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const data = await profileAPI.get();
      setProfile(data);
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        dateOfBirth: data.dateOfBirth || '',
        gender: data.gender || '',
        location: data.location || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
      navigate('/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await profileAPI.update(formData);
      toast.success(language === 'en' ? 'Profile updated successfully!' : 'Wasifu umebadilishwa!');
      fetchProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(language === 'en' ? 'Passwords do not match' : 'Maneno ya siri hayalingani');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error(language === 'en' ? 'Password must be at least 6 characters' : 'Neno la siri lazima liwe na angalau herufi 6');
      return;
    }

    try {
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      toast.success(language === 'en' ? 'Password changed successfully!' : 'Neno la siri limebadilishwa!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    }
  };

  const handleLanguageChange = (newLanguage: 'en' | 'sw') => {
    setLanguage(newLanguage);
    toast.success(language === 'en' ? 'Language updated!' : 'Lugha imebadilishwa!');
  };

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = [profile.name, profile.phone, profile.dateOfBirth, profile.gender, profile.location];
    const filled = fields.filter(field => field && field.trim() !== '').length;
    return Math.round((filled / fields.length) * 100);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[80vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>

          {/* Profile Completion */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {language === 'en' ? 'Profile Completion' : 'Ukamilishaji wa Wasifu'}
              </span>
              <span className="text-sm font-medium">{getProfileCompletion()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary rounded-full h-2 transition-all"
                style={{ width: `${getProfileCompletion()}%` }}
              />
            </div>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">
              <User className="w-4 h-4 mr-2" />
              {t.personalInfo}
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="w-4 h-4 mr-2" />
              {t.activityStats}
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="w-4 h-4 mr-2" />
              {t.security}
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.personalInfo}</CardTitle>
                <CardDescription>
                  {language === 'en'
                    ? 'Update your personal details and profile information'
                    : 'Sasisha maelezo yako binafsi na taarifa za wasifu'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.name}</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        className="pl-10"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t.email}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        className="pl-10"
                        value={profile?.email}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">{t.phone}</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        className="pl-10"
                        placeholder="+254..."
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">{t.dateOfBirth}</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="dateOfBirth"
                        type="date"
                        className="pl-10"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gender">{t.gender}</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'en' ? 'Select gender' : 'Chagua jinsia'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">{t.male}</SelectItem>
                        <SelectItem value="female">{t.female}</SelectItem>
                        <SelectItem value="other">{t.other}</SelectItem>
                        <SelectItem value="prefer-not-to-say">{t.preferNotToSay}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">{t.location}</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="location"
                        className="pl-10"
                        placeholder="Nairobi"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveProfile} disabled={isSaving} className="w-full md:w-auto">
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t.saving}
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        {t.saveChanges}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>{t.settings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">{t.language}</Label>
                  <Select value={language} onValueChange={handleLanguageChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          {t.english}
                        </div>
                      </SelectItem>
                      <SelectItem value="sw">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 mr-2" />
                          {t.swahili}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Stats Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.totalAppointments}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.stats.totalAppointments || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.totalSymptomChecks}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.stats.totalSymptomChecks || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.totalBookings}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{profile?.stats.totalBookings || 0}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t.accountAge}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {profile?.stats.accountAge || 0} {t.days}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'en' ? 'Account Information' : 'Taarifa za Akaunti'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Account Created' : 'Akaunti Iliundwa'}
                  </span>
                  <span className="font-medium">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Last Login' : 'Kuingia Mwisho'}
                  </span>
                  <span className="font-medium">
                    {profile?.lastLogin ? new Date(profile.lastLogin).toLocaleString() : language === 'en' ? 'Never' : 'Kamwe'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {language === 'en' ? 'Account Status' : 'Hali ya Akaunti'}
                  </span>
                  <Badge variant="default">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === 'en' ? 'Active' : 'Inatumika'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.changePassword}</CardTitle>
                <CardDescription>
                  {language === 'en'
                    ? 'Update your password to keep your account secure'
                    : 'Sasisha neno lako la siri ili kulinda akaunti yako'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">{t.currentPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="currentPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t.newPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="newPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{t.confirmPassword}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      className="pl-10"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleChangePassword} className="w-full md:w-auto">
                    <Lock className="w-4 h-4 mr-2" />
                    {t.changePassword}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;

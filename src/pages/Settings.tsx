import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { settingsAPI } from '@/services/api';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  Shield,
  Palette,
  Trash2,
  Save,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserSettings {
  notifications: {
    email: boolean;
    sms: boolean;
    appointments: boolean;
    healthTips: boolean;
    newsletter: boolean;
  };
  privacy: {
    profileVisibility: string;
    shareHealthData: boolean;
  };
  preferences: {
    language: string;
    theme: string;
    timezone: string;
  };
}

const Settings = () => {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const content = {
    en: {
      title: 'Settings',
      subtitle: 'Manage your account preferences and settings',
      notifications: 'Notifications',
      privacy: 'Privacy',
      preferences: 'Preferences',
      account: 'Account',
      emailNotifications: 'Email Notifications',
      emailNotificationsDesc: 'Receive updates via email',
      smsNotifications: 'SMS Notifications',
      smsNotificationsDesc: 'Receive updates via SMS',
      appointmentReminders: 'Appointment Reminders',
      appointmentRemindersDesc: 'Get reminded about upcoming appointments',
      healthTips: 'Health Tips',
      healthTipsDesc: 'Receive weekly health tips and advice',
      newsletter: 'Newsletter',
      newsletterDesc: 'Subscribe to our monthly newsletter',
      profileVisibility: 'Profile Visibility',
      profileVisibilityDesc: 'Control who can see your profile',
      shareHealthData: 'Share Health Data',
      shareHealthDataDesc: 'Allow anonymous health data for research',
      languagePref: 'Language',
      themePref: 'Theme',
      timezonePref: 'Timezone',
      saveChanges: 'Save Changes',
      saving: 'Saving...',
      deleteAccount: 'Delete Account',
      deleteAccountDesc: 'Permanently delete your account and all data',
      deleteAccountWarning: 'This action cannot be undone. All your data will be permanently deleted.',
      enterPassword: 'Enter your password to confirm',
      confirmDelete: 'Confirm Delete',
      cancel: 'Cancel',
      public: 'Public',
      private: 'Private',
      friendsOnly: 'Friends Only',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      english: 'English',
      swahili: 'Swahili',
    },
    sw: {
      title: 'Mipangilio',
      subtitle: 'Dhibiti mapendeleo ya akaunti yako na mipangilio',
      notifications: 'Arifa',
      privacy: 'Faragha',
      preferences: 'Mapendeleo',
      account: 'Akaunti',
      emailNotifications: 'Arifa za Barua Pepe',
      emailNotificationsDesc: 'Pokea masasisho kupitia barua pepe',
      smsNotifications: 'Arifa za SMS',
      smsNotificationsDesc: 'Pokea masasisho kupitia SMS',
      appointmentReminders: 'Vikumbusho vya Miadi',
      appointmentRemindersDesc: 'Pata kukumbushwa kuhusu miadi inayokuja',
      healthTips: 'Vidokezo vya Afya',
      healthTipsDesc: 'Pokea vidokezo vya afya kila wiki',
      newsletter: 'Jarida',
      newsletterDesc: 'Jiandikishe kwa jarida letu la kila mwezi',
      profileVisibility: 'Mwonekano wa Wasifu',
      profileVisibilityDesc: 'Dhibiti nani anaweza kuona wasifu wako',
      shareHealthData: 'Shiriki Data ya Afya',
      shareHealthDataDesc: 'Ruhusu data ya afya isiyojulikana kwa utafiti',
      languagePref: 'Lugha',
      themePref: 'Mandhari',
      timezonePref: 'Eneo la Saa',
      saveChanges: 'Hifadhi Mabadiliko',
      saving: 'Inahifadhi...',
      deleteAccount: 'Futa Akaunti',
      deleteAccountDesc: 'Futa kabisa akaunti yako na data yote',
      deleteAccountWarning: 'Hatua hii haiwezi kutendeka. Data yako yote itafutwa kabisa.',
      enterPassword: 'Ingiza neno lako la siri kuthibitisha',
      confirmDelete: 'Thibitisha Ufutaji',
      cancel: 'Ghairi',
      public: 'Hadharani',
      private: 'Binafsi',
      friendsOnly: 'Marafiki Tu',
      light: 'Nuru',
      dark: 'Giza',
      system: 'Mfumo',
      english: 'Kiingereza',
      swahili: 'Kiswahili',
    },
  };

  const t = content[language];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }

      const data = await settingsAPI.get();

      // Sync theme with current theme context
      if (data.settings.preferences.theme) {
        setTheme(data.settings.preferences.theme as 'light' | 'dark' | 'system');
      }

      setSettings(data.settings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success(language === 'en' ? 'Settings saved successfully!' : 'Mipangilio imehifadhiwa!');

      // Update app language if changed
      if (settings.preferences.language !== language) {
        setLanguage(settings.preferences.language as 'en' | 'sw');
      }

      // Update app theme if changed
      if (settings.preferences.theme !== theme) {
        setTheme(settings.preferences.theme as 'light' | 'dark' | 'system');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      toast.error(language === 'en' ? 'Please enter your password' : 'Tafadhali ingiza neno lako la siri');
      return;
    }

    try {
      await settingsAPI.deleteAccount(deletePassword);
      toast.success(language === 'en' ? 'Account deleted successfully' : 'Akaunti imefutwa');
      logout();
      navigate('/');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    }
  };

  const updateSettings = (section: keyof UserSettings, key: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [key]: value,
      },
    });
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

  if (!settings) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground">{t.subtitle}</p>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4 mr-2" />
              {t.notifications}
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="w-4 h-4 mr-2" />
              {t.privacy}
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <Palette className="w-4 h-4 mr-2" />
              {t.preferences}
            </TabsTrigger>
            <TabsTrigger value="account">
              <Trash2 className="w-4 h-4 mr-2" />
              {t.account}
            </TabsTrigger>
          </TabsList>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.notifications}</CardTitle>
                <CardDescription>
                  {language === 'en'
                    ? 'Choose how you want to be notified about updates'
                    : 'Chagua jinsi unavyotaka kuarifwa kuhusu masasisho'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.emailNotifications}</Label>
                    <p className="text-sm text-muted-foreground">{t.emailNotificationsDesc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateSettings('notifications', 'email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.smsNotifications}</Label>
                    <p className="text-sm text-muted-foreground">{t.smsNotificationsDesc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => updateSettings('notifications', 'sms', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.appointmentReminders}</Label>
                    <p className="text-sm text-muted-foreground">{t.appointmentRemindersDesc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.appointments}
                    onCheckedChange={(checked) => updateSettings('notifications', 'appointments', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.healthTips}</Label>
                    <p className="text-sm text-muted-foreground">{t.healthTipsDesc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.healthTips}
                    onCheckedChange={(checked) => updateSettings('notifications', 'healthTips', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.newsletter}</Label>
                    <p className="text-sm text-muted-foreground">{t.newsletterDesc}</p>
                  </div>
                  <Switch
                    checked={settings.notifications.newsletter}
                    onCheckedChange={(checked) => updateSettings('notifications', 'newsletter', checked)}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
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
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.privacy}</CardTitle>
                <CardDescription>
                  {language === 'en'
                    ? 'Control your privacy and data sharing preferences'
                    : 'Dhibiti faragha yako na mapendeleo ya kushiriki data'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.profileVisibility}</Label>
                  <p className="text-sm text-muted-foreground mb-2">{t.profileVisibilityDesc}</p>
                  <Select
                    value={settings.privacy.profileVisibility}
                    onValueChange={(value) => updateSettings('privacy', 'profileVisibility', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">{t.public}</SelectItem>
                      <SelectItem value="private">{t.private}</SelectItem>
                      <SelectItem value="friends">{t.friendsOnly}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>{t.shareHealthData}</Label>
                    <p className="text-sm text-muted-foreground">{t.shareHealthDataDesc}</p>
                  </div>
                  <Switch
                    checked={settings.privacy.shareHealthData}
                    onCheckedChange={(checked) => updateSettings('privacy', 'shareHealthData', checked)}
                  />
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
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
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t.preferences}</CardTitle>
                <CardDescription>
                  {language === 'en'
                    ? 'Customize your app experience'
                    : 'Badilisha uzoefu wako wa programu'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>{t.languagePref}</Label>
                  <Select
                    value={settings.preferences.language}
                    onValueChange={(value) => updateSettings('preferences', 'language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t.english}</SelectItem>
                      <SelectItem value="sw">{t.swahili}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.themePref}</Label>
                  <Select
                    value={settings.preferences.theme}
                    onValueChange={(value) => updateSettings('preferences', 'theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">{t.light}</SelectItem>
                      <SelectItem value="dark">{t.dark}</SelectItem>
                      <SelectItem value="system">{t.system}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t.timezonePref}</Label>
                  <Select
                    value={settings.preferences.timezone}
                    onValueChange={(value) => updateSettings('preferences', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Africa/Nairobi">East Africa Time (EAT)</SelectItem>
                      <SelectItem value="Africa/Lagos">West Africa Time (WAT)</SelectItem>
                      <SelectItem value="Africa/Johannesburg">South Africa Time (SAST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveSettings} disabled={isSaving}>
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
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">{t.deleteAccount}</CardTitle>
                <CardDescription>{t.deleteAccountDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showDeleteConfirm ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">{t.deleteAccountWarning}</p>
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t.deleteAccount}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-destructive/10 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
                      <p className="text-sm text-destructive">{t.deleteAccountWarning}</p>
                    </div>
                    <div className="space-y-2">
                      <Label>{t.enterPassword}</Label>
                      <Input
                        type="password"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <div className="flex gap-3">
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                      >
                        {t.confirmDelete}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeletePassword('');
                        }}
                      >
                        {t.cancel}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

import { useState } from 'react';
import { User, Bell, Shield, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';
import { useStore } from '@/store/useStore';

export function SettingsView() {
  const { t } = useTranslation();
  const { currentUser, updateUser } = useStore();
  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    mentions: true,
    updates: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    updateUser(currentUser.id, {
      name: profileData.name,
      email: profileData.email,
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">{t('login_per_impostazioni')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('impostazioni')}</h1>
        <p className="text-gray-500 text-sm">{t('gestisci_preferenze')}</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            {t('profilo')}
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            {t('notifiche')}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            {t('sicurezza')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('informazioni_profilo')}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarFallback className="text-2xl">{getInitials(currentUser.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline">
                      {t('cambia_avatar')}
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      {t('avatar_formato')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('nome')}</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">{t('ruolo')}</Label>
                  <Input id="role" value={t(currentUser.role)} disabled />
                  <p className="text-sm text-gray-500 mt-1">
                    {t('ruolo_solo_admin')}
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    {t('salva_modifiche')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('preferenze_notifiche')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('notifiche_email')}</p>
                  <p className="text-sm text-gray-500">{t('ricevi_aggiornamenti_email')}</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('notifiche_push')}</p>
                  <p className="text-sm text-gray-500">{t('ricevi_notifiche_push')}</p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('menzioni')}</p>
                  <p className="text-sm text-gray-500">{t('notifica_menzioni')}</p>
                </div>
                <Switch
                  checked={notifications.mentions}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, mentions: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('aggiornamenti_progetto')}</p>
                  <p className="text-sm text-gray-500">{t('notifica_aggiornamenti')}</p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, updates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('sicurezza_account')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="current-password">{t('password_attuale')}</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>

              <div>
                <Label htmlFor="new-password">{t('nuova_password')}</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>

              <div>
                <Label htmlFor="confirm-password">{t('conferma_password')}</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>

              <div className="flex justify-end">
                <Button>{t('aggiorna_password')}</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">{t('zona_pericolosa')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{t('elimina_account')}</p>
                  <p className="text-sm text-gray-500">
                    {t('elimina_account_desc')}
                  </p>
                </div>
                <Button variant="destructive">{t('elimina_account')}</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

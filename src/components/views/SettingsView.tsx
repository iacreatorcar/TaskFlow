import { useState } from 'react';
import { User, Bell, Shield, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/store/useStore';

export function SettingsView() {
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
        <p className="text-gray-500">Effettua il login per accedere alle impostazioni</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Impostazioni</h1>
        <p className="text-gray-500 text-sm">Gestisci le preferenze del tuo account</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">
            <User className="w-4 h-4 mr-2" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifiche
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Sicurezza
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Profilo</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="flex items-center gap-6">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={currentUser.avatar} />
                    <AvatarFallback className="text-2xl">{currentUser.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <Button type="button" variant="outline">
                      Cambia Avatar
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                      JPG, PNG o GIF. Max 2MB.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
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
                  <Label htmlFor="role">Ruolo</Label>
                  <Input id="role" value={currentUser.role} disabled />
                  <p className="text-sm text-gray-500 mt-1">
                    Il ruolo può essere modificato solo dagli amministratori.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Salva Modifiche
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preferenze Notifiche</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Notifiche Email</p>
                  <p className="text-sm text-gray-500">Ricevi aggiornamenti via email</p>
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
                  <p className="font-medium">Notifiche Push</p>
                  <p className="text-sm text-gray-500">Ricevi notifiche push nel browser</p>
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
                  <p className="font-medium">Menzioni</p>
                  <p className="text-sm text-gray-500">Notifica quando vieni menzionato</p>
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
                  <p className="font-medium">Aggiornamenti Progetto</p>
                  <p className="text-sm text-gray-500">Notifica aggiornamenti sui progetti</p>
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
              <CardTitle>Sicurezza Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="current-password">Password Attuale</Label>
                <Input id="current-password" type="password" placeholder="••••••••" />
              </div>

              <div>
                <Label htmlFor="new-password">Nuova Password</Label>
                <Input id="new-password" type="password" placeholder="••••••••" />
              </div>

              <div>
                <Label htmlFor="confirm-password">Conferma Password</Label>
                <Input id="confirm-password" type="password" placeholder="••••••••" />
              </div>

              <div className="flex justify-end">
                <Button>Aggiorna Password</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Zona Pericolosa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Elimina Account</p>
                  <p className="text-sm text-gray-500">
                    Elimina permanentemente il tuo account e tutti i dati associati
                  </p>
                </div>
                <Button variant="destructive">Elimina Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from 'react';
import { Kanban, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/store/useStore';

export function LoginView() {
  const { users, setCurrentUser } = useStore();
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  const handleLogin = () => {
    if (selectedUser) {
      const user = users.find((u) => u.id === selectedUser);
      if (user) {
        setCurrentUser(user);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Kanban className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-white">TaskFlow</h1>
          <p className="text-blue-100 mt-2">Sistema di Ticketing Semplice e Potente</p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-center">Accedi al tuo account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nessun utente trovato</p>
                <Button onClick={() => {}}>Inizializza Dati Demo</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 text-center">
                  Seleziona un utente per continuare
                </p>

                <div className="space-y-2">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => setSelectedUser(user.id)}
                      className={`
                        w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all
                        ${selectedUser === user.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="text-xs text-gray-400 capitalize bg-gray-100 px-2 py-1 rounded">
                        {user.role}
                      </div>
                    </button>
                  ))}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  disabled={!selectedUser}
                  onClick={handleLogin}
                >
                  <User className="w-4 h-4 mr-2" />
                  Accedi
                </Button>

                <div className="text-center space-y-1">
                  <p className="text-xs text-gray-400">
                    TaskFlow v1.0 - Sistema di Ticketing
                  </p>
                  <p className="text-xs text-blue-600 font-medium">
                    Creato da D'Alise Carmine Digital System
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Kanban className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm font-medium">Board Kanban</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="w-6 h-6 text-white" />
            </div>
            <p className="text-white text-sm font-medium">Team Collaboration</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mx-auto mb-2">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-white text-sm font-medium">Statistiche</p>
          </div>
        </div>
      </div>
    </div>
  );
}

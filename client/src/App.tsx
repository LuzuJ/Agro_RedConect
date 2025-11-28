import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/contexts';
import { container, seedDatabase } from '@/config';
import { LoginView, RegisterView, SocialView, MarketplaceView, WikiView, GroupsView, DiagnosisView } from '@/features';
import { ProfileView } from '@/features/profile';
import { LoadingScreen, Icons } from '@/components/ui';
import { AppView } from '@/types';

// NavItem component moved outside to avoid recreating on each render
interface NavItemProps {
  view: AppView;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const NavItem: React.FC<NavItemProps> = ({ view, icon: Icon, label, activeView, onNavigate }) => {
  const isActive = activeView === view;
  return (
    <button
      onClick={() => onNavigate(view)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        isActive ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
      }`}
    >
      <div
        className={`p-1 rounded-xl transition-all ${
          isActive ? 'bg-emerald-50 -translate-y-1' : ''
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <span
        className={`text-[10px] mt-1 font-medium ${
          isActive ? 'opacity-100' : 'opacity-80'
        }`}
      >
        {label}
      </span>
    </button>
  );
};

// Bottom Navigation component
interface BottomNavigationProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeView, onNavigate }) => (
  <nav className="fixed bottom-0 w-full max-w-md md:max-w-2xl bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
    <div className="flex justify-around items-end h-16 pb-1">
      <NavItem view={AppView.SOCIAL} icon={Icons.Home} label="Inicio" activeView={activeView} onNavigate={onNavigate} />
      <NavItem view={AppView.GROUPS} icon={Icons.Users} label="Grupos" activeView={activeView} onNavigate={onNavigate} />

      {/* Central Action Button (Diagnosis) */}
      <div className="relative -top-5">
        <button
          onClick={() => onNavigate(AppView.DIAGNOSIS)}
          className={`flex items-center justify-center w-14 h-14 rounded-full shadow-emerald-200 shadow-xl transition-transform active:scale-95 ${
            activeView === AppView.DIAGNOSIS
              ? 'bg-emerald-700 ring-4 ring-emerald-100'
              : 'bg-emerald-600 hover:bg-emerald-700'
          }`}
        >
          <Icons.Camera className="w-7 h-7 text-white" />
        </button>
      </div>

      <NavItem view={AppView.MARKET} icon={Icons.ShoppingBag} label="Tienda" activeView={activeView} onNavigate={onNavigate} />
      <NavItem view={AppView.WIKI} icon={Icons.Book} label="Wiki" activeView={activeView} onNavigate={onNavigate} />
    </div>
  </nav>
);

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initializing AgriConnect...');
        await container.initialize();
        await seedDatabase();
        setIsInitialized(true);
        console.log('✅ AgriConnect initialized successfully!');
      } catch (error) {
        console.error('❌ Error initializing app:', error);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <LoadingScreen message="Inicializando aplicación..." />;
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeView, setActiveView] = useState<AppView>(AppView.SOCIAL);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  const handleNavigate = useCallback((view: AppView) => {
    setActiveView(view);
  }, []);

  if (isLoading) {
    return <LoadingScreen message="Verificando sesión..." />;
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginView onSwitchToRegister={() => setAuthView('register')} />
    ) : (
      <RegisterView onSwitchToLogin={() => setAuthView('login')} />
    );
  }

  const renderView = () => {
    switch (activeView) {
      case AppView.SOCIAL:
        return <SocialView />;
      case AppView.MARKET:
        return <MarketplaceView />;
      case AppView.DIAGNOSIS:
        return <DiagnosisView />;
      case AppView.WIKI:
        return <WikiView />;
      case AppView.GROUPS:
        return <GroupsView />;
      case AppView.PROFILE:
        return <ProfileView />;
      default:
        return <SocialView />;
    }
  };

  // Si está en la vista de perfil, mostrar layout especial
  if (activeView === AppView.PROFILE) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col mx-auto max-w-md md:max-w-2xl shadow-2xl relative">
        <main className="flex-1 overflow-y-auto">
          <ProfileView />
        </main>
        <BottomNavigation activeView={activeView} onNavigate={handleNavigate} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col mx-auto max-w-md md:max-w-2xl shadow-2xl relative">
      {/* Top Bar */}
      <header className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <div className="bg-emerald-600 rounded-lg p-1.5">
            <Icons.Globe className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-800">
            Agri<span className="text-emerald-600">Connect</span>
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleNavigate(AppView.PROFILE)}
            className="focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-full"
          >
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-8 h-8 rounded-full object-cover hover:ring-2 hover:ring-emerald-500 transition-all"
            />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 overflow-y-auto pb-20">{renderView()}</main>

      {/* Bottom Navigation */}
      <BottomNavigation activeView={activeView} onNavigate={handleNavigate} />
    </div>
  );
};

export default App;

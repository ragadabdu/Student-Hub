import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { MobileNav } from './components/layout/MobileNav/MobileNav';
import { useHealth } from './hooks/useHealth'; 
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

function App() {
  const { isConnected, isLoading, error, checkHealth } = useHealth(); // <-- This triggers the health check
  
  console.log('🔵 App: isConnected =', isConnected); 

  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />
          
          <div className="flex-1 flex flex-col min-w-0">
            {/* Connection Status Bar */}
            <div className="sticky top-0 z-40 px-4 py-1.5 bg-white border-b border-border">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-text-secondary">API Status:</span>
                  {isLoading ? (
                    <span className="text-yellow-500">Connecting...</span>
                  ) : isConnected ? (
                    <span className="text-green-500 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Connected
                    </span>
                  ) : (
                    <span className="text-red-500 flex items-center gap-1">
                      <span className="inline-block w-2 h-2 bg-red-500 rounded-full" />
                      Disconnected
                    </span>
                  )}
                </div>
                {error && (
                  <button
                    onClick={checkHealth}
                    className="text-primary hover:underline"
                  >
                    Retry
                  </button>
                )}
              </div>
            </div>

            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              <Routes>
                <Route path="/" element={<Explore />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/matches" element={<Matches />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </main>
          </div>

          <MobileNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
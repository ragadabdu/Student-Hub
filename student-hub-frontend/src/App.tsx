import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar/Sidebar';
import { MobileNav } from './components/layout/MobileNav/MobileNav';
import Explore from './pages/Explore';
import Profile from './pages/Profile';
import Projects from './pages/Projects';
import Matches from './pages/Matches';
import Messages from './pages/Messages';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex h-screen overflow-hidden bg-background">
          {/* Desktop Sidebar */}
          <Sidebar />
          
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-w-0">
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

          {/* Mobile Bottom Navigation */}
          <MobileNav />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
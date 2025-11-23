import { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import { useAuth } from '@/contexts/AuthContext';

export default function AppLayout() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'super-admin';

  // Only admins can switch to folder view
  const [viewMode, setViewMode] = useState<'list' | 'folder'>('list');

  const handleViewModeChange = (mode: 'list' | 'folder') => {
    if (isAdmin) {
      setViewMode(mode);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full">
      {/* Top Navbar */}
      <Navbar
        viewMode={viewMode}
        onViewModeChange={isAdmin ? handleViewModeChange : undefined}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Only visible in list view */}
        {viewMode === 'list' && <Sidebar />}

        {/* Main Content */}
        <MainContent viewMode={viewMode} />
      </div>
    </div>
  );
}

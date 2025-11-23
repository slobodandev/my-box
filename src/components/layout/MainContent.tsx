import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import PersonalFilesPage from '@/pages/PersonalFilesPage';
import LoanDetailsPage from '@/pages/LoanDetailsPage';

interface MainContentProps {
  viewMode: 'list' | 'folder';
}

export default function MainContent({ viewMode }: MainContentProps) {
  return (
    <main className="flex-1 overflow-y-auto">
      <Routes>
        <Route path="/" element={<HomePage viewMode={viewMode} />} />
        <Route path="/personal" element={<PersonalFilesPage />} />
        <Route path="/loan/:loanId" element={<LoanDetailsPage />} />
      </Routes>
    </main>
  );
}

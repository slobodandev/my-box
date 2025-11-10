import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import PersonalFilesPage from '@/pages/PersonalFilesPage'
import LoanDetailsPage from '@/pages/LoanDetailsPage'

export default function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/personal" element={<PersonalFilesPage />} />
        <Route path="/loan/:loanId" element={<LoanDetailsPage />} />
      </Routes>
    </main>
  )
}

import { useParams } from 'react-router-dom'

export default function LoanDetailsPage() {
  const { loanId } = useParams<{ loanId: string }>()

  return (
    <div className="p-8">
      <h1 className="text-gray-900 dark:text-white text-3xl font-bold">Loan #{loanId}</h1>
      <p className="text-gray-500 dark:text-gray-400 mt-2">View files for this loan.</p>
      {/* Content will be implemented later */}
    </div>
  )
}

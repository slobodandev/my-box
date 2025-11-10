import { useState } from 'react'
import FileList from '@/components/files/FileList'
import SearchBar from '@/components/common/SearchBar'
import FilterButton from '@/components/common/FilterButton'
import { MOCK_USER_NAME } from '@/constants/app'

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)
  const [showPersonalOnly, setShowPersonalOnly] = useState(false)

  return (
    <div className="p-8">
      {/* Page Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col">
          <h1 className="text-gray-900 dark:text-white text-3xl font-bold tracking-tight">
            Welcome back, {MOCK_USER_NAME}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-base font-normal leading-normal mt-1">
            Manage your loan and personal documents securely.
          </p>
        </div>
        <button className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] shadow-sm hover:bg-primary/90">
          <span className="material-symbols-outlined text-base">upload_file</span>
          <span className="truncate">Upload File</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="mt-8 flex flex-col gap-6">
        <div className="bg-white dark:bg-gray-800/50 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
          {/* Search Bar and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />

            <div className="flex items-center gap-2">
              <FilterButton
                selectedLoan={selectedLoan}
                onSelectLoan={setSelectedLoan}
              />

              <div className="flex items-center space-x-2 pl-2">
                <input
                  id="personal-files-checkbox"
                  type="checkbox"
                  checked={showPersonalOnly}
                  onChange={(e) => setShowPersonalOnly(e.target.checked)}
                  className="h-4 w-4 rounded text-primary focus:ring-primary border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-offset-gray-800"
                />
                <label
                  htmlFor="personal-files-checkbox"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Show personal files
                </label>
              </div>
            </div>
          </div>

          {/* File List */}
          <FileList
            searchTerm={searchTerm}
            selectedLoan={selectedLoan}
            showPersonalOnly={showPersonalOnly}
          />
        </div>
      </div>
    </div>
  )
}

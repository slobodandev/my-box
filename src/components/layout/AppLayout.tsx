import Sidebar from './Sidebar'
import MainContent from './MainContent'

export default function AppLayout() {
  return (
    <div className="flex h-screen w-full">
      <Sidebar />
      <MainContent />
    </div>
  )
}

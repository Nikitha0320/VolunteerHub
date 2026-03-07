import Navbar from '../components/Navbar'

function MainLayout({ children }) {
  return (
    <div className="min-h-screen w-full bg-[#F6F7FB]">
      <div className="min-h-screen w-full bg-[#F6F7FB] overflow-hidden">
        <Navbar />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

export default MainLayout

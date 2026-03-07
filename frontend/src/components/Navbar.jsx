import { CalendarDays, ChevronDown, LogOut, Menu, MessageSquare, PlusCircle, Settings, User, UserCheck, Users, X } from 'lucide-react'
import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem('user') || '{}')

  const getProfilePath = () => {
    if (user.role === 'VOLUNTEER') return '/profile'
    if (user.role === 'ORGANIZER') return '/organizer-dashboard'
    if (user.role === 'ADMIN') return '/admin-dashboard'
    return '/events'
  }

  const getSettingsPath = () => {
    if (user.role === 'VOLUNTEER' || user.role === 'ORGANIZER') return '/settings'
    return '/events'
  }

  const links = [
    { to: '/events', label: 'Events', icon: CalendarDays },
    { to: '/joined-events', label: 'Joined', icon: UserCheck, roles: ['VOLUNTEER'] },
    { to: '/create-event', label: 'Create', icon: PlusCircle, roles: ['ORGANIZER'] },
    { to: '/organizer-dashboard', label: 'Organizer', icon: User, roles: ['ORGANIZER'] },
    { to: '/event-messages', label: 'Messages', icon: MessageSquare }
  ]

  const filteredLinks = links.filter((link) => !link.roles || link.roles.includes(user.role))

  const logout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const goToProfile = () => {
    setProfileOpen(false)
    navigate(getProfilePath())
  }

  const goToSettings = () => {
    setProfileOpen(false)
    navigate(getSettingsPath())
  }

  const navLinkClass = ({ isActive }) =>
    `px-3.5 py-3 text-lg transition-all duration-200 flex items-center gap-2 border-b-2 ${isActive ? 'text-indigo-300 border-indigo-400 font-semibold' : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'}`

  const displayRole = user.role === 'VOLUNTEER' ? 'Volunteer' : user.role === 'ORGANIZER' ? 'Organizer' : user.role || 'User'
  const userInitial = (user.name || 'U').charAt(0).toUpperCase()

  return (
    <header className="bg-[#0F172A] border-b border-slate-700 sticky top-0 z-20">
      <div className="px-4 md:px-6 py-3.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1E293B] text-white flex items-center justify-center">
            <Users size={17} />
          </div>
          <h1 className="font-semibold text-[32px] md:text-[36px] text-white">VolunteerHub</h1>
        </div>

        <nav className="hidden lg:flex items-center gap-4">
          {filteredLinks.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={navLinkClass}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3 relative">
            <p className="hidden md:block text-xl text-slate-200 whitespace-nowrap font-medium">{user.name || 'User'} ({displayRole})</p>
          <button
            type="button"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-600 bg-[#1E293B] text-slate-100 hover:bg-[#334155] shadow-sm transition-all duration-200"
            onClick={() => setProfileOpen((prev) => !prev)}
            title="Open profile menu"
            aria-label="Open profile menu"
          >
              <span className="w-8 h-8 rounded-full bg-slate-600 text-sm text-white font-semibold flex items-center justify-center">{userInitial}</span>
              <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="lg:hidden p-2 rounded-xl border border-slate-700 bg-[#151925] hover:bg-[#1b2030] shadow-sm transition-all duration-200 text-slate-100"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-72 bg-[#0F172A] border border-slate-600 rounded-xl shadow-lg p-2 z-30">
              <button
                type="button"
                onClick={goToProfile}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-lg text-slate-100 hover:bg-[#1E293B] transition-all duration-200 text-left"
              >
                <User size={18} />
                Profile
              </button>
              <button
                type="button"
                onClick={goToSettings}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-lg text-slate-100 hover:bg-[#1E293B] transition-all duration-200 text-left"
              >
                <Settings size={18} />
                Settings
              </button>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-4 py-3 rounded-lg text-lg text-red-500 hover:bg-red-50 transition-all duration-200 text-left"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-700 px-4 py-3 bg-[#0F172A]">
          <p className="text-sm text-slate-300 mb-2 font-medium">{user.name || 'User'} ({displayRole})</p>
          <nav className="grid gap-1">
            {filteredLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={14} />
                <span>{label}</span>
              </NavLink>
            ))}
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-all duration-200 text-left"
            >
              <LogOut size={16} />
              Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  )
}

export default Navbar

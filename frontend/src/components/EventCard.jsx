import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'

const getCategoryTheme = (event) => {
  const text = `${event?.title || ''} ${event?.description || ''} ${event?.details || ''}`.toLowerCase()

  if (text.includes('medical') || text.includes('blood')) {
    return {
      label: 'Medical',
      chip: 'bg-[#EDE9FE] text-[#7C3AED]',
      border: 'border-l-[#A78BFA]',
      button: 'bg-indigo-500 hover:bg-indigo-600 text-white'
    }
  }

  if (text.includes('education') || text.includes('school') || text.includes('library')) {
    return {
      label: 'Education',
      chip: 'bg-[#DBEAFE] text-[#2563EB]',
      border: 'border-l-[#60A5FA]',
      button: 'bg-indigo-500 hover:bg-indigo-600 text-white'
    }
  }

  if (text.includes('food') || text.includes('community') || text.includes('school') || text.includes('home')) {
    return {
      label: 'Community',
      chip: 'bg-[#FEF9C3] text-[#A16207]',
      border: 'border-l-[#FACC15]',
      button: 'bg-indigo-500 hover:bg-indigo-600 text-white'
    }
  }

  return {
    label: 'Environmental',
    chip: 'bg-[#DCFCE7] text-[#15803D]',
    border: 'border-l-[#34D399]',
    button: 'bg-indigo-500 hover:bg-indigo-600 text-white'
  }
}

function EventCard({ event, showEdit = false, onEdit }) {
  const eventDescription = event.description || event.details || 'No details provided.'
  const category = getCategoryTheme(event)
  const formattedDate = event.eventDate
    ? new Date(`${event.eventDate}T00:00:00`).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      })
    : '-'
  const formattedTime = event.eventTime
    ? new Date(`1970-01-01T${event.eventTime}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit'
      })
    : '-'

  return (
    <article className={`bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 p-6 border-l-8 ${category.border} aspect-square flex flex-col`}>
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${category.chip}`}>
        <span>●</span>
        {category.label}
      </div>

      <h3 className="text-2xl leading-tight font-semibold text-slate-800 mb-2 line-clamp-2">{event.title}</h3>
      <p className="text-base text-slate-500 leading-relaxed line-clamp-3">{eventDescription}</p>

      <div className="mt-3 space-y-1.5 text-sm text-slate-600">
        <p className="flex items-center gap-2 text-slate-600">
          <MapPin size={16} className="text-slate-400" />
          {event.location || '-'}
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <CalendarDays size={16} className="text-slate-400" />
          {formattedDate}
        </p>
        <p className="flex items-center gap-2 text-slate-600">
          <Clock3 size={16} className="text-slate-400" />
          {formattedTime}
        </p>
      </div>

      <div className="mt-auto pt-3 flex items-center justify-between gap-2">
        <Link
          to={`/events/${event.id}`}
          className={`inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${category.button}`}
        >
          {showEdit ? 'View Details' : 'Join Event'}
        </Link>
        {showEdit && (
          <button
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-pink-400 text-white hover:bg-pink-500 transition-all duration-200"
            onClick={() => onEdit?.(event)}
          >
            Edit
          </button>
        )}
        {!showEdit && <span className="text-slate-400 tracking-[0.25em]">...</span>}
      </div>
    </article>
  )
}

export default EventCard

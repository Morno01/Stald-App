import { Link } from 'react-router-dom'
import { MapPin, User, Utensils, StickyNote, ArrowRight } from 'lucide-react'

export default function HorseCard({ horse }) {
  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h2 className="text-xl font-serif font-semibold text-stone-800">{horse.name}</h2>
          <div className="flex items-center gap-1 text-sm text-stone-500 mt-0.5">
            <User size={13} />
            <span>{horse.ownerName}</span>
          </div>
        </div>
        <span className="bg-brand-50 text-brand-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-brand-100">
          {horse.box}
        </span>
      </div>

      {horse.feed && (
        <div className="flex items-start gap-2 text-sm text-stone-600 mb-2">
          <Utensils size={14} className="mt-0.5 text-brand-400 shrink-0" />
          <span className="line-clamp-2">{horse.feed}</span>
        </div>
      )}

      {horse.notes && (
        <div className="flex items-start gap-2 text-sm text-stone-500 mb-3">
          <StickyNote size={14} className="mt-0.5 text-amber-400 shrink-0" />
          <span className="line-clamp-2 italic">{horse.notes}</span>
        </div>
      )}

      <div className="pt-3 border-t border-stone-100">
        <Link
          to={`/hest/${horse.id}`}
          className="btn-primary w-full justify-center text-sm"
        >
          Se hest
          <ArrowRight size={15} />
        </Link>
      </div>
    </div>
  )
}

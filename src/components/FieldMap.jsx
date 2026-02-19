import { useState } from 'react'
import { MapPin } from 'lucide-react'

// Predefined field layout — positions are percentages of SVG viewBox (0–100)
const FIELD_LAYOUT = [
  { id: 'fold1', name: 'Fold 1',   x: 5,  y: 5,  w: 55, h: 28, color: '#d1fae5' },
  { id: 'fold2', name: 'Fold 2',   x: 62, y: 5,  w: 33, h: 28, color: '#dcfce7' },
  { id: 'fold3', name: 'Fold 3',   x: 5,  y: 38, w: 26, h: 28, color: '#d9f99d' },
  { id: 'fold4', name: 'Fold 4',   x: 35, y: 38, w: 26, h: 28, color: '#bbf7d0' },
  { id: 'fold5', name: 'Fold 5',   x: 65, y: 38, w: 30, h: 28, color: '#a7f3d0' },
  { id: 'fold6', name: 'Fold 6',   x: 5,  y: 71, w: 90, h: 24, color: '#d1fae5' },
]

function HorseIcon({ x, y, name }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r="8" fill="#f43f6e" fillOpacity="0.15" stroke="#f43f6e" strokeWidth="1.5" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="8" fill="#be1249" fontWeight="bold">
        🐴
      </text>
      <text y="14" textAnchor="middle" fontSize="5.5" fill="#44403c" fontWeight="500">
        {name.length > 8 ? name.slice(0, 7) + '…' : name}
      </text>
    </g>
  )
}

export default function FieldMap({ horses = [], fields = [] }) {
  const [hovered, setHovered] = useState(null)

  // Build map: fieldId → array of horse names
  const fieldHorses = {}
  horses.forEach((h) => {
    if (h.fieldId) {
      if (!fieldHorses[h.fieldId]) fieldHorses[h.fieldId] = []
      fieldHorses[h.fieldId].push(h)
    }
  })

  return (
    <div className="w-full">
      <div className="relative rounded-2xl overflow-hidden border border-stone-200 bg-emerald-50">
        <svg
          viewBox="0 0 100 100"
          className="w-full"
          style={{ aspectRatio: '4/3' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background */}
          <rect width="100" height="100" fill="#f0fdf4" />

          {/* Path / road */}
          <rect x="32" y="33" width="3" height="37" fill="#e7e5e4" rx="1" />
          <rect x="62" y="33" width="3" height="37" fill="#e7e5e4" rx="1" />

          {/* Fields */}
          {FIELD_LAYOUT.map((field) => {
            const horseList = fieldHorses[field.id] || []
            const isHovered = hovered === field.id
            return (
              <g
                key={field.id}
                onMouseEnter={() => setHovered(field.id)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: horseList.length ? 'pointer' : 'default' }}
              >
                <rect
                  x={field.x} y={field.y} width={field.w} height={field.h}
                  rx="1.5" ry="1.5"
                  fill={field.color}
                  stroke={isHovered ? '#10b981' : '#a7f3d0'}
                  strokeWidth={isHovered ? 0.8 : 0.5}
                />
                {/* Field name */}
                <text
                  x={field.x + field.w / 2}
                  y={field.y + 6}
                  textAnchor="middle"
                  fontSize="4.5"
                  fill="#065f46"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                >
                  {field.name}
                </text>

                {/* Horse icons spread across field */}
                {horseList.slice(0, 5).map((horse, i) => {
                  const cols = Math.min(horseList.length, 3)
                  const col = i % cols
                  const row = Math.floor(i / cols)
                  const startX = field.x + 10 + (col * (field.w - 20)) / Math.max(cols - 1, 1)
                  const startY = field.y + 12 + row * 16
                  return (
                    <HorseIcon
                      key={horse.id}
                      x={field.w <= 26 ? field.x + field.w / 2 : startX}
                      y={startY}
                      name={horse.name}
                    />
                  )
                })}

                {/* Count badge if >5 */}
                {horseList.length > 5 && (
                  <text
                    x={field.x + field.w - 3}
                    y={field.y + field.h - 3}
                    textAnchor="end"
                    fontSize="4"
                    fill="#065f46"
                  >
                    +{horseList.length - 5} mere
                  </text>
                )}
              </g>
            )
          })}

          {/* Legend label */}
          <text x="50" y="99" textAnchor="middle" fontSize="3" fill="#a8a29e" fontFamily="Inter, sans-serif">
            Oversigtskort over folde
          </text>
        </svg>

        {/* Tooltip on hover */}
        {hovered && fieldHorses[hovered]?.length > 0 && (
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-md border border-stone-100 text-xs">
            <div className="font-semibold text-stone-700 mb-1">
              {FIELD_LAYOUT.find((f) => f.id === hovered)?.name}
            </div>
            {fieldHorses[hovered].map((h) => (
              <div key={h.id} className="text-stone-600 flex items-center gap-1">
                <span>🐴</span> {h.name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap gap-2">
        {FIELD_LAYOUT.map((field) => {
          const count = (fieldHorses[field.id] || []).length
          return (
            <div key={field.id} className="flex items-center gap-1.5 text-xs text-stone-600">
              <span
                className="inline-block w-3 h-3 rounded"
                style={{ backgroundColor: field.color, border: '1px solid #a7f3d0' }}
              />
              <span>{field.name}</span>
              {count > 0 && (
                <span className="text-brand-500 font-medium">({count})</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { FIELD_LAYOUT }

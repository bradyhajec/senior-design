'use client';
import Link from 'next/link';
import { Plant } from '@/lib/store';

interface PlantCardProps {
  plant: Plant;
}

export default function PlantCard({ plant }: PlantCardProps) {
  const latestAssessment = plant.assessments[0] ?? null;
  const enabledReminders = plant.reminders.filter(r => r.enabled);

  return (
    <Link href={`/plants/${plant.plantId}`}>
      <div className="group bg-cream-100 border border-forest-200/30 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-forest-700/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        {/* Image */}
        <div className="relative h-48 bg-forest-100 overflow-hidden">
          {plant.photoBase64 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={plant.photoBase64}
              alt={plant.nickname}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg viewBox="0 0 80 100" className="w-16 h-20 opacity-20" fill="#1a3a2a">
                <path d="M40 5 C25 20 10 35 40 75 C70 35 55 20 40 5z" />
                <path d="M40 15 C55 30 65 45 40 75" stroke="#1a3a2a" strokeWidth="1.5" fill="none" />
                <rect x="36" y="75" width="8" height="20" rx="4" />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3
            className="text-xl font-medium text-forest-700 leading-tight"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 600 }}
          >
            {plant.nickname}
          </h3>
          <p className="text-sm text-forest-500 mt-0.5 italic">{plant.species || 'Unidentified'}</p>

          {/* Reminder pills */}
          {enabledReminders.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {enabledReminders.map((r) => (
                <span
                  key={r.reminderId}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-cream-100"
                  style={{ backgroundColor: '#c4714a' }}
                >
                  {r.reminderType === 'Watering' ? '💧'
                    : r.reminderType === 'Fertilizing' ? '🌱'
                    : r.reminderType === 'Pruning' ? '✂️'
                    : '🌿'}
                  {r.reminderType}
                </span>
              ))}
            </div>
          )}

          {/* No assessment yet */}
          {!latestAssessment && (
            <div className="mt-3 text-xs text-forest-400 italic">No assessment yet — tap to analyze</div>
          )}
        </div>
      </div>
    </Link>
  );
}
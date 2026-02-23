'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import PlantCard from '@/components/PlantCard';
import { Plant, getPlants, deletePlant } from '@/lib/store';

export default function HomePage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPlants(getPlants());
    setMounted(true);
  }, []);

  const handleDelete = (e: React.MouseEvent, plantId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Remove this plant from your collection?')) {
      deletePlant(plantId);
      setPlants(getPlants());
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-12 px-4 sm:px-6">
        {/* Decorative background leaves */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5 pointer-events-none">
          <svg viewBox="0 0 200 200" fill="#1a3a2a">
            <path d="M100 10 C60 40 20 80 100 170 C180 80 140 40 100 10z" />
            <path d="M100 30 C130 60 140 90 100 160" stroke="#1a3a2a" strokeWidth="2" fill="none" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-8 w-40 h-40 opacity-5 pointer-events-none rotate-45">
          <svg viewBox="0 0 200 200" fill="#1a3a2a">
            <path d="M100 10 C60 40 20 80 100 170 C180 80 140 40 100 10z" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl">
            <p
              className="text-terracotta-500 text-sm font-medium tracking-widest uppercase mb-4 opacity-0 animate-fade-up anim-delay-100"
              style={{ animationFillMode: 'forwards' }}
            >
              Your Collection
            </p>
            <h1
              className="text-5xl sm:text-6xl font-light text-forest-700 leading-none mb-4 opacity-0 animate-fade-up anim-delay-200"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300, animationFillMode: 'forwards' }}
            >
              My Plants
            </h1>
            <p
              className="text-forest-500 text-lg leading-relaxed opacity-0 animate-fade-up anim-delay-300"
              style={{ animationFillMode: 'forwards' }}
            >
              Track, identify, and care for every plant in your collection with AI-powered insights.
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">

        {plants.length === 0 ? (
          // Empty state
          <div className="text-center py-24 opacity-0 animate-fade-up anim-delay-400" style={{ animationFillMode: 'forwards' }}>
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-forest-100 mb-6">
              <svg viewBox="0 0 60 75" className="w-10 h-12" fill="none">
                <path d="M30 5 C20 18 8 30 30 60 C52 30 40 18 30 5z" fill="#3d6b3f" opacity="0.3" />
                <path d="M30 15 C40 28 44 40 30 58" stroke="#3d6b3f" strokeWidth="1.5" strokeLinecap="round" />
                <rect x="27" y="60" width="6" height="12" rx="3" fill="#3d6b3f" opacity="0.3" />
              </svg>
            </div>
            <h2
              className="text-3xl font-light text-forest-700 mb-3"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              No plants yet
            </h2>
            <p className="text-forest-400 mb-8 max-w-sm mx-auto">
              Analyze your first plant to identify it, assess its health, and get personalized care recommendations.
            </p>
            <Link
              href="/analyze"
              className="inline-flex items-center gap-2 px-6 py-3 bg-forest-700 hover:bg-forest-600 text-cream-100 rounded-full font-medium transition-colors duration-200"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" />
              </svg>
              Analyze Your First Plant
            </Link>
          </div>
        ) : (
          <>
            {/* Stats bar */}
            <div
              className="grid grid-cols-3 gap-4 mb-10 opacity-0 animate-fade-up anim-delay-300"
              style={{ animationFillMode: 'forwards' }}
            >
              {[
                { label: 'Total Plants', value: plants.length },
                {
                  label: 'Assessments',
                  value: plants.reduce((acc, p) => acc + p.assessments.length, 0),
                },
                {
                  label: 'Avg. Health',
                  value: plants.reduce((acc, p) => {
                    const s = p.assessments[0]?.healthScore ?? 0;
                    return acc + s;
                  }, 0) / (plants.filter(p => p.assessments.length > 0).length || 1),
                  suffix: '/100',
                  isFloat: true,
                },
              ].map((stat) => (
                <div key={stat.label} className="bg-cream-100 border border-forest-200/30 rounded-2xl p-4 sm:p-6 text-center">
                  <div
                    className="text-3xl sm:text-4xl font-light text-forest-700"
                    style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                  >
                    {stat.isFloat ? Math.round(stat.value as number) : stat.value}
                    {stat.suffix && <span className="text-xl text-forest-400">{stat.suffix}</span>}
                  </div>
                  <div className="text-xs sm:text-sm text-forest-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Plants grid */}
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-0 animate-fade-up anim-delay-400"
              style={{ animationFillMode: 'forwards' }}
            >
              {plants.map((plant) => (
                <div key={plant.plantId} className="relative group">
                  <PlantCard plant={plant} />
                  {/* Delete button */}
                  <button
                    onClick={(e) => handleDelete(e, plant.plantId)}
                    className="absolute top-3 left-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white hover:bg-red-600 z-10"
                    title="Remove plant"
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Add new card */}
              <Link
                href="/analyze"
                className="border-2 border-dashed border-forest-300/50 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center hover:border-forest-400 hover:bg-forest-50/50 transition-all duration-200 min-h-[280px] group"
              >
                <div className="w-12 h-12 rounded-full bg-forest-100 group-hover:bg-forest-200 flex items-center justify-center transition-colors duration-200">
                  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-forest-600" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-forest-600">Add Plant</p>
                  <p className="text-sm text-forest-400 mt-0.5">Analyze a new plant</p>
                </div>
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

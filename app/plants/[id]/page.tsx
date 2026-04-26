'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { Plant, getPlantById, upsertPlant, Reminder } from '@/lib/store';
import { format } from 'date-fns';

export default function PlantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [plant, setPlant] = useState<Plant | null>(null);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<string, boolean>>({});
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');

  useEffect(() => {
    const p = getPlantById(id);
    if (p) {
      setPlant(p);
      setNicknameInput(p.nickname);
    }
    setMounted(true);
  }, [id]);

  if (!mounted) return null;

  if (!plant) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-24 text-center">
          <h2 className="text-2xl font-light text-forest-700" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>Plant not found</h2>
          <Link href="/" className="mt-4 inline-block text-forest-500 underline">Back to collection</Link>
        </div>
      </div>
    );
  }

  const latestAssessment = plant.assessments[0] ?? null;

  const toggleReminder = (reminderId: string) => {
    const updated = {
      ...plant,
      reminders: plant.reminders.map(r =>
        r.reminderId === reminderId ? { ...r, enabled: !r.enabled } : r
      ),
    };
    upsertPlant(updated);
    setPlant(updated);
  };

  const submitFeedback = (assessmentId: string, helpful: boolean) => {
    const updated = {
      ...plant,
      assessments: plant.assessments.map(a =>
        a.assessmentId === assessmentId
          ? { ...a, feedback: { helpful, correct: helpful, comment: '', submittedAt: new Date().toISOString() } }
          : a
      ),
    };
    upsertPlant(updated);
    setPlant(updated);
    setFeedbackSubmitted(prev => ({ ...prev, [assessmentId]: true }));
  };

  const saveNickname = () => {
    if (nicknameInput.trim()) {
      const updated = { ...plant, nickname: nicknameInput.trim() };
      upsertPlant(updated);
      setPlant(updated);
    }
    setEditingNickname(false);
  };

  const categoryIcons: Record<string, string> = {
    watering: '💧', light: '☀️', soil: '🪴', fertilizing: '🌱', pest: '🐛', general: '✦',
  };

  const reminderIcons: Record<string, string> = {
    Watering: '💧', Fertilizing: '🌱', Pruning: '✂️',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 pb-20">
        {/* Back */}
        <div className="py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm text-forest-500 hover:text-forest-700 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            My Plants
          </button>
        </div>

        {/* Hero */}
        <div className="bg-cream-100 border border-forest-200/30 rounded-2xl overflow-hidden mb-6 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
          {plant.photoBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={plant.photoBase64} alt={plant.nickname} className="w-full h-56 object-cover" />
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                {editingNickname ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') saveNickname(); if (e.key === 'Escape') setEditingNickname(false); }}
                      className="text-3xl font-medium bg-transparent border-b-2 border-forest-400 text-forest-700 focus:outline-none"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    />
                    <button onClick={saveNickname} className="text-forest-500 hover:text-forest-700">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setEditingNickname(true)} className="group flex items-center gap-2 text-left">
                    <h1 className="text-4xl font-medium text-forest-700" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                      {plant.nickname}
                    </h1>
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-forest-400 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                )}
                <p className="text-forest-500 italic mt-0.5">{plant.species}</p>
                <p className="text-xs text-forest-400 mt-1">Added {format(new Date(plant.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            {plant.environmentalDetails && (
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: plant.environmentalDetails.placement === 'indoor' ? '🏠 Indoor' : '🌿 Outdoor' },
                  { label: `💡 ${plant.environmentalDetails.lightLevel.replace('-', ' ')}` },
                  { label: `💧 ${plant.environmentalDetails.humidity} humidity` },
                ].map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 bg-forest-100 rounded-full text-xs text-forest-600 capitalize">
                    {tag.label}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Reminders */}
        {plant.reminders.length > 0 && (
          <div className="mb-6 animate-fade-up opacity-0 anim-delay-100" style={{ animationFillMode: 'forwards' }}>
            <h3
              className="text-lg font-medium text-forest-700 mb-3"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Care Reminders
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {plant.reminders.map((reminder: Reminder) => (
                <button
                  key={reminder.reminderId}
                  onClick={() => toggleReminder(reminder.reminderId)}
                  className={`rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                    reminder.enabled
                      ? 'bg-terracotta-500 border-terracotta-600 text-cream-100'
                      : 'bg-cream-100 border-terracotta-200 text-forest-400 opacity-60'
                  }`}
                >
                  <div className="text-2xl mb-2">
                    {reminderIcons[reminder.reminderType] ?? '🌿'}
                  </div>
                  <div className={`font-medium text-sm ${reminder.enabled ? 'text-cream-100' : 'text-forest-500'}`}>
                    {reminder.reminderType}
                  </div>
                  <div className={`text-xs mt-0.5 ${reminder.enabled ? 'text-cream-200' : 'text-forest-400'}`}>
                    {reminder.schedule}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mb-6 animate-fade-up opacity-0 anim-delay-100" style={{ animationFillMode: 'forwards' }}>
          <Link
            href="/analyze"
            className="flex-1 py-3 bg-terracotta-500 hover:bg-terracotta-600 text-cream-100 rounded-xl font-medium transition-colors duration-200 text-center text-sm"
          >
            New Analysis
          </Link>
          <Link
            href="/analyze"
            className="flex-1 py-3 bg-cream-100 border border-forest-300 text-forest-600 hover:bg-forest-50 rounded-xl font-medium transition-colors duration-200 text-center text-sm"
          >
            Re-analyze Plant
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-cream-200 p-1 rounded-xl mb-6 animate-fade-up opacity-0 anim-delay-200" style={{ animationFillMode: 'forwards' }}>
          {([['overview', 'Overview'], ['history', 'History']] as const).map(([tab, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-cream-100 text-forest-700 shadow-sm'
                  : 'text-forest-500 hover:text-forest-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="animate-fade-up opacity-0 anim-delay-300" style={{ animationFillMode: 'forwards' }}>

          {/* Overview tab */}
          {activeTab === 'overview' && latestAssessment && (
            <div className="space-y-5">
              <div className="bg-cream-100 border border-forest-200/30 rounded-2xl p-5">
                <h3 className="text-xl font-medium text-forest-700 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                  Current Care Plan
                </h3>
                {latestAssessment.recommendations.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-forest-400 italic">No current recommendations.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {latestAssessment.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-3 py-2 border-b border-forest-100 last:border-0">
                        <span className="text-lg flex-shrink-0">{categoryIcons[rec.category] ?? '✦'}</span>
                        <p className="text-sm text-forest-600 leading-relaxed">{rec.actionText}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {latestAssessment.rawAnalysis && (
                <div className="bg-cream-100 border border-forest-200/30 rounded-2xl p-5">
                  <h3 className="text-xl font-medium text-forest-700 mb-4" style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}>
                    Detailed Notes
                  </h3>
                  <div
                    className="prose-plant text-sm"
                    dangerouslySetInnerHTML={{
                      __html: latestAssessment.rawAnalysis
                        .replace(/^#### (.*)/gm, '<h4>$1</h4>')
                        .replace(/^### (.*)/gm, '<h3>$1</h3>')
                        .replace(/^## (.*)/gm, '<h2>$1</h2>')
                        .replace(/^# (.*)/gm, '<h4>$1</h4>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/^- (.*)$/gm, '<li>$1</li>')
                        .replace(/\n\n/g, '</p><p>')
                    }}
                  />
                </div>
              )}

              {!latestAssessment.feedback && !feedbackSubmitted[latestAssessment.assessmentId] && (
                <div className="bg-cream-200 border border-forest-200/30 rounded-2xl p-5 text-center">
                  <p className="text-sm text-forest-600 mb-3">Was this analysis helpful?</p>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => submitFeedback(latestAssessment.assessmentId, true)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-forest-700 hover:bg-forest-600 text-cream-100 rounded-full text-sm font-medium transition-colors"
                    >
                      👍 Yes, helpful
                    </button>
                    <button
                      onClick={() => submitFeedback(latestAssessment.assessmentId, false)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-cream-100 border border-forest-300 text-forest-600 hover:bg-forest-50 rounded-full text-sm font-medium transition-colors"
                    >
                      👎 Not quite
                    </button>
                  </div>
                </div>
              )}

              {(latestAssessment.feedback || feedbackSubmitted[latestAssessment.assessmentId]) && (
                <div className="bg-sage-300/20 border border-sage-300/40 rounded-2xl p-4 text-center">
                  <p className="text-sm text-forest-600">Thank you for your feedback! 🌱</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'overview' && !latestAssessment && (
            <div className="text-center py-12">
              <p className="text-forest-400">No assessments yet.</p>
              <Link href="/analyze" className="mt-3 inline-block text-forest-600 underline text-sm">Analyze this plant</Link>
            </div>
          )}

          {/* History tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {plant.assessments.length === 0 ? (
                <div className="text-center py-12 text-forest-400">No assessment history yet.</div>
              ) : (
                plant.assessments.map((assessment, i) => (
                  <div key={assessment.assessmentId} className="bg-cream-100 border border-forest-200/30 rounded-2xl p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-xs text-forest-400 uppercase tracking-wide font-medium">
                          {i === 0 ? 'Latest' : `Assessment ${plant.assessments.length - i}`}
                        </p>
                        <p className="text-sm text-forest-500 mt-0.5">
                          {format(new Date(assessment.timestamp), 'MMMM d, yyyy · h:mm a')}
                        </p>
                        {assessment.symptomReport && (
                          <p className="text-xs text-forest-400 mt-1 italic">&ldquo;{assessment.symptomReport.text}&rdquo;</p>
                        )}
                      </div>
                    </div>
                    {assessment.prediction && (
                      <p className="text-xs text-forest-400 mt-2">
                        Identified as <em>{assessment.prediction.label}</em> ({Math.round(assessment.prediction.confidence * 100)}% confidence)
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
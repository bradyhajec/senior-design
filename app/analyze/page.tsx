'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { upsertPlant, Plant, EnvironmentalDetails } from '@/lib/store';
import { v4 as uuidv4 } from 'uuid';

type Step = 'upload' | 'details' | 'analyzing' | 'result';

interface AnalysisResult {
  species: string;
  nickname_suggestion: string;
  confidence: number;
  healthScore: number;
  healthSummary: string;
  issues: string[];
  recommendations: Array<{ actionText: string; category: string }>;
  reminders: Array<{ reminderType: string; schedule: string }>;
  clarifyingQuestions: string[];
  detailedAnalysis: string;
}

const lightOptions = [
  { value: 'low', label: 'Low Light', icon: '🌑', desc: 'North-facing, dim rooms' },
  { value: 'medium', label: 'Medium', icon: '⛅', desc: 'East/west-facing' },
  { value: 'bright-indirect', label: 'Bright Indirect', icon: '🌤', desc: 'Near sunny window' },
  { value: 'direct', label: 'Direct Sun', icon: '☀️', desc: 'Full outdoor sun' },
];

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>('upload');

  // Upload state
  const [imageBase64, setImageBase64] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageMediaType, setImageMediaType] = useState<string>('image/jpeg');
  const [symptoms, setSymptoms] = useState('');
  const [dragging, setDragging] = useState(false);

  // Details state
  const [envDetails, setEnvDetails] = useState<EnvironmentalDetails>({
    lightLevel: 'bright-indirect',
    placement: 'indoor',
    soilType: '',
    potSize: '',
    humidity: 'medium',
  });
  const [nickname, setNickname] = useState('');

  // Analysis state
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [savedPlantId, setSavedPlantId] = useState('');

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file.');
      return;
    }
    setImageMediaType(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      // Extract base64 part
      const base64 = dataUrl.split(',')[1];
      setImageBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleAnalyze = async () => {
    setStep('analyzing');
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: imageBase64 || undefined,
          imageMediaType: imageBase64 ? imageMediaType : undefined,
          symptoms: symptoms || undefined,
          environmentalDetails: envDetails,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Analysis failed');
      }

      const data: AnalysisResult = await res.json();
      setResult(data);

      // Auto-set nickname from suggestion if not set
      if (!nickname && data.nickname_suggestion) {
        setNickname(data.nickname_suggestion);
      }

      // Save plant
      const plantId = uuidv4();
      const plant: Plant = {
        plantId,
        nickname: nickname || data.nickname_suggestion || data.species,
        species: data.species,
        createdAt: new Date().toISOString(),
        photoBase64: imagePreview || undefined,
        reminders: data.reminders.map(r => ({
          reminderId: uuidv4(),
          reminderType: r.reminderType,
          schedule: r.schedule,
          nextDue: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          enabled: true,
        })),
        assessments: [{
          assessmentId: uuidv4(),
          timestamp: new Date().toISOString(),
          photoBase64: imagePreview || undefined,
          symptomReport: symptoms ? { text: symptoms } : null,
          prediction: { label: data.species, confidence: data.confidence },
          recommendations: data.recommendations.map(r => ({
            actionText: r.actionText,
            category: r.category as never,
          })),
          rawAnalysis: data.detailedAnalysis,
          healthScore: data.healthScore,
          clarifyingQuestions: data.clarifyingQuestions,
          answers: [],
          feedback: null,
        }],
        environmentalDetails: envDetails,
      };

      upsertPlant(plant);
      setSavedPlantId(plantId);
      setStep('result');
    } catch (err) {
      setError(String(err));
      setStep('details');
    }
  };

  const healthColor = result
    ? result.healthScore >= 75 ? '#3d6b3f'
      : result.healthScore >= 50 ? '#8faa8b'
      : result.healthScore >= 25 ? '#c4714a'
      : '#a85c37'
    : '#3d6b3f';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f0e8' }}>
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-terracotta-500 text-sm font-medium tracking-widest uppercase mb-3">
            AI Analysis
          </p>
          <h1
            className="text-5xl font-light text-forest-700"
            style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', fontWeight: 300 }}
          >
            {step === 'result' ? 'Analysis Complete' : 'Analyze Your Plant'}
          </h1>
          {step !== 'result' && (
            <p className="text-forest-500 mt-2">
              Upload a photo and describe any symptoms for an AI-powered health assessment.
            </p>
          )}
        </div>

        {/* Step indicator */}
        {step !== 'analyzing' && step !== 'result' && (
          <div className="flex items-center gap-3 mb-8">
            {[{ id: 'upload', label: 'Photo & Symptoms' }, { id: 'details', label: 'Environment' }].map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                  step === s.id ? 'bg-forest-700 text-cream-100' :
                  (step === 'details' && s.id === 'upload') ? 'bg-sage-400 text-white' :
                  'bg-forest-100 text-forest-400'
                }`}>
                  {(step === 'details' && s.id === 'upload') ? (
                    <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (i + 1)}
                </div>
                <span className={`text-sm ${step === s.id ? 'text-forest-700 font-medium' : 'text-forest-400'}`}>{s.label}</span>
                {i === 0 && <div className="w-8 h-px bg-forest-200" />}
              </div>
            ))}
          </div>
        )}

        {/* ===== STEP 1: Upload ===== */}
        {step === 'upload' && (
          <div className="space-y-6 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                dragging
                  ? 'border-forest-500 bg-forest-50'
                  : imagePreview
                  ? 'border-transparent'
                  : 'border-dashed border-forest-300 hover:border-forest-400 bg-cream-100 hover:bg-forest-50/30'
              }`}
              style={{ minHeight: '280px' }}
            >
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} />

              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Plant preview" className="w-full max-h-80 object-cover rounded-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl" />
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                    <span className="text-white text-sm font-medium">Photo uploaded ✓</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); setImagePreview(''); setImageBase64(''); }}
                      className="text-white/80 text-sm hover:text-white bg-black/30 px-3 py-1 rounded-full"
                    >
                      Change
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-4 p-12 text-center" style={{ minHeight: '280px' }}>
                  <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-8 h-8 fill-none stroke-forest-500" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="3" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-forest-600">Drop your plant photo here</p>
                    <p className="text-sm text-forest-400 mt-1">or click to browse — JPG, PNG, WebP</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-forest-300">
                    <div className="w-12 h-px bg-forest-200" />
                    <span>also works without a photo</span>
                    <div className="w-12 h-px bg-forest-200" />
                  </div>
                </div>
              )}
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2">
                Observed Symptoms <span className="text-forest-400 font-normal">(optional but recommended)</span>
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. yellowing leaves, brown tips, drooping, spots, slow growth, root rot..."
                rows={3}
                className="w-full bg-cream-100 border border-forest-200 rounded-xl px-4 py-3 text-forest-700 placeholder-forest-300 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 resize-none transition-colors"
              />
            </div>

            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-2">
                Give your plant a nickname <span className="text-forest-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Spike, Leafy, Sir Droopsalot..."
                className="w-full bg-cream-100 border border-forest-200 rounded-xl px-4 py-3 text-forest-700 placeholder-forest-300 focus:outline-none focus:border-forest-500 focus:ring-1 focus:ring-forest-500 transition-colors"
              />
            </div>

            <button
              onClick={() => setStep('details')}
              disabled={!imageBase64 && !symptoms}
              className="w-full py-4 bg-forest-700 hover:bg-forest-600 disabled:bg-forest-300 disabled:cursor-not-allowed text-cream-100 rounded-xl font-medium transition-colors duration-200 text-base"
            >
              Continue to Environment Details
            </button>
          </div>
        )}

        {/* ===== STEP 2: Environment Details ===== */}
        {step === 'details' && (
          <div className="space-y-8 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>

            {/* Light level */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-3">Light Conditions</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {lightOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setEnvDetails(d => ({ ...d, lightLevel: opt.value as EnvironmentalDetails['lightLevel'] }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all duration-200 ${
                      envDetails.lightLevel === opt.value
                        ? 'border-forest-600 bg-forest-700 text-cream-100'
                        : 'border-forest-200 bg-cream-100 text-forest-600 hover:border-forest-400'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-medium">{opt.label}</div>
                    <div className={`text-xs mt-0.5 ${envDetails.lightLevel === opt.value ? 'text-cream-300' : 'text-forest-400'}`}>{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Indoor/Outdoor */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-3">Placement</label>
              <div className="flex gap-3">
                {['indoor', 'outdoor'].map((p) => (
                  <button
                    key={p}
                    onClick={() => setEnvDetails(d => ({ ...d, placement: p as 'indoor' | 'outdoor' }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium capitalize transition-all duration-200 ${
                      envDetails.placement === p
                        ? 'border-forest-600 bg-forest-700 text-cream-100'
                        : 'border-forest-200 bg-cream-100 text-forest-600 hover:border-forest-400'
                    }`}
                  >
                    {p === 'indoor' ? '🏠 Indoor' : '🌿 Outdoor'}
                  </button>
                ))}
              </div>
            </div>

            {/* Humidity */}
            <div>
              <label className="block text-sm font-medium text-forest-600 mb-3">Humidity Level</label>
              <div className="flex gap-3">
                {[{ v: 'low', l: 'Low' }, { v: 'medium', l: 'Medium' }, { v: 'high', l: 'High' }].map((h) => (
                  <button
                    key={h.v}
                    onClick={() => setEnvDetails(d => ({ ...d, humidity: h.v as EnvironmentalDetails['humidity'] }))}
                    className={`flex-1 py-3 rounded-xl border-2 font-medium transition-all duration-200 ${
                      envDetails.humidity === h.v
                        ? 'border-forest-600 bg-forest-700 text-cream-100'
                        : 'border-forest-200 bg-cream-100 text-forest-600 hover:border-forest-400'
                    }`}
                  >
                    {h.l}
                  </button>
                ))}
              </div>
            </div>

            {/* Soil and Pot */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2">Soil Type <span className="text-forest-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={envDetails.soilType}
                  onChange={(e) => setEnvDetails(d => ({ ...d, soilType: e.target.value }))}
                  placeholder="e.g. potting mix, cactus soil"
                  className="w-full bg-cream-100 border border-forest-200 rounded-xl px-3 py-2.5 text-sm text-forest-700 placeholder-forest-300 focus:outline-none focus:border-forest-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-forest-600 mb-2">Pot Size <span className="text-forest-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  value={envDetails.potSize}
                  onChange={(e) => setEnvDetails(d => ({ ...d, potSize: e.target.value }))}
                  placeholder="e.g. 4 inch, 6 inch, large"
                  className="w-full bg-cream-100 border border-forest-200 rounded-xl px-3 py-2.5 text-sm text-forest-700 placeholder-forest-300 focus:outline-none focus:border-forest-500 transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setStep('upload')}
                className="px-6 py-4 border border-forest-300 text-forest-600 rounded-xl font-medium hover:bg-forest-50 transition-colors duration-200"
              >
                Back
              </button>
              <button
                onClick={handleAnalyze}
                className="flex-1 py-4 bg-terracotta-500 hover:bg-terracotta-600 text-cream-100 rounded-xl font-medium transition-colors duration-200 text-base flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current" strokeWidth="2">
                  <path d="M12 2C8 7 3 11 12 20 21 11 16 7 12 2z" />
                </svg>
                Analyze Plant
              </button>
            </div>
          </div>
        )}

        {/* ===== ANALYZING ===== */}
        {step === 'analyzing' && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 rounded-full border-4 border-forest-200" />
              <div className="absolute inset-0 rounded-full border-4 border-forest-600 border-t-transparent animate-spin" />
              <div className="absolute inset-3 flex items-center justify-center">
                <svg viewBox="0 0 40 50" className="w-8 h-10 animate-leaf-sway" fill="#1a3a2a" opacity="0.5">
                  <path d="M20 3 C14 12 6 20 20 42 C34 20 26 12 20 3z" />
                  <path d="M20 8 C27 18 29 28 20 40" stroke="#f5f0e8" strokeWidth="1.5" fill="none" />
                </svg>
              </div>
            </div>
            <h2
              className="text-3xl font-light text-forest-700 mb-2"
              style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
            >
              Analyzing your plant
            </h2>
            <p className="text-forest-400 animate-pulse-soft">
              Identifying species, assessing health, crafting care plan...
            </p>
          </div>
        )}

        {/* ===== RESULT ===== */}
        {step === 'result' && result && (
          <div className="space-y-6 animate-fade-up opacity-0" style={{ animationFillMode: 'forwards' }}>
            {/* Hero result card */}
            <div className="bg-cream-100 border border-forest-200/30 rounded-2xl overflow-hidden">
              {imagePreview && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imagePreview} alt="Plant" className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2
                      className="text-3xl font-medium text-forest-700"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                    >
                      {nickname || result.nickname_suggestion}
                    </h2>
                    <p className="text-forest-500 italic mt-0.5">{result.species}</p>
                    <p className="text-sm text-forest-400 mt-1">
                      {Math.round(result.confidence * 100)}% identification confidence
                    </p>
                  </div>
                  <div className="text-center flex-shrink-0">
                    <div
                      className="text-5xl font-light"
                      style={{ fontFamily: 'Cormorant Garamond, Georgia, serif', color: healthColor }}
                    >
                      {result.healthScore}
                    </div>
                    <div className="text-xs text-forest-400">/100 health</div>
                  </div>
                </div>

                <div className="mt-4 h-2 bg-forest-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${result.healthScore}%`, backgroundColor: healthColor }}
                  />
                </div>

                <p className="text-forest-500 text-sm mt-4 leading-relaxed">{result.healthSummary}</p>
              </div>
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="bg-terracotta-400/10 border border-terracotta-400/30 rounded-2xl p-5">
                <h3
                  className="text-lg font-medium text-terracotta-600 mb-3 flex items-center gap-2"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-terracotta-500" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v5M12 16v.5" strokeLinecap="round" />
                  </svg>
                  Detected Issues
                </h3>
                <ul className="space-y-1.5">
                  {result.issues.map((issue, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-terracotta-700">
                      <span className="text-terracotta-400 mt-0.5">•</span>
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recommendations */}
            <div>
              <h3
                className="text-xl font-medium text-forest-700 mb-3"
                style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
              >
                Care Recommendations
              </h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => {
                  const categoryIcons: Record<string, string> = {
                    watering: '💧', light: '☀️', soil: '🪴', fertilizing: '🌱', pest: '🐛', general: '✦',
                  };
                  return (
                    <div key={i} className="bg-cream-100 border border-forest-200/40 rounded-xl px-4 py-3 flex items-start gap-3">
                      <span className="text-lg flex-shrink-0 mt-0.5">{categoryIcons[rec.category] ?? '✦'}</span>
                      <p className="text-sm text-forest-600 leading-relaxed">{rec.actionText}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reminders */}
            {result.reminders.length > 0 && (
              <div className="bg-sage-300/20 border border-sage-300/40 rounded-2xl p-5">
                <h3
                  className="text-lg font-medium text-forest-700 mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  📅 Care Schedule
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {result.reminders.map((r, i) => (
                    <div key={i} className="bg-cream-100 rounded-xl p-3">
                      <div className="font-medium text-sm text-forest-700">{r.reminderType}</div>
                      <div className="text-xs text-forest-400 mt-0.5">{r.schedule}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed analysis */}
            {result.detailedAnalysis && (
              <div className="bg-cream-100 border border-forest-200/30 rounded-2xl p-6">
                <h3
                  className="text-xl font-medium text-forest-700 mb-4"
                  style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
                >
                  Detailed Analysis
                </h3>
                <div
                  className="prose-plant text-sm"
                  dangerouslySetInnerHTML={{
                    __html: result.detailedAnalysis
                      .replace(/## (.*)/g, '<h2>$1</h2>')
                      .replace(/### (.*)/g, '<h3>$1</h3>')
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/^- (.*)$/gm, '<li>$1</li>')
                      .replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>')
                      .replace(/\n\n/g, '</p><p>')
                      .replace(/^(?!<[hul])/gm, '<p>')
                      .replace(/(?<![>])$/gm, '</p>')
                  }}
                />
              </div>
            )}

            {/* Clarifying questions */}
            {result.clarifyingQuestions.length > 0 && (
              <div className="bg-cream-200 border border-forest-200/30 rounded-2xl p-5">
                <h3 className="text-sm font-medium text-forest-600 mb-2">💬 For a more accurate analysis:</h3>
                <ul className="space-y-1">
                  {result.clarifyingQuestions.map((q, i) => (
                    <li key={i} className="text-sm text-forest-500">• {q}</li>
                  ))}
                </ul>
                <button
                  onClick={() => { setStep('upload'); setSymptoms(prev => prev + '\n'); }}
                  className="mt-3 text-sm text-forest-600 underline hover:text-forest-800"
                >
                  Answer these questions
                </button>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.push(`/plants/${savedPlantId}`)}
                className="flex-1 py-4 bg-forest-700 hover:bg-forest-600 text-cream-100 rounded-xl font-medium transition-colors duration-200"
              >
                View Plant Profile
              </button>
              <button
                onClick={() => {
                  setStep('upload');
                  setImageBase64('');
                  setImagePreview('');
                  setSymptoms('');
                  setNickname('');
                  setResult(null);
                }}
                className="px-6 py-4 border border-forest-300 text-forest-600 rounded-xl font-medium hover:bg-forest-50 transition-colors duration-200"
              >
                Analyze Another
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

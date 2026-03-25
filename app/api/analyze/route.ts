import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const PLANT_API_URL = process.env.PLANT_API_URL;

  try {
    const body = await req.json();
    const { imageBase64, imageMediaType } = body;

    if (!PLANT_API_URL) {
      return NextResponse.json({ error: 'PLANT_API_URL not configured' }, { status: 500 });
    }

    const byteCharacters = atob(imageBase64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: imageMediaType });

    const formData = new FormData();
    formData.append('file', blob, 'plant.jpg');

    const apiResponse = await fetch(`${PLANT_API_URL}/predict`, {
      method: 'POST',
      body: formData,
    });

    if (!apiResponse.ok) {
      const error = await apiResponse.json();
      return NextResponse.json(
        { error: 'Prediction failed', details: error.detail },
        { status: apiResponse.status }
      );
    }

    const prediction = await apiResponse.json();
    const care = prediction.care;

    const recommendations = [];
    if (care?.watering) recommendations.push({ actionText: care.watering.frequency, category: 'watering' });
    if (care?.light)    recommendations.push({ actionText: care.light.ideal, category: 'light' });
    if (care?.soil)     recommendations.push({ actionText: care.soil, category: 'soil' });
    if (care?.fertilizer) recommendations.push({ actionText: care.fertilizer, category: 'fertilizing' });

    const reminders = [
      { reminderType: 'Watering',    schedule: care?.watering?.frequency ?? 'Check regularly' },
      { reminderType: 'Fertilizing', schedule: care?.fertilizer ?? 'Once a month in spring and summer' },
    ];

    const issues = (care?.common_issues ?? []).map((i: { symptom: string }) => i.symptom);

    const toxicity = care?.toxicity ?? {};
    const detailedAnalysis = `## ${prediction.species}

### Watering
${care?.watering?.method ?? ''}
**Tip:** ${care?.watering?.tip ?? ''}

### Light
${care?.light?.ideal ?? ''}
**Warning:** ${care?.light?.warning ?? ''}

### Humidity
Ideal range: ${care?.humidity?.ideal_range_percent ?? ''}
${care?.humidity?.notes ?? ''}

### Temperature
Ideal range: ${care?.temperature?.ideal_range_f ?? ''}

### Toxicity
Toxic to pets: ${toxicity.toxic_to_pets ? 'Yes' : 'No'}
Toxic to humans: ${toxicity.toxic_to_humans ? 'Yes' : 'No'}
${toxicity.details ?? ''}

### Common Issues
${(care?.common_issues ?? []).map((i: { symptom: string; fix: string }) => `- **${i.symptom}**: ${i.fix}`).join('\n')}`;

    const analysisData = {
      species:             prediction.species,
      confidence:          prediction.confidence,
      nickname_suggestion: `My ${prediction.species.split('(')[0].trim()}`,
      healthSummary:       `${prediction.species} detected. Review the care recommendations below to keep your plant thriving.`,
      issues,
      recommendations,
      reminders,
      clarifyingQuestions: [],
      detailedAnalysis,
      top3:                prediction.top3,
    };

    return NextResponse.json(analysisData);

  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed', details: String(error) }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, imageMediaType, symptoms, environmentalDetails, clarifyingAnswers } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 });
    }

    const systemPrompt = `You are an expert botanist and plant care specialist AI assistant. 
You analyze plant images and symptoms to provide accurate identification, health assessments, and care guidance.
Always respond in valid JSON format exactly matching the schema provided.
Be thorough, accurate, and compassionate in your assessments. 
When identifying plants, consider the visual features carefully.
Provide actionable, specific care recommendations.`;

    const userContent: Anthropic.MessageParam['content'] = [];

    if (imageBase64 && imageMediaType) {
      userContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: imageMediaType as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: imageBase64,
        },
      });
    }

    const contextParts: string[] = [];
    if (symptoms) contextParts.push(`Observed symptoms: ${symptoms}`);
    if (environmentalDetails) {
      contextParts.push(`Environmental details: Light level: ${environmentalDetails.lightLevel}, Placement: ${environmentalDetails.placement}, Soil type: ${environmentalDetails.soilType || 'unknown'}, Pot size: ${environmentalDetails.potSize || 'unknown'}, Humidity: ${environmentalDetails.humidity}`);
    }
    if (clarifyingAnswers && clarifyingAnswers.length > 0) {
      const qaText = clarifyingAnswers.map((qa: {question: string; answer: string}) => `Q: ${qa.question}\nA: ${qa.answer}`).join('\n');
      contextParts.push(`Additional context:\n${qaText}`);
    }

    const prompt = `${contextParts.length > 0 ? contextParts.join('\n\n') + '\n\n' : ''}Please analyze this plant and respond with ONLY a JSON object (no markdown, no explanation) matching this exact schema:

{
  "species": "scientific and common name",
  "nickname_suggestion": "a friendly nickname for this plant",
  "confidence": 0.95,
  "healthScore": 72,
  "healthSummary": "Brief overall health assessment in 1-2 sentences",
  "issues": ["list of detected health issues"],
  "recommendations": [
    {
      "actionText": "Specific action to take",
      "category": "watering|light|soil|fertilizing|pest|general"
    }
  ],
  "reminders": [
    {
      "reminderType": "Watering",
      "schedule": "Every 7 days"
    },
    {
      "reminderType": "Fertilizing", 
      "schedule": "Every 30 days"
    }
  ],
  "clarifyingQuestions": ["question if more info needed, or empty array"],
  "detailedAnalysis": "Detailed markdown-friendly analysis covering identification, health assessment, care requirements, and specific recommendations. Use ## headers and bullet points."
}

Health score should be 0-100 where: 0-24=critical, 25-49=struggling, 50-74=needs attention, 75-100=thriving.
If no image is provided, analyze based on symptoms and context alone.`;

    userContent.push({ type: 'text', text: prompt });

    const response = await client.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      return NextResponse.json({ error: 'No text response from AI' }, { status: 500 });
    }

    let analysisData;
    try {
      // Strip any markdown code fences if present
      const cleaned = textContent.text.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleaned);
    } catch {
      return NextResponse.json({ error: 'Failed to parse AI response', raw: textContent.text }, { status: 500 });
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed', details: String(error) }, { status: 500 });
  }
}

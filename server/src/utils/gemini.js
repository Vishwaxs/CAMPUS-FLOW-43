/**
 * Generate a theme configuration from user answers using Gemini AI
 * @param {Object} answers - The 5 predefined answers
 * @param {string} answers.mood - Event mood (Professional, Energetic, Festive, Minimal, Futuristic)
 * @param {string} answers.brightness - Brightness preference (Light, Dark, Auto)
 * @param {string} answers.colorFamily - Primary color family (Blue, Purple, Red, Green, Orange, Mixed)
 * @param {string} answers.fontStyle - Font style (Modern, Elegant, Bold, Minimal)
 * @param {string} answers.intensity - Visual intensity (Subtle, Balanced, High Contrast)
 * @returns {Promise<Object>} Generated theme configuration matching the theme schema
 */
async function generateThemeFromAnswers(answers) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  // Strict system prompt - enforces JSON-only output
  const prompt = `You are a theme generator for a campus event platform. Your ONLY task is to convert user preferences into a valid theme JSON object.

USER PREFERENCES:
- Event Mood: ${answers.mood}
- Brightness Preference: ${answers.brightness}
- Primary Color Family: ${answers.colorFamily}
- Font Style: ${answers.fontStyle}
- Visual Intensity: ${answers.intensity}

REQUIREMENTS:
1. Return ONLY valid JSON, no explanations, no markdown, no comments
2. Use the EXACT schema below
3. Generate harmonious, accessible color palettes
4. Choose appropriate Google Fonts based on font style
5. Ensure text colors have sufficient contrast with backgrounds
6. For "Auto" brightness, choose based on mood (Professional/Minimal=Light, Energetic/Futuristic=Dark, Festive=Light)

EXACT SCHEMA (return this structure):
{
  "name": "AI Generated Theme",
  "colors": {
    "primary": "#hexcode",
    "secondary": "#hexcode",
    "accent": "#hexcode",
    "background": "#hexcode",
    "surface": "#hexcode",
    "text": "#hexcode",
    "textSecondary": "#hexcode",
    "border": "#hexcode",
    "success": "#22c55e",
    "error": "#ef4444"
  },
  "fonts": {
    "heading": "FontName, fallback",
    "body": "FontName, fallback"
  },
  "layout": "standard",
  "borderRadius": "8px",
  "logo": null
}

Return ONLY the JSON object, nothing else.`;

  try {
    // Direct HTTP call to Gemini v1 REST API
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    
    // Extract text from Gemini v1 API response structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      throw new Error('Invalid response structure from Gemini API');
    }

    let text = data.candidates[0].content.parts[0].text.trim();

    // Remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse and validate JSON
    const theme = JSON.parse(text);

    // Validate required fields
    if (!theme.name || !theme.colors || !theme.fonts) {
      throw new Error('Generated theme missing required fields');
    }

    // Validate color fields
    const requiredColors = ['primary', 'secondary', 'accent', 'background', 'surface', 'text', 'textSecondary', 'border', 'success', 'error'];
    for (const color of requiredColors) {
      if (!theme.colors[color]) {
        throw new Error(`Generated theme missing color: ${color}`);
      }
    }

    // Validate font fields
    if (!theme.fonts.heading || !theme.fonts.body) {
      throw new Error('Generated theme missing font definitions');
    }

    return theme;
  } catch (error) {
    console.error('Gemini theme generation error:', error);
    throw new Error(`Failed to generate theme: ${error.message}`);
  }
}

module.exports = { generateThemeFromAnswers };

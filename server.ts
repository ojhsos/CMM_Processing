import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Gemini AI CMM Parser endpoint
app.post('/api/parse-cmm', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string') {
      res.status(400).json({ error: 'rawText is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
Role: Expert CMM (Coordinate Measuring Machine) Report Parser and QA Data Analyst.
Task: Parse the following CMM raw inspection text into a clean JSON structure.

Raw CMM Text:
"""
${rawText}
"""

Instructions:
1. Extract metadata: programName, date, author, unit, partName, partNumber.
2. Extract datums: array of { code, name, description }.
3. Extract measurement items: array of {
     elementName: string (e.g. "원 2", "위치도"),
     feature: string (e.g. "X", "Y", "Z", "지름", "위치도", "평탄도"),
     featureType: string (one of "X", "Y", "Z", "지름", "반경", "위치도", "평탄도", "직각도", "동축도", "동심도", "거리", "기타"),
     nominal: number | null,
     actual: number | null,
     deviation: number | null,
     upperTol: number | null,
     lowerTol: number | null,
     judgment: "OK" | "NG"
   }

Respond ONLY with valid JSON matching this schema:
{
  "metadata": {
    "programName": string,
    "date": string,
    "author": string,
    "unit": string,
    "partName": string,
    "partNumber": string
  },
  "datums": [
    { "code": string, "name": string, "description": string }
  ],
  "items": [
    {
      "elementName": string,
      "feature": string,
      "featureType": string,
      "nominal": number or null,
      "actual": number or null,
      "deviation": number or null,
      "upperTol": number or null,
      "lowerTol": number or null,
      "judgment": "OK" or "NG"
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const jsonText = response.text || '{}';
    const parsedData = JSON.parse(jsonText);
    res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error('Gemini parse error:', err);
    res.status(500).json({ error: err.message || 'AI parsing failed' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CMM App Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();

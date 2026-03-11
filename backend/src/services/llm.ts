import { GoogleGenerativeAI } from '@google/generative-ai';
import { ParsedData } from './parser';

const GEMINI_MODEL = 'gemini-2.5-flash';

function buildPrompt(data: ParsedData): string {
  const rowCount = data.rows.length;
  const columns = data.headers.join(', ');

  return `You are an elite sales analyst preparing an executive briefing for senior leadership.

Analyse the following sales dataset (${rowCount} records, columns: ${columns}) and produce a concise, professional narrative summary of no more than 400 words.

Your summary MUST include:
1. **Overall Performance** – total revenue, total units sold, and key period.
2. **Top Performers** – best product category and best region by revenue.
3. **Trends & Patterns** – notable month-over-month or category trends.
4. **Risk Flags** – any cancelled orders or underperforming segments.
5. **Executive Recommendation** – one actionable insight for leadership.

Use clear, confident business language. Format with short paragraphs and bold headings.

--- BEGIN DATA ---
${data.rawCsv}
--- END DATA ---`;
}

export async function generateSummary(data: ParsedData): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = buildPrompt(data);

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  if (!text || text.trim().length === 0) {
    throw new Error('LLM returned an empty response.');
  }

  return text.trim();
}

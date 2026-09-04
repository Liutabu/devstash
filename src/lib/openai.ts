import OpenAI from 'openai';

let _openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (_openai) return _openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('Missing OPENAI_API_KEY');
  _openai = new OpenAI({
    apiKey: key,
    maxRetries: 2,
    timeout: 30_000,
  });
  return _openai;
}

export const openai = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return Reflect.get(getOpenAI(), prop, getOpenAI());
  },
});

export const AI_MODEL = 'gpt-5-nano';

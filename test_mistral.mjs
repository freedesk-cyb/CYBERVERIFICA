// Leer desde .env.local: la clave no debe vivir en un archivo versionado.
import { readFileSync } from 'node:fs';
const env = readFileSync(new URL('./.env.local', import.meta.url), 'utf8');
const apiKey = (env.match(/^MISTRAL_API_KEY=(.*)$/m) || [])[1]?.trim();

if (!apiKey) {
  console.error('MISTRAL_API_KEY no encontrado en .env.local');
  process.exit(1);
}

async function testMistralJson() {
  const models = ['open-mistral-nemo', 'open-mistral-7b', 'open-mixtral-8x7b'];
  for (const m of models) {
    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: m,
          messages: [
            { role: 'system', content: 'Responde un JSON valido: {"saludo": "hola", "estado": "ok"}' },
            { role: 'user', content: 'Genera el JSON' }
          ],
          response_format: { type: 'json_object' },
          max_tokens: 100
        })
      });
      const data = await res.json();
      if (res.ok) {
        console.log(`Mistral JSON ${m}: SUCCESS ->`, data.choices?.[0]?.message?.content);
      } else {
        console.log(`Mistral JSON ${m}: FAILED ->`, res.status, data.message || data.error);
      }
    } catch (e) {
      console.log(`Mistral JSON ${m}: EXCEPTION ->`, e.message);
    }
  }
}

testMistralJson();

import { NextRequest } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Sei un assistente esperto di e-commerce e analisi di trend di mercato integrato in TrendFinder, una piattaforma che analizza Google Trends e Amazon Best Sellers.

Puoi aiutare gli utenti a:
- Interpretare i dati di trend e crescita dei prodotti
- Valutare opportunità di business nell'e-commerce
- Suggerire strategie di pricing e posizionamento
- Analizzare la competizione di mercato
- Identificare nicchie di prodotto promettenti
- Consigliare keyword per la ricerca di trend

Quando l'utente condivide dati di prodotti in trend, analizzali in modo dettagliato e fornisci consigli pratici e actionable.
Rispondi sempre in italiano in modo conciso e professionale.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context } = body as {
      messages: Array<{ role: 'user' | 'assistant'; content: string }>;
      context?: string;
    };

    if (!messages?.length) {
      return new Response(JSON.stringify({ error: 'messages required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const systemWithContext = context
      ? `${SYSTEM_PROMPT}\n\n## Dati trend attuali nell'app:\n${context}`
      : SYSTEM_PROMPT;

    const stream = client.messages.stream({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      thinking: { type: 'adaptive' },
      system: systemWithContext,
      messages,
    });

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (
              event.type === 'content_block_delta' &&
              event.delta.type === 'text_delta'
            ) {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'X-Accel-Buffering': 'no',
      },
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

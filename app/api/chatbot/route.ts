import { NextRequest, NextResponse } from 'next/server';
import { getDecryptedApiKey } from '@/lib/encryption';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { messages } = body;

        console.log('Received request body:', JSON.stringify(body).substring(0, 200));
        console.log('Messages array:', messages ? 'exists' : 'missing', 'Type:', Array.isArray(messages) ? 'array' : typeof messages);

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json(
                { error: 'Invalid messages format. Expected array of messages.', received: typeof messages },
                { status: 400 }
            );
        }

        if (messages.length === 0) {
            return NextResponse.json(
                { error: 'Messages array cannot be empty' },
                { status: 400 }
            );
        }

        // Get API key (supports both plain and encrypted versions)
        const apiKey = getDecryptedApiKey();
        if (!apiKey) {
            console.error('GROQ_API_KEY is not set');
            return NextResponse.json(
                { error: 'API key not configured on server' },
                { status: 500 }
            );
        }

        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: messages,
                max_tokens: 1024,
                temperature: 0.7,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            console.error('Groq API error:', error);
            return NextResponse.json(
                { error: 'Failed to get response from Groq API' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Chatbot API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

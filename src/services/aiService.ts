import axios from 'axios';
import dotenv from 'dotenv';
import type { Message } from '../types/chat';
import type { Reminder } from '../types/chat';
import type { CalendarEvent } from '../types/chat';

dotenv.config();

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: AIMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class AIService {
  private static instance: AIService;
  private readonly API_KEY: string;
  private readonly MODEL: string;
  private readonly API_URL = 'https://openrouter.ai/api/v1/chat/completions';

  private constructor() {
    this.API_KEY = process.env.OPENROUTER_API_KEY || '';
    this.MODEL = process.env.OPENROUTER_MODEL || 'claude-3-sonnet-20240229';
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }

  private formatMessageForAI(message: Message): any {
    return {
      role: message.sender === 'user' ? 'user' : 'assistant',
      content: message.content,
    };
  }

  public async generateResponse(messages: Message[]): Promise<string> {
    const aiMessages = messages.map(this.formatMessageForAI);

    try {
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: aiMessages,
        max_tokens: 2000,
        temperature: 0.7,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      return response.data.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating response:', error);
      throw new Error('Error al generar la respuesta');
    }
  }

  public async generateProactiveMessage(messages: Message[]): Promise<string> {
    const aiMessages = messages.map(this.formatMessageForAI);

    try {
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Genera un mensaje proactivo basado en el contexto de la conversación. El mensaje debe ser útil y relevante.',
          },
          ...aiMessages,
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      return response.data.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating proactive message:', error);
      return '';
    }
  }

  public async generateNotification(content: string): Promise<string> {
    try {
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are a notification generator. Generate a concise notification message based on the user input.',
          },
          {
            role: 'user',
            content: `Generate a notification based on this input: ${content}`,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      return response.data.choices[0].message.content || '';
    } catch (error) {
      console.error('Error generating notification:', error);
      return '';
    }
  }

  public async generateReminder(messageContent: string): Promise<Reminder | null> {
    try {
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Analiza el mensaje y genera un recordatorio si es relevante. Responde en formato JSON con las propiedades: id, title, description, date, time, type, isActive.',
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      const reminder = JSON.parse(response.data.choices[0].message.content);
      return {
        id: Date.now().toString(),
        ...reminder,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error generating reminder:', error);
      return null;
    }
  }

  public async generateCalendarEvent(messageContent: string): Promise<CalendarEvent | null> {
    try {
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Analiza el mensaje y genera un evento de calendario si es relevante. Responde en formato JSON con las propiedades: id, title, description, start, end, location.',
          },
          {
            role: 'user',
            content: messageContent,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      const event = JSON.parse(response.data.choices[0].message.content);
      return {
        id: Date.now().toString(),
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        reminders: [],
      };
    } catch (error) {
      console.error('Error generating calendar event:', error);
      return null;
    }
  }
}

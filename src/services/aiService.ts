import axios from 'axios';
import dotenv from 'dotenv';
import type { Message } from '../types/chat';

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

  private async generateMessages(messages: Message[]): Promise<AIMessage[]> {
    return messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));
  }

  public async generateResponse(messages: Message[]): Promise<string> {
    try {
      const aiMessages = await this.generateMessages(messages);
      
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

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error in AI response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  public async generateProactiveMessage(messages: Message[]): Promise<string> {
    try {
      const aiMessages = await this.generateMessages(messages);
      
      const response = await axios.post<AIResponse>(this.API_URL, {
        model: this.MODEL,
        messages: [
          {
            role: 'system',
            content: 'Act as a proactive assistant. Analyze the conversation and suggest a relevant proactive message that would be helpful to the user. The message should be concise and relevant to their current context or needs.'
          },
          ...aiMessages
        ],
        max_tokens: 500,
        temperature: 0.5,
        stream: false,
      }, {
        headers: {
          'Authorization': `Bearer ${this.API_KEY}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Proactive Chatbot',
        }
      });

      return response.data.choices[0].message.content;
    } catch (error) {
      console.error('Error in proactive message generation:', error);
      throw new Error('Failed to generate proactive message');
    }
  }
}

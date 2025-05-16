import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message, ChatState, ChatActions, UserPreferences } from '../types/chat';
import { AIService } from '../services/aiService';

export const useChat = (): [ChatState, ChatActions] => {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => [] as Message[],
  });

  const addMessage = async (message: Message) => {
    try {
      queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
        [...oldMessages, message]
      );

      // Si es un mensaje del usuario, generamos una respuesta
      if (message.sender === 'user') {
        setIsTyping(true);
        const aiResponse = await AIService.getInstance().generateResponse(messages);
        
        const botMessage: Message = {
          id: Date.now().toString(),
          content: aiResponse,
          sender: 'bot',
          timestamp: new Date().toISOString(),
          type: 'text',
        };

        queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
          [...oldMessages, botMessage]
        );
        setIsTyping(false);

        // Generar un mensaje proactivo después de la respuesta
        setTimeout(async () => {
          const proactiveMessage = await AIService.getInstance().generateProactiveMessage(messages);
          if (proactiveMessage.trim()) {
            const proactiveMsg: Message = {
              id: Date.now().toString(),
              content: proactiveMessage,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              type: 'notification',
            };
            queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
              [...oldMessages, proactiveMsg]
            );
          }
        }, 2000); // Esperar 2 segundos antes de enviar un mensaje proactivo
      }
    } catch (err) {
      setError('Error al procesar el mensaje');
      setIsTyping(false);
    }
  };

  const setChatError = (error: string | null) => {
    setError(error);
  };

  const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
    queryClient.setQueryData(['userPreferences'], (oldPreferences: UserPreferences | undefined) =>
      ({ ...oldPreferences, ...preferences })
    );
  };

  return [
    {
      messages,
      isTyping,
      isLoading: false,
      error,
      userPreferences: queryClient.getQueryData<UserPreferences>(['userPreferences']) || {},
    },
    {
      addMessage,
      setIsTyping,
      setChatError,
      updateUserPreferences,
    },
  ];
};

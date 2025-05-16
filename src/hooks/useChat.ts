import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { Message, ChatState, ChatActions, Reminder, CalendarEvent, UserPreferences } from '../types/chat';
import { AIService } from '../services/aiService';
import { ReminderService } from '../services/reminderService';

export const useChat = (): [ChatState, ChatActions] => {
  const queryClient = useQueryClient();
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reminderService = ReminderService.getInstance();

  try {
    const { data: messages = [], isLoading, error: queryError } = useQuery({
      queryKey: ['messages'] as const,
      queryFn: () => [] as Message[],
    });

    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : 'Error al cargar mensajes');
    }

    const addMessage = async (message: Message) => {
      try {
        setIsTyping(true);
        setError(null);

        const newMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };

        queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
          [...oldMessages, newMessage]
        );

        if (message.type === 'text') {
          const response = await AIService.getInstance().generateResponse(messages);
          if (response) {
            const botMessage: Message = {
              id: Date.now().toString(),
              content: response,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              type: 'text',
              role: 'assistant',
            };

            queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
              [...oldMessages, botMessage]
            );
          }
        }

        if (message.type === 'notification') {
          const notification = await AIService.getInstance().generateNotification(message.content);
          if (notification) {
            const newMessage = {
              id: Date.now().toString(),
              content: notification,
              sender: 'bot',
              timestamp: new Date().toISOString(),
              type: 'notification',
              role: 'assistant',
            } as Message;

            queryClient.setQueryData(['messages'], (oldMessages: Message[]) =>
              [...oldMessages, newMessage]
            );
          }
        }

        if (message.type === 'text' && message.content.toLowerCase().includes('reminder')) {
          const reminder = await AIService.getInstance().generateReminder(message.content);
          if (reminder) {
            reminderService.addReminder(reminder);
            queryClient.invalidateQueries({ queryKey: ['reminders'] as const });
          }
        }

        if (message.type === 'text' && message.content.toLowerCase().includes('event')) {
          const event = await AIService.getInstance().generateCalendarEvent(message.content);
          if (event) {
            reminderService.addCalendarEvent(event);
            queryClient.invalidateQueries({ queryKey: ['calendarEvents'] as const });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al procesar el mensaje');
      } finally {
        setIsTyping(false);
      }
    };

    const deleteReminder = async (reminderId: string) => {
      try {
        await reminderService.deleteReminder(reminderId);
        queryClient.invalidateQueries({ queryKey: ['reminders'] as const });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar recordatorio');
      }
    };

    const deleteCalendarEvent = async (eventId: string) => {
      try {
        await reminderService.deleteCalendarEvent(eventId);
        queryClient.invalidateQueries({ queryKey: ['calendarEvents'] as const });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al eliminar evento');
      }
    };

    const setChatError = (error: string | null) => {
      setError(error);
    };

    const addReminder = (reminder: Reminder) => {
      reminderService.addReminder(reminder);
      queryClient.invalidateQueries({ queryKey: ['reminders'] as const });
    };

    const addCalendarEvent = (event: CalendarEvent) => {
      reminderService.addCalendarEvent(event);
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] as const });
    };

    const updateUserPreferences = (preferences: Partial<UserPreferences>) => {
      queryClient.setQueryData(['userPreferences'] as const, (oldPreferences: UserPreferences | undefined) =>
        ({ ...oldPreferences, ...preferences })
      );
    };

    const updateReminder = (id: string, updates: Partial<Reminder>) => {
      reminderService.updateReminder(id, updates);
      queryClient.invalidateQueries({ queryKey: ['reminders'] as const });
    };

    const updateCalendarEvent = (id: string, updates: Partial<CalendarEvent>) => {
      reminderService.updateCalendarEvent(id, updates);
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] as const });
    };

    return [
      {
        messages,
        reminders: [],
        calendarEvents: [],
        isTyping,
        isLoading,
        error,
        userPreferences: {},
      },
      {
        addMessage,
        deleteReminder,
        deleteCalendarEvent,
        setIsTyping,
        setChatError,
        addReminder,
        addCalendarEvent,
        updateUserPreferences,
        updateReminder,
        updateCalendarEvent,
      }
    ];
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Error en el hook useChat');
    return [
      {
        messages: [],
        reminders: [],
        calendarEvents: [],
        isTyping: false,
        isLoading: false,
        error: 'Error en el hook useChat',
        userPreferences: {},
      },
      {
        addMessage: () => {},
        deleteReminder: () => {},
        deleteCalendarEvent: () => {},
        setIsTyping: () => {},
        setChatError: () => {},
        addReminder: () => {},
        addCalendarEvent: () => {},
        updateUserPreferences: () => {},
        updateReminder: () => {},
        updateCalendarEvent: () => {},
      }
    ];
  }
};

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

  const { data: messages = [] } = useQuery({
    queryKey: ['messages'],
    queryFn: () => [] as Message[],
  });

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
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsTyping(false);
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

  const deleteReminder = (id: string) => {
    reminderService.deleteReminder(id);
    queryClient.invalidateQueries({ queryKey: ['reminders'] as const });
  };

  const deleteCalendarEvent = (id: string) => {
    reminderService.deleteCalendarEvent(id);
    queryClient.invalidateQueries({ queryKey: ['calendarEvents'] as const });
  };

  return [
    {
      messages,
      isTyping,
      isLoading: false,
      error,
      userPreferences: queryClient.getQueryData<UserPreferences>(['userPreferences']) || {},
      reminders: queryClient.getQueryData<Reminder[]>(['reminders']) || [],
      calendarEvents: queryClient.getQueryData<CalendarEvent[]>(['calendarEvents']) || [],
    },
    {
      addMessage,
      setIsTyping,
      setChatError,
      updateUserPreferences,
      addReminder,
      addCalendarEvent,
      updateReminder,
      updateCalendarEvent,
      deleteReminder,
      deleteCalendarEvent,
    },
  ];
};

import type { Reminder } from '../types/chat';
import type { CalendarEvent } from '../types/chat';
import type { QueryClientType } from '../types/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export class ReminderService {
  private static instance: ReminderService;
  private queryClient: QueryClientType;

  private constructor() {
    this.queryClient = useQueryClient();
  }

  public static getInstance(): ReminderService {
    if (!ReminderService.instance) {
      ReminderService.instance = new ReminderService();
    }
    return ReminderService.instance;
  }

  public addReminder(reminder: Reminder): void {
    const currentReminders = this.queryClient.getQueryData<Reminder[]>(['reminders']) || [];
    this.queryClient.setQueryData(['reminders'], [...currentReminders, reminder]);
  }

  public updateReminder(id: string, updates: Partial<Reminder>): void {
    const currentReminders = this.queryClient.getQueryData<Reminder[]>(['reminders']) || [];
    const updatedReminders = currentReminders.map((reminder: Reminder) => 
      reminder.id === id ? { ...reminder, ...updates, updatedAt: new Date().toISOString() } : reminder
    );
    this.queryClient.setQueryData(['reminders'], updatedReminders);
  }

  public deleteReminder(id: string): void {
    const currentReminders = this.queryClient.getQueryData<Reminder[]>(['reminders']) || [];
    const updatedReminders = currentReminders.filter((reminder: Reminder) => reminder.id !== id);
    this.queryClient.setQueryData(['reminders'], updatedReminders);
  }

  public addCalendarEvent(event: CalendarEvent): void {
    const currentEvents = this.queryClient.getQueryData<CalendarEvent[]>(['calendarEvents']) || [];
    this.queryClient.setQueryData(['calendarEvents'], [...currentEvents, event]);
  }

  public updateCalendarEvent(id: string, updates: Partial<CalendarEvent>): void {
    const currentEvents = this.queryClient.getQueryData<CalendarEvent[]>(['calendarEvents']) || [];
    const updatedEvents = currentEvents.map((event: CalendarEvent) => 
      event.id === id ? { ...event, ...updates, updatedAt: new Date().toISOString() } : event
    );
    this.queryClient.setQueryData(['calendarEvents'], updatedEvents);
  }

  public deleteCalendarEvent(id: string): void {
    const currentEvents = this.queryClient.getQueryData<CalendarEvent[]>(['calendarEvents']) || [];
    const updatedEvents = currentEvents.filter((event: CalendarEvent) => event.id !== id);
    this.queryClient.setQueryData(['calendarEvents'], updatedEvents);
  }

  public getUpcomingReminders(): Reminder[] {
    const currentReminders = this.queryClient.getQueryData<Reminder[]>(['reminders']) || [];
    const now = new Date();
    return currentReminders.filter((reminder: Reminder) => {
      const reminderDate = new Date(reminder.date);
      const reminderTime = reminder.time ? new Date(`${reminder.date}T${reminder.time}`) : reminderDate;
      return reminderTime > now && reminder.isActive;
    });
  }

  public getEventsForDate(date: string): CalendarEvent[] {
    const currentEvents = this.queryClient.getQueryData<CalendarEvent[]>(['calendarEvents']) || [];
    const targetDate = new Date(date);
    return currentEvents.filter((event: CalendarEvent) => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      return eventStart <= targetDate && eventEnd >= targetDate;
    });
  }

  public checkAndNotify(): void {
    const upcomingReminders = this.getUpcomingReminders();
    if (upcomingReminders.length > 0) {
      // Aquí podríamos implementar la lógica de notificación
      console.log('Upcoming reminders:', upcomingReminders);
    }
  }
}

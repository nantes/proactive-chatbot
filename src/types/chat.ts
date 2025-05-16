export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'notification' | 'reminder' | 'calendar';
  role?: 'user' | 'assistant';
  metadata?: {
    reminderDate?: string;
    reminderType?: 'once' | 'daily' | 'weekly' | 'monthly';
    calendarEvent?: {
      title: string;
      start: string;
      end: string;
      description?: string;
      location?: string;
    };
  };
}

export interface UserPreferences {
  name?: string;
  interests?: string[];
  timezone?: string;
  language?: string;
  notificationPreferences?: {
    reminders: boolean;
    updates: boolean;
    calendar: boolean;
    email?: boolean;
    sms?: boolean;
    push?: boolean;
  };
  reminderPreferences?: {
    defaultType?: 'once' | 'daily' | 'weekly' | 'monthly';
    defaultTime?: string;
  };
  calendarPreferences?: {
    defaultDuration: number;
    defaultLocation: string;
    defaultReminders: {
      before: number;
      unit: 'minutes' | 'hours' | 'days';
    }[];
  };
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  userPreferences: UserPreferences;
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
}

export interface ChatActions {
  addMessage: (message: Message) => void;
  setIsTyping: (isTyping: boolean) => void;
  setChatError: (error: string | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  addReminder: (reminder: Reminder) => void;
  addCalendarEvent: (event: CalendarEvent) => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  updateCalendarEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteReminder: (id: string) => void;
  deleteCalendarEvent: (id: string) => void;
}

export interface ChatProps {
  initialMessages?: Message[];
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'once' | 'daily' | 'weekly' | 'monthly';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

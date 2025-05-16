export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: string;
  type: 'text' | 'notification' | 'reminder';
}

export interface UserPreferences {
  name?: string;
  interests?: string[];
  timezone?: string;
  notificationPreferences?: {
    reminders: boolean;
    updates: boolean;
    calendar: boolean;
  };
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  isLoading: boolean;
  error: string | null;
  userPreferences: UserPreferences;
}

export interface ChatActions {
  addMessage: (message: Message) => void;
  setIsTyping: (isTyping: boolean) => void;
  setChatError: (error: string | null) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
}

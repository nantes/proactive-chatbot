import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Chat } from '../Chat';
import '@testing-library/jest-dom';

// Mock services
jest.mock('../../services/aiService', () => ({
  getInstance: jest.fn().mockReturnValue({
    generateResponse: jest.fn(),
    generateNotification: jest.fn(),
    generateReminder: jest.fn(),
    generateCalendarEvent: jest.fn()
  })
}));

jest.mock('../../services/reminderService', () => ({
  getInstance: jest.fn().mockReturnValue({
    addReminder: jest.fn(),
    addCalendarEvent: jest.fn()
  })
}));

// Mock useChat hook
const mockAddMessage = jest.fn();
const mockDeleteReminder = jest.fn();
const mockDeleteCalendarEvent = jest.fn();

jest.mock('../../hooks/useChat', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: [],
    reminders: [],
    calendarEvents: [],
    addMessage: mockAddMessage,
    deleteReminder: mockDeleteReminder,
    deleteCalendarEvent: mockDeleteCalendarEvent,
    isTyping: false,
    error: null,
    setIsTyping: jest.fn(),
    setChatError: jest.fn()
  }))
}));

describe('Chat Component', () => {
  let container: HTMLElement;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    container.remove();
  });

  it('renders chat interface correctly', () => {
    render(<Chat />, { container });

    // Check tabs
    const chatTab = screen.getByText('Chat');
    const remindersTab = screen.getByText('Reminders');
    const calendarTab = screen.getByText('Calendar');
    expect(chatTab).toBeInTheDocument();
    expect(remindersTab).toBeInTheDocument();
    expect(calendarTab).toBeInTheDocument();

    // Check input and send button
    const inputElement = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });
    expect(inputElement).toBeInTheDocument();
    expect(sendButton).toBeInTheDocument();
  });

  it('handles user message input and sending', async () => {
    render(<Chat />, { container });

    const inputElement = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByRole('button', { name: /send/i });

    // Type message
    fireEvent.change(inputElement, { target: { value: 'Hola, recuérdame algo' } });
    expect(inputElement).toHaveValue('Hola, recuérdame algo');

    // Click send button
    fireEvent.click(sendButton);

    await waitFor(() => {
      expect(mockAddMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'Hola, recuérdame algo',
          sender: 'user',
          type: 'text'
        })
      );
    });
  });

  it('handles tab switching', () => {
    render(<Chat />, { container });

    const remindersTab = screen.getByText('Reminders');
    const calendarTab = screen.getByText('Calendar');

    fireEvent.click(remindersTab);
    expect(screen.getByText('Reminders')).toBeInTheDocument();

    fireEvent.click(calendarTab);
    expect(screen.getByText('Calendar')).toBeInTheDocument();
  });
});

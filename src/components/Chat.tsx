import React from 'react';
import { useState } from 'react';
import { Box, Paper, Typography, TextField, IconButton, Tabs, Tab, CircularProgress } from '@mui/material';
import { Send as SendIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useChat } from '../hooks/useChat';
import type { Message } from '../types/chat';

export interface ChatProps {
}

export const Chat: React.FC<ChatProps> = () => {
  const [chatState, chatActions] = useChat();
  const [inputValue, setInputValue] = useState('');
  const [tabValue, setTabValue] = useState(0);

  if (chatState.error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#ffebee',
        color: '#c62828',
        border: '1px solid #ffcdd2',
        borderRadius: '4px',
        maxWidth: '600px',
        margin: '20px auto',
        textAlign: 'center'
      }}>
        <h2>Error en el componente Chat:</h2>
        <p>{chatState.error}</p>
      </div>
    );
  }

  if (chatState.isLoading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#f5f5f5',
        color: '#666',
        border: '1px solid #ddd',
        borderRadius: '4px',
        maxWidth: '600px',
        margin: '20px auto',
        textAlign: 'center'
      }}>
        <CircularProgress />
        <p>Cargando mensajes...</p>
      </div>
    );
  }

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDeleteReminder = (reminderId: string) => {
    chatActions.deleteReminder(reminderId);
  };

  const handleDeleteCalendarEvent = (eventId: string) => {
    chatActions.deleteCalendarEvent(eventId);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
      type: 'text',
      role: 'user',
    };

    setInputValue('');
    await chatActions.addMessage(newMessage);
  };



  return (
    <Box sx={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs value={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tab label="Chat" />
        <Tab label="Reminders" />
        <Tab label="Calendar" />
      </Tabs>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Chat" />
          <Tab label="Reminders" />
          <Tab label="Calendar" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {chatState.messages.map((message) => (
              <Paper
                key={message.id}
                sx={{
                  p: 2,
                  bgcolor: message.sender === 'user' ? 'primary.light' : 'background.paper',
                  alignSelf: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  width: 'fit-content',
                  maxWidth: '80%',
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
            ))}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            {chatState.reminders?.map((reminder) => (
              <Paper key={reminder.id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{reminder.title}</Typography>
                    <Typography variant="caption">{reminder.date}</Typography>
                  </Box>
                  <IconButton onClick={() => handleDeleteReminder(reminder.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {tabValue === 2 && (
          <Box>
            {chatState.calendarEvents?.map((event) => (
              <Paper key={event.id} sx={{ p: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body1">{event.title}</Typography>
                    <Typography variant="caption">{event.start} - {event.end}</Typography>
                  </Box>
                  <IconButton onClick={() => handleDeleteCalendarEvent(event.id)}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      <Box sx={{ display: 'flex', p: 2, borderTop: 1, borderColor: 'divider' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
        />
        <IconButton onClick={handleSend} sx={{ ml: 2 }}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

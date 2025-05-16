import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../hooks/useChat';
import type { Message } from '../types/chat';

interface ChatProps {
  initialMessages?: Message[];
}

export const Chat: React.FC<ChatProps> = ({ initialMessages = [] }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [chatState, chatActions] = useChat();

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        content: message,
        sender: 'user',
        timestamp: new Date().toISOString(),
        type: 'text',
      };

      await chatActions.addMessage(newMessage);
      setInputMessage('');
    } catch (err) {
      console.error('Error sending message:', err);
      chatActions.setChatError('Error al enviar el mensaje');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(inputMessage);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 800, mx: 'auto', p: 2 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Chat Proactivo
        </Typography>
        <Box sx={{ height: 400, overflowY: 'auto', mb: 2 }}>
          {chatState.messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                mb: 2,
                display: 'flex',
                flexDirection: message.sender === 'user' ? 'row' : 'row-reverse',
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#fff',
                }}
              >
                <Typography>{message.content}</Typography>
                <Typography variant="caption" sx={{ mt: 1 }}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </Typography>
              </Paper>
            </Box>
          ))}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Escribe tu mensaje..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={chatState.isTyping}
          />
          <IconButton
            color="primary"
            onClick={() => handleSendMessage(inputMessage)}
            disabled={chatState.isTyping || !inputMessage.trim()}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

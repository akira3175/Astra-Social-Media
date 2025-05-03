import React from 'react';
import { Box, Typography, Avatar, Paper } from '@mui/material';
import { AttachFile, Description } from '@mui/icons-material';
import type { Message } from '../../../types/message';
import { alpha } from '@mui/material/styles';
import MessageService from '../../../services/messageService';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  showAvatar: boolean;
  avatar?: string;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  showAvatar,
  avatar
}) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const renderAttachment = () => {
    if (!message.fileUrl) return null;

    const handleFileClick = async (e: React.MouseEvent) => {
      e.preventDefault();
      if (message.fileUrl) {
        try {
          const token = localStorage.getItem('accessToken');
          if (!token) {
            console.error('No access token found');
            return;
          }

          const response = await MessageService.downloadFile(message.fileUrl);

          if (!response) {
            throw new Error('Download failed');
          }

          const blob = new Blob([response], { type: response.type });

          const url = window.URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = url;
          link.download = message.fileName || 'file';
          document.body.appendChild(link);
          link.click();

          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Error downloading file:', error);
        }
      }
    };

    switch (message.attachmentType) {
      case 'image':
        return (
          <Box
            component="img"
            src={message.fileUrl}
            alt={message.fileName || 'Image'}
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: 1,
              mt: 1,
              objectFit: 'contain',
              cursor: 'pointer',
              '&:hover': {
                opacity: 0.9
              }
            }}
            onClick={(e) => {
              e.preventDefault();
              window.open(message.fileUrl, '_blank');
            }}
          />
        );
      case 'video':
        return (
          <Box
            component="video"
            src={message.fileUrl}
            controls
            sx={{
              maxWidth: '100%',
              maxHeight: '300px',
              borderRadius: 1,
              mt: 1
            }}
          />
        );
      case 'document':
        return (
          <Box
            onClick={handleFileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              mt: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <Description fontSize="small" />
            <Typography variant="body2" noWrap>
              {message.fileName || 'Document'}
            </Typography>
          </Box>
        );
      default:
        return (
          <Box
            onClick={handleFileClick}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1,
              mt: 1,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.2)
              }
            }}
          >
            <AttachFile fontSize="small" />
            <Typography variant="body2" noWrap>
              {message.fileName || 'File'}
            </Typography>
          </Box>
        );
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isCurrentUser ? 'flex-end' : 'flex-start',
        mb: 1,
        maxWidth: '70%',
        ml: isCurrentUser ? 'auto' : 0,
        mr: isCurrentUser ? 0 : 'auto'
      }}
    >
      {showAvatar && (
        <Avatar
          src={avatar}
          alt="Avatar"
          sx={{
            width: 32,
            height: 32,
            mb: 0.5,
            alignSelf: isCurrentUser ? 'flex-end' : 'flex-start'
          }}
        />
      )}
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          borderRadius: 2,
          bgcolor: (theme) =>
            isCurrentUser
              ? alpha(theme.palette.primary.main, 0.1)
              : alpha(theme.palette.grey[300], 0.5),
          position: 'relative',
          maxWidth: '100%'
        }}
      >
        {message.text && (
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          >
            {message.text}
          </Typography>
        )}
        {renderAttachment()}
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            mt: 0.5,
            textAlign: 'right',
            color: 'text.secondary'
          }}
        >
          {formatTime(message.timestamp)}
        </Typography>
      </Paper>
    </Box>
  );
};

export default MessageBubble;

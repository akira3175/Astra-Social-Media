import { Dialog, DialogContent, IconButton, DialogTitle, Box, TextField, Avatar, Button, Divider } from '@mui/material';
import { Close as CloseIcon, Image, Send } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useCurrentUser } from '../../../contexts/currentUserContext';
import { usePostStore } from '../../../stores/postStore';
import { uploadToCloudinary } from '../../../utils/uploadUtils';

const CreatePostModal = () => {
  const navigate = useNavigate();
  const [content, setContent] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { currentUser } = useCurrentUser();
  const { addPost } = usePostStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    navigate('/');
  };

  const handleCreatePost = async () => {
    if (!content.trim() && selectedFiles.length === 0) return;

    setIsUploading(true);
    try {
      const cloudinaryUrls = await uploadToCloudinary(selectedFiles);
      await addPost(content, cloudinaryUrls);
      navigate('/');
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveSelectedImage = (indexToRemove: number) => {
    setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
  };

  return (
    <Dialog
      open={true}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: 'background.paper',
        }
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Tạo bài viết mới
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}>
          <Avatar src={currentUser?.avatar} sx={{ mr: 1.5, mt: 1 }} />
          <TextField
            fullWidth
            placeholder="Bạn đang nghĩ gì?"
            multiline
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
        </Box>

        {selectedFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {selectedFiles.map((file, index) => (
              <Box
                key={index}
                sx={{ position: 'relative', width: 100, height: 100 }}
              >
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Preview ${index}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemoveSelectedImage(index)}
                  sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'background.paper' },
                  }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            startIcon={<Image />}
            onClick={handleImageClick}
            disabled={isUploading}
          >
            Thêm ảnh
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleCreatePost}
            disabled={isUploading || (!content.trim() && selectedFiles.length === 0)}
          >
            {isUploading ? 'Đang đăng...' : 'Đăng bài'}
          </Button>
        </Box>

        <input
          type="file"
          accept="image/*"
          multiple
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreatePostModal;
"use client";

import type React from "react";
import { useState, useRef } from "react"; 
import { Avatar, Box, Button, Card, CardContent, CircularProgress, Divider, IconButton, type SxProps, TextField, type Theme } from "@mui/material"; // Import CircularProgress and IconButton
import { Close as CloseIcon, Image, Send } from "@mui/icons-material"; // Import CloseIcon
import { useCurrentUser } from "../../../contexts/currentUserContext";
import { usePostStore } from "../../../stores/postStore";
import { uploadToCloudinary } from '../../../utils/uploadUtils';

interface CreatePostProps {
  className?: string;
  sx?: SxProps<Theme>;
}

const CreatePost: React.FC<CreatePostProps> = ({ className, sx }) => {
  const [content, setContent] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]); 
  const [isUploading, setIsUploading] = useState<boolean>(false); 
  const { currentUser } = useCurrentUser() ?? {};
  const { addPost, fetchPostsByUserEmail } = usePostStore(); // Thêm fetchPostsByUserEmail
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleCreatePost = async () => {
    if (!content.trim()) return;

    setIsUploading(true);
    try {
      const cloudinaryUrls = await uploadToCloudinary(selectedFiles);
      
      // Thêm post mới
      await addPost(content, cloudinaryUrls);
      
      // Fetch lại posts của user hiện tại
      if (currentUser?.email) {
        await fetchPostsByUserEmail(currentUser.email);
      }
      
      setContent("");
      setSelectedFiles([]);
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
      setSelectedFiles(prevFiles => [...prevFiles, ...Array.from(files)]); // Append new files to existing files
      if (event.target) {
        event.target.value = ''; // Reset input value to allow re-selecting same files
      }
    }
  };

  const handleRemoveSelectedImage = (indexToRemove: number) => {
    setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
  };


  return (
    <Card className={className} sx={sx}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar src={currentUser?.avatar} sx={{ mr: 1.5 }} />
          <TextField
            fullWidth
            placeholder="Bạn đang nghĩ gì?"
            multiline
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            variant="outlined"
          />
        </Box>

        {/* Image preview area */}
        {selectedFiles.length > 0 && (
          <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', mt: 2 }}>
            {selectedFiles.map((file, index) => (
              <Box key={index} sx={{ position: 'relative', width: 100, height: 100, mr: 1, mb: 1, overflow: 'hidden', borderRadius: 1, border: '1px solid #ccc' }}>
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <IconButton 
                  aria-label="remove image" 
                  size="small" 
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'rgba(255,255,255,0.8)' }}
                  onClick={() => handleRemoveSelectedImage(index)} 
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              </Box>
            ))}
          </Box>
        )}

        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex" }}>
            <Button startIcon={<Image />} sx={{ mr: 1, textTransform: "none" }} onClick={handleImageClick}>
              Ảnh/Video
            </Button>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />
          </Box>
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleCreatePost}
            disabled={!content.trim() || isUploading} 
            sx={{
              bgcolor: "#4f46e5",
              "&:hover": { bgcolor: "#4338ca" },
              textTransform: "none",
            }}
          >
            {isUploading ? <CircularProgress size={24} color="inherit" /> : "Đăng"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePost;

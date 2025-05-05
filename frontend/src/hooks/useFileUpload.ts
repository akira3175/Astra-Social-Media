import { useState } from 'react'
import axios from 'axios'

export const useFileUpload = () => {
    const [isUploading, setIsUploading] = useState(false)

    const handleFileUpload = async (file: File) => {
        setIsUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            return response.data.url
        } catch (error) {
            console.error('Error uploading file:', error)
            throw error
        } finally {
            setIsUploading(false)
        }
    }

    return {
        handleFileUpload,
        isUploading
    }
} 
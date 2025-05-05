import { useState, useCallback } from 'react'

export const useEmojiPicker = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const handleEmojiClick = useCallback((emoji: any) => {
        setShowEmojiPicker(false)
        return emoji.native
    }, [])

    const toggleEmojiPicker = useCallback(() => {
        setShowEmojiPicker(prev => !prev)
    }, [])

    return {
        showEmojiPicker,
        handleEmojiClick,
        toggleEmojiPicker
    }
} 
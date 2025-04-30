import { useState, useCallback } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

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
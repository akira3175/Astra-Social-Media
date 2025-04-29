import { useState } from 'react'
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'

export const useEmojiPicker = () => {
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const handleEmojiClick = (emoji: any) => {
        return emoji.native
    }

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(prev => !prev)
    }

    return {
        showEmojiPicker,
        handleEmojiClick,
        toggleEmojiPicker
    }
} 
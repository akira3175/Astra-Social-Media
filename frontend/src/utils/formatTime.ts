export const formatTime = (timestamp: string | number[]) => {
    try {
        if (!timestamp) {
            return "00:00"
        }

        let date: Date
        if (Array.isArray(timestamp)) {
            // Xử lý timestamp dạng mảng [year, month, day, hour, minute]
            if (timestamp.length === 5) {
                date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4])
            }
            // Xử lý timestamp dạng mảng [year, month, day, hour, minute, second]
            else if (timestamp.length === 6) {
                date = new Date(timestamp[0], timestamp[1] - 1, timestamp[2], timestamp[3], timestamp[4], timestamp[5])
            } else {
                console.error('Invalid timestamp array length:', timestamp)
                return "00:00"
            }
        } else {
            // Xử lý timestamp dạng chuỗi ISO
            date = new Date(timestamp)
        }

        if (isNaN(date.getTime())) {
            console.error('Invalid timestamp:', timestamp)
            return "00:00"
        }

        const now = new Date()
        const messageDate = date

        // Nếu tin nhắn được gửi trong cùng ngày
        if (messageDate.toDateString() === now.toDateString()) {
            return messageDate.toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
        // Nếu tin nhắn được gửi trong cùng tuần
        else if (now.getTime() - messageDate.getTime() <= 7 * 24 * 60 * 60 * 1000) {
            return messageDate.toLocaleDateString('vi-VN', {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
        // Nếu tin nhắn được gửi trước đó
        else {
            return messageDate.toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
            })
        }
    } catch (error) {
        console.error('Error formatting time:', error, 'Timestamp:', timestamp)
        return "00:00"
    }
} 
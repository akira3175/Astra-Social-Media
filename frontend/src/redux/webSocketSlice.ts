// src/redux/webSocketSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketState {
  messages: string[];
  connected: boolean;
  error: string | null; // Thêm field error vào state
}

const initialState: WebSocketState = {
  messages: [],
  connected: false,
  error: null, // Giá trị mặc định là null
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<string>) => {
      state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => { // Thêm reducer setError
      state.error = action.payload;
    },
  },
});

export const { setMessages, setConnectionStatus, setError } = webSocketSlice.actions; // Export setError
export default webSocketSlice.reducer;

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WebSocketMessage {
  type: string;
  content: string;
}

interface WebSocketState {
  messages: WebSocketMessage[];
  connected: boolean;
  error: string | null;
}

const initialState: WebSocketState = {
  messages: [],
  connected: false,
  error: null,
};

const webSocketSlice = createSlice({
  name: 'webSocket',
  initialState,
  reducers: {
    setMessages: (state, action: PayloadAction<WebSocketMessage>) => {
      state.messages.push(action.payload);
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.connected = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },
});

export const { setMessages, setConnectionStatus, setError } = webSocketSlice.actions;
export default webSocketSlice.reducer;
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    loading: false,
    isLoading: false
};

export const loading = createSlice({
    name: 'loading',
    initialState: initialState,
    reducers: {
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setLoadingPanel: (state, action) => {
            state.isLoading = action.payload
        }
    },
});

export const { setLoading, setLoadingPanel } = loading.actions;

export default loading.reducer;

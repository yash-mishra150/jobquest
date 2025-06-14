import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SignupFlowState {
  currentStep: number;
  email: string;
  name: string;
  password: string;
  phone: string;
  userType: string;
  preferredJobType: string;
  preferredWorkMode: string;
  locationPreferences: string[];
  skills: string[];
  expectedSalaryRange: string;
  resume: string;
}

const initialState: SignupFlowState = {
  currentStep: 0,
  email: '',
  name: '',
  password: '',
  phone: '',
  userType: '',
  preferredJobType: '',
  preferredWorkMode: '',
  locationPreferences: [],
  skills: [],
  expectedSalaryRange: '',
  resume: '',
};

const signupFlowSlice = createSlice({
  name: 'signupFlow',
  initialState,
  reducers: {
    setField: (state, action: PayloadAction<Partial<SignupFlowState>>) => {
      return { ...state, ...action.payload };
    },
    setStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload;
    },
    resetSignupFlow: () => initialState,
  },
});

export const { setField, setStep, resetSignupFlow } = signupFlowSlice.actions;

export default signupFlowSlice.reducer;

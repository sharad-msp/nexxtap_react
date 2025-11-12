import api from '@/lib/axios';

export interface ForgotPasswordRequest {
  email: string;
  user_type: 'admin' | 'kds' | 'pos';
}

export interface ForgotPasswordResponse {
  status: number;
  message: string;
  data: {
    message: string;
    email: string;
  };
}

export interface VerifyEmailRequest {
  email: string;
}

export interface VerifyEmailResponse {
  status: number;
  message: string;
  data: {
    exists: boolean;
    email: string;
  };
}

export const forgotPasswordApi = {
  /**
   * Send forgot password request
   */
  forgotPassword: async (data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> => {
    const response = await api.post('/forgot-password/', data);
    return response.data;
  },

  /**
   * Verify if email exists in the system
   */
  verifyEmail: async (data: VerifyEmailRequest): Promise<VerifyEmailResponse> => {
    const response = await api.post('/forgot-password/verify-email', data);
    return response.data;
  }
};

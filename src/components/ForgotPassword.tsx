import { useState } from 'react';
import { Button } from '@/components/Button';
import { Form, FormInput } from '@/components/Form';
import { useToast } from '@/components';
import { forgotPasswordApi } from '@/api';
import { ArrowLeft, Mail, CheckCircle, AlertCircle } from 'lucide-react';

interface ForgotPasswordProps {
  userType: 'admin' | 'kds' | 'pos';
  onBack: () => void;
}

export const ForgotPassword = ({ userType, onBack }: ForgotPasswordProps) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (values: any, setFormErrors: (errors: Record<string, string>) => void) => {
    setLoading(true);

    try {
      const response = await forgotPasswordApi.forgotPassword({
        email: values.email,
        user_type: userType
      });

      if (response.status === 1) {
        setEmailSent(true);
        setEmail(values.email);
        showToast('success', 'Password reset email sent successfully!');
      } else {
        showToast('error', response.message || 'Failed to send password reset email');
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      
      if (error.response?.data?.errors) {
        const errorData = error.response.data.errors;
        const formattedErrors: Record<string, string> = {};
        
        Object.keys(errorData).forEach(key => {
          const errorArray = errorData[key];
          if (Array.isArray(errorArray) && errorArray.length > 0) {
            formattedErrors[key] = errorArray[0];
          } else if (typeof errorArray === 'string') {
            formattedErrors[key] = errorArray;
          }
        });
        
        setFormErrors(formattedErrors);
      } else {
        const errorMessage = error.response?.data?.message || 'Failed to send password reset email';
        showToast('error', errorMessage);
        setFormErrors({ email: errorMessage });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setEmailSent(false);
    setEmail('');
    onBack();
  };

  if (emailSent) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Check Your Email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We've sent a new password to your email address
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4 p-3 bg-gray-50 rounded-lg">
              <Mail className="h-6 w-6 text-indigo-600 mr-3" />
              <span className="text-lg font-medium text-gray-900 break-all">{email}</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Please check your email for the new password. You can change it after logging in.
            </p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-green-800 mb-2">Success!</h4>
                <p className="text-sm text-green-700">
                  Your password reset email has been sent successfully.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 mb-2">Important:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• This is a temporary password</li>
                  <li>• Please change it after logging in</li>
                  <li>• Do not share this password with anyone</li>
                  <li>• Check your spam folder if you don't see the email</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleBackToLogin}
              className="w-full"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
            >
              Back to Login
            </Button>
            
            <button
              onClick={() => setEmailSent(false)}
              className="w-full text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              Try a different email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100">
          <Mail className="h-6 w-6 text-indigo-600" />
        </div>
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
          Forgot Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your email address and we'll send you a new password
        </p>
      </div>

      <Form
        onSubmit={handleSubmit}
        submitText={loading ? "Sending..." : "Send New Password"}
        cancelText="Back to Login"
        onCancel={onBack}
        showCancel
        loading={loading}
        initialValues={{ email }}
      >
        <div className="space-y-4">
          <FormInput
            name="email"
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            required
            autoComplete="email"
            autoFocus
            disabled={loading}
          />
        </div>
      </Form>
    </div>
  );
};

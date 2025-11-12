import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button, Input, ForgotPassword } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useToast } from '@/components/Toast';

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const { showToast } = useToast();
  
  usePageTitle({ title: 'Login' });
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    const newErrors: Record<string, string> = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await login(formData, showToast);
      navigate('/dashboard');
    } catch (error: any) {
      // Error toast is already handled in the login function
      // No need to set general error since Toast handles it
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleForgotPassword = () => {
    setShowForgotPassword(true);
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
  };

  // Show forgot password component if needed
  if (showForgotPassword) {
    return <ForgotPassword userType="admin" onBack={handleBackToLogin} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(value) => handleInputChange('email', value)}
        placeholder="Enter your email"
        error={errors.email}
        leftIcon={<Mail className="h-4 w-4" />}
        required
      />

      <Input
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={(value) => handleInputChange('password', value)}
        placeholder="Enter your password"
        error={errors.password}
        leftIcon={<Lock className="h-4 w-4" />}
        rightIcon={showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        onRightIconClick={() => setShowPassword(!showPassword)}
        required
      />

      <div className="flex items-center justify-between">
        <div></div>
        <button
          type="button"
          onClick={handleForgotPassword}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Forgot your password?
        </button>
      </div>

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}

import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoginFormHeader } from './LoginFormHeader';
import { LoginFormFields } from './LoginFormFields';
import { validateCompanyName, validateAccessCode } from '../../utils/validation';

export function LoginFormContent() {
  const [companyName, setCompanyName] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);

  const validateForm = (): string | null => {
    const nameError = validateCompanyName(companyName);
    if (nameError) return nameError;

    const codeError = validateAccessCode(accessCode);
    if (codeError) return codeError;

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      await login(companyName.trim(), accessCode.trim().toUpperCase());
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An unexpected error occurred. Please try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccessCodeChange = (value: string) => {
    // Only allow alphanumeric characters
    const sanitized = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    setAccessCode(sanitized);
  };

  return (
    <>
      <LoginFormHeader />
      <LoginFormFields
        companyName={companyName}
        accessCode={accessCode}
        error={error}
        isLoading={isLoading}
        onCompanyNameChange={setCompanyName}
        onAccessCodeChange={handleAccessCodeChange}
        onSubmit={handleSubmit}
      />
    </>
  );
}
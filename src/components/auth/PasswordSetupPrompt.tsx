/**
 * Password Setup Prompt
 * Automatically detects temporary users and prompts them to set up a password
 * Used as a wrapper in the app to show modal for magic link users
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PasswordSetupModal } from './PasswordSetupModal';

interface PasswordSetupPromptProps {
  children: React.ReactNode;
}

export const PasswordSetupPrompt: React.FC<PasswordSetupPromptProps> = ({ children }) => {
  const { user, setupPassword } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [hasBeenPrompted, setHasBeenPrompted] = useState(false);

  useEffect(() => {
    // Check if user is temporary and hasn't been prompted yet in this session
    if (user && user.isTemporary && !user.hasPassword && !hasBeenPrompted) {
      // Show modal after a brief delay for better UX
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [user, hasBeenPrompted]);

  const handleSetupComplete = async (password: string) => {
    try {
      await setupPassword(password);
      setShowModal(false);
      setHasBeenPrompted(true);

      // Show success message
      console.log('Password setup successful!');
    } catch (error) {
      // Error will be handled by the modal
      throw error;
    }
  };

  const handleSkip = () => {
    setShowModal(false);
    setHasBeenPrompted(true); // Don't show again this session
  };

  return (
    <>
      {children}
      {user && user.email && (
        <PasswordSetupModal
          isOpen={showModal}
          userEmail={user.email}
          onSetupComplete={handleSetupComplete}
          onSkip={handleSkip}
          canSkip={true}
        />
      )}
    </>
  );
};

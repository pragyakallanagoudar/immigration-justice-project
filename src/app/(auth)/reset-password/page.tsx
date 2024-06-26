'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '@/api/supabase/createClient';
import { verifyNewPassword } from '@/api/supabase/queries/password';
import { BigBlueButton } from '@/components/Buttons';
import PasswordComplexity from '@/components/PasswordComplexity';
import TextInput from '@/components/TextInput/index';
import COLORS from '@/styles/colors';
import { Flex, SmallCardForm } from '@/styles/containers';
import { H1, H4, P } from '@/styles/text';
import { useAuth } from '@/utils/AuthProvider';

export default function ResetPassword() {
  const auth = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [canReset, setCanReset] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordComplexity, setPasswordComplexity] = useState(false);
  const { push } = useRouter();

  useEffect(() => {
    supabase.auth.onAuthStateChange(async event => {
      if (event === 'PASSWORD_RECOVERY') {
        setCanReset(true);
      }
    });
  }, []);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!passwordComplexity) {
      setErrorMessage('Password must meet complexity requirements.');
      return;
    }
    if (newPassword !== newPassword2) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (await verifyNewPassword(newPassword)) {
      setErrorMessage('New password must be different from the old password.');
      return;
    }
    setErrorMessage('');
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setErrorMessage('Something went wrong. Please try again later.');
    } else {
      const signOutError = await auth?.signOut();
      if (signOutError) {
        throw new Error(
          `An error occurred trying to sign out: ${signOutError.message}`,
        );
      }
      push('/confirm-reset-password');
    }
  };

  return canReset ? (
    <SmallCardForm onSubmit={handleResetPassword}>
      <Flex $direction="column" $gap="10px">
        <H1>Set New Password</H1>
        {errorMessage !== '' && <P $color={COLORS.redMid}>{errorMessage}</P>}
      </Flex>
      <Flex $direction="column" $gap="20px">
        <Flex $direction="column" $gap="8px">
          <TextInput
            label="New Password"
            placeholder="Password"
            type="password"
            id="newpass"
            value={newPassword}
            setValue={setNewPassword}
          />
          <PasswordComplexity
            password={newPassword}
            setComplexity={setPasswordComplexity}
          />
        </Flex>
        <TextInput
          label="Confirm New Password"
          placeholder="Password"
          type="password"
          id="confirmnewpass"
          value={newPassword2}
          setValue={setNewPassword2}
        />
      </Flex>
      <BigBlueButton type="submit">
        <H4 $color="white">Set Password</H4>
      </BigBlueButton>
    </SmallCardForm>
  ) : null;
}

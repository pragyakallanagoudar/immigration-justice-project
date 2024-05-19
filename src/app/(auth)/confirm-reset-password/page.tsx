'use client';

import { BigBlueLinkButton } from '@/components/Buttons';
import { Flex, SmallCard } from '@/styles/containers';
import { H2, H4 } from '@/styles/text';

export default function ConfirmResetPassword() {
  return (
    <SmallCard>
      <Flex $direction="column" $gap="20px">
        <H2>Your password has been reset.</H2>
        <BigBlueLinkButton href="/login">
          <H4 $color="white">Go to Log In</H4>
        </BigBlueLinkButton>
      </Flex>
    </SmallCard>
  );
}

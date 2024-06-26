'use client';

import { useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { BigBlueButton, BigButton } from '@/components/Buttons';
import DateInput from '@/components/DateInput';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/Form';
import Icon from '@/components/Icon';
import RadioGroup from '@/components/RadioGroup';
import { legalFellowCredentialSchema } from '@/data/formSchemas';
import { CardForm, Flex } from '@/styles/containers';
import { H1Centered } from '@/styles/text';
import {
  formatTruthy,
  getCurrentDate,
  identity,
  parseDateAlt,
  parseDateString,
} from '@/utils/helpers';
import {
  useGuardedOnboarding,
  useOnboardingNavigation,
  useScrollToTop,
} from '@/utils/hooks';
import * as Styles from '../styles';

export default function Page() {
  const onboarding = useGuardedOnboarding();
  const { backlinkHref, ebbTo, pageProgress } = useOnboardingNavigation();
  const { push } = useRouter();

  // scroll to top
  useScrollToTop();

  const [expectedBarDate, setExpectedBarDate] = useState<string>(
    onboarding.profile.expected_bar_date
      ? parseDateAlt(onboarding.profile.expected_bar_date)
      : '',
  );

  // initialize form with values from onboarding context
  const form = useForm<z.infer<typeof legalFellowCredentialSchema>>({
    resolver: zodResolver(legalFellowCredentialSchema),
    defaultValues: {
      expectedBarDate: onboarding.profile.expected_bar_date
        ? onboarding.profile.expected_bar_date
        : undefined,
      eoirRegistered: onboarding.profile.eoir_registered ?? undefined,
    },
  });

  const formValues = form.watch();
  const isEmpty = useMemo(
    () =>
      formValues.expectedBarDate === undefined ||
      formValues.eoirRegistered === undefined,
    [formValues],
  );

  // update form submitter and dirty state
  const { setForm: setOnboardingForm } = onboarding;
  const { isDirty, isValid } = form.formState;
  useEffect(() => {
    setOnboardingForm({
      trigger: form.handleSubmit(identity),
      isDirty,
      isValid,
    });
  }, [setOnboardingForm, form, isDirty, isValid]);

  const onValidSubmit = () => {
    push(`/onboarding/${onboarding.flow[pageProgress + 1].url}`);
    onboarding.setForm(undefined);
  };

  return (
    <FormProvider {...form}>
      {/* noValidate to prevent default HTML invalid input pop-up */}
      <CardForm onSubmit={form.handleSubmit(onValidSubmit)} noValidate>
        <Styles.BackLinkButton
          type="button"
          onClick={() => ebbTo(backlinkHref)}
        >
          <Icon type="leftArrow" />
        </Styles.BackLinkButton>

        <Styles.RequiredText>Required Fields</Styles.RequiredText>

        <H1Centered>Legal Credentials</H1Centered>

        <Styles.FormFieldsContainer>
          <FormField
            control={form.control}
            name="expectedBarDate"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>When are you expected to be barred?</FormLabel>
                <FormControl>
                  <DateInput
                    error={fieldState.error?.message}
                    min={parseDateAlt(getCurrentDate())}
                    value={expectedBarDate}
                    setValue={setExpectedBarDate}
                    onChange={newValue => {
                      // turn "" into undefined (cannot be parsed to date)
                      if (!newValue) {
                        field.onChange(undefined);
                        onboarding.updateProfile({
                          expected_bar_date: undefined,
                        });
                        return;
                      }

                      const newDate = parseDateString(newValue);
                      field.onChange(newDate);
                      onboarding.updateProfile({
                        expected_bar_date: newDate,
                      });
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eoirRegistered"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel>
                  Are you registered by the Executive Office of Immigration
                  Review?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    name="registered"
                    defaultValue={formatTruthy(
                      field.value,
                      'Yes',
                      'No',
                      undefined,
                    )}
                    options={['Yes', 'No']}
                    error={fieldState.error ? undefined : ''}
                    onChange={newValue => {
                      const bool = newValue === 'Yes';
                      onboarding.updateProfile({ eoir_registered: bool });
                      field.onChange(bool);
                    }}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Flex $gap="40px">
            <BigButton type="button" onClick={() => ebbTo(backlinkHref)}>
              Back
            </BigButton>
            <BigBlueButton type="submit" disabled={isEmpty}>
              Continue
            </BigBlueButton>
          </Flex>
        </Styles.FormFieldsContainer>
      </CardForm>
    </FormProvider>
  );
}

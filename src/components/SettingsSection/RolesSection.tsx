import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { z } from 'zod';
import { usStates } from '@/data/citiesAndStates';
import {
  CHAR_LIMIT_MSG,
  FormRoleEnum,
  roleAndLegalSchema,
} from '@/data/formSchemas';
import { roleOptions } from '@/data/roles';
import { Box } from '@/styles/containers';
import { H3 } from '@/styles/text';
import { Profile, ProfileRole } from '@/types/schema';
import {
  capitalize,
  formatEnumeration,
  formatTruthy,
  getCurrentDate,
  parseDate,
  parseDateAlt,
  parseDateString,
  timestampStringToDate,
} from '@/utils/helpers';
import { useProfileAuth } from '@/utils/hooks';
import { SettingField, SettingSection } from '.';
import DateInput from '../DateInput';
import { FormMessage } from '../Form';
import InputDropdown from '../InputDropdown';
import RadioGroup from '../RadioGroup';
import TextAreaInput from '../TextAreaInput';
import TextInput from '../TextInput';

const getFormDefaults = (
  roles: ProfileRole[],
  profile: Partial<Profile>,
): Partial<z.infer<typeof roleAndLegalSchema>> => {
  const roleList = roles.map(role => role.role);
  const isAttorney = roleList.includes('ATTORNEY');
  const isLegalFellow = roleList.includes('LEGAL_FELLOW');
  const isInterpreter = roleList.includes('INTERPRETER');

  let defaultRole: FormRoleEnum = '';
  if (isInterpreter) defaultRole = 'INTERPRETER';
  if (isAttorney) defaultRole = 'ATTORNEY';
  if (isLegalFellow) defaultRole = 'LEGAL_FELLOW';
  if (isAttorney && isInterpreter) defaultRole = 'ATTORNEY,INTERPRETER';
  if (isLegalFellow && isInterpreter) defaultRole = 'LEGAL_FELLOW,INTERPRETER';

  const defaultValue: Partial<z.infer<typeof roleAndLegalSchema>> = {
    barNumber: profile.bar_number,
    eoirRegistered: profile.eoir_registered,
    expectedBarDate: profile.expected_bar_date
      ? new Date(profile.expected_bar_date)
      : undefined,
    stateBarred: profile.state_barred,
    roles: defaultRole,
    barred: profile.has_bar_number,
    legalCredentialComment: profile.legal_credential_comment,
  };

  return defaultValue;
};

const getDateDefault = (profile: Partial<Profile>): string =>
  profile.expected_bar_date
    ? parseDateAlt(timestampStringToDate(profile.expected_bar_date))
    : '';

export default function RolesSection() {
  const { profile, auth } = useProfileAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [commentError, setCommentError] = useState('');

  const [expectedBarDate, setExpectedBarDate] = useState<string>(
    getDateDefault(profile.profileData ?? {}),
  );

  const form = useForm<z.infer<typeof roleAndLegalSchema>>({
    resolver: zodResolver(roleAndLegalSchema),
    defaultValues: getFormDefaults(profile.roles, profile.profileData ?? {}),
  });

  const onValidSubmit = async (values: z.infer<typeof roleAndLegalSchema>) => {
    const { userId } = auth;
    if (!userId) throw new Error('User ID not found! Are you logged in?');

    // parse roles to update into array
    // nasty boolean checking to ensure type safety
    const rolesToUpdate: ProfileRole[] = [];

    const isAttorney =
      values.roles === 'ATTORNEY' || values.roles === 'ATTORNEY,INTERPRETER';
    const isLegalFellow =
      values.roles === 'LEGAL_FELLOW' ||
      values.roles === 'LEGAL_FELLOW,INTERPRETER';
    const isInterpreter =
      values.roles === 'INTERPRETER' ||
      values.roles === 'ATTORNEY,INTERPRETER' ||
      values.roles === 'LEGAL_FELLOW,INTERPRETER';

    if (isAttorney) rolesToUpdate.push({ role: 'ATTORNEY', user_id: userId });
    if (isLegalFellow)
      rolesToUpdate.push({ role: 'LEGAL_FELLOW', user_id: userId });
    if (isInterpreter)
      rolesToUpdate.push({ role: 'INTERPRETER', user_id: userId });

    await Promise.all([
      profile.updateProfile({
        state_barred: isAttorney ? values.stateBarred : null,
        bar_number: isAttorney ? values.barNumber : null,
        eoir_registered:
          isAttorney || isLegalFellow ? values.eoirRegistered : null,
        expected_bar_date: isLegalFellow ? values.expectedBarDate : null,
        legal_credential_comment: isAttorney
          ? values.legalCredentialComment
          : null,
        has_bar_number: isAttorney ? values.barred : null,
      }),
      profile.setRoles(rolesToUpdate),
    ]);

    setIsEditing(false);
  };

  const { roles, barred } = form.watch();
  const isAttorney = roles === 'ATTORNEY' || roles === 'ATTORNEY,INTERPRETER';
  const isLegalFellow =
    roles === 'LEGAL_FELLOW' || roles === 'LEGAL_FELLOW,INTERPRETER';

  const handleRoleUpdate = (newRole: FormRoleEnum, oldRole: FormRoleEnum) => {
    if (newRole === 'INTERPRETER' || oldRole === 'INTERPRETER') {
      form.reset({
        barNumber: undefined,
        eoirRegistered: undefined,
        expectedBarDate: undefined,
        stateBarred: undefined,
        roles: newRole,
      });
      setExpectedBarDate('');
      return;
    }

    const wasAttorney =
      oldRole === 'ATTORNEY' || oldRole === 'ATTORNEY,INTERPRETER';

    const wasLegalFellow =
      oldRole === 'LEGAL_FELLOW' || oldRole === 'LEGAL_FELLOW,INTERPRETER';

    const nowAttorney =
      newRole === 'ATTORNEY' || newRole === 'ATTORNEY,INTERPRETER';

    const nowLegalFellow =
      newRole === 'LEGAL_FELLOW' || newRole === 'LEGAL_FELLOW,INTERPRETER';

    if ((wasAttorney && nowLegalFellow) || (wasLegalFellow && nowAttorney)) {
      form.reset({
        barNumber: undefined,
        eoirRegistered: form.getValues('eoirRegistered'),
        expectedBarDate: undefined,
        stateBarred: undefined,
        roles: newRole,
      });
      setExpectedBarDate('');
    }
  };

  return (
    <Box>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onValidSubmit)}>
          <SettingSection
            title="Roles"
            canEdit
            isSubmitting={form.formState.isSubmitting}
            isEditing={isEditing}
            startEdit={() => setIsEditing(true)}
            cancelEdit={() => {
              setIsEditing(false);
              form.reset(
                getFormDefaults(profile.roles, profile.profileData ?? {}),
              );
              setExpectedBarDate(getDateDefault(profile.profileData ?? {}));
              setCommentError('');
            }}
          >
            <SettingField
              control={form.control}
              name="roles"
              label="Selected Roles"
              extractValue={v =>
                v
                  ? formatEnumeration(
                      v.split(',').map(role =>
                        role
                          .split('_')
                          .map(r => capitalize(r.toLowerCase()))
                          .join(' '),
                      ),
                    )
                  : ''
              }
              render={({ field, fieldState }) => (
                <>
                  <InputDropdown
                    error={!!fieldState.error}
                    onChange={v =>
                      handleRoleUpdate(v as FormRoleEnum, field.value)
                    }
                    options={roleOptions}
                    defaultValue={field.value}
                    placeholder="Click to select"
                  />
                  <FormMessage />
                </>
              )}
            />

            {isAttorney && (
              <>
                <H3>Attorney-Specific</H3>

                <SettingField
                  control={form.control}
                  name="stateBarred"
                  label="State Barred"
                  render={({ field, fieldState }) => (
                    <>
                      <InputDropdown
                        options={usStates}
                        error={!!fieldState.error}
                        onChange={field.onChange}
                        defaultValue={field.value ?? ''}
                        placeholder="Start typing to filter states..."
                      />
                      <FormMessage />
                    </>
                  )}
                />

                <SettingField
                  control={form.control}
                  name="barred"
                  label="Has Bar Number"
                  extractValue={v => formatTruthy(v, 'Yes', 'No', 'N/A')}
                  render={({ field, fieldState }) => (
                    <RadioGroup
                      name="barred"
                      defaultValue={formatTruthy(
                        field.value,
                        'Yes',
                        'No',
                        undefined,
                      )}
                      options={['Yes', 'No']}
                      error={fieldState.error?.message}
                      onChange={newValue => {
                        const bool = newValue === 'Yes';
                        const barNum = bool ? '' : 'N/A';
                        form.setValue('barNumber', barNum);
                        field.onChange(bool);
                      }}
                    />
                  )}
                />

                {barred && (
                  <SettingField
                    control={form.control}
                    name="barNumber"
                    label="Attorney Bar Number"
                    render={({ field, fieldState }) => (
                      <TextInput
                        errorText={fieldState.error?.message}
                        placeholder="123456"
                        type="text"
                        defaultValue={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                )}
              </>
            )}

            {isLegalFellow && (
              <>
                <H3>Legal Fellow-Specific</H3>

                <SettingField
                  control={form.control}
                  name="expectedBarDate"
                  label="Expected Bar Date"
                  extractValue={v => (v ? parseDate(v) : 'N/A')}
                  render={({ field, fieldState }) => (
                    <DateInput
                      error={fieldState.error?.message}
                      min={parseDateAlt(getCurrentDate())}
                      value={expectedBarDate}
                      setValue={setExpectedBarDate}
                      onChange={newValue => {
                        // turn "" into undefined (cannot be parsed to date)
                        if (!newValue) {
                          field.onChange(undefined);
                          return;
                        }

                        const newDate = parseDateString(newValue);
                        field.onChange(newDate);
                      }}
                    />
                  )}
                />
              </>
            )}

            {isAttorney || isLegalFellow ? (
              <SettingField
                control={form.control}
                name="eoirRegistered"
                label="EOIR Registration Status"
                extractValue={v =>
                  formatTruthy(v, 'Registered', 'Not Registered', 'N/A')
                }
                render={({ field, fieldState }) => (
                  <RadioGroup
                    name="registered"
                    defaultValue={formatTruthy(
                      field.value,
                      'Registered',
                      'Not Registered',
                      undefined,
                    )}
                    options={['Registered', 'Not Registered']}
                    error={fieldState.error?.message}
                    onChange={newValue => {
                      const bool = newValue === 'Registered';
                      field.onChange(bool);
                    }}
                  />
                )}
              />
            ) : null}

            {isAttorney && (
              <SettingField
                control={form.control}
                name="legalCredentialComment"
                label={
                  barred
                    ? 'Additional Information (optional)'
                    : 'Additional Information'
                }
                required={!barred}
                extractValue={v => v ?? 'N/A'}
                render={({ field, fieldState }) => (
                  <TextAreaInput
                    placeholder="There are some extenuating circumstances with..."
                    defaultValue={field.value ?? ''}
                    error={fieldState.error?.message ?? commentError}
                    onChange={newValue => {
                      setCommentError(
                        newValue.length > 400 ? CHAR_LIMIT_MSG : '',
                      );
                      field.onChange(newValue);
                    }}
                  />
                )}
              />
            )}
          </SettingSection>
        </form>
      </FormProvider>
    </Box>
  );
}

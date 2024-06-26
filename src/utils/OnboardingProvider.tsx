'use client';

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useCallback,
  useMemo,
  useState,
} from 'react';
import { UUID } from 'crypto';
import { FlowData } from '@/types/misc';
import {
  Profile,
  ProfileLanguage,
  ProfileRole,
  ProfileToUpload,
  RoleEnum,
} from '@/types/schema';
import { useAuth } from '@/utils/AuthProvider';
import { useProfile } from '@/utils/ProfileProvider';

export interface OnboardingFormData {
  trigger: () => Promise<void>;
  isDirty: boolean;
  isValid: boolean;
}

interface OnboardingContextType {
  profile: Partial<ProfileToUpload>;
  canReads: string[];
  canSpeaks: string[];
  roles: RoleEnum[];
  progress: number;
  flow: FlowData[];
  form?: OnboardingFormData;
  pushingData: boolean;
  setForm: Dispatch<SetStateAction<OnboardingFormData | undefined>>;
  updateProfile: (updateInfo: Partial<ProfileToUpload>) => void;
  removeFromProfile: (toClear: Array<keyof Profile>) => void;
  flushData: () => Promise<void>;
  setProgress: Dispatch<SetStateAction<number>>;
  setFlow: Dispatch<SetStateAction<FlowData[]>>;
  setCanReads: Dispatch<SetStateAction<string[]>>;
  setCanSpeaks: Dispatch<SetStateAction<string[]>>;
  setRoles: Dispatch<SetStateAction<RoleEnum[]>>;
}

export const OnboardingContext = createContext<
  OnboardingContextType | undefined
>(undefined);

export default function OnboardingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const auth = useAuth();
  const profile = useProfile();
  const [progress, setProgress] = useState(0);
  const [flow, setFlow] = useState<FlowData[]>([]);
  const [userProfile, setUserProfile] = useState<Partial<ProfileToUpload>>({});
  const [canReads, setCanReads] = useState<string[]>([]);
  const [canSpeaks, setCanSpeaks] = useState<string[]>([]);
  const [roles, setRoles] = useState<RoleEnum[]>([]);
  const [form, setForm] = useState<OnboardingFormData>();
  const [pushingData, setPushingData] = useState<boolean>(false);

  /**
   * Updates stored profile state with the partial data.
   * Does not affect database.
   */
  const updateProfile = useCallback((updatedInfo: Partial<ProfileToUpload>) => {
    setUserProfile(oldProfile => ({ ...oldProfile, ...updatedInfo }));
  }, []);

  const removeFromProfile = useCallback((keys: Array<keyof Profile>) => {
    setUserProfile(oldProfile => {
      const clonedProfile = { ...oldProfile };
      keys.forEach(key => {
        delete clonedProfile[key];
      });
      return clonedProfile;
    });
  }, []);

  const flushData = useCallback(async () => {
    if (pushingData) return;
    if (!auth) throw new Error('Fatal: No auth context provided!');
    if (!profile) throw new Error('Fatal: No profile context provided!');
    if (!auth.userId) throw new Error('Fatal: User is not logged in!');

    const uid: UUID = auth.userId;

    if (!userProfile.first_name) throw new Error('First name is required!');

    if (!userProfile.last_name) throw new Error('Last name is required!');

    if (userProfile.hours_per_month === undefined)
      throw new Error('Hours per month is required!');

    if (!userProfile.country) throw new Error('Country is required!');

    if (!userProfile.state) throw new Error('State is required!');

    if (!userProfile.city) throw new Error('City is required!');

    if (!userProfile.start_date) throw new Error('Start date is required!');

    if (!userProfile.phone_number) throw new Error('Phone number is required!');

    if (roles.length === 0) throw new Error('Error: could not determine role!');

    if (roles.includes('ATTORNEY')) {
      if (userProfile.has_bar_number && !userProfile.bar_number)
        throw new Error('Bar number is required!');

      if (!userProfile.has_bar_number && !userProfile.legal_credential_comment)
        throw new Error('Comment is required in the absence of bar number!');

      if (!userProfile.state_barred)
        throw new Error('State barred is required!');

      if (userProfile.eoir_registered === undefined)
        throw new Error('EOIR registered is required!');
    }

    if (roles.includes('LEGAL_FELLOW')) {
      if (!userProfile.expected_bar_date)
        throw new Error('Expected bar date is required!');

      if (userProfile.eoir_registered === undefined)
        throw new Error('EOIR registered is required!');
    }

    if (canReads.length + canSpeaks.length === 0)
      throw new Error('Languages are required!');

    // format data
    const profileToInsert: ProfileToUpload = {
      first_name: userProfile.first_name,
      last_name: userProfile.last_name,
      hours_per_month: userProfile.hours_per_month,
      country: userProfile.country,
      state: userProfile.state,
      city: userProfile.city,
      start_date: userProfile.start_date,
      availability_description: userProfile.availability_description,
      bar_number: userProfile.bar_number,
      state_barred: userProfile.state_barred,
      eoir_registered: userProfile.eoir_registered,
      user_id: uid,
      phone_number: userProfile.phone_number,
      legal_credential_comment: userProfile.legal_credential_comment,
      has_bar_number: userProfile.has_bar_number,
    };

    const userLangs = new Set(canReads.concat(canSpeaks));
    const langsToInsert: ProfileLanguage[] = Array.from(userLangs).map(l => ({
      user_id: uid,
      can_read: canReads.includes(l),
      can_speak: canSpeaks.includes(l),
      language_name: l,
    }));

    const rolesToInsert: ProfileRole[] = Array.from(roles).map(r => ({
      user_id: uid,
      role: r,
    }));

    setPushingData(true);

    await profile.createNewProfile(
      profileToInsert,
      langsToInsert,
      rolesToInsert,
    );
  }, [auth, profile, userProfile, canReads, canSpeaks, roles, pushingData]);

  const providerValue = useMemo(
    () => ({
      progress,
      profile: userProfile,
      canReads,
      canSpeaks,
      roles,
      flow,
      form,
      pushingData,
      flushData,
      setFlow,
      setProgress,
      updateProfile,
      removeFromProfile,
      setForm,
      setCanReads,
      setCanSpeaks,
      setRoles,
    }),
    [
      progress,
      userProfile,
      canReads,
      canSpeaks,
      roles,
      flow,
      pushingData,
      form,
      flushData,
      updateProfile,
      removeFromProfile,
      setForm,
    ],
  );

  return (
    <OnboardingContext.Provider value={providerValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

/**
 * EXAMPLE USAGE:
 */

/**
 * app/test/layout.tsx

'use client';

import { ReactNode } from 'react';
import OnboardingProvider from '@/utils/OnboardingProvider';

export default function TestLayout({ children }: { children: ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>;
}

*/

/**
 * app/test/page.tsx

'use client';

import { useContext, useState } from 'react';
import { OnboardingContext } from '@/utils/OnboardingProvider';
import { RoleEnum } from '@/types/schema';

export default function Page() {
  const onboarding = useContext(OnboardingContext);
  const [notice, setNotice] = useState<string>('');

  const updateProfile = async () => {
    if (!onboarding) {
      setNotice('No onboarding context detected');
      return;
    }
    setNotice('');

    onboarding
      .flushData()
      .then(() => {
        setNotice('Success!');
      })
      .catch(err => {
        setNotice(err.message);
      });
  };

  return (
    <div>
      <p>Progress: {onboarding && onboarding.progress}</p>
      <button
        type="button"
        onClick={() =>
          onboarding && onboarding.setProgress(onboarding.progress + 1)
        }
      >
        +
      </button>
      <button
        type="button"
        onClick={() =>
          onboarding && onboarding.setProgress(onboarding.progress - 1)
        }
      >
        -
      </button>
      <h4>Profile:</h4>
      <p>User ID: {onboarding && onboarding.profile.user_id}</p>

      <hr />
      {notice && <p>{notice}</p>}

      <p>First name: {onboarding && onboarding.profile.first_name}</p>
      <input
        type="text"
        onBlur={e =>
          onboarding && onboarding.updateProfile({ first_name: e.target.value })
        }
      />
      <p>Last name: {onboarding && onboarding.profile.last_name}</p>
      <input
        type="text"
        onBlur={e =>
          onboarding && onboarding.updateProfile({ last_name: e.target.value })
        }
      />
      <p>Hours per month: {onboarding && onboarding.profile.hours_per_month}</p>
      <input
        type="number"
        onBlur={e =>
          onboarding &&
          onboarding.updateProfile({
            hours_per_month: parseInt(e.target.value, 10),
          })
        }
      />
      <p>Location: {onboarding && onboarding.profile.location}</p>
      <input
        type="text"
        onBlur={e =>
          onboarding && onboarding.updateProfile({ location: e.target.value })
        }
      />
      <p>Start date: {onboarding && onboarding.profile.start_date}</p>
      <input
        type="date"
        onBlur={e =>
          onboarding && onboarding.updateProfile({ start_date: e.target.value })
        }
      />
      <p>
        Roles (comma separated):{' '}
        {onboarding && Array.from(onboarding.roles).join(',')}
      </p>
      <input
        type="text"
        onBlur={e =>
          onboarding &&
          onboarding.setRoles(
            new Set(e.target.value.split(',')) as Set<RoleEnum>,
          )
        }
      />
      <p>
        Can read languages (comma separated):{' '}
        {onboarding && Array.from(onboarding.canReads).join(',')}
      </p>
      <input
        type="text"
        onBlur={e =>
          onboarding &&
          onboarding.setCanReads(new Set(e.target.value.split(',')))
        }
      />
      <p>
        Can speak languages (comma separated):{' '}
        {onboarding && Array.from(onboarding.canSpeaks).join(',')}
      </p>
      <input
        type="text"
        onBlur={e =>
          onboarding &&
          onboarding.setCanSpeaks(new Set(e.target.value.split(',')))
        }
      />
      <br />
      <button type="button" onClick={updateProfile}>
        Update
      </button>
    </div>
  );
}

*/

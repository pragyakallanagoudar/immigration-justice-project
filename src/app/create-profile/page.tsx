'use client';

import { UUID } from 'crypto';
import { useState } from 'react';
import { insertProfile } from '@/api/supabase/queries/profiles';
import { Profile } from '@/types/schema';

export default function Profile() {
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');

  const handleInsert = async () => {
    if (!firstName || !lastName) return;
    const newProfile: Profile = {
      // hardcoded values for now
      location: 'Berkeley, CA',
      user_id: crypto.randomUUID() as UUID,
      hours_per_month: 40,
      immigration_law_experience: 'HIGH',
      bar_number: '12345',
      start_date: new Date().toDateString(),
      availability_description: 'blah blah blah',
      eoir_registered: false,
      first_name: firstName,
      last_name: lastName,
    };
    await insertProfile(newProfile);
    setFirstName('');
    setLastName('');
  };

  return (
    <main>
      <div>Create Profile Form</div>
      <form>
        <div>
          <label htmlFor="firstName">
            First Name:
            <input
              type="text"
              name="firstName"
              required
              value={firstName}
              onChange={event => setFirstName(event.target.value)}
            />
          </label>
        </div>
        <div>
          <label htmlFor="lastName">
            Last Name:
            <input
              type="text"
              name="lastName"
              required
              value={lastName}
              onChange={event => setLastName(event.target.value)}
            />
          </label>
        </div>
        <button type="button" onClick={handleInsert}>
          Submit
        </button>
      </form>
    </main>
  );
}
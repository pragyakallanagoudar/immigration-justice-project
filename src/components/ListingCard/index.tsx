'use client';

import { useMemo } from 'react';
import { UUID } from 'crypto';
import COLORS from '@/styles/colors';
import { Flex } from '@/styles/containers';
import { H4, MediumSpan, P } from '@/styles/text';
import { Listing } from '@/types/schema';
import { formatTimestamp } from '@/utils/helpers';
import Icon from '../Icon';
import * as Styles from './styles';

export default function ListingCard({
  listing,
  isSelected = false,
  onClick,
  interpretation = false,
}: {
  listing: Listing;
  isSelected?: boolean;
  onClick?: (id: UUID) => void;
  interpretation?: boolean;
}) {
  const interpretationType = useMemo(() => {
    if (listing.listing_type === 'CASE' && listing.needs_interpreter)
      return 'Case Interpretation';
    if (listing.listing_type === 'DOC') return 'Document Translation';
    if (listing.listing_type === 'INT') return 'One-time Interpretation';
    return '';
  }, [listing]);

  // list of tags to display
  const cardTags = useMemo(() => {
    const tags = [];

    if (listing.listing_type === 'CASE') {
      if (
        !interpretation &&
        listing.relief_codes &&
        listing.relief_codes.length > 0
      ) {
        tags.push(listing.relief_codes.join(', '));
      }

      if (listing.hours_per_week) {
        tags.push(`${listing.hours_per_week} hrs/week`);
      }
    }

    // language tag
    if (listing.languages && listing.languages.length > 0) {
      let langTag = listing.languages.slice(0, 2).join(', ');
      if (listing.languages.length > 2)
        langTag += ` + ${listing.languages.length - 2}`;
      tags.push(langTag);
    }

    // limited case assignment
    if (listing.listing_type === 'LCA') {
      tags.push(listing.country);
    }

    // language support
    if (listing.listing_type === 'DOC') {
      const plural = listing.num_pages > 1 ? 's' : '';
      tags.push(`${listing.num_pages} page${plural}`);
    }

    return tags;
  }, [listing, interpretation]);

  // remote info
  const remoteInfo = useMemo(() => {
    if (listing.listing_type === 'CASE' || listing.listing_type === 'INT') {
      if (listing.is_remote === null || listing.is_remote === undefined) {
        return 'To Be Determined';
      }
      return listing.is_remote ? 'Remote' : 'In Person';
    }
    return 'Asynchronous';
  }, [listing]);

  return (
    <Styles.CardBody
      $selected={isSelected}
      onClick={() => onClick?.(listing.id)}
    >
      {interpretation && (
        <Styles.LanguageSupportLabel>
          {interpretationType}
        </Styles.LanguageSupportLabel>
      )}

      <H4>{listing.title || 'Migrant seeking representation'}</H4>

      {cardTags.length > 0 && (
        <Styles.TagRow>
          {cardTags.map(s => (
            <Styles.CardTag key={s} color={COLORS.blueLight}>
              {s}
            </Styles.CardTag>
          ))}
        </Styles.TagRow>
      )}

      <Flex $gap="16px">
        <Styles.IconTextGroup>
          <Icon type="location" />
          <P>{remoteInfo}</P>
        </Styles.IconTextGroup>

        {listing.listing_type === 'CASE' && !interpretation ? (
          <Styles.IconTextGroup>
            <Icon type="gavel" />
            <P>{listing.adjudicating_agency ?? 'Not Available'}</P>
          </Styles.IconTextGroup>
        ) : null}
      </Flex>

      {listing.listing_type !== 'INT' ? (
        <Flex $gap="8px">
          <Icon type="calendar" />
          <P>
            <MediumSpan>
              {listing.listing_type === 'CASE'
                ? 'Next Filing/Court Date:'
                : 'Assignment Deadline:'}
            </MediumSpan>
            &nbsp;
            {listing.listing_type === 'CASE'
              ? formatTimestamp(listing.upcoming_date)
              : formatTimestamp(listing.deadline)}
          </P>
        </Flex>
      ) : null}
    </Styles.CardBody>
  );
}

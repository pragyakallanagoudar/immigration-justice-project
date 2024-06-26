import styled from 'styled-components';
import COLORS from '@/styles/colors';
import { P } from '@/styles/text';

export const ListingDescription = styled(P)`
  overflow-wrap: break-word;
`;

export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 50%;
`;

export const InnerInfoContainer = styled.div`
  display: grid;
  grid-template-rows: 1fr 1fr 1fr;
`;

export const InnerFieldContainer = styled.div`
  gap: 30px;
  justify-content: space-between;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
`;

export const FieldContainer = styled.div`
  display: flex;
  gap: 3px;
  flex-direction: column;
`;

export const AuthButtons = styled.div`
  display: flex;
  gap: 25px;
  margin-top: 20px;
`;

export const IconTextGroup = styled.div`
  display: flex;
  direction: row;
  gap: 10px;
  align-items: center;
`;

export const BorderedSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 30px 55px;
  border-top: 2px solid ${COLORS.greyLighter};

  &:first-child {
    border-top: none;
  }
`;

export const Subheading = styled(P)<{ $bold?: true; $color?: string }>`
  display: inline;
  font-size: 1rem;
  font-weight: ${({ $bold }) => ($bold ? 500 : 400)};
  color: ${({ $color }) => $color || COLORS.greyDarker};
`;

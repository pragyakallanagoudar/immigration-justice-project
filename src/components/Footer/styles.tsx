import styled from 'styled-components';
import COLORS from '@/styles/colors';
import { sans } from '@/styles/fonts';
import { LinkColored } from '@/styles/text';

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  background-color: ${COLORS.blueMid};
  min-height: 290px;
  padding: 40px 100px 0px 100px;
`;

export const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FooterLink = styled(LinkColored)`
  text-decoration: none;
  font-size: 0.9375rem;
  font-weight: 400px;
  gap: 10px;
  display: flex;
  align-items: center;
`;

export const Header = styled.p`
  ${sans.style}
  font-size: 1.25rem;
  color: white;
  font-weight: 500;
`;

export const HorizontalLine = styled.hr<{ $width?: string }>`
  color: white;
  margin-bottom: 10px;
  width: ${({ $width }) => $width || '2.5rem'};
`;

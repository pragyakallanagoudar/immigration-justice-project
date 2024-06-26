import styled from 'styled-components';
import CONFIG from '@/lib/configs';
import COLORS from '@/styles/colors';
import { sans } from '@/styles/fonts';
import { LinkColored } from '@/styles/text';

export const NavBarContainer = styled.div`
  display: flex;
  width: 100%;
  height: ${CONFIG.navbarHeight}px;
  background: ${COLORS.blueMid};
  z-index: 1000;
  box-shadow: 0px 4px 7px 0px rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  padding: 0px 34px;
`;

export const NavBarSectionDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 12px;
`;

export const AuthButtons = styled.div`
  display: flex;
  gap: 1rem;
  align-self: center;
  top: 0;
  right: 0;
`;
export const NoUnderlineLink = styled(LinkColored)`
  ${sans.style}
  text-decoration: none;
  margin: 10px;
  font-weight: 600;
  color: transparent;
  position: relative;
  cursor: pointer;
`;

export const DisplayText = styled.span<{ $isActive: boolean }>`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '400')};
  color: white;
`;

export const ActiveUnderline = styled.hr<{ $isActive: boolean }>`
  visibility: ${({ $isActive }) => ($isActive ? 'visible' : 'hidden')};
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 4px;
  background-color: white;
  border: none;
  margin: 0;
  margin-bottom: 4px;
`;

export const LinkContainer = styled.div`
  display: flex;
  position: relative;
  height: 100%;
  justify-content: space-between;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
`;

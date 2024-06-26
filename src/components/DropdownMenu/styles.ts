import styled, { keyframes } from 'styled-components';
import COLORS from '@/styles/colors';

// use this keyframe in input dropdown in the future
export const FadeInKeyframes = keyframes`
  from {
    opacity: 0;
    transform: translateY(-0.5rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const MenuContainer = styled.div<{ $show: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  transform: translateY(0.125rem);

  display: ${({ $show }) => ($show ? 'flex' : 'none')};
  flex-direction: column;
  width: max-content;
  min-width: 100%;
  max-height: 12.5rem;
  overflow-y: auto;
  background: white;
  box-shadow: 0 2px 0.25em 0.1em rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(0, 0, 0, 0.25);
  padding: 0.2rem 0.3rem;
  border-radius: 0.5rem;
  z-index: 100;

  &:empty {
    &::after {
      content: 'No matches found';
      padding: 0.5rem;
      text-align: center;
      font-size: 0.875rem;
      color: ${COLORS.greyMid};
    }
  }

  animation: 80ms ${FadeInKeyframes} cubic-bezier(0, 0, 0.35, 1);
`;

// menu option
export const DropdownItem = styled.p<{
  $selected: boolean;
  $multi?: boolean;
  $forceFocus?: boolean;
  $disableMouseFocus?: boolean;
}>`
  color: ${COLORS.greyDarker};
  position: relative;
  cursor: default;
  border-radius: 0.25rem;
  padding: 0.5rem;
  padding-left: ${({ $multi }) => ($multi ? '2rem' : '1rem')};
  font-size: 0.9375rem;
  user-select: none;
  outline: none;

  background-image: ${({ $selected }) =>
    $selected
      ? `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 17' fill='none' %3E%3Crect x='0.5' y='1' width='15' height='15' rx='2.5' fill='%230069A9' stroke='%230069A9' /%3E %3Cpath d='M6.17794 10.8117L3.80728 8.32401L3 9.16517L6.17794 12.5L13 5.34116L12.1984 4.5L6.17794 10.8117Z' fill='white' /%3E %3C/svg%3E")`
      : `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 17' fill='none' %3E%3Crect x='0.5' y='1' width='15' height='15' rx='2.5' stroke='%230069A9' /%3E%3C/svg%3E")`};
  ${({ $multi }) => !$multi && `background-image: none;`}
  background-repeat: no-repeat;
  background-size: 1rem 1rem;
  background-position: left 0.5rem center;

  transition: 150ms;

  &::before {
    content: '';
    background: ${({ $selected }) =>
      $selected ? COLORS.blueLighter : COLORS.greyLighter};
    width: 100%;
    height: calc(100% - 0.25rem);
    border-radius: 0.25rem;
    top: 0;
    left: 0;
    transform: translateY(0.1rem);
    position: absolute;
    z-index: -1;
    opacity: ${({ $selected, $forceFocus }) =>
      $selected || $forceFocus ? 1 : 0};
  }

  ${({ $disableMouseFocus }) =>
    !$disableMouseFocus &&
    `
    &:hover::before {
      opacity: 1;
    }
  `}

  &:focus::before {
    opacity: 1;
  }
`;

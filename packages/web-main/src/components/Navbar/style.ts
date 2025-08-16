import { styled } from '@takaro/lib-components';
import { motion } from 'framer-motion';

export const Container = styled(motion.div)<{ $isCollapsed?: boolean }>`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme, $isCollapsed }) =>
    $isCollapsed
      ? `${theme.spacing[2]} ${theme.spacing['0_5']} ${theme.spacing['1_5']} ${theme.spacing['0_5']}`
      : `${theme.spacing[2]} ${theme.spacing[1]} ${theme.spacing['1_5']} ${theme.spacing[1]}`};
  gap: ${({ theme }) => theme.spacing[2]};
  overflow: hidden;

  .company-icon {
    margin: 0 auto;
    cursor: pointer;
  }

  img {
    display: block;
    width: 80px;
    height: auto;
    margin: 0 auto;
    margin-bottom: 20px;
    cursor: pointer;
  }
`;

export const NoServersCallToAction = styled(motion.div)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  align-items: space-between;
  width: 100%;
  padding: ${({ theme }) => `${theme.spacing['1']} ${theme.spacing[1]}`};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  text-align: center;

  gap: ${({ theme }) => theme.spacing[2]};
`;

export const IconNavContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[2]};
  padding-top: ${({ theme }) => theme.spacing[5]};
`;

export const Nav = styled.nav<{ $isCollapsed?: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing['0_75']};
  width: 100%;
  flex-direction: column;

  h3 {
    font-size: ${({ theme }) => theme.fontSize.tiny};
    color: ${({ theme }) => theme.colors.textAlt};
    font-weight: 600;
    margin-left: ${({ theme }) => theme.spacing[1]};
    text-transform: uppercase;
  }

  a {
    width: 100%;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: ${({ theme, $isCollapsed }) =>
      $isCollapsed
        ? `${theme.spacing['0_75']} ${theme.spacing['0_5']}`
        : `${theme.spacing['0_75']} ${theme.spacing['1']}`};
    display: flex;
    align-items: center;
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
    transition: 0.2s transform ease-in-out;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid transparent;

    span {
      display: flex;
      align-items: center;
      justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
    }

    &:hover {
      border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
    }

    p {
      margin: ${({ theme }) => `0 ${theme.spacing['4']} 0 ${theme.spacing[1]}`};
    }

    svg {
      fill: ${({ theme }) => theme.colors.textAlt};
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
    }
  }
`;

export const IconNav = styled.nav`
  display: flex;
  flex-direction: row;
  margin-top: ${({ theme }) => theme.spacing['1']};
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing[1]};

  a {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

export const NavItem = styled.div<{ $isParent?: boolean; $isCollapsed?: boolean }>`
  width: 100%;
  cursor: ${({ $isParent }) => ($isParent ? 'pointer' : 'default')};

  &.parent-item {
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    padding: ${({ theme, $isCollapsed }) =>
      $isCollapsed
        ? `${theme.spacing['0_75']} ${theme.spacing['0_5']}`
        : `${theme.spacing['0_75']} ${theme.spacing['1']}`};
    display: flex;
    align-items: center;
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'space-between')};
    transition: 0.2s all ease-in-out;
    font-weight: 500;
    white-space: nowrap;
    border: 1px solid transparent;

    &:hover {
      border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
      background-color: ${({ theme }) => theme.colors.backgroundAlt};
    }

    span {
      display: flex;
      align-items: center;
      justify-content: ${({ $isCollapsed }) => ($isCollapsed ? 'center' : 'flex-start')};
      gap: ${({ theme }) => theme.spacing[1]};
    }

    svg {
      fill: ${({ theme }) => theme.colors.textAlt};
    }
  }
`;

export const NestedNav = styled(motion.div)<{ $isCollapsed?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing['0_5']};
  margin-left: ${({ theme, $isCollapsed }) => ($isCollapsed ? '0' : theme.spacing[3])};
  margin-top: ${({ theme }) => theme.spacing['0_5']};
  overflow: hidden;

  a {
    font-size: ${({ theme }) => theme.fontSize.small};
    padding: ${({ theme, $isCollapsed }) =>
      $isCollapsed
        ? `${theme.spacing['0_5']} ${theme.spacing['0_5']}`
        : `${theme.spacing['0_5']} ${theme.spacing['1']}`};
  }
`;

export const ExpandIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;

  svg {
    width: 16px;
    height: 16px;
  }
`;

import { styled } from '@takaro/lib-components';
import { motion } from 'framer-motion';

export const Container = styled(motion.div)`
  width: 0;
  position: relative;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  display: flex;
  align-items: flex-start;
  flex-direction: column;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[4]} ${theme.spacing[1]} ${theme.spacing['1_5']} ${theme.spacing[1]}`};

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

export const Nav = styled.nav`
  display: flex;
  gap: ${({ theme }) => theme.spacing['0_75']};
  width: 100%;
  flex-direction: column;
  margin-top: ${({ theme }) => theme.spacing[8]};

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
    padding: ${({ theme }) => `${theme.spacing['0_75']} ${theme.spacing['1']}`};
    display: flex;
    align-items: center;
    justify-content: space-between;
    transition: 0.2s transform ease-in-out;
    font-weight: 500;
    white-space: nowrap;

    span {
      display: flex;
      align-items: center;
    }

    &:hover {
      background-color: ${({ theme }) => theme.colors.background};
    }

    p {
      margin: ${({ theme }) => `0 ${theme.spacing['4']} 0 ${theme.spacing[1]}`};
    }

    svg {
      fill: ${({ theme }) => theme.colors.textAlt};
    }

    &.active {
      svg {
        fill: ${({ theme }) => theme.colors.primary};
      }
      p {
        color: white;
      }
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

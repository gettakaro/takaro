import { styled } from '../../../styled';

export const Wrapper = styled.div`
  height: 100%;
  font-weight: 500;
  border-left: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-right: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  position: relative;
  border-top-right-radius: ${({ theme }) => theme.borderRadius.large};
  border-top-left-radius: ${({ theme }) => theme.borderRadius.large};
`;

export const Header = styled.div`
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-top: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  height: 50px;
  display: flex;
  gap: ${({ theme }) => theme.spacing[1]};
  align-items: center;
  justify-content: flex-end;
  padding: 0 ${({ theme }) => theme.spacing[1]};
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
`;

export const MessageContainer = styled.div`
  min-height: 550px;
  height: calc(100% - 50px);
  border-radius: 0;
`;

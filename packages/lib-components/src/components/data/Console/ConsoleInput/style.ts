import { styled } from '../../../../styled';
import { AiOutlineEnter as EnterIcon } from 'react-icons/ai';

export const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  width: 100%;
  align-items: center;
  input {
    position: relative;
    width: 100%;
    background-color: ${({ theme }) => theme.colors.primary};
    color: white;
    font-size: 110%;
    height: 40px;
    font-weight: 500;
    font-family: 'inconsolata';
    border-radius: 0;
    padding-right: ${({ theme }) => theme.spacing[6]};
    ::placeholder {
      color: white;
    }
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
  }

  span {
    font-family: 'inconsolata';
    color: black;
    font-weight: 500;
    margin-left: ${({ theme }) => theme.spacing[1]};
  }
`;

export const StyledEnterIcon = styled(EnterIcon)`
  position: absolute;
  right: 2rem;
  cursor: pointer;
`;

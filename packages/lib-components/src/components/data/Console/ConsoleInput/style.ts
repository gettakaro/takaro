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
    height: 50px;
    font-weight: 500;
    font-family: 'inconsolata';
    border-radius: 0;
    padding-right: 5rem;
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
    margin-left: 10px;
  }
`;

export const SuggestionsContainer = styled.div<{ showSuggestions: boolean }>`
  display: ${({ showSuggestions }) => (showSuggestions ? 'block' : 'none')};
  position: absolute;
  bottom: 30px;
  left: 0;
  right: 0;
  margin: 0 auto;
  width: 60%;
  min-width: 600px;
  overflow: hidden;
  height: 50vh;
  background-color: white;
  box-shadow: ${({ theme }) => theme.shadows.default};
  border-radius: 0.5rem;
  padding: 2rem;
  h3 {
    width: 100%;
    text-align: center;
    margin-bottom: 1rem;
  }

  ul {
    height: 100%;
  }
  li {
    display: flex;
    flex-direction: column;
    align-items: space-between;
    justify-content: center;
    border-radius: 0.5rem;
    padding: 1rem;
    span {
      &:last-child {
        font-size: 80%;
      }
    }

    &.active {
      background-color: ${({ theme }) => theme.colors.primary};
      span {
        color: white;
      }
    }
  }
`;

export const StyledEnterIcon = styled(EnterIcon)`
  position: absolute;
  right: 2rem;
  cursor: pointer;
`;

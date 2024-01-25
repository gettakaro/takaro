import { styled } from '../../../styled';

export const Svg = styled.svg`
  .tick {
    & > line {
      width: 1px;
    }
  }

  .tick-label {
    fill: var(--text-secondary);
    font-size: 7px;
  }

  .tooltip {
    display: grid;
    row-gap: 10px;
    padding: 10px;
    text-align: center;
    & > time {
      font-size: 1.4em;
      text-transform: uppercase;
    }
    & > p {
      font-size: 1.2em;
      color: black;
    }
  }
`;

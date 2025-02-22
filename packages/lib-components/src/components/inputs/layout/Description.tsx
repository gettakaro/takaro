import { FC, CSSProperties } from 'react';
import { styled } from '../../../styled';

const StyledP = styled.p`
  margin-top: ${({ theme }) => theme.spacing['0_25']};
  color: ${({ theme }) => theme.colors.textAlt};
  white-space: pre-wrap;
  line-height: 1.5;
`;

interface DescriptionProps {
  description: string;
  inputName: string;
  style?: CSSProperties;
}

export const Description: FC<DescriptionProps> = ({ description, inputName, style }) => {
  const urlPattern = /(https?:\/\/[^\s]+)/g;

  return (
    <StyledP id={`${inputName}-description`} style={style}>
      {description.split(urlPattern).map((part, i) => {
        if (part.match(urlPattern)) {
          return (
            <a key={`${i}`} href={part} target="_blank" rel="noopener noreferrer" className="underline">
              {part}
            </a>
          );
        }
        return part;
      })}
    </StyledP>
  );
};

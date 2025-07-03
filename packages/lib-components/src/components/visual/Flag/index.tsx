import { styled } from '../../../styled';
import { FC, ImgHTMLAttributes } from 'react';

const FlagImg = styled.img`
  width: 1rem;
  height: 1rem;
  object-fit: cover;
  border-radius: 2px;
`;

export interface FlagProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  /** 2-letter ISO country code (e.g., 'US', 'FR', 'JP') */
  countryCode: string;
  /** Optional country name for better accessibility */
  countryName?: string;
  /** Size of the flag in rem units */
  size?: number;
}

export const Flag: FC<FlagProps> = ({ countryCode, countryName, size = 1, style, ...props }) => {
  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  const uppercaseCode = countryCode.toUpperCase();
  const flagUrl = `http://purecatamphetamine.github.io/country-flag-icons/3x2/${uppercaseCode}.svg`;
  const altText = countryName ? `Flag of ${countryName}` : `Flag of ${uppercaseCode}`;

  return (
    <FlagImg
      src={flagUrl}
      alt={altText}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        ...style,
      }}
      {...props}
    />
  );
};

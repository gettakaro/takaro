import { styled } from '../../../styled';
import { FC, ImgHTMLAttributes, useState } from 'react';

const FlagImg = styled.img`
  width: 1rem;
  height: 1rem;
  object-fit: cover;
  border-radius: 2px;
`;

const FallbackContainer = styled.div<{ size: number }>`
  width: ${({ size }) => `${size}rem`};
  height: ${({ size }) => `${size}rem`};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border-radius: 2px;
  font-size: ${({ size }) => `${size * 0.5}rem`};
  color: ${({ theme }) => theme.colors.textAlt};
  font-weight: 600;
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
  const [imageError, setImageError] = useState(false);

  if (!countryCode || countryCode.length !== 2) {
    return null;
  }

  const uppercaseCode = countryCode.toUpperCase();
  const flagUrl = `https://purecatamphetamine.github.io/country-flag-icons/3x2/${uppercaseCode}.svg`;
  const altText = countryName ? `Flag of ${countryName}` : `Flag of ${uppercaseCode}`;

  if (imageError) {
    return <FallbackContainer size={size}>{uppercaseCode}</FallbackContainer>;
  }

  return (
    <FlagImg
      src={flagUrl}
      alt={altText}
      onError={() => setImageError(true)}
      style={{
        width: `${size}rem`,
        height: `${size}rem`,
        ...style,
      }}
      {...props}
    />
  );
};

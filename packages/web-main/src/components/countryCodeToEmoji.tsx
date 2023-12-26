import { FC } from 'react';

export const CountryCodeToEmoji: FC<{ countryCode: string | undefined }> = ({ countryCode }) => {
  const isoToEmoji = (isoCode) => {
    if (!isoCode) return '';
    return isoCode
      .toUpperCase()
      .split('')
      .map((char) => String.fromCodePoint(127397 + char.charCodeAt()))
      .join('');
  };

  if (!countryCode) return <></>;

  return <span>{isoToEmoji(countryCode)}</span>;
};

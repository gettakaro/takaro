import { FC } from 'react';

interface CountryCodeToEmojiProps {
  countryCode?: string;
}

export const CountryCodeToEmoji: FC<CountryCodeToEmojiProps> = ({ countryCode }) => {
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

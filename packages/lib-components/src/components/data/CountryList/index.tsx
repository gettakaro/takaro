import { styled } from '../../../styled';
import { Flag } from '../../visual/Flag';
import { alpha2ToAlpha3 } from '../../charts/GeoMercator/iso3166-alpha2-to-alpha3';

const alpha3ToAlpha2: Record<string, string> = Object.entries(alpha2ToAlpha3).reduce(
  (acc, [alpha2, alpha3]) => {
    acc[alpha3] = alpha2;
    return acc;
  },
  {} as Record<string, string>,
);

const Container = styled.div`
  width: 320px;
  min-width: 320px;
  flex-shrink: 0;
  height: 100%;
  overflow: auto;
  background-color: ${({ theme }) => theme.colors.backgroundAlt};
  border: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ theme }) => theme.spacing['3']};
`;

const Title = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing['2']} 0;
  font-size: ${({ theme }) => theme.fontSize.tiny};
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textAlt};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CountryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['2']};
`;

const CountryTable = styled.div`
  display: table;
  width: 100%;
  font-size: ${({ theme }) => theme.fontSize.small};
  border-collapse: collapse;
`;

const CountryRow = styled.div`
  display: table-row;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundAccent};
  }

  &:last-child > div {
    border-bottom: none;
  }
`;

const CountryCell = styled.div`
  display: table-cell;
  padding: 2px 0;
  vertical-align: middle;
  border-bottom: 1px solid ${({ theme }) => theme.colors.backgroundAccent};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.3;
`;

const FlagCell = styled(CountryCell)`
  width: 20px;
  text-align: center;
  padding-right: 4px;
`;

const CountryCodeCell = styled(CountryCell)`
  padding-right: 4px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.fontSize.tiny};
`;

const CountCell = styled(CountryCell)`
  text-align: right;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.primary};
  width: 20px;
  font-size: ${({ theme }) => theme.fontSize.tiny};
`;

export interface CountryListProps<T> {
  /** Array of data items containing country information */
  data: T[];
  /** Function to extract country code from data item (supports both alpha-2 and alpha-3 codes) */
  xAccessor: (d: T) => string;
  /** Function to extract numeric value from data item */
  yAccessor: (d: T) => number;
  /** Optional title for the list. Defaults to "Countries ({count})" */
  title?: string;
}

/**
 * CountryList displays a sorted list of countries with flags and numeric values in a two-column layout.
 *
 * Features:
 * - Automatically sorts data by numeric value (descending)
 * - Displays country flags when available
 * - Supports both alpha-2 (US) and alpha-3 (USA) country codes
 * - Two-column grid layout for compact display
 * - Hover effects on rows
 */
export const CountryList = <T,>({ data, xAccessor, yAccessor, title }: CountryListProps<T>) => {
  const sortedData = [...data].sort((a, b) => yAccessor(b) - yAccessor(a));

  // Split data into two columns
  const midPoint = Math.ceil(sortedData.length / 2);
  const leftColumnData = sortedData.slice(0, midPoint);
  const rightColumnData = sortedData.slice(midPoint);

  const renderCountryTable = (columnData: T[]) => (
    <CountryTable>
      {columnData.map((item, index) => {
        const countryCode = xAccessor(item);
        const count = yAccessor(item);
        const alpha2Code = countryCode.length === 3 ? alpha3ToAlpha2[countryCode] : countryCode;
        // Prefer 2-letter country codes for display if available
        const displayCode = alpha2Code || countryCode;

        return (
          <CountryRow key={`${countryCode}-${index}`}>
            <FlagCell>{alpha2Code && <Flag countryCode={alpha2Code} size={1} />}</FlagCell>
            <CountryCodeCell>{displayCode}</CountryCodeCell>
            <CountCell>{count}</CountCell>
          </CountryRow>
        );
      })}
    </CountryTable>
  );

  return (
    <Container>
      <Title>{title || `Countries (${sortedData.length})`}</Title>
      <CountryGrid>
        {renderCountryTable(leftColumnData)}
        {renderCountryTable(rightColumnData)}
      </CountryGrid>
    </Container>
  );
};

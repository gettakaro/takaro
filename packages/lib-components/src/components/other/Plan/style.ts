import { styled } from '../../../styled';

export const InnerContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;

  @media (max-width: 1200px) {
    grid-template-columns: 450px 1fr;
  }
`;

export const PriceContainer = styled.div<{ highlight: boolean }>`
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border-width: 1px;
  border-style: solid;
  border-color: ${({ highlight, theme }) => (highlight ? theme.colors.primary : theme.colors.backgroundAccent)};
  padding: ${({ theme }) => theme.spacing[4]};

  & > div:first-child {
    justify-content: center;
    flex-direction: column;
    display: flex;
    align-items: center;
    height: 100%;
    min-width: fit-content;

    p:last-child {
      font-size: ${({ theme }) => theme.fontSize.tiny};
      color: ${({ theme }) => theme.colors.textAlt};
      margin-top: ${({ theme }) => theme.spacing['1_5']};
    }
  }
`;

export const FeaturesContainer = styled.div`
  flex: 1 1 auto;
  padding: 0 ${({ theme }) => theme.spacing[2]};

  h1 {
    margin-bottom: ${({ theme }) => theme.spacing['1_5']};
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const FeatureList = styled.ul`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;

  li {
    column-gap: ${({ theme }) => theme.spacing['0_75']};
    display: flex;
    align-items: center;
    justify-content: center;
    text-transform: capitalize;
  }
`;

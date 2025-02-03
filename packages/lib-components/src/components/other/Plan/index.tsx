import { FC } from 'react';
import { Button, Card, Chip, Divider } from '../../../components';
import { AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { useTheme } from '../../../hooks';
import { InnerContainer, PriceContainer, FeatureList, FeaturesContainer } from './style';

export interface PlanProps {
  to: string;
  title: string;
  description: string;
  features: string[];
  price?: string;
  buttonText: string;
  highlight?: boolean;
  currency?: string;
  period?: string;
}

export const Plan: FC<PlanProps> = ({
  to,
  title,
  description,
  features,
  price,
  buttonText,
  highlight = false,
  currency,
  period,
}) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
      }}
    >
      <Card.Body>
        <InnerContainer>
          <FeaturesContainer>
            <h1 style={{}}>
              {title}
              {highlight && <Chip color="primary" variant="outline" label="Most popular" />}
            </h1>
            <p style={{ marginBottom: '3rem' }}>{description}</p>
            <Divider
              // eslint-disable-next-line quotes
              label={{ text: "What's included", labelPosition: 'center', color: 'primary' }}
              fullWidth
              size="large"
            />
            <FeatureList>
              {features.map((feature) => (
                <li key={feature}>
                  <CheckmarkIcon fill={theme.colors.primary} style={{ marginRight: '0.5rem' }} /> {feature}
                </li>
              ))}
            </FeatureList>
          </FeaturesContainer>
          {/* right side*/}
          <PriceContainer highlight={highlight}>
            <div>
              <h2>For a price of</h2>
              {price && (
                <p
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',

                    fontSize: theme.fontSize.mediumLarge,
                    fontWeight: 600,
                    columnGap: theme.spacing['0_5'],
                  }}
                >
                  <span style={{ fontSize: theme.fontSize.huge, fontWeight: 800 }}>{price}</span>
                  <span style={{ fontSize: theme.fontSize.small }}>
                    {currency ? currency.toUpperCase() : ''} / {period}
                  </span>
                </p>
              )}
              <a style={{ width: '100%' }} className="button" href={to} target="_blank" rel="noreferrer">
                <Button fullWidth text={buttonText} />
              </a>
              <p>Invoices and receipts available for easy company reimbursement</p>
            </div>
          </PriceContainer>
        </InnerContainer>
      </Card.Body>
    </Card>
  );
};

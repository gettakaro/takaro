import { FC } from 'react';
import { Button, Card, Divider } from '../../../components';
import { AiOutlineCheck as CheckmarkIcon } from 'react-icons/ai';
import { useTheme } from '../../../hooks';

export interface PlanProps {
  to: string;
  title: string;
  description: string;
  items: string[];
  price: number;
  buttonText: string;
  highlight?: boolean;
}

export const Plan: FC<PlanProps> = ({ to, title, description, items, price, buttonText, highlight = false }) => {
  const theme = useTheme();

  return (
    <Card
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '3rem 2rem',
      }}
    >
      <div style={{ display: 'flex' }}>
        <div style={{ flex: '1 1 auto', padding: '2.5rem' }}>
          <h1 style={{ marginBottom: '1rem' }}>{title}</h1>
          <p style={{ marginBottom: '2rem' }}>{description}</p>
          <Divider label={{ text: "What's included", labelPosition: 'left', color: 'primary' }} fullWidth size="huge" />
          <ul style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '1.5rem' }}>
            {items.map((item) => (
              <li style={{ columnGap: 0.75, display: 'flex', alignItems: 'center' }} key={item}>
                <CheckmarkIcon fill={theme.colors.primary} style={{ marginRight: '0.5rem' }} /> {item}
              </li>
            ))}
          </ul>
        </div>
        {/* right side*/}
        <div
          style={{
            maxWidth: '28rem',
            width: '100%',
            backgroundColor: theme.colors.background,
            borderRadius: '1rem',
            borderWidth: '1px',
            borderStyle: 'solid',
            borderColor: highlight ? theme.colors.primary : theme.colors.backgroundAccent,
            padding: '2rem',
          }}
        >
          <div
            style={{
              paddingTop: '4rem',
              paddingBottom: '4rem',
              justifyContent: 'space-evenly',
              flexDirection: 'column',
              display: 'flex',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <h2>For a small price of</h2>
            <p style={{ fontSize: theme.fontSize.mediumLarge, fontWeight: 600 }}>
              <span style={{ fontSize: theme.fontSize.huge, fontWeight: 800, marginRight: '2rem' }}>€{price}</span>/
              month
            </p>
            <a style={{ width: '100%' }} className="button" href={to} target="_blank" rel="noreferrer">
              <Button fullWidth text={buttonText} />
            </a>
          </div>
        </div>
      </div>
    </Card>
  );
};

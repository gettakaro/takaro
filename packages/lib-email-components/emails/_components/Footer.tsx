import { CSSProperties, FC } from 'react';
import { Link, Hr, Row, Section, Column } from '@react-email/components';
import { theme } from './theme';
import { hrStyle } from './styles';

export const Footer: FC = () => {
  const style: CSSProperties = {
    color: theme.colors.textAlt,
    fontSize: theme.fontSize.small,
    lineHeight: '16px',
    textDecoration: 'underline',
  };

  const columnStyle: CSSProperties = {
    textAlign: 'center',
  };

  return (
    <Section>
      <Hr style={{ ...hrStyle, marginBottom: '5px' }} />
      <Row>
        <Column style={columnStyle}>
          <Link href="https://github.com/gettakaro/takaro" style={style}>
            Github
          </Link>
        </Column>

        <Column style={columnStyle}>
          <Link href="https://docs.takaro.io" target="_blank" style={style}>
            Documentation
          </Link>
        </Column>
        <Column style={columnStyle}>
          <Link href="https://discord.takaro.io" target="_blank" style={style}>
            Discord
          </Link>
        </Column>
      </Row>
    </Section>
  );
};

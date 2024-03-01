import { FC } from 'react';
import { Head } from './_components/Head';
import { Footer } from './_components/Footer';
import { Body, Html, Button, Text, Container, Heading, Hr, Section } from '@react-email/components';
import { boxStyle, buttonStyle, containerStyle, headingStyle, hrStyle, paragraphStyle } from './_components/styles';
import { theme } from './_components/theme';

interface InviteUserProps {
  user: {
    firstName: string;
  };
  inviteLink: string;
}

const InviteUser: FC<InviteUserProps> = ({ user = { firstName: 'Alan' }, inviteLink = 'placeholder' }) => {
  return (
    <Html style={{ color: theme.colors.white }}>
      <Head />
      <Body>
        <Container style={containerStyle}>
          <Section style={boxStyle}>
            <Heading as="h2" style={headingStyle}>
              Takaro
            </Heading>
            <Hr style={hrStyle} />
            <Text style={paragraphStyle}>Hi {user.firstName},</Text>
            <Text style={paragraphStyle}>
              You have been invited to join Takaro. Click the button below to accept the invitation.
            </Text>

            <Section style={{ textAlign: 'center' as const }}>
              <Button href={inviteLink} style={{ ...buttonStyle }}>
                Accept invitation
              </Button>
            </Section>
            <Footer />
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default InviteUser;

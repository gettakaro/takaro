import { FC } from 'react';
import { styled } from '../../styled';
import { Link } from 'react-router-dom';
import { SupportButton } from '../../..';
import { Tile } from './Tile';

const Wrapper = styled.div`
  width: 100%;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  flex-direction: row;
  height: 70px;
  width: 100%;
  background-color: ${({ theme }) => theme.colors.white};
  padding: 0 4rem;
  justify-content: space-between;
  align-items: center;
  box-shadow: rgba(0, 0, 0, 0.03) 1px 2px 4px 0;
  border-bottom: 1px solid rgba(241, 241, 241);

  img {
    width: 38px;
    height: 38px;
  }
`;

const GridWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10vh;
`;

const Grid = styled.div`
  display: grid;
  -moz-box-pack: center;
  justify-content: center;
  gap: 1.5rem;
  grid-template-rows: auto;
  max-width: 960px;
  margin-top: 1rem;
  grid-template-columns: repeat(3, 304px);
  grid-template-areas: 'title title skip' 'content content content';
`;

const LongTitle = styled.div`
  grid-area: title;
  border: 0 none;
  border-radius: 15px;
  padding: 3rem 2rem;
  min-height: 80px;
  background-color: white;
  box-shadow: rgba(3, 27, 78, 0.15) 0 6px 20px -5px;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
`;

const ShortTitle = styled.div`
  border-radius: 15px;
  padding: 3rem 2rem;
  grid-area: skip;
  background-color: white;
  box-shadow: rgba(3, 27, 78, 0.15) 0 6px 20px -5px;

  p {
    font-weight: 700;
    margin-bottom: 1rem;
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    font-weight: 600;
  }
`;

const ContentWrapper = styled.div`
  grid-area: content;
  margin-bottom: 0;
`;

const ContentContainer = styled.div`
  grid-template-columns: repeat(3, 1fr);
  display: grid;
  gap: 1.5rem;
  justify-content: center;
  -moz-box-pack: center;
  grid-template-rows: auto;
`;

export const Welcome: FC = () => {
  return (
    <Wrapper>
      <Header>
        <img alt="Takaro icon" src="images/csmm-icon.png" />
        <SupportButton message="welcome" size="small" />
      </Header>
      <GridWrapper>
        <Grid>
          <LongTitle>
            <h3>Welcome to Takaro, let's get started</h3>
            <p>Choose a game server manager!</p>
          </LongTitle>
          <ShortTitle>
            <p>Not ready to jump in yet?</p>
            <Link className="underline" to="/store/dashboard">
              Explore our dashboard
            </Link>
          </ShortTitle>
          <ContentWrapper>
            <ContentContainer>
              <Tile game="7 days to die"></Tile>
              <Tile game="rust">Rust</Tile>
            </ContentContainer>
          </ContentWrapper>
        </Grid>
      </GridWrapper>
    </Wrapper>
  );
};

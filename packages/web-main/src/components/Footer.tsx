import { Company, styled } from '@takaro/lib-components';

const Container = styled.footer`
  ul {
    display: flex;
    flex-wrap: wrap;
    gap: ${({ theme }) => theme.spacing[1]};
  }
`;

export const Footer = () => {
  return (
    <Container>
      <ul>
        <li>
          <a href="">About</a>
        </li>
        <li>
          <a href="">Blog</a>
        </li>
        <li>
          <a href="">Changelog</a>
        </li>
        <li>
          <a href="">Something else</a>
        </li>
        <li>
          <a href="">
            <Company textVisible={false} size="tiny" />
          </a>
        </li>
        <li>
          <a href="">Privacy & Terms</a>
        </li>
        <li>
          <a href="">Feedback</a>
        </li>
        <li>
          <a href="">Support & Community</a>
        </li>
      </ul>
    </Container>
  );
};

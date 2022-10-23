import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Meta, StoryFn } from '@storybook/react';
import { FileExplorer } from '.';
import { styled } from '../../../../styled';

const Wrapper = styled.div`
  width: 300px;
  height: 100vh;
  background-color: orange;
`;

export default {
  title: 'Other/IDE/FileExplorer',
  component: FileExplorer 
} as Meta;

export const Default: StoryFn = () => {
  const files= {
    '/hooks/index.ts': {code: 'content here', active: true},
    '/cron/index.ts': {code: 'content here', },
    '/command/index.ts': {code: 'content here'}
  };

  return (
    <SandpackProvider 
      files={files}
    >
      <Wrapper>
      <FileExplorer />
      </Wrapper>
    </SandpackProvider>
  );
};

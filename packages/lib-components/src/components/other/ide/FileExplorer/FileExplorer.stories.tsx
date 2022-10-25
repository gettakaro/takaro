import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Meta, StoryFn } from '@storybook/react';
import { FileExplorer, FileExplorerProps } from '.';
import { styled } from '../../../../styled';

const Wrapper = styled.div`
  width: 300px;
  height: 100vh;
`;

export default {
  title: 'Other/IDE/FileExplorer',
  component: FileExplorer,
} as Meta<FileExplorerProps>;

export const Default: StoryFn = () => {
  const files = {
    '/hooks/index.ts': { code: 'content here', active: true },
    '/hooks/test.ts': { code: 'content here' },
    '/hooks/inner/index.ts': { code: 'content here' },
    '/hooks/inner/test.ts': { code: 'content here' },
    '/cron/index.ts': { code: 'content here' },
    '/command/index.ts': { code: 'content here' },
  };

  return (
    <SandpackProvider
      customSetup={{ entry: '/hooks/index.ts' }}
      files={files}
      prefix=""
    >
      <Wrapper>
        <FileExplorer />
      </Wrapper>
    </SandpackProvider>
  );
};

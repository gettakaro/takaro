import { Meta, StoryFn } from '@storybook/react';
import { IconNav } from '.';
import type { IconNavProps } from '.';
import { styled } from '../../../styled';

import { CollapseList } from '../../../components';
import { SandpackProvider } from '@codesandbox/sandpack-react';

const Container = styled.div`
  display: flex;
  width: 100vw;
`;
const EditorContainer = styled.div`
  width: 100%;
  height: 100vh;
`;

export default {
  title: 'Navigation/IconNav',
  component: IconNav,
} as Meta<IconNavProps>;

export const Default: StoryFn = () => {
  const files = {
    '/hooks/index.ts': { code: 'content here', active: true },
    '/cron/index.ts': { code: 'content here' },
    '/command/index.ts': { code: 'content here', hidden: true },
  };

  return (
    <SandpackProvider
      customSetup={{
        entry: '/hooks/index.ts',
        dependencies: { react: 'latest' },
      }}
      files={files}
    >
      <Container>
        <Resizable
          enable={{
            top: false,
            topRight: false,
            right: true,
            bottomRight: false,
            bottom: false,
            bottomLeft: false,
            left: false,
            topLeft: false,
          }}
          defaultSize={{
            width: '20%',
            height: '100vh',
          }}
          minWidth="190px"
          maxHeight="100vh"
          minHeight="100vh"
        >
          <CollapseList>
            <CollapseList.Item title="File explorer">
              <FileExplorer />
            </CollapseList.Item>
          </CollapseList>
        </Resizable>
        <EditorContainer>
          <Editor />
        </EditorContainer>
      </Container>
    </SandpackProvider>
  );
};

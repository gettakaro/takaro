import { Meta, StoryFn } from '@storybook/react';
import { IconNav } from '.';
import type { IconNavProps} from '.';
import { styled } from '../../../styled';
import { AiFillFile as FileIcon, AiFillSetting as SettingsIcon } from 'react-icons/ai';
import { CollapsableList, FileExplorer, Editor } from '../../../components';
import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Resizable } from 're-resizable';

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
  const navigation: IconNavProps['items'] = [
    {
      icon: <FileIcon/>,
      title: 'Explorer',
      to: '/explorer',
    },
    {
      icon: <SettingsIcon/>,
      title: 'Settings',
      to: '/settings',
    },
  ];

  const files= {
    '/hooks/index.ts': {code: 'content here', active: true},
    '/cron/index.ts': {code: 'content here', },
    '/command/index.ts': {code: 'content here', hidden: true},
  };

  return (
    <SandpackProvider customSetup={{ entry: '/hooks/index.ts', dependencies: { 'react': 'latest'} }} files={files}>
      <Container>
        <IconNav items={navigation} />
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
            height: '100vh'
          }}
          minWidth="190px"
          maxHeight="100vh"
          minHeight="100vh"
          >
          <CollapsableList>
            <CollapsableList.Item title="File explorer">
              <FileExplorer/>
            </CollapsableList.Item>
          </CollapsableList>
          </Resizable>
          <EditorContainer>
          <Editor/>
          </EditorContainer>
      </Container>
    </SandpackProvider>
  );
};

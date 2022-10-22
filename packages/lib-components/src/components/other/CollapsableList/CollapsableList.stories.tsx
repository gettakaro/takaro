import { SandpackProvider } from '@codesandbox/sandpack-react';
import { Meta, Story } from '@storybook/react';
import { CollapsableList } from '.';
import { FileExplorer } from '../IDE/FileExplorer';

export default {
  /** useStepper requires a context provider which is (currently) mounted on the root of the application.
   *  <StepperProvider /> requires no parameters.
   */
  title: 'Navigation/CollapsableList',
  component: CollapsableList
} as Meta;

export const Default: Story = () => {
  const files= {
    '/hooks/index.ts': {code: 'content here', active: true},
    '/cron/index.ts': {code: 'content here', },
    '/command/index.ts': {code: 'content here'}
  };


  return (
    <CollapsableList>
      <CollapsableList.Item title="Files">
    <SandpackProvider files={files}>
      <FileExplorer />
    </SandpackProvider>
      </CollapsableList.Item>
    </CollapsableList>
  );
};


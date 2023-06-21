import { FC, useEffect, useMemo } from 'react';
import {
  FileTabs,
  SandpackStack,
  SandpackThemeProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { useModule } from 'hooks/useModule';
import { useDebounce, styled } from '@takaro/lib-components';
import { handleCustomTypes } from './customTypes';
import { defineTheme } from './theme';
import { useFunctionUpdate } from 'queries/modules/queries';

const StyledFileTabs = styled(FileTabs)`
  border-bottom: 0px;
`;

export type EditorProps = {
  readOnly?: boolean;
};

export const Editor: FC<EditorProps> = ({ readOnly }) => {
  const { code, updateCode } = useActiveCode();
  const monaco = useMonaco();
  const debouncedCode = useDebounce<string>(code, 2000);
  const { moduleData } = useModule();
  const { sandpack } = useSandpack();
  const { mutateAsync: updateFunction } = useFunctionUpdate();

  useMemo(() => {
    if (monaco) {
      defineTheme(monaco);
      monaco.editor.setTheme('takaro');

      // only load monaco types if there is no model
      if (monaco.editor.getModels().length === 0) {
        handleCustomTypes(monaco);
      }
    }
  }, [monaco]);

  useEffect(() => {
    if (debouncedCode !== '' && moduleData.fileMap[sandpack.activeFile]) {
      updateFunction({
        functionId: moduleData.fileMap[sandpack.activeFile].functionId,
        fn: { code: debouncedCode },
      });
    }
  }, [debouncedCode, sandpack.activeFile, moduleData.fileMap]);

  return (
    <SandpackThemeProvider theme="auto" style={{ width: '100%' }}>
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <StyledFileTabs closableTabs />
        <MonacoEditor
          width="100%"
          height="100%"
          language="typescript"
          theme="takaro"
          key={sandpack.activeFile}
          defaultValue={code}
          onChange={(value) => updateCode(value || '')}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            renderWhitespace: 'none',
            lineNumbers: 'on',
            contextmenu: false,
            'semanticHighlighting.enabled': true,
            readOnly,
            fontSize: 12,
            fontFamily: 'Fira Code',
            lineHeight: 22,
            fontWeight: '400',
            fontLigatures: false,
          }}
        />
      </SandpackStack>
    </SandpackThemeProvider>
  );
};

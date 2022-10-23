import { FC, useMemo } from 'react';
import { FileTabs, SandpackStack, SandpackThemeProvider, useActiveCode, useSandpack } from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { defineTheme } from './theme';

export const Editor: FC = () => {
  const { code, updateCode } = useActiveCode();
  const monaco = useMonaco();
  const { sandpack } = useSandpack();

  useMemo(() => {
    if (monaco) {
      defineTheme(monaco);
      // monaco.editor.colorizeElement(document.getElementById('code')!, {});
    }
  }, [monaco]);

  if (!monaco) {
    return <div>'loading...'</div>;
  }

  return (
    <SandpackThemeProvider theme="auto">
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <FileTabs closableTabs />
        <div style={{ flex: 1, paddingTop: 8 }}>
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
              lineNumbers: 'on',
              contextmenu: false,
              readOnly: false,
              fontSize: 16,
            }}
          />
        </div>
      </SandpackStack>
    </SandpackThemeProvider >
  );
};

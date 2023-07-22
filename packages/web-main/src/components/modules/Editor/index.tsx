import { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FileTabs,
  SandpackStack,
  SandpackThemeProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import * as mon from 'monaco-editor';
import { useModule } from 'hooks/useModule';
import { useDebounce, styled, ContextMenu } from '@takaro/lib-components';
import { handleCustomTypes } from './customTypes';
import { defineTheme } from './theme';
import { useFunctionUpdate } from 'queries/modules/queries';
import { useSnackbar } from 'notistack';

const StyledDiv = styled.div`
  width: 100%;
  height: 100%;

  .glyph-error {
    /* error icon */
  }
`;

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
  const { enqueueSnackbar } = useSnackbar();
  const { moduleData } = useModule();
  const { sandpack } = useSandpack();
  const { mutateAsync: updateFunction } = useFunctionUpdate();
  const editorInstance = useRef<mon.editor.IStandaloneCodeEditor>();
  const containerRef = useRef<HTMLDivElement | null>(null);

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

  interface saveFileOptions {
    manual?: boolean;
    editor?: mon.editor.IStandaloneCodeEditor;
    code: string;
  }

  const saveFile = useCallback(
    async ({ manual, editor }: saveFileOptions) => {
      const editorInstanceToUse = editor || editorInstance.current;

      if (!editorInstanceToUse) {
        return;
      }

      if (readOnly && manual) {
        enqueueSnackbar('You cannot save a read-only file', { variant: 'default', type: 'error' });
        return;
      }

      const model = editor!.getModel();

      if (model) {
        const markers = monaco?.editor.getModelMarkers({ resource: model.uri });
        const hasSyntaxErrors = markers?.some((marker) => marker.severity === monaco?.MarkerSeverity.Error);

        if (hasSyntaxErrors && manual) {
          enqueueSnackbar('Cannot save file, it still contains syntax errors', { variant: 'default', type: 'error' });
          return;
        }
      }

      await updateFunction({
        functionId: moduleData.fileMap[sandpack.activeFile].functionId,
        fn: { code: debouncedCode },
      });
    },
    [monaco]
  );

  useEffect(() => {
    if (!readOnly && debouncedCode !== '' && moduleData.fileMap[sandpack.activeFile]) {
      saveFile({ manual: false, code: debouncedCode });
    }
  }, [debouncedCode, sandpack.activeFile, moduleData.fileMap, updateFunction, readOnly]);

  return (
    <SandpackThemeProvider theme="auto" style={{ width: '100%' }}>
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <StyledFileTabs closableTabs />
        <StyledDiv>
          <ContextMenu targetRef={containerRef}>
            <ContextMenu.Group divider>
              <ContextMenu.Item
                shortcut="Ctrl+F12"
                label="Go to definition"
                onClick={() => editorInstance.current?.getAction('')?.run()}
              />
              <ContextMenu.Item shortcut="Ctrl+Shift+F10" label="Peek definition" />
              <ContextMenu.Item label="Go to type defintion" />
              <ContextMenu.Item shortcut="Shift+Alt+F12" label="Find all references" />
              <ContextMenu.Item label="Peek all references" />
            </ContextMenu.Group>
            <ContextMenu.Group divider>
              <ContextMenu.Item label="Rename symbol" shortcut="F2" />
              <ContextMenu.Item label="Format document" shortcut="Ctrl+Shift+I" />
              <ContextMenu.Item label="Refactor..." />
            </ContextMenu.Group>
            <ContextMenu.Group divider>
              <ContextMenu.Item label="Cut" />
              <ContextMenu.Item label="Copy" />
            </ContextMenu.Group>
            <ContextMenu.Item label="Command palette" shortcut="Ctrl+Shift+P" />
          </ContextMenu>

          <MonacoEditor
            width="100%"
            height="100%"
            language="typescript"
            theme="takaro"
            key={sandpack.activeFile}
            defaultValue={code}
            onMount={(editor, monaco) => {
              containerRef.current = document.querySelector('.monaco-scrollable-element');

              // Force Monaco to reconsider font size
              editor.updateOptions({ fontSize: 13 }); // slightly smaller

              setTimeout(() => {
                editor.updateOptions({ fontSize: 14 }); // back to normal
              }, 100);

              editor.addAction({
                id: 'save',
                label: 'Save File',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: () => saveFile({ manual: true, editor, code: editor.getValue() }),
              });

              editor.addAction({
                id: 'my-unique-id',
                label: 'Quick Fix',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
                contextMenuGroupId: '2_correction',
                contextMenuOrder: 1,
                run: () => editor.getAction('editor.action.quickFix')?.run(),
              });

              // keep this at bottom

              editorInstance.current = editor;

              /*
              const model = editor.getModel()!;
              monaco?.editor.setModelMarkers(model, 'owner', [
                {
                  startLineNumber: 2,
                  startColumn: 1,
                  endLineNumber: 2,
                  endColumn: 5,
                  message: 'Erorr!',
                  severity: monaco.MarkerSeverity.Error,
                },
              ]);
              */
            }}
            onChange={(value) => !readOnly && updateCode(value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              renderWhitespace: 'none',
              lineNumbers: 'on',
              contextmenu: false,
              'semanticHighlighting.enabled': true,
              tabSize: 2,
              readOnly,
              fontSize: 14,
              glyphMargin: true,
              lineHeight: 22,
              fontFamily: 'Fira Code',
              folding: true,
              renderLineHighlight: 'line',
              fontWeight: '400',
              guides: {
                indentation: true,
                bracketPairs: false,
                bracketPairsHorizontal: true,
                highlightActiveBracketPair: true,
                highlightActiveIndentation: true,
              },
              fontLigatures: false,
              formatOnType: true,
              formatOnPaste: true,
              smoothScrolling: true,
              scrollBeyondLastLine: false,
              rulers: [120],
              autoIndent: 'full',
              autoClosingQuotes: 'always',
              multiCursorModifier: 'alt',
              inlayHints: {
                enabled: 'on',
              },
              autoClosingBrackets: 'always',
              automaticLayout: true,
              links: true,
              lightbulb: {
                enabled: true,
              },
              mouseWheelZoom: true,
              parameterHints: {
                enabled: true,
              },
              showFoldingControls: 'always',
              find: {
                autoFindInSelection: 'always',
              },
              suggest: {
                insertMode: 'replace', // Other option is 'insert'.
                showIcons: true,
                filterGraceful: true,
                showMethods: true,
                showFunctions: true,
                showConstructors: true,
                showFields: true,
                showVariables: true,
                showClasses: true,
                showStructs: true,
                showInterfaces: true,
                showModules: true,
                showProperties: true,
                showEvents: true,
                showOperators: true,
                showUnits: true,
                showValues: true,
                showConstants: true,
                showEnums: true,
                showEnumMembers: true,
                showIssues: true,
                showUsers: true,
                showFolders: true,
                showKeywords: true,
                showColors: true,
                showFiles: true,
                showReferences: true,
                showSnippets: true,
              },
            }}
          />
        </StyledDiv>
      </SandpackStack>
    </SandpackThemeProvider>
  );
};

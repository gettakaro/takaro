import { FC, useMemo, useRef, useState } from 'react';
import { SandpackStack, SandpackThemeProvider, useActiveCode, useSandpack } from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import * as mon from 'monaco-editor';
import { useModule } from 'hooks/useModule';
import { styled, ContextMenu } from '@takaro/lib-components';
import { FileTabs } from './FileTabs';
import { handleCustomTypes } from './customTypes';
import { defineTheme } from './theme';
import { useFunctionUpdate } from 'queries/modules/queries';
import { useSnackbar } from 'notistack';
import * as Sentry from '@sentry/react';

const StyledDiv = styled.div`
  width: 100%;
  height: 100%;
`;

export type EditorProps = {
  readOnly?: boolean;
};

export const Editor: FC<EditorProps> = ({ readOnly }) => {
  const { code, updateCode } = useActiveCode();
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [modelVersionId, setModelVersionId] = useState<number>();
  const { enqueueSnackbar } = useSnackbar();
  const monaco = useMonaco();
  const { moduleData } = useModule();
  const { sandpack } = useSandpack();
  const { mutateAsync: updateFunction } = useFunctionUpdate();
  const editorInstance = useRef<mon.editor.IStandaloneCodeEditor>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<typeof mon | null>(null);

  const handleCopyOperation = async () => {
    const editor = editorInstance.current;
    if (editor) {
      const model = editor.getModel();
      const selection = editor.getSelection();
      if (model && selection) {
        const selectedText = model.getValueInRange(selection);
        try {
          await navigator.clipboard.writeText(selectedText);
        } catch (e) {
          enqueueSnackbar('Could not copy text to clipboard', { variant: 'default', type: 'error' });
        }
      }
    }
  };
  const handleCutOperation = async () => {
    const editor = editorInstance.current;
    if (editor) {
      const model = editor.getModel();
      const selection = editor.getSelection();
      if (model && selection) {
        const selectedText = model.getValueInRange(selection);
        try {
          await navigator.clipboard.writeText(selectedText);
          editor.executeEdits('', [{ range: selection, text: '' }]);
        } catch (e) {
          enqueueSnackbar('Could not cut text to clipboard', { variant: 'default', type: 'error' });
        }
      }
    }
  };

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

  const saveFile = async () => {
    try {
      if (readOnly) {
        enqueueSnackbar('You cannot save a read-only file', { variant: 'default', type: 'error' });
        return;
      }

      const model = editorInstance.current?.getModel();

      if (model) {
        /*
         * We can not use this because the modelMarkers are updated async
         * and are not immediately up to date. A better solution would be to
         * use an actual typescript server to check the syntax errors.
         
        const markers = monacoRef.current?.editor.getModelMarkers({ resource: model.uri });
        const hasSyntaxErrors = markers?.some((marker) => marker.severity === monacoRef.current?.MarkerSeverity.Error);
        console.log(hasSyntaxErrors);
 
        if (hasSyntaxErrors) {
          enqueueSnackbar(<span>Cannot save file with syntax errors. Please fix the errors and try again.</span>, {
            variant: 'default',
            type: 'error',
          });
          return;
        }*/

        await updateFunction({
          functionId: moduleData.fileMap[sandpack.activeFile].functionId,
          fn: { code: model.getValue() },
        });

        // the new model version is now the one saved in the database
        // so undoing to the first state is not equal to the saved state
        setModelVersionId(model.getAlternativeVersionId());

        setDirtyFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(sandpack.activeFile);
          return newSet;
        });
      }
    } catch (e) {
      enqueueSnackbar('Something went wrong while saving the file', { variant: 'default', type: 'error' });
      Sentry.captureException(e);
    }
  };

  return (
    <SandpackThemeProvider theme="auto" style={{ width: '100%' }}>
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <FileTabs closableTabs dirtyFiles={dirtyFiles} setDirtyFiles={setDirtyFiles} />
        <StyledDiv>
          <ContextMenu targetRef={containerRef}>
            <ContextMenu.Group divider>
              {/* TODO: These are not native and require a separate typescript language server */}
              {/* <ContextMenu.Item shortcut="Shift+Alt+F12" label="Find all references" />*/}
              {/*<ContextMenu.Item label="Peek all references" />*/}
              {/*<ContextMenu.Item shortcut="Ctrl+F12" label="Go to definition" />*/}
              {/*<ContextMenu.Item label="Go to type defintion" />*/}
              {/*<ContextMenu.Item shortcut="Ctrl+Shift+F10" label="Peek definition"/>*/}
            </ContextMenu.Group>
            <ContextMenu.Group divider>
              <ContextMenu.Item
                label="Rename symbol"
                shortcut="F2"
                onClick={() => editorInstance.current?.trigger('contextmenu', 'editor.action.rename', null)}
              />
              <ContextMenu.Item
                label="Format document"
                shortcut="Ctrl+Shift+I"
                onClick={() => editorInstance.current?.trigger('contextmenu', 'editor.action.formatDocument', null)}
              />
              <ContextMenu.Item
                label="Quick fix"
                shortcut="Ctrl+L"
                onClick={() => editorInstance.current?.trigger('contextmenu', 'editor.action.quickFix', null)}
              />
            </ContextMenu.Group>
            <ContextMenu.Group divider>
              <ContextMenu.Item label="Cut" onClick={handleCutOperation} />

              {/* Due to browser restrictions, custom paste is hard and is often not provided in context menu, only native ctrl+v is supported*/}
              <ContextMenu.Item label="Copy" onClick={handleCopyOperation} />
            </ContextMenu.Group>
            {/* TODO: Monaco only provides with all commands, but not the UI */}
            {/*<ContextMenu.Item label="Command palette" shortcut="Ctrl+Shift+P" />*/}
          </ContextMenu>

          <MonacoEditor
            width="100%"
            height="100%"
            language="typescript"
            theme="takaro"
            key={sandpack.activeFile}
            defaultValue={code}
            beforeMount={(monaco) => {
              monacoRef.current = monaco;
            }}
            onMount={(editor, monaco) => {
              containerRef.current = document.querySelector('.monaco-scrollable-element');
              if (!monaco) {
                throw new Error('Monaco is not defined');
              }

              editor.addAction({
                id: 'save',
                label: 'Save File',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: async () => {
                  await editor.getAction('editor.action.formatDocument')?.run();
                  saveFile();
                },
              });

              editor.addAction({
                id: 'my-unique-id',
                label: 'Quick Fix',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
                contextMenuGroupId: '2_correction',
                contextMenuOrder: 1,
                run: () => editor.getAction('editor.action.quickFix')?.run(),
              });

              editor.addAction({
                id: 'formatDocument',
                label: 'Format Document',
                keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyI], // Ctrl + Shift + I
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: () => editor.getAction('editor.action.formatDocument')?.run(),
              });

              editor.addAction({
                id: 'renameSymbol',
                label: 'Rename Symbol',
                keybindings: [monaco.KeyCode.F2], // F2
                contextMenuGroupId: 'navigation',
                contextMenuOrder: 1.5,
                run: () => editor.getAction('editor.action.rename')?.run(),
              });

              setModelVersionId(editor.getModel()?.getAlternativeVersionId());

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
            onChange={(value) => {
              if (readOnly) return;

              // update the code in the sandpack
              updateCode(value || '');

              if (modelVersionId !== editorInstance.current?.getModel()?.getAlternativeVersionId()) {
                setDirtyFiles((prev) => new Set([...prev, sandpack.activeFile]));
              } else {
                setDirtyFiles((prev) => {
                  const newSet = new Set(prev);
                  newSet.delete(sandpack.activeFile);
                  return newSet;
                });
              }
            }}
            options={{
              minimap: { enabled: true },
              wordWrap: 'on',
              renderWhitespace: 'none',
              lineNumbers: 'on',
              contextmenu: false,
              'semanticHighlighting.enabled': true,
              tabSize: 2,
              readOnly,
              fontSize: 14,
              glyphMargin: false,
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

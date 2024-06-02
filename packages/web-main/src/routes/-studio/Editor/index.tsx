import { FC, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import * as mon from 'monaco-editor';
import { FileTabs } from './FileTabs';
import { FunctionType, setExtraLibs } from './customTypes';
import { defineTheme } from './theme';
import { useFunctionUpdate } from 'queries/module';
import { useSnackbar } from 'notistack';
import { Button, Tooltip, styled } from '@takaro/lib-components';
import { AiFillSave as SaveIcon } from 'react-icons/ai';
import { useStudioContext } from '../useStudioStore';
import { useActiveCode } from '../useActiveCode';

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
`;

export type EditorProps = {
  readOnly?: boolean;
};

/* NOTE: Context menu paste is not supported due to security reasons.
 * Paste is restricted so that contents of the clipboard cannot be viewed by a random website without a user's knowledge
 * https://github.com/Automattic/simplenote-electron/issues/2994
 */

export const Editor: FC<EditorProps> = ({ readOnly }) => {
  const { code, updateCode } = useActiveCode();
  const [dirtyFiles, setDirtyFiles] = useState<Set<string>>(new Set());
  const [modelVersionId, setModelVersionId] = useState<number>();
  const { enqueueSnackbar } = useSnackbar();
  const { mutateAsync: updateFunction } = useFunctionUpdate();
  const editorInstance = useRef<mon.editor.IStandaloneCodeEditor>();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const monacoRef = useRef<typeof mon | null>(null);
  const fileMap = useStudioContext((s) => s.fileMap);

  const activeFile = useStudioContext((s) => s.activeFile);
  if (!activeFile) {
    throw new Error('Editor should not be rendered without an active file');
  }

  const saveFile = async () => {
    if (!activeFile) return;
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
          functionId: fileMap[activeFile].functionId,
          fn: { code: model.getValue() },
        });

        // the new model version is now the one saved in the database
        // so undoing to the first state is not equal to the saved state
        setModelVersionId(model.getAlternativeVersionId());

        setDirtyFiles((prev) => {
          const newSet = new Set(prev);
          newSet.delete(activeFile);
          return newSet;
        });
      }
    } catch (e) {
      enqueueSnackbar('Something went wrong while saving the file', { variant: 'default', type: 'error' });
    }
  };

  return (
    <Stack>
      <FileTabs closableTabs dirtyFiles={dirtyFiles} setDirtyFiles={setDirtyFiles} />
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MonacoEditor
          width="100%"
          height="100%"
          language="typescript"
          theme="takaro"
          path={activeFile}
          key={activeFile}
          defaultValue={code}
          defaultLanguage="typescript"
          beforeMount={async (monaco) => {
            // Monaco is calculating positions based on the font size.
            // If the font is not loaded yet, the positions will be wrong.
            await document.fonts.ready;
            monaco.editor.remeasureFonts();

            // this is ran everytime the file changes
            monacoRef.current = monaco;
            defineTheme(monaco);
            monaco.editor.setTheme('takaro');
            monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
            const compilerOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

            monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
              ...compilerOptions,
              lib: ['es2020'],
              module: mon.languages.typescript.ModuleKind.ESNext,
              allowNonTsExtensions: true,
              experimentalDecorators: true,
              target: mon.languages.typescript.ScriptTarget.ES2020,
              moduleResolution: mon.languages.typescript.ModuleResolutionKind.NodeJs,
              paths: {
                '@takaro/helpers': ['index.d.ts'],
              },
            });

            monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
              noSemanticValidation: false,
              noSyntaxValidation: false,
            });

            if (activeFile.startsWith('/commands/')) {
              setExtraLibs(monaco, FunctionType.Command);
            }
            if (activeFile.startsWith('/cronjobs/')) {
              setExtraLibs(monaco, FunctionType.Cron);
            }
            if (activeFile.startsWith('/hooks/')) {
              setExtraLibs(monaco, FunctionType.Hook);
            }
          }}
          onMount={(editor, monaco) => {
            containerRef.current = document.querySelector('.monaco-scrollable-element');

            if (!monaco) {
              throw new Error('Monaco is not defined');
            }

            editor.createContextKey('canEdit', !readOnly);

            editor.addAction({
              precondition: 'canEdit',
              id: 'save',
              label: 'Save File',
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
              contextMenuOrder: 1,
              contextMenuGroupId: '8_modification',
              run: async () => {
                await editor.getAction('editor.action.formatDocument')?.run();
                saveFile();
              },
            });

            editor.addAction({
              precondition: 'canEdit',
              id: 'my-unique-id',
              label: 'Quick Fix',
              contextMenuOrder: 2,
              contextMenuGroupId: '8_modification',
              keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL],
              run: () => editor.getAction('editor.action.quickFix')?.run(),
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
              setDirtyFiles((prev) => new Set([...prev, activeFile]));
            } else {
              setDirtyFiles((prev) => {
                const newSet = new Set(prev);
                newSet.delete(activeFile);
                return newSet;
              });
            }
          }}
          options={{
            minimap: { enabled: true },
            wordWrap: 'on',
            renderWhitespace: 'none',
            lineNumbers: 'on',
            contextmenu: true,
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
              enabled: mon.editor.ShowLightbulbIconMode.On,
            },
            mouseWheelZoom: true,
            parameterHints: {
              enabled: true,
            },
            showFoldingControls: 'always',
            find: {
              autoFindInSelection: 'never', // Search can be done in the selected area.
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
        {dirtyFiles.has(activeFile) && (
          <div style={{ position: 'fixed', bottom: '20px', right: '40px' }}>
            <Tooltip>
              <Tooltip.Trigger asChild>
                <Button
                  icon={<SaveIcon />}
                  text="Save file"
                  onClick={() => {
                    editorInstance.current?.getAction('save')?.run();
                  }}
                />
              </Tooltip.Trigger>
              <Tooltip.Content>
                You can also save with <strong>CTRL+S</strong>
              </Tooltip.Content>
            </Tooltip>
          </div>
        )}
      </div>
    </Stack>
  );
};

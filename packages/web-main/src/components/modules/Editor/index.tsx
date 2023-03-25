import { FC, useEffect, useMemo, useState } from 'react';
import {
  FileTabs,
  SandpackStack,
  SandpackThemeProvider,
  useActiveCode,
  useSandpack,
} from '@codesandbox/sandpack-react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { defineTheme } from './theme';
import { useModule } from 'hooks/useModule';
import { useApiClient } from 'hooks/useApiClient';
import { useDebounce, styled } from '@takaro/lib-components';
import customTypes from './monacoCustomTypes.json';
import { languages } from 'monaco-editor';

const Wrapper = styled.div`
  flex: 1;
  padding-top: 8px;
  background-color: ${({ theme }): string => theme.colors.primary};

  a,
  p,
  div,
  li,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  header,
  footer {
    font-family: 'Fira Code';
    color: none;
  }
`;

const StyledFileTabs = styled(FileTabs)`
  &:hover {
    svg {
      fill: ${({ theme }): string => theme.colors.primary};
      stroke: ${({ theme }): string => theme.colors.primary};
    }
  }
`;

export const Editor: FC = () => {
  const { code, updateCode } = useActiveCode();
  const monaco = useMonaco();
  const apiClient = useApiClient();
  const debouncedCode = useDebounce<string>(code, 2000);
  const { moduleData } = useModule();
  const { sandpack } = useSandpack();
  const [shouldHandleCustomTypes, setShouldHandleCustomTypes] = useState(true);

  // TODO: this should be moved to react query
  useEffect(() => {
    if (debouncedCode !== '' && moduleData.fileMap[sandpack.activeFile]) {
      apiClient.function.functionControllerUpdate(
        moduleData.fileMap[sandpack.activeFile].functionId,
        { code: debouncedCode }
      );
    }
  }, [debouncedCode, sandpack.activeFile, apiClient, moduleData.fileMap]);

  useMemo(() => {
    if (monaco) {
      defineTheme(monaco);
      monaco.editor.setTheme('takaro');

      var testlibSource = [
        '   declare module Kaka {',
        '     constructor(config: IApiClientConfig);',
        '     private addAuthHeaders;',
        '     set username(username: string);',
        '     set password(password: string);',
        '     login(): Promise<void>;',
        '     logout(): void;',
        '     get user(): UserApi;',
        '     get role(): RoleApi;',
        '     get gameserver(): GameServerApi;',
        '     get cronjob(): CronJobApi;',
        '     get function(): FunctionApi;',
        '     get module(): ModuleApi;',
        '     get hook(): HookApi;',
        '     get command(): CommandApi;',
        '     get player(): PlayerApi;',
        '     get settings(): SettingsApi;',
        '     get variable(): VariableApi;',
        ' }      ',
      ].join('\n');
      var testlibUri = 'ts:filename/facts.d.ts';

      if (shouldHandleCustomTypes) {
        setShouldHandleCustomTypes(false);
        console.log('HANDLING CUSTOM TYPES');
        monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
        const compilerOptions =
          monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

        monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
          ...compilerOptions,
          lib: ['es2020'],
          allowNonTsExtensions: true,
          experimentalDecorators: true,
          target: languages.typescript.ScriptTarget.ES2020,
          moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
          paths: {
            '@takaro/helpers': ['node_modules/@takaro/helpers/dist'],
          },
        });

        let extraLibs: { content: string; libUri: string }[] = [];
        extraLibs.push({
          content: testlibSource,
          libUri: testlibUri,
        });

        // add takaro library to monaco
        for (const libUri of Object.keys(customTypes)) {
          const content = customTypes[libUri];
          console.log(libUri);
          console.log(content);

          extraLibs.push({
            content,
            libUri: monaco.Uri.file(libUri).toString(true),
          });
        }

        monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);

        extraLibs.forEach((lib) =>
          monaco.editor.createModel(
            lib.content,
            'typescript',
            monaco.Uri.parse(lib.libUri)
          )
        );
      }

      // monaco.editor.colorizeElement(document.getElementById('code')!, {});
    }
  }, [monaco]);

  return (
    <SandpackThemeProvider theme="auto">
      <SandpackStack style={{ height: '100vh', margin: 0 }}>
        <StyledFileTabs closableTabs />
        <Wrapper>
          <MonacoEditor
            width="100%"
            height="100%"
            language="typescript"
            theme="takaro"
            loading={<div>loading...</div>}
            key={sandpack.activeFile}
            defaultValue={code}
            className="code-editor"
            onChange={(value) => updateCode(value || '')}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              contextmenu: false,
              'semanticHighlighting.enabled': true,
              readOnly: false,
              fontSize: 17,
              fontWeight: 'bold',
              fontLigatures: false,
            }}
          />
        </Wrapper>
      </SandpackStack>
    </SandpackThemeProvider>
  );
};

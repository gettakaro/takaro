import { Monaco } from '@monaco-editor/react';
import customTypes from './monacoCustomTypes.json';
import { languages } from 'monaco-editor';

export function handleCustomTypes(monaco: Monaco) {
  // Need to do this 'manually' to get this working
  // There's a lot of _weirdness_ in play here
  // We are importing "files" in Monaco, but Monaco cannot access a real file system
  // This "packages" up the exports we get from the ts build and makes it easier to access for Monaco
  const libSource = [
    // eslint-disable-next-line quotes
    "declare module '@takaro/helpers' {",
    '    declare function getData(): Promise<any>',
    '    declare function getTakaro(data: Record<string, string>): Promise<Client>;',
    '}',
  ].join('\n');
  const libUri = 'file:///node_modules/@takaro/helpers';

  monaco.languages.typescript.typescriptDefaults.setEagerModelSync(true);
  const compilerOptions = monaco.languages.typescript.typescriptDefaults.getCompilerOptions();

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    ...compilerOptions,
    lib: ['es2020'],
    allowNonTsExtensions: true,
    experimentalDecorators: true,
    target: languages.typescript.ScriptTarget.ES2020,
    moduleResolution: languages.typescript.ModuleResolutionKind.NodeJs,
    paths: {
      '@takaro/helpers': ['index.d.ts'],
    },
  });

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  const extraLibs: { content: string; libUri: string }[] = [];
  extraLibs.push({
    content: libSource,
    libUri: libUri,
  });

  // add takaro library to monaco
  for (const libUri of Object.keys(customTypes)) {
    const content = customTypes[libUri];
    extraLibs.push({
      content,
      libUri: monaco.Uri.file(libUri).toString(true),
    });
  }

  monaco.languages.typescript.typescriptDefaults.setExtraLibs(extraLibs);

  extraLibs.forEach((lib) => monaco.editor.createModel(lib.content, 'typescript', monaco.Uri.parse(lib.libUri)));
}

import { Monaco } from '@monaco-editor/react';
import customTypes from './monacoCustomTypes.json';
import { languages } from 'monaco-editor';

export function handleCustomTypes(monaco: Monaco) {
  var testlibSource = [
    "declare module '@takaro/helpers' {",
    '    declare function getData(): Promise<any>',
    '    declare function getTakaro(data: Record<string, string>): Promise<Client>;',
    '}',
  ].join('\n');
  var testlibUri = 'file:///node_modules/@takaro/helpers';

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
      '@takaro/helpers': ['index.d.ts'],
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

import { Monaco } from '@monaco-editor/react';
import { theme } from '../../../../styled';

/* eventually all used colors should become part of editorTheme but for now playing around with default colors to define what key has impact on what.
const editorTheme = {
  highlightBackground: '#202229',
  selectionBackground: theme.colors.primary
};
*/

export function defineTheme(monaco: Monaco) {
  const t: Record<string, string> = {};
  for (const [key, value] of Object.entries(theme.colors)) {
    t[key] = value.substring(1);
  }

  monaco.editor.defineTheme('takaro', {
    base: 'vs-dark',
    inherit: false,

    // Rules are based on the tokenizer.
    rules: [
      { token: '', background: '282a36' },
      { token: 'comment', foreground: '757575' },
      { token: 'string', foreground: '98C379' },
      { token: 'constant.numeric', foreground: 'bd93f9' },
      { token: 'constant.language', foreground: 'bd93f9' },
      { token: 'constant.character', foreground: 'bd93f9' },
      { token: 'constant.other', foreground: 'bd93f9' },
      { token: 'variable.other.readwrite.instance', foreground: 'ffb86c' },
      { token: 'constant.character.escaped', foreground: 'ff79c6' },
      { token: 'constant.character.escape', foreground: 'ff79c6' },
      { token: 'string source', foreground: 'ff79c6' },
      { token: 'string source.ruby', foreground: 'ff79c6' },
      { token: 'keyword', foreground: t.primary },
      { token: 'storage', foreground: 'ff79c6' },
      { token: 'storage.type', foreground: '8be9fd', fontStyle: 'italic' },
      {
        token: 'entity.name.class',
        foreground: '50fa7b',
        fontStyle: 'underline',
      },
      {
        token: 'entity.other.inherited-class',
        foreground: '50fa7b',
        fontStyle: 'italic underline',
      },
      { token: 'entity.name.function', foreground: '62AEEF' },
      {
        token: 'variable.parameter',
        foreground: 'ffb86c',
        fontStyle: 'italic',
      },
      { token: 'entity.name.tag', foreground: 'E06C75' },
      { token: 'entity.other.attribute-name', foreground: '50fa7b' },
      { token: 'support.function', foreground: '8be9fd' },
      { token: 'support.constant', foreground: '6be5fd' },
      { token: 'support.type', foreground: '66d9ef', fontStyle: ' italic' },
      { token: 'support.class', foreground: '66d9ef', fontStyle: ' italic' },
      { token: 'invalid', foreground: 'f8f8f0', background: 'ff79c6' },
      {
        token: 'invalid.deprecated',
        foreground: 'f8f8f0',
        background: 'bd93f9',
      },
      {
        token: 'meta.structure.dictionary.json string.quoted.double.json',
        foreground: 'cfcfc2',
      },
      { token: 'meta.diff', foreground: '6272a4' },
      { token: 'meta.diff.header', foreground: '6272a4' },
      { token: 'markup.deleted', foreground: 'ff79c6' },
      { token: 'markup.inserted', foreground: '50fa7b' },
      { token: 'markup.changed', foreground: 'e6db74' },
      {
        token: 'constant.numeric.line-number.find-in-files - match',
        foreground: 'bd93f9',
      },
      { token: 'entity.name.filename', foreground: 'e6db74' },
      { token: 'message.error', foreground: 'f83333' },
      {
        token:
          'punctuation.definition.string.begin.json - meta.structure.dictionary.value.json',
        foreground: 'eeeeee',
      },
      {
        token:
          'punctuation.definition.string.end.json - meta.structure.dictionary.value.json',
        foreground: 'eeeeee',
      },
      {
        token: 'meta.structure.dictionary.json string.quoted.double.json',
        foreground: '8be9fd',
      },
      {
        token: 'meta.structure.dictionary.value.json string.quoted.double.json',
        foreground: 'f1fa8c',
      },
      {
        token:
          'meta meta meta meta meta meta meta.structure.dictionary.value string',
        foreground: '50fa7b',
      },
      {
        token:
          'meta meta meta meta meta meta.structure.dictionary.value string',
        foreground: 'ffb86c',
      },
      {
        token: 'meta meta meta meta meta.structure.dictionary.value string',
        foreground: 'ff79c6',
      },
      {
        token: 'meta meta meta meta.structure.dictionary.value string',
        foreground: 'bd93f9',
      },
      {
        token: 'meta meta meta.structure.dictionary.value string',
        foreground: '50fa7b',
      },
      {
        token: 'meta meta.structure.dictionary.value string',
        foreground: 'ffb86c',
      },
    ],

    // https://code.visualstudio.com/api/references/theme-color
    colors: {
      // editor
      'editor.foreground': '#A8B1C2',
      'editor.background': '#23262E',
      'editor.selectionBackground': `${theme.colors.primary}44`,

      'editor.wordHighlightBackground': `${theme.colors.primary}44`,

      'editor.findMatchBackground': `${theme.colors.primary}DD`,
      'editor.findMatchHighlightBackground': `${theme.colors.primary}44`,

      'editor.hoverHighlightBackground': `${theme.colors.primary}44`,

      'editor.descriptionForeground': '#f8f8f8', // o.a. kleur van beschrijving van functie bij hover.
      'editor.lineHighlightBackground': '#202229',
      'editorCursor.foreground': '#f8f8f0',
      'editorWhitespace.foreground': '#3B3A32',
      'editorIndentGuide.activeBackground': '#9D550FB0',
      'editor.selectionHighlightBorder': '#222218',

      'editor.dropdown.background': '#FF00FF',

      'badge.foreground': '#00FF00',

      // editor widget colors
      'editorWidget.foreground': '#00FF00',
      'editorWidget.background': '#202229',
      'editorWidget.border': '#FF00FF',
      'editorWidget.resizeBorder': theme.colors.primary,

      'editorBracketMatch.background': theme.colors.primary,

      // command palette
      'quickInput.background': '#0000FF',
      'quickInput.foreground': '#FFFF00',
      'quickInputList.focusBackground': theme.colors.primary,
      'quickInputList.focusForeground': theme.colors.white,
      'quickInputList.focusIconForeground': theme.colors.white,
      'quickInputTitle.background': '#ff00ff',

      // 'editorSuggestWidget.foreground': '#ff0000',
      'editorSuggestWidget.background': '#202229',
      'editorSuggestWidget.border': '#202229',
      'editorSuggestWidget.foreground': '#ff00ff',
      'editorSuggestWidget.focusHighlightForeground': theme.colors.white,
      'editorSuggestWidget.highlightForeground': theme.colors.primary,
      'editorSuggestWidget.selectedBackground': theme.colors.primary,
      'editorSuggestWidget.selectedForeground': theme.colors.white,
      'editorSuggestWidget.selectedIconForeground': theme.colors.white,
      'editorSuggestWidgetStatus.foreground': '#0000FF',

      // widget when hovering a keyword or definition
      'editorHoverWidget.foreground': '#F0FF00',
      'editorHoverWidget.background': '#202229',
      'editorHoverWidget.highlightForeground': theme.colors.primary,
      'editorHoverWidget.border': '#202229',
      'editorHoverWidget.statusBarBackground': '#00FFFF',

      'editorGhostText.border': '#00FFFF',
      'editorGhostText.foreground': '#f8f8f0',
      'editorGhostText.background': '#00FF00',

      // TODO: not implemented
      'debugExceptionWidget.background': '#000000',
      'debugExceptionWidget.border': '#000000',

      // TODO: not sure what this is: 'editorGhostText.background': '#ff0000',
    },
  });
}

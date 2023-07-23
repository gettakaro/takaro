import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { AutoFilterNode } from './FilterNode';
import { AutoFilterPlugin, FilterMatcher } from './AutoFilterPlugin';

const FILTER_MATCHER = /(?<column>\w+)=:(?<value>\w+)/;

// const SEARCH_MATCHER = /(\w+)*:(\w+)/;

const MATCHERS: FilterMatcher[] = [
  (text) => {
    const match = FILTER_MATCHER.exec(text);
    if (match === null || match.groups === undefined) {
      return null;
    }

    const fullMatch = match[0];
    return {
      index: match.index,
      length: fullMatch.length,
      column: match.groups.column,
      separator: '=:',
      value: match.groups.value,
    };
  },
];

export const InputField = () => {
  const initialConfig: InitialConfigType = {
    editorState: null,
    namespace: 'filter-and-search',
    nodes: [AutoFilterNode],
    onError: (error: Error) => {
      console.error(error);
      throw error;
    },
  };

  function onChange(editorState) {
    editorState.read(() => {});
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div>Type here...</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <AutoFilterPlugin matchers={MATCHERS} />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
};

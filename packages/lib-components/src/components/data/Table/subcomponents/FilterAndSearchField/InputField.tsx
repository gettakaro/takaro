import { $getRoot, $getSelection } from 'lexical';
import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import LexicalErrorBoundary from '@lexical/react/LexicalErrorBoundary';
import { AutoFilterNode } from './FilterNode';
import { AutoFilterPlugin } from './AutoFilterPlugin';

const _FILTER_MATCHER = /(\w+)=:(\w+)/;
const _SEARCH_MATCHER = /(\w+)*:(\w+)/;

export const InputField = () => {
  const initialConfig: InitialConfigType = {
    editorState: null,
    namespace: 'filter-and-search',
    nodes: [AutoFilterNode],
    onError: (error: Error) => {
      throw error;
    },
  };

  function onChange(editorState) {
    editorState.read(() => {
      // Read the contents of the EditorState here.
      const root = $getRoot();
      const selection = $getSelection();

      console.log(root, selection);
    });
  }

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div>
        <PlainTextPlugin
          contentEditable={<ContentEditable className="editor-input" />}
          placeholder={<div>"Type here..."</div>}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChange} />
        <AutoFilterPlugin />
        <HistoryPlugin />
      </div>
    </LexicalComposer>
  );
};

import type { EditorConfig, LexicalNode, NodeKey, SerializedTextNode } from 'lexical';

import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, TextNode } from 'lexical';

export class SearchNode extends TextNode {
  static getType(): string {
    return 'search';
  }

  static clone(node: SearchNode): SearchNode {
    return new SearchNode(node.__text, node.__key);
  }

  constructor(text: string, key?: NodeKey) {
    super(text, key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(element, 'search-node');
    return element;
  }

  static importJSON(serializedNode: SerializedTextNode): SearchNode {
    const node = $createSearchNode(serializedNode.text);
    node.setFormat(serializedNode.format);
    node.setDetail(serializedNode.detail);
    node.setMode(serializedNode.mode);
    node.setStyle(serializedNode.style);
    return node;
  }

  exportJSON(): SerializedTextNode {
    return {
      ...super.exportJSON(),
      type: 'search',
    };
  }

  canInsertTextBefore(): boolean {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

/**
 * Generates a HashtagNode, which is a string following the format of a # followed by some text, eg. #lexical.
 * @param text - The text used inside the HashtagNode.
 * @returns - The HashtagNode with the embedded text.
 */
export function $createSearchNode(text = ''): SearchNode {
  return $applyNodeReplacement(new SearchNode(text));
}

/**
 * Determines if node is a HashtagNode.
 * @param node - The node to be checked.
 * @returns true if node is a HashtagNode, false otherwise.
 */
export function $isSearchNode(node: LexicalNode | null | undefined): node is SearchNode {
  return node instanceof SearchNode;
}

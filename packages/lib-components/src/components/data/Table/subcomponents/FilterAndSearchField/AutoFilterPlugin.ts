/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ElementNode, LexicalEditor, LexicalNode } from 'lexical';
import { $isAutoFilterNode, $isFilterNode, AutoFilterNode } from './FilterNode';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { mergeRegister } from '@lexical/utils';
import { $isElementNode, $isLineBreakNode, $isTextNode, TextNode } from 'lexical';
import { useEffect } from 'react';

// invariant(condition, message) will refine types based on "condition", and
// if "condition" is false will throw an error. This function is special-cased
// in flow itself, so we can't name it anything else.
export default function invariant(cond?: boolean, message?: string, ..._args: string[]): asserts cond {
  if (cond) {
    return;
  }

  throw new Error(
    'Internal Lexical error: invariant() is meant to be replaced at compile ' +
      'time. There is no runtime version. Error: ' +
      message
  );
}

type ChangeHandler = (url: string | null, prevUrl: string | null) => void;

type FilterMatcherResult = {
  index: number;
  column: string;
  separator: string;
  value: string;
  length: number;
};

export type FilterMatcher = (text: string) => FilterMatcherResult | null;

const PUNCTUATION_OR_SPACE = /[.,;\s]/;

function isSeparator(char: string): boolean {
  return PUNCTUATION_OR_SPACE.test(char);
}

function endsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[textContent.length - 1]);
}

function startsWithSeparator(textContent: string): boolean {
  return isSeparator(textContent[0]);
}

function isPreviousNodeValid(node: LexicalNode): boolean {
  let previousNode = node.getPreviousSibling();
  if ($isElementNode(previousNode)) {
    previousNode = previousNode.getLastDescendant();
  }
  return (
    previousNode === null ||
    $isLineBreakNode(previousNode) ||
    ($isTextNode(previousNode) && endsWithSeparator(previousNode.getTextContent()))
  );
}

function isNextNodeValid(node: LexicalNode): boolean {
  let nextNode = node.getNextSibling();
  if ($isElementNode(nextNode)) {
    nextNode = nextNode.getFirstDescendant();
  }
  return (
    nextNode === null ||
    $isLineBreakNode(nextNode) ||
    ($isTextNode(nextNode) && startsWithSeparator(nextNode.getTextContent()))
  );
}

function handleFilterEdit(linkNode: AutoFilterNode, matchers: Array<FilterMatcher>, onChange: ChangeHandler): void {
  // Check children are simple text
  const children = linkNode.getChildren();
  const childrenLength = children.length;
  for (let i = 0; i < childrenLength; i++) {
    const child = children[i];
    if (!$isTextNode(child) || !child.isSimpleText()) {
      replaceWithChildren(linkNode);
      onChange(null, linkNode.getURL());
      return;
    }
  }
  // Check neighbors
  if (!isPreviousNodeValid(linkNode) || !isNextNodeValid(linkNode)) {
    replaceWithChildren(linkNode);
    onChange(null, linkNode.getURL());
    return;
  }
}

// Bad neighbours are edits in neighbor nodes that make AutoLinks incompatible.
// Given the creation preconditions, these can only be simple text nodes.
function handleBadNeighbors(textNode: TextNode, matchers: Array<FilterMatcher>, onChange: ChangeHandler): void {
  const previousSibling = textNode.getPreviousSibling();
  const nextSibling = textNode.getNextSibling();
  const text = textNode.getTextContent();

  if ($isAutoFilterNode(previousSibling) && !startsWithSeparator(text)) {
    previousSibling.append(textNode);
    handleFilterEdit(previousSibling, matchers, onChange);
    onChange(null, previousSibling.getURL());
  }

  if ($isAutoFilterNode(nextSibling) && !endsWithSeparator(text)) {
    replaceWithChildren(nextSibling);
    handleFilterEdit(nextSibling, matchers, onChange);
    onChange(null, nextSibling.getURL());
  }
}

function replaceWithChildren(node: ElementNode): Array<LexicalNode> {
  const children = node.getChildren();
  const childrenLength = children.length;

  for (let j = childrenLength - 1; j >= 0; j--) {
    node.insertAfter(children[j]);
  }

  node.remove();
  return children.map((child) => child.getLatest());
}

function useAutoFilter(editor: LexicalEditor, matchers: Array<FilterMatcher>, onChange?: ChangeHandler): void {
  useEffect(() => {
    if (!editor.hasNodes([AutoFilterNode])) {
      invariant(false, 'AutoFilterPlugin: AutoFilterNode not registered on editor');
    }

    const onChangeWrapped = (url: string | null, prevUrl: string | null) => {
      if (onChange) {
        onChange(url, prevUrl);
      }
    };

    return mergeRegister(
      editor.registerNodeTransform(TextNode, (textNode: TextNode) => {
        const parent = textNode.getParentOrThrow();
        const previous = textNode.getPreviousSibling();
        if ($isAutoFilterNode(parent)) {
          handleFilterEdit(parent, matchers, onChangeWrapped);
        } else if (!$isFilterNode(parent)) {
          if (
            textNode.isSimpleText() &&
            (startsWithSeparator(textNode.getTextContent()) || !$isAutoFilterNode(previous))
          ) {
          }

          handleBadNeighbors(textNode, matchers, onChangeWrapped);
        }
      })
    );
  }, [editor, matchers, onChange]);
}

export function AutoFilterPlugin({
  matchers,
  onChange,
}: {
  matchers: Array<FilterMatcher>;
  onChange?: ChangeHandler;
}): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useAutoFilter(editor, matchers, onChange);

  return null;
}

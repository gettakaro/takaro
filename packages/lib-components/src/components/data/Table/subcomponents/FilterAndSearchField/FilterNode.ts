/** @module @lexical/link */
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {
  EditorConfig,
  GridSelection,
  LexicalNode,
  NodeKey,
  NodeSelection,
  RangeSelection,
  SerializedElementNode,
} from 'lexical';

import { addClassNamesToElement } from '@lexical/utils';
import { $applyNodeReplacement, $isElementNode, $isRangeSelection, ElementNode, Spread } from 'lexical';

export type SerializedFilterNode = Spread<
  {
    column: string;
    separator: string;
    value: string;
  },
  SerializedElementNode
>;

export class FilterNode extends ElementNode {
  static getType(): string {
    return 'filter';
  }

  static clone(node: FilterNode): FilterNode {
    return new FilterNode(node.column, node.separator, node.value, node.__key);
  }

  constructor(column: string, separator: string, value: string, key?: NodeKey) {
    super(key);
    this.__column = column;
    this.__separator = separator;
    this.__value = value;
  }

  createDOM(_config: EditorConfig): HTMLDivElement {
    const element = document.createElement('div');

    // column div
    const columnDiv = document.createElement('div');
    columnDiv.className = 'column';
    columnDiv.innerText = this.__column;
    element.appendChild(columnDiv);

    // separator div
    const separatorDiv = document.createElement('div');
    separatorDiv.className = 'separator';
    separatorDiv.innerText = this.__separator;
    element.appendChild(separatorDiv);

    // value div
    const valueDiv = document.createElement('div');
    valueDiv.className = 'value';
    valueDiv.innerText = this.__value;
    element.appendChild(valueDiv);

    addClassNamesToElement(element, 'filter-node');
    return element;
  }

  updateDOM(_prevNode: FilterNode, _anchor: HTMLAnchorElement, _config: EditorConfig): boolean {
    const _column = this.__column;
    const _separator = this.__separator;
    const _value = this.__value;

    return false;
  }

  static importJSON(serializedNode: SerializedFilterNode): FilterNode {
    const node = $createFilterNode(serializedNode.column, serializedNode.separator, serializedNode.value);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedFilterNode {
    return {
      ...super.exportJSON(),
      column: this.getColumn(),
      separator: this.getSeparator(),
      value: this.getValue(),
      type: 'filter-node',
      version: 1,
    };
  }

  // getter and setter for column
  getColumn(): string {
    return this.getLatest().__column;
  }
  setColumn(column: string): void {
    const writable = this.getWritable();
    writable.__column = column;
  }

  // getter and setter for separator
  getSeparator(): string {
    return this.getLatest().__separator;
  }
  setSeparator(separator: string): void {
    const writable = this.getWritable();
    writable.__separator = separator;
  }

  // getter and setter for value
  getValue(): string {
    return this.getLatest().__value;
  }
  setValue(value: string): void {
    const writable = this.getWritable();
    writable.__value = value;
  }

  insertNewAfter(selection: RangeSelection, restoreSelection = true): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(selection, restoreSelection);
    if ($isElementNode(element)) {
      const filterNode = $createFilterNode(this.__column, this.__separator, this.__value);
      element.append(filterNode);
      return filterNode;
    }
    return null;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }

  isInline(): true {
    return true;
  }

  extractWithChild(
    child: LexicalNode,
    selection: RangeSelection | NodeSelection | GridSelection,
    _destination: 'clone' | 'html'
  ): boolean {
    if (!$isRangeSelection(selection)) {
      return false;
    }

    const anchorNode = selection.anchor.getNode();
    const focusNode = selection.focus.getNode();

    return this.isParentOf(anchorNode) && this.isParentOf(focusNode) && selection.getTextContent().length > 0;
  }
}

export function $createFilterNode(column: string, separator: string, value: string): FilterNode {
  return $applyNodeReplacement(new FilterNode(column, separator, value));
}

/**
 * Determines if node is a LinkNode.
 * @param node - The node to be checked.
 * @returns true if node is a LinkNode, false otherwise.
 */
export function $isFilterNode(node: LexicalNode | null | undefined): node is FilterNode {
  return node instanceof FilterNode;
}

export type SerializedAutoFilterNode = SerializedFilterNode;

export class AutoFilterNode extends FilterNode {
  static getType(): string {
    return 'auto-filter';
  }

  static clone(node: AutoFilterNode): AutoFilterNode {
    return new AutoFilterNode(node.__column, node.__separator, node.__value, node.__key);
  }

  static importJSON(serializedNode: SerializedAutoFilterNode): AutoFilterNode {
    const node = $createAutoFilterNode(serializedNode.column, serializedNode.separator, serializedNode.value);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  static importDOM(): null {
    // TODO: Should link node should handle the import over autolink?
    return null;
  }

  exportJSON(): SerializedAutoFilterNode {
    return {
      ...super.exportJSON(),
      type: 'autolink',
      version: 1,
    };
  }

  insertNewAfter(selection: RangeSelection, restoreSelection = true): null | ElementNode {
    const element = this.getParentOrThrow().insertNewAfter(selection, restoreSelection);
    if ($isElementNode(element)) {
      const filterNode = $createAutoFilterNode(this.column, this.separator, this.value);
      element.append(filterNode);
      return filterNode;
    }
    return null;
  }
}

/**
 * Takes a URL and creates an AutoLinkNode. AutoLinkNodes are generally automatically generated
 * during typing, which is especially useful when a button to generate a LinkNode is not practical.
 * @param url - The URL the LinkNode should direct to.
 * @param attributes - Optional HTML a tag attributes. { target, rel, title }
 * @returns The LinkNode.
 */
export function $createAutoFilterNode(column: string, separator: string, value: string): AutoFilterNode {
  return $applyNodeReplacement(new AutoFilterNode(column, separator, value));
}

/**
 * Determines if node is an AutoLinkNode.
 * @param node - The node to be checked.
 * @returns true if node is an AutoLinkNode, false otherwise.
 */
export function $isAutoFilterNode(node: LexicalNode | null | undefined): node is AutoFilterNode {
  return node instanceof AutoFilterNode;
}

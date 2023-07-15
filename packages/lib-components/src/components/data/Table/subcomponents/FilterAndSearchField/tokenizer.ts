export enum TokenType {
  NOT = 'not',
  NO = 'no',
  EXACT_COLUMN = 'exact_column',
  SEARCH_COLUMN = 'search_column',
  VALUE = 'value',
  SEARCH_GLOBAL = 'search_global',
}

interface Token {
  key: string;
  value: string;
  type: TokenType;
}

// currently very naive implement. It should be improved to handle
// combinations of tokens.
export function tokenize(text: string): Token[] {
  if (text.startsWith('no:')) {
    return [{ key: text.substring(3), type: TokenType.NO, value: text.substring(3, text.length) }];
  }
  if (text.includes(':=')) {
    const [column, value] = text.split(':=');
    return [{ key: column, type: TokenType.EXACT_COLUMN, value: value }];
  }
  if (text.includes(':*')) {
    const [column, value] = text.split(':*');
    return [{ key: column, type: TokenType.SEARCH_COLUMN, value: value }];
  }
  if (text.includes(':!')) {
    const [column, value] = text.split(':!');
    return [{ key: column, type: TokenType.NOT, value: value }];
  }
  return [{ value: text, type: TokenType.SEARCH_GLOBAL, key: '' }];
}

export function isKeyword(tokenType: TokenType): boolean {
  return [TokenType.NOT, TokenType.EXACT_COLUMN, TokenType.SEARCH_COLUMN].includes(tokenType);
}

export function getTokenChars(tokenType: TokenType): string {
  switch (tokenType) {
    case TokenType.NOT:
      return '';
    case TokenType.EXACT_COLUMN:
      return ':=';
    case TokenType.SEARCH_COLUMN:
      return ':*';
    case TokenType.VALUE:
      return '';
    case TokenType.SEARCH_GLOBAL:
      return '';
    case TokenType.NO:
      return ':!';
  }
}

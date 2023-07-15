import { tokenize, TokenType } from './tokenizer';

it('should be of type search_column', () => {
  const tokens = tokenize('column_here*=foo');
  expect(tokens[0].type).toBe(TokenType.SEARCH_COLUMN);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo');
});

it('should be of type exact_column', () => {
  const tokens = tokenize('column_here:=foo');
  expect(tokens[0].type).toBe(TokenType.EXACT_COLUMN);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo');
});

it('should be of type not', () => {
  const tokens = tokenize('column_here:!foo');
  expect(tokens[0].type).toBe(TokenType.NOT);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo');
});

it('should be of type no', () => {
  const tokens = tokenize('no:column_here');
  expect(tokens[0].type).toBe(TokenType.NO);
  expect(tokens[0].value).toBe('column_here');
});

it('should be of type none', () => {
  const tokens = tokenize('foo');
  expect(tokens[0].type).toBe(TokenType.SEARCH_GLOBAL);
  expect(tokens[0].value).toBe('foo');
});

it('should manage spaces', () => {
  const tokens = tokenize('column_here:=foo bar');
  expect(tokens[0].type).toBe(TokenType.EXACT_COLUMN);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo');
  expect(tokens[2].type).toBe(TokenType.SEARCH_GLOBAL);
  expect(tokens[2].value).toBe(' bar');
});

it('should manage quotes of exact_column', () => {
  const tokens = tokenize('column_here:="foo bar"');
  expect(tokens[0].type).toBe(TokenType.EXACT_COLUMN);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo bar');
});

it('should manage quotes of search_column', () => {
  const tokens = tokenize('column_here*="foo bar"');
  expect(tokens[0].type).toBe(TokenType.SEARCH_COLUMN);
  expect(tokens[0].value).toBe('column_here');
  expect(tokens[1].type).toBe(TokenType.VALUE);
  expect(tokens[1].value).toBe('foo bar');
});

it('should manage quotes when there is no key or value', () => {
  const tokens = tokenize('"foo bar"');
  expect(tokens[0].type).toBe(TokenType.SEARCH_GLOBAL);
  expect(tokens[0].value).toBe('"foo bar"');
});

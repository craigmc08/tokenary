const { makeToken, makeError, makeNothing, stringifyToken, prettyPrint } = require('../src/Token');
const TokenError = require('../src/TokenError');

test('makeToken should create a token object', () => {
    expect(makeToken('word')('dog', 7)).toEqual({
        type: 'word',
        lexeme: 'dog',
        offset: 7,
    });
});

test('makeNothing should return null', () => {
    expect(makeNothing('dog', 7)).toBe(null);
});

test('makeError should throw a TokenError', () => {
    expect(makeError('Test error')('dog', 7)).toThrow(new TokenError('Test error', 'dog', 7));
});

test('stringifyToken should format a single token', () => {
    const expected = `<Token type='word' lexeme='dog' offset=7>`;
    expect(stringifyToken(makeToken('word')('dog', 7))).toBe(expected);
});

test('prettyPrint should format an array of tokens', () => {
    const expected = `[\n  <Token type='word' lexeme='dog' offset=7>,\n  <TokenType='word' lexeme='cat' offset=11>\n]`;
    expect(prettyPrint([
        makeToken('word')('dog', 7), makeToken('word')('cat', 11)
    ])).toBe(expected);
});
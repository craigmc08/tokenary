const TokenError = require('./TokenError');
const tokState = require('./TokState');

/**
 * @typedef {tokState.TokState} TokState
 */

/**
 * @namespace token
 */

/**
 * @typedef Token
 * @property {string} type - Type of token
 * @property {string} lexeme - The text this token represents
 * @property {number} offset - The offset of the first character of the lexeme
 */

/**
 * @callback TokenCreator
 * @param {string} lexeme - The text this token represents
 * @param {number} offset - The offset of the first character of the lexeme
 * @param {TokState} [state] - State of tokenizer when created (optional)
 * @returns {Token|undefined}
 */

 /**
  * Creates a token object
  * @memberof token
  * @param {string} type - Type name of token
  * @returns {TokenCreator}
  */
const makeToken = type => (lexeme, offset) => ({ type, lexeme, offset });
exports.makeToken = makeToken;

/**
 * Creates nothing
 * @memberof token
 * @type {TokenCreator}
 */
const makeNothing = (lexeme, offset) => null;
exports.makeNothing = makeNothing;

/**
 * Throws an error
 * @memberof token
 * @param {string} message
 * @returns {TokenCreator}
 * @throws TokenError
 */
const makeError = message => (lexeme, offset, state) => {
    throw new TokenError(message, lexeme, offset, state);
}
exports.makeError = makeError;

/**
 * Formats a token for printing
 * @memberof token
 * @param {Token} token - Token to stringify
 * @returns {string}
 */
const stringifyToken =
    token => `<Token type='${token.type}' lexeme='${token.lexeme}' offset=${token.offset}>`;
exports.stringifyToken = stringifyToken;

/**
 * Formats an array of tokens for printing
 * @memberof token
 * @param {Token[]} tokens - Tokens to pretty print
 * @returns {string}
 */
const prettyPrint = tokens =>
    '[\n  '
    + tokens.map(stringifyToken).join(',\n  ')
    + '\n]'
exports.prettyPrint = prettyPrint;
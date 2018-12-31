const TokenError = require('./TokenError');

/**
 * @typedef Token
 * @property {string} type - Type of token
 * @property {string} lexeme - The text this token represents
 * @property {number} offset - The offset of the first character of the lexeme
 */

/**
 * @callback TokenCreator
 * @param {string} lexeme
 * @param {number} offset
 * @returns {Token|undefined}
 */

 /**
  * @memberof Token
  * Creates a token object
  * @param {string} type - Type name of token
  * @returns {TokenCreator}
  */
const makeToken = type => (lexeme, offset) => ({ type, lexeme, offset });
exports.makeToken = makeToken;

/**
 * @memberof Token
 * Creates nothing
 * @type {TokenCreator}
 */
const makeNothing = (lexeme, offset) => null;
exports.makeNothing = makeNothing;

/**
 * @memberof Token
 * Throws an error
 * @param {string} message
 * @returns {TokenCreator}
 * @throws TokenError
 */
const makeError = message => (lexeme, offset) => {
    throw new TokenError(message, lexeme, offset);
}
exports.makeError = makeError;

/**
 * Formats a token for printing
 * @param {Token} token - Token to stringify
 * @returns {string}
 */
const stringifyToken =
    token => `<Token type='${token.type}' lexeme='${token.lexeme}' offset=${token.offset}>`;
exports.stringifyToken = stringifyToken;

/**
 * Formats an array of tokens for printing
 * @param {Token[]} tokens - Tokens to pretty print
 * @returns {string}
 */
const prettyPrint = tokens =>
    '[\n  '
    + tokens.map(stringifyToken).join(',\n  ')
    + '\n]'
exports.prettyPrint = prettyPrint;
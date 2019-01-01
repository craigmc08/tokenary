const tokState = require('./TokState');

/**
 * @typedef {tokState.TokState} TokState
 */

class TokenError extends Error {
    /**
     * @param {string} message - The error message
     * @param {string} lexeme - The lexeme this error is for
     * @param {number} offset - The index of the first lexeme character in the text
     * @param {TokState} state - The state of the tokenizer when error was created
     */
    constructor(message, lexeme, offset, state) {
        super(message);
        this.lexeme = lexeme;
        this.offset = offset;
        this.state = state;
    }
}
module.exports = TokenError;
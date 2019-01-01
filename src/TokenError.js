class TokenError extends Error {
    /**
     * 
     * @param {string} message - The error message
     * @param {string} lexeme - The lexeme this error is for
     * @param {number} offset - The index of the first lexeme character in the text
     */
    constructor(message, lexeme, offset) {
        super(message);
        this.lexeme = lexeme;
        this.offset = offset;
    }
}
module.exports = TokenError;
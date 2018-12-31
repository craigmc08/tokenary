class TokenError extends Error {
    /**
     * 
     * @param {string} message - The error message
     * @param {string} lexeme - The lexeme this error is for
     * @param {number} offset - The index of the first lexeme character in the text
     * @param {string} text - The text that generated this error
     */
    constructor(message, lexeme, offset, text) {
        super(message);
        this.lexeme = lexeme;
        this.offset = offset;
        this.text = text;
    }
}
module.exports = TokenError;
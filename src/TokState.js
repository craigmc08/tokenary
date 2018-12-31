/**
 * @typedef {import("./Token").Token} Token
 */

/**
 * @typedef TokState
 * @property {string} text - The text represented by the state
 * @property {number} current - Current offset in text
 * @property {Token[]} tokens - Tokens created so far
 */

 /**
  * Creates a TokState object
  * @memberof TokState
  * @param {string} text - The text represented by the state
  * @param {number} [current] - Current offset in text
  * @param {Token[]} [tokens] - Tokens created so far
  * @returns {TokState}
  */
function create(text, current=0, tokens=[]) {
    return Object.freeze({
        text,
        current: current,
        tokens: tokens,
    });
}
exports.create = create;

/**
 * Increments TokState.current by 1 (creates new object)
 * @memberof TokState
 * @param {TokState} state 
 * @returns {TokState}
 */
function advance(state) {
    return create(state.text, state.current + 1, state.tokens);
}
exports.advance = advance;

/**
 * Appends a token to TokState.tokens (creates new object)
 * @memberof {TokState}
 * @param {TokState} state 
 * @param {Token} token 
 * @returns {TokState}
 */
function addToken(state, token) {
    return exports.create(state.text, state.current, state.tokens.concat(token));
}
exports.addToken = addToken;

/**
 * Returns whether the TokState is at the end or not
 * @memberof {TokState}
 * @param {TokState} state 
 * @returns {boolean}
 */
function atEnd(state) {
    return state.current > state.text.length;
}
exports.atEnd = atEnd;

/**
 * Returns the next character in the tokenizer
 * @memberof {TokState}
 * @param {TokState} state 
 * @returns {string}
 */
function peek(state) {
    return state.text[state.current];
}
exports.peek = peek;

/**
 * Get substring of state.text
 * @memberof {TokState}
 * @param {TokState} state 
 * @param {number} start - First character
 * @param {number} end - Last character (exclusive)
 * @returns {string}
 */
function segment(state, start, end) {
    return state.text.substring(start, end);
}
exports.segment = segment;

/**
 * Get a substring of state.text from start to state.current
 * @memberof {TokState}
 * @param {TokState} state 
 * @param {number} start - First character
 * @returns {string}
 */
function segmentFrom(state, start) {
    return segment(state, start, state.current);
}
exports.segmentFrom = segmentFrom;
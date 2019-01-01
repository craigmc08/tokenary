const tokState = require('./TokState');
const reducer = require('./reducer');
const token = require('./Token');
const TokenError = require('./TokenError');

/**
 * @typedef {reducer.Reducer} Reducer
 * @typedef {token.Token} Token
 * @typedef {token.TokenCreator} TokenCreator
 * @typedef {tokState.TokState} TokState
 */

/**
 * Creates a tokenizing function
 * @param {Reducer[]} reducers - Main reducers
 * @param {object} [settings] - Settings for tokenizer
 * @param {TokenCreator} [settings.catcher] - Token creator to use if an error is found
 * @returns {function(string): Token[]}
 */
function tokenary(reducers, settings) {
    if (!Array.isArray(reducers)) throw new TypeError('`reducers` must be an array');

    const defaultSettings = {
        catcher: null
    };
    const tokSettings = Object.assign({}, defaultSettings, settings);

    return function Tokenize(text) {
        if (typeof text !== 'string') throw new TypeError('No text given to tokenize');
        // Create initial state
        let state = tokState.create(text);

        // Loop through the state until it reaches the end
        while (!tokState.atEnd(state)) {
            try {
                // Loop through each reducer, checking for a new state
                const nextState = reducers.reduce((foundState, reducer) => {
                    if (foundState !== null) return foundState;                
                    else return reducer(state);
                }, null);
    
                // If a new state was made, update the state
                if (nextState !== null) state = nextState;
                // Otherwise, advance the state
                else state = tokState.advance(state);
            } catch (err) {
                if (tokSettings.catcher !== null && err instanceof TokenError) {
                    state = tokState.addToken(
                        err.state,
                        Object.assign(
                            {},
                            tokSettings.catcher(err.lexeme, err.offset),
                            { message: err.message }
                        )
                    );
                } else {
                    throw err;
                }
            }
        }

        // Return the tokens found
        return state.tokens;
    }
}
module.exports = tokenary;
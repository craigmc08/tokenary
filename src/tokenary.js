const tokState = require('./TokState');

/**
 * @typedef {import("./reducer").Reducer} Reducer
 * @typedef {import("./Token").Token} Token
 * @typedef {import("./TokState").TokState} TokState
 */

/**
 * Creates a tokenizing function
 * @param {Reducer[]} reducers - Main reducers
 * @returns {function(string): Token[]}
 */
function Tokenary(reducers) {
    if (!Array.isArray(reducers)) throw new TypeError('`reducers` must be an array');

    return function Tokenize(text) {
        if (typeof text !== 'string') throw new TypeError('No text given to tokenize');
        // Create initial state
        let state = tokState.create(text);

        // Loop through the state until it reaches the end
        while (!tokState.atEnd(state)) {
            // Loop through each reducer, checking for a new state
            const nextState = reducers.reduce((foundState, reducer) => {
                if (foundState !== null) return foundState;                
                else return reducer(state);
            }, null);

            // If a new state was made, update the state
            if (nextState !== null) state = nextState;
            // Otherwise, advance the state
            else state = tokState.advance(state);
        }

        // Return the tokens found
        return state.tokens;
    }
}
module.exports = Tokenary;
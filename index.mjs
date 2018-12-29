/**
 * @typedef Token
 * @property {string|Symbol} type - Type of token
 * @property {string} lexeme - The text this token encapsulates
 * @property {number} offset - The index of the first character of this token in the text
 * @property {string} text - The full text this token belongs to
 */

/**
 * @param {string} text - Full text token belongs to
 * @returns {function(string|Symbol): function(string, number): Token}
 */
export const Token = text => type => (lexeme, offset) => ({ type, lexeme, offset, text });
export const makeToken = type => text => (lexeme, offset) => ({ type, lexeme, offset, text });

/**
 * @typedef TokState
 * @property {function(): string} advance - Advance the tokenizer 1, returns character
 * @property {function(): string} look - Returns current character
 * @property {function(): string} peek - Returns next character
 * @property {function(): boolean} atEnd - Returns if the text is at end
 * @property {function(): number} getCurrent - Gets current index of text
 * 
 * @property {string} text - The full text thats being tokenize
 */

 /**
  * @typedef ReducerState
  * @property {boolean} finished - If true, no further reducers are run
  * @property {Token[]} tokens - Tokens to append to output
  */

/**
 * @callback Reducer
 * @param {string} char - Current character of tokenizer
 * @param {TokState} tokState - Functions to use for tokenizing
 * @returns {ReducerState} Information about the reducer after it is finished
 */

export const Tokenizer = function () {
    /** @type {Reducer[]} */
    const reducers = [];

    /**
     * Tokenizes the text
     * @param {string} text - The full text to tokenize
     */
    const T = function (text) {
        const output = [];

        let current = 0;
        
        const advance = () => { return text[current++]; }
        const look = () => text[current - 1];
        const peek = () => text[current];
        const atEnd = () => current >= text.length;
        const getCurrent = () => current;

        /** @type TokState */
        const tokState = {
            advance, look, peek, atEnd, getCurrent, text,
        };

        while (!atEnd()) {
            const char = advance();
            reducers.reduce((finished, reducer) => {
                if (finished) return;
                const state = reducer(char, tokState);
                output.push(...state.tokens);
                return state.finished;
            }, false);
        }

        return output;
    }

    /**
     * @function
     * Adds a reducer that is run whenever it is reached
     * @param {Reducer} reducer
     */
    T.default = reducer => {
        reducers.push(reducer);
        return T;
    }

    /**
     * @function
     * Calls the reducer if the character matches a reducer in the supplied map
     * @param {Object.<string, Reducer>} reducerMap - character:reducer map to check
     * @returns {Reducer}
     */
    T.onChar = reducerMap => {
        const reducer = (char, state) => {
            const finalState = {
                finished: false,
                tokens: [],
            };
    
            // Acts as a kind of switch block, then sets final state to state of whichever reducer is run
            Object.keys(reducerMap).reduce((finished, charKey) => {
                if (finished) return;
                if (char !== charKey) return finished;
    
                const redState = reducerMap[charKey](char, state);
                finalState.finished = redState.finished;
                finalState.tokens = redState.tokens;
    
                return true;
            }, false);

            return finalState;
        }

        reducers.push(reducer);
        return T;
    }

    return T;
}

/**
 * @callback TokenCreator
 * @param {string} type
 * @returns {function(string, number): Token}
 */

/**
 * Creates a token for every character after the reducer is run
 * @param {TokenCreator} tokenCreator
 * @returns {Reducer}
 */
export const everything = tokenCreator => (char, state) => {
    const start = state.getCurrent() - 1;
    while (!state.atEnd()) state.advance();
    const end = state.getCurrent();

    const text = state.text.substring(start, end);

    return {
        continue: false,
        tokens: [tokenCreator(state.text)(text, start)],
    };
}

/**
 * 
 * @param {...string} chars - Characters to possibly match
 * @returns {function(TokenCreator): Reducer}
 */
export const everythingUntil = (...chars) => tokenCreator => (char, state) => {
    const start = state.getCurrent() - 1;
    if (chars.includes(char)) return { continue: true, tokens: [] };
    while (!chars.includes(state.peek()) && !state.atEnd()) {
        state.advance();
    }
    const end = state.getCurrent();

    const text = state.text.substring(start, end);

    return {
        continue: false,
        tokens: [tokenCreator(state.text)(text, start)],
    };
}

/**
 * Creates a token from the single current character
 * @param {TokenCreator} tokenCreator
 * @returns {Reducer}
 */
export const single = tokenCreator => (char, state) => {
    return {
        continue: false,
        tokens: [tokenCreator(state.text)(char, state.getCurrent() - 1)],
    };
}

/**************************
    UTILITY FUNCTIONS
 ***************************/

/**
 * @param {Token} token
 */
export const stringifyToken =
    token => `<Token type='${token.type}' lexeme='${token.lexeme}' offset=${token.offset}>`

/**
 * Formats an array of tokens
 * @param {Token[]} tokens 
 */
export const prettyPrint = tokens =>
   '[\n  ' + tokens
       .map(stringifyToken)
       .join(',\n  ')
   + '\n]'
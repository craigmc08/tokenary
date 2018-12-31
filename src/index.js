const TokenError = require('./TokenError');
exports.TokenError = TokenError;

/**
 * @typedef Token
 * @property {string|Symbol} type - Type of token
 * @property {string} lexeme - The text this token encapsulates
 * @property {number} offset - The index of the first character of this token in the text
 * @property {string} text - The full text this token belongs to
 */

/**
 * Creates a token object
 * @param {string} text - Full text token belongs to
 * @returns {function(string): function(string, number): Token}
 */
const CreateToken = text => type => (lexeme, offset) => ({ type, lexeme, offset, text });
exports.CreateToken = CreateToken;

/**
 * Creates a token object
 * @type {TokenCreator}
 * @param {string} type
 * @returns {function(string): function(string, number): Token}
 */
const makeToken = type => text => (lexeme, offset) => ({ type, lexeme, offset, text });
exports.makeToken = makeToken;

/**
 * Creates a null token (ignored by Tokenizer)
 * @type {TokenCreator}
 * @param {string} text
 * @returns {function(string, number): null}
 */
const makeNothing = text => (lexeme, offset) => null;
exports.makeNothing = makeNothing;

/**
 * Throws an error
 * @type {TokenCreator}
 * @param {string} message - The message the error has
 * @returns {function(string, number): null}
 */
const makeError = message => text => (lexeme, offset) => {
    throw new TokenError(message, lexeme, offset)
}
exports.makeError = makeError;

/**
 * @typedef TokState
 * @property {function(): string} advance - Advance the tokenizer 1 character forward
 * @property {function(): string} retreat - Moves the tokenizer 1 character back
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

/**
 * @typedef Tokenary
 * @property {function(Reducer): Tokenary} default
 * @property {function(TokenCreator): Tokenary} catch
 * @property {function(Predicate, Reducer): Tokenary} if
 * @property {function(Object.<string, TokenCreator>): Tokenary} keywords
 * @property {function(Object.<string, Reducer>): Tokenary} onChar
 * 
 * Parses the text into tokens based on the rules given to it
 * @function Tokenary
 * @param {string} text - The text to tokenize
 * @returns {Token[]}
 */

/**
 * Creates a Tokenizer object
 * @returns {Tokenary}
 */
const Tokenizer = function Tokenizer () {
    /** @type {Reducer[]} */
    const reducers = [];
    let catcher = null;

    const T = function (text) {
        const output = [];

        let current = 0;
        
        const advance = () => { return text[current++]; }
        const retreat = () => { return text[current--]; }
        const look = () => text[current - 1];
        const peek = () => text[current];
        const atEnd = () => current >= text.length;
        const getCurrent = () => current;

        /** @type TokState */
        const tokState = {
            advance, retreat, look, peek, atEnd, getCurrent, text,
        };

        while (!atEnd()) {
            const char = advance();
            try {
                reducers.reduce((finished, reducer) => {
                    if (finished) return true;
                    const state = reducer(char, tokState);
                    const newToks = state.tokens.filter(token => token !== null);
                    output.push(...newToks);
                    return state.finished;
                }, false);
            } catch (err) {
                // If it's a TokenError, create (and the catcher exists)
                // create a token from it
                if (err instanceof TokenError && catcher !== null) {
                    const tok = catcher(err.text)(err.lexeme, err.offset);
                    tok.message = err.message;
                    output.push(tok);
                } else {
                    // Otherwise just throw the error again
                    throw err;
                }
            }
        }

        return output;
    }

    /**
     * Adds a reducer that is run whenever it is reached
     * @function default
     * @param {Reducer} reducer
     */
    T.default = reducer => {
        reducers.push(reducer);
        return T;
    }

    /**
     * Adds a reducer that is run if `predicate` is true for the current char
     * @function if
     * @param {Predicate} predicate
     * @param {Reducer} reducer - Reducer to run if `predicate` is true
     */
    T.if = (predicate, reducer) => {
        const wrappedReducer = (char, state) => {
            if (predicate(char)) return reducer(char, state);
            else return { finished: false, tokens: [] };
        }

        reducers.push(wrappedReducer);
        return T;
    }

    /**
     * Adds a reducer that extracts keywords from the keyword map, running the token creator for each.
     * @function keywords
     * @param {Object.<string, TokenCreator>} keywordMap
     * @param {object} [settings] - keywords parsing settings
     * @param {(RegExp)} [settings.charset] - Charset allowed for a keyword
     * @param {(string|RegExp)} [settings.firstChar] - Charset allowed for first character of keyword
     * @param {TokenCreator} [settings.noMatch] - Token creator to use on invalid keywords, nothing happens if not supplied
     * @returns {Reducer}
     */
    T.keywords = (keywordMap, settings) => {
        const { noMatch, charset, firstChar } = Object.assign({}, {
            charset: /^[a-z0-9_]+$/i,
            firstChar: /^[a-z]+$/i,
            noMatch: null
        });

        const keywords = Object.keys(keywordMap).filter(k => k !== '');
        const reducer = (char, state) => {
            // Ensure first character is valid
            if (!firstChar.test(char)) return { finished: false, tokens: [] };

            // Find the keyword
            const start = state.getCurrent() - 1;
            while (charset.test(state.peek()) && !state.atEnd()) state.advance();
            const word = state.text.substring(start, state.getCurrent());

            if (keywords.includes(word)) {
                // Check if it is a keyword
                return {
                    finished: true,
                    tokens: [ keywordMap[word](state.text)(word, start) ],
                };
            } else if (noMatch !== null) {
                // If not, check for a noMatch creator
                return {
                    finished: true,
                    tokens: [ noMatch(state.text)(word, start) ],
                };
            } else {
                // Nothing should happen
                // Rewind time to before this reducer happened
                while (state.getCurrent() > start + 1) state.retreat();
                return { finished: false, tokens: [] };
            }
        }

        reducers.push(reducer);
        return T;
    }

    /**
     * Calls the reducer if the character matches a reducer in the supplied map
     * @function onChar
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
                if (finished) return true;
                if (char !== charKey) return false;
    
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

    T.catch = tokenCreator => {
        catcher = tokenCreator;

        return T;
    }

    return T;
}
exports.Tokenizer = Tokenizer;

/**
 * @callback TokenCreator
 * @param {string} text
 * @returns {function(string, number): Token}
 */


/**************************
    BUILT-IN REDUCERS
 ***************************/

/**
 * Creates a token for every character after the reducer is run
 * @param {TokenCreator} tokenCreator
 * @returns {Reducer}
 */
const everything = tokenCreator => (char, state) => {
    const start = state.getCurrent() - 1;
    while (!state.atEnd()) state.advance();
    const end = state.getCurrent();

    const text = state.text.substring(start, end);

    return {
        finished: true,
        tokens: [tokenCreator(state.text)(text, start)],
    };
}
exports.everything = everything;

/**
 * Creates a token for every character until a character matches one given
 * @param {...string} chars - Characters to possibly match
 * @returns {function(TokenCreator): Reducer}
 */
const everythingUntil = (...chars) => tokenCreator => (char, state) => {
    const start = state.getCurrent() - 1;
    if (chars.includes(char)) return { continue: true, tokens: [] };
    while (!chars.includes(state.peek()) && !state.atEnd()) {
        state.advance();
    }
    const end = state.getCurrent();

    const text = state.text.substring(start, end);

    return {
        finished: true,
        tokens: [tokenCreator(state.text)(text, start)],
    };
}
exports.everythingUntil = everythingUntil;

/**
 * Creates a token from the single current character
 * @param {TokenCreator} tokenCreator
 * @returns {Reducer}
 */
const single = tokenCreator => (char, state) => {
    return {
        finished: true,
        tokens: [tokenCreator(state.text)(char, state.getCurrent() - 1)],
    };
}
exports.single = single;

/**
 * Runs all the consumers given and creates a token from what they consume
 * @param {...Consumer} consumers
 * @returns {function(TokenCreator): Reducer}
 */
const sequence = (...consumers) => tokenCreator => (char, state) => {
    state.retreat();
    const start = state.getCurrent();
    consumers.forEach(consumer => consumer(state));
    const end = state.getCurrent();
    if (start === end) state.advance();

    const lexeme = state.text.substring(start, end);

    return {
        finished: start === end,
        tokens: start === end ? [] : [ tokenCreator(state.text)(lexeme, start) ],
    };
}
exports.sequence = sequence;

/**
 * Runs a consumer and creates a token from what it consumes
 * @param {Consumer} consumer
 */
const consume = consumer => tokenCreator => (char, state) => {
    state.retreat();
    const start = state.getCurrent();
    consumer(state);
    const end = state.getCurrent();
    if (start === end) state.advance();

    const lexeme = state.text.substring(start, end);

    return {
        finished: start !== end,
        tokens: start === end ? [] : [ tokenCreator(state.text)(lexeme, start) ],
    }
}
exports.consume = consume;



/**************************
    BUILT-IN CONSUMERS
 ***************************/

/**
 * Consumes a single specified character
 * @param {string} char - Character to match
 * @returns {Consumer}
 */
const char = char => state => {
    if (state.peek() === char) state.advance();
}
exports.char = char;

/**
 * Consumes a single character that matches the supplied regex
 * @param {RegExp} regex
 * @returns {Consumer}
 */
const regex = regex => state => {
    if (regex.test(state.peek())) state.advance();
}
exports.regex = regex;

/**
 * Runs the regex on increasing chunks of text until the regex fails
 * @param {RegExp} regex - Regex to test piece with
 * @returns {Consumer}
 */
const untilRegexFails = regex => state => {
    const start = state.getCurrent();
    const nextPiece = () => state.text.substring(start, state.getCurrent() + 1);
    while (regex.test(nextPiece()) && !state.atEnd()) state.advance();
}
exports.untilRegexFails = untilRegexFails;

/**
 * Consumes characters until non-whitespace character is found
 * @returns {Consumer}
 */
const whitespace = () => state => {
    const chars = [' ', '\f', '\n', '\r', '\t', '\v'];
    if (chars.includes(state.look())) return;
    while (chars.includes(state.peek()) && !state.atEnd()) state.advance();
}
exports.whitespace = whitespace;

/**
 * Consumes and checks for a string
 * @param {String} string
 * @returns {Consumer}
 */
const str = string => state => {
    const start = state.getCurrent();
    for (let i = 0; i < string.length; i++) state.advance();
    const found = state.text.substring(start, state.getCurrent());
    if (found !== string) throw new Error(`Mismatched string: expected '${string}' but got '${found}'`);
}
exports.str = str;


/**************************
    UTILITY FUNCTIONS
 ***************************/

/**
 * Formats a single token
 * @param {Token} token
 */
const stringifyToken =
    token => `<Token type='${token.type}' lexeme='${token.lexeme}' offset=${token.offset}>`
exports.stringifyToken = stringifyToken;

/**
 * Formats an array of tokens
 * @param {Token[]} tokens 
 */
const prettyPrint = tokens =>
    '[\n  ' + tokens
        .map(stringifyToken)
        .join(',\n  ')
    + '\n]'
exports.prettyPrint = prettyPrint;


    
/**************************
    PREDICATES
 ***************************/
const predicate = require('./predicate');
exports.predicate = predicate;
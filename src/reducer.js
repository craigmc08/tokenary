const tokState = require('./TokState');
const predicate = require('./predicate');
const TokenError = require('./TokenError');

/**
 * @namespace reducer
 */

/**
 * @typedef {import("./TokState").TokState} TokState
 * @typedef {import("./predicate").Predicate} Predicate
 * @typedef {import("./Token").Token} Token
 * @typedef {import("./Token").TokenCreator} TokenCreator
 */

/**
 * @callback Reducer
 * @param {TokState} state - The state to modify
 * @returns {TokState}
 */



/****************************************************
            Reducers that do create tokens
 *****************************************************/

 /**
  * Extracts keywords from the text
  * @param {Object.<string, TokenCreator>} keywordMap - Map of keywords to check for
  * @param {object} [settings]
  * @param {RegExp} [settings.charset] - Charset allowed for a keyword
  * @param {RegExp} [settings.firstChar] - Charset allowed for first character of keyword
  * @param {TokenCreator} [settings.noMatch] - Token creator to use on invalid keywords
  * @returns {Reducer}
  */
const keywords = (keywordMap, settings) => {
    const { noMatch, charset, firstChar } = Object.assign({}, {
        charset: /^[a-z0-9_]$/i,
        firstChar: /^[a-z]$/i,
        noMatch: null
    }, settings);

    const keywords = Object.keys(keywordMap);
    return state => {
        let finalState = state;
        // Check if first character is in firstChar charset
        if (!firstChar.test(tokState.peek(state))) return null;
        
        // Find the keyword
        let start = state.current;
        while (charset.test(tokState.peek(finalState)) && !tokState.atEnd(finalState)) {
            finalState = tokState.advance(finalState);
        }
        const word = tokState.segmentFrom(finalState, start);

        if (keywords.includes(word)) {
            // If it is a keyword, add the appropriate token
            return tokState.addToken(finalState, keywordMap[word](word, start));
        } else if (noMatch !== null) {
            // If it's not, check for a no match
            return tokState.addToken(finalState, noMatch(word, start));
        } else {
            return null;
        }
    }
}
exports.keywords = keywords;

/**
 * If the predicate is true, run the reducer
 * @param {Predicate} predicate - Condition to be met
 * @returns {function(Reducer): Reducer}
 */
const ifThen = predicate => reducer => state => {
    if (predicate(tokState.peek(state))) return reducer(state);
}
exports.ifThen = ifThen;

/**
 * If a matching character is found, runs the given reducer
 * @param {Object.<string, Reducer>} reducerMap - character to reducer map to check
 * @returns {Reducer}
 */
const ifChar = reducerMap => state => {
    const char = tokState.peek(state);
    if (reducerMap[char] !== undefined) {
        return reducerMap[char](state);
    } else {
        return null;
    }
}

 /**
  * Creates a token from every character that follows
  * @memberof reducer
  * @param {TokenCreator} tokenCreator 
  * @returns {Reducer}
  */
const everything = tokenCreator => state => {
    let finalState = state;
    const start = state.current;
    // Advance state until the end is reached
    while (!tokState.atEnd(state)) {
        finalState = tokState.advance(finalState);
    }

    // Add token
    return tokState.addToken(finalState, tokenCreator(tokState.segmentFrom(state, start), start));
}
exports.everything = everything;

/**
 * Creates a token from every character that follows until one given is reached
 * @memberof reducer
 * @param {string[]} chars - Characters to possibly match
 * @returns {function(TokenCreator): Reducer}
 */
const everythingUntil = chars => tokenCreator => state => {
    let finalState = state;
    const start = state.current;
    // Advance until end or one of the parameters characters is reached
    while (!tokState.atEnd(state) && !chars.includes(tokState.peek(state))) {
        finalState = tokState.advance(finalState);
    }

    // Add token
    return tokState.addToken(finalState, tokenCreator(tokState.segmentFrom(state, start), start));
}
exports.everythingUntil = everythingUntil;

/**
 * Creates a token from the single current character
 * @memberof reducer
 * @param {TokenCreator} tokenCreator
 * @returns {Reducer}
 */
const single = tokenCreator => state => {
    const char = tokState.peek(state);
    const start = state.current;
    return tokState.addToken(tokState.advance(state), tokenCreator(char, start));
}
exports.single = single;

/**
 * Creates a token from the characters passed over in the given reducer
 * Expects the given reducers to not return any tokens
 * @param {Reducer} reducer
 * @returns {function(TokenCreator): Reducer}
 */
const consume = reducer => tokenCreator => state => {
    const start = state.current;
    const finalState = reducer(state);
    return tokState.addToken(finalState, tokenCreator(tokState.segmentFrom(state, start), start))
}
exports.consume = consume;



/****************************************************
            Reducers that don't create tokens
 *****************************************************/

/**
 * Pipe output of a sequence of reducers together (left to right)
 * @memberof reducer
 * @param {Reducer[]} reducers 
 * @returns {Reducer}
 */
const sequence = reducers => state => {
    return reducers.reduce((s, reducer) => reducer(s), state);
}
exports.sequence = sequence;

/**
 * Advances past a single character, throws an error if it's not what is expected
 * @memberof reducer
 * @param {string} char - Expected character
 * @returns {Reducer}
 */
const char = char => state => {
    if (tokState.peek(state) === char) return tokState.advance(state);
    else throw new TokenError(
        `Expected '${char}' but got ${tokState.peek(state)}`,
        tokState.peek(state), state.current
    );
}
exports.char = char;

/**
 * Runs the regex until the regex fails on all characters advanced past
 * @param {RegExp} regex 
 * @returns {Reducer}
 */
const untilRegexFails = regex => state => {
    let finalState = state;
    const start = state.current;
    const next = () => tokState.segment(finalState, start, finalState.current + 1);
    while (regex.test(next()) && !tokState.atEnd(finalState)) {
        finalState = tokState.advance(finalState);
    }
    return finalState;
}
exports.untilRegexFails = untilRegexFails;

/**
 * Advances past all contiguous whitespace characters
 */
const whitespace = untilRegexFails(/^\s*$/);
exports.whitespace = whitespace;
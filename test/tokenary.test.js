const {
    tokenary,
    reducer: { ifChar, everythingUntil, consume, single },
    token: { makeToken },
    tokState
} = require('../src');

test('tokenary should advance a character if all reducers return null', () => {
    let result;
    tokenary([
        state => {
            if (state.current === 0) return null;
            else {
                result = true;
                return null; 
            }
        }
    ])('ab');

    expect(result).toBe(true);
});

test('tokenary should call reducers in the order they are added', () => {
    let result = [];
    tokenary([
        state => { result.push(1); return null; },
        state => { result.push(2); return null; },
    ])('a');

    expect(result).toEqual([1, 2]);
});

test('tokenary should use the state from the first reducer to return non-null', () => {
    expect(tokenary([
        state => tokState.addToken(tokState.advance(state), makeToken('a')('a', 0)),
        state => tokState.addToken(tokState.advance(state), makeToken('b')('b', 0))
    ])('a')).toEqual(tokState.create('a', 1, [ makeToken('a')('a', 0) ]));
});

test('example csv parser should work', () => {
    const TokenType = {
        comma: 'COMMA',
        value: 'VALUE',
        newline: 'NEWLINE',
    };
    
    const tokenizeCSV = tokenary([
        ifChar({
            ',': single(makeToken(TokenType.comma)),
            '\n': single(makeToken(TokenType.newline))
        }),
        consume(everythingUntil([',', '\n']))(makeToken(TokenType.value))
    ]);
    
    const testCSV = 
`1,Up
2,Left`;

    expect(tokenizeCSV(testCSV)).toEqual([
        makeToken('VALUE')('1', 0),
        makeToken('COMMA')(',', 1),
        makeToken('VALUE')('Up', 2),
        makeToken('NEWLINE')('\n', 4),
        makeToken('VALUE')('2', 5),
        makeToken('COMMA')(',', 6),
        makeToken('VALUE')('Left', 7)
    ]);
});
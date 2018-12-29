/*
Predicates are simple boolean functions that can be combined together

basic:
is(truth)(actual) -> Checks if actual is === truth
isOneOf(...truths)(actual) -> Checks if actual is included in truths
matches(regex)(actual) -> Checks if actual matches the regular expression

higher order:
not(predicate) -> Checks if the predicate is not true
or(...predicates) -> Checks if any of the predicates are true
nor(...predicates) -> Checks if none of the predicates are true (not or)
and(...predicates) -> Checks if all the predicates are true
nand(...predicates) -> Checks if not all the predicates are true (not and)
xor(predicate1, predicate2) -> exclusive or for 2 predicates
*/

/**
 * @callback Predicate
 * @param {any} actual
 * @returns {boolean}
 */

 /**
  * Checks if actual is strict equal (===) to truth
  * @param {any} truth
  * @returns {Predicate}
  */
export const is = truth => actual => truth === actual;
/**
 * Checks if actual is any of the values in truths
 * @param {...any} truths
 * @returns {Predicate}
 */
export const isOneOf = (...truths) => actual => truths.includes(actual);
/**
 * Checks if actual matches the regular expression
 * @param {RegExp} regex 
 * @returns {Predicate}
 */
export const matches = regex => actual => regex.test(actual);

/**
 * Logical not operator on a predicate
 * @param {Predicate} predicate
 * @returns {Predicate}
 */
export const not = predicate => actual => !predicate(actual);
/**
 * Logical or operator on predicates
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
export const or = (...predicates) => actual =>
    predicates.reduce((result, predicate) => result || predicate(actual), false);
/**
 * Logical nor operator on predicates. Short for not(or(...predicates))
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
export const nor = (...predicates) => not(or(...predicates));
/**
 * Logical and operator on predicates
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
export const and = (...predicates) => actual =>
    predicates.reduce((result, predicate) => result && predicate(actual), true);
/**
 * Logical nand operator on predicates. Short for not(and(...predicates))
 * @param {...Predicate} predicates
 * @returns {Predicate}
 */
export const nand = (...predicates) => not(and(...predicates));
/**
 * Logical xor operator on 2 predicates
 * @param {Predicate} predicate1
 * @param {Predicate} predicate2
 * @returns {Predicate}
 */
export const xor = (predicate1, predicate2) =>
    and(nand(predicate1, predicate2), or(predicate1, predicate2))
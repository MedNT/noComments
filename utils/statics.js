const exampleComment = `/**
 * Sorts an array using a modified Quick Sort algorithm.
 * 
 * @param {Array} arr - The array to be sorted.
 * @returns {Array} - A new sorted array.
 * 
 * This function selects a "pivot" element from the middle of the array, 
 * then partitions the rest of the array into three sub-arrays:
 * - left: elements smaller than the pivot
 * - right: elements larger than the pivot
 * - equal: elements equal to the pivot
 * It recursively sorts the left and right sub-arrays, and concatenates 
 * them with the 'equal' sub-array to form the final sorted result.
 * 
 * If the input array has one or fewer elements, it is returned as is, 
 * as it is already sorted by definition.
 */`;

const modelPrompt =
	"Generate a detailed comment for this function following the format of JSDoc comments, including descriptions for parameters, return value, and an explanation of what the function does: \n";

// list of available languages (for the beta version 0.0.1)
const languages = ["javascript", "typescript"];

module.exports = { exampleComment, modelPrompt, languages };

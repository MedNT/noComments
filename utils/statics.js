const modelPrompt =
	"Generate a detailed comment for this function following the format of JSDoc comments, including descriptions for parameters, return value, and an explanation of what the function does: \n";

// list of available languages (for the beta version 0.0.1)
const languages = ["javascript", "typescript"];

module.exports = { modelPrompt, languages };

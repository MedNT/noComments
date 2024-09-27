const axios = require("axios");

/**
 * Generate Comment for Code Snippet
 * @param {string} codeSnippet: a function code snippet (signature+body)
 * @param {string} apiKey: OpenAI Model Api Key
 * @returns {string} comment related to that function's logic
 */
async function generateCommentForCode(codeSnippet, apiKey) {
	const endpoint = "https://api.openai.com/v1/chat/completions";

	try {
		const response = await axios.post(
			endpoint,
			{
				model: "gpt-4o-mini",
				messages: [
					{
						role: "user",
						content: `Please generate a comment for the following code using the programming language commenting principles:\n\n${codeSnippet}`,
					},
				]
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
			}
		);

		const generatedComment = response.data.choices[0].message.content;
		return generatedComment;
	} catch (error) {
		console.error("Error generating comment:", error);
		return null;
	}
}

function sum(a, b) {
    return a+b;
}

module.exports = { generateCommentForCode };

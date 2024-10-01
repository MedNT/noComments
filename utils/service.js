const { modelPrompt } = require("./statics");
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
						content: `${modelPrompt}${codeSnippet}`,
					},
				],
			},
			{
				headers: {
					Authorization: `Bearer ${apiKey}`,
					"Content-Type": "application/json",
				},
			}
		);

		return {
			comment: response.data.choices[0].message.content
		};
	
	} catch (error) {
		
		return {
			error : error.message + ". Check following link for details. "
		}
	}
}

module.exports = { generateCommentForCode };
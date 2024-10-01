const { generateCommentForCode } = require("./utils/service");
const { languages } = require("./utils/statics");
const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	
	// languages provider
	const langsProviders = [];
	// looping through all supported languages
	for (let i = 0; i < languages.length; i++) {
		// registering providers
		langsProviders.push(
			vscode.languages.registerCodeLensProvider(languages[i], {
				provideCodeLenses(document, __token) {
					return getCodeLens(document);
				},
			})
		);
	};

	// command for comment generation using OpenAI model
	const generateComment = vscode.commands.registerCommand(
		"noComments.generateComment",
		async function (uri, startLine, endLine, startChar, endChar) {
			vscode.workspace.openTextDocument(uri).then(async (doc) => {
				// parsing the function content
				const functionContent = doc.getText(
					new vscode.Range(startLine, startChar, endLine, endChar)
				);

				// Getting users inserted personal API key
				const apiKey = vscode.workspace
					.getConfiguration("noComments")
					.get("apiKey");
				// if the user didn't insert an API key yet
				if (!apiKey) {
					const errorMsg = "No API Key Exists! Insert yours, check extention Docs for help";
					vscode.window.showErrorMessage(errorMsg);
					return;
				}

				// generating a comment using AI
				const result = await generateCommentForCode(
					functionContent,
					apiKey
				);
				

				// if an error occured while generating the comment
				if (Object.keys(result).includes("error")) {
					// showing the error message to the user
					vscode.window.showErrorMessage(result.error);
					vscode.window.showErrorMessage(
						result.error,
						"Open Link"
					).then(selection => {
						if (selection === "Open Link") {
							vscode.env.openExternal(vscode.Uri.parse("https://platform.openai.com/docs/guides/error-codes/api-errors"));
						}
					});
					// exit the the command's logic
					return;
				}
				// if the AI model generat the comment successfully
				else {
					// adding the generated code on top of the function
					const editor = vscode.window.activeTextEditor;
					if (editor) {
						// Choosing the position of comment insertion
						const position = new vscode.Position(startLine, 0);
						// putting the comment on top of the function
						editor.edit((editBuilder) => {
							editBuilder.insert(position, `${result.comment}\n`);
						});
					}
				}
			});
		}
	);

	// Adding users personal API Key
	vscode.commands.registerCommand(
		"noComments.inputApiKey",
		async () => {
			// fetching the user's api key and validatin it
			const apiKey = await vscode.window.showInputBox({
				placeHolder: "Enter your OpenAI API key",
				prompt: "API Key must be a valid OpenAI key - See Docs on how to get one!",
				validateInput: (input) => {
					if (!input) {
						return "API key cannot be empty";
					}
					return; // No error
				},
			});

			// showing the selected API Key for validation purposes (UX)
			vscode.window.showInformationMessage(apiKey);

			// if APi Key is fetched correctly
			if (apiKey) {
				// Save the API key to the workspace configuration
				const config = vscode.workspace.getConfiguration("noComments");
				await config.update(
					"apiKey",
					apiKey,
					vscode.ConfigurationTarget.Global
				);
				vscode.window.showInformationMessage(
					"API Key saved successfully!"
				);
			}
		}
	);

	// commands subscriptions
	context.subscriptions.push(
		...langsProviders,
		generateComment
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

// This function creates a CodeLens for each function in the document
// detecting functions poisition using REGEX and inserting a CodeLens
// on the right position
function getCodeLens(document) {
	const lenses = [];
	const regex = /function\s+(\w+)\s*\(/g; // Simple regex to find functions

	let match;
	while ((match = regex.exec(document.getText())) !== null) {
		const functionName = match[1];
		const startLine = document.positionAt(match.index).line;
		const startChar = match.index;

		// Find the start of the function's body
		let bodyStart = regex.lastIndex;

		let braceCount = 0;
		let endLine = startLine;
		let endChar = startChar;

		// Loop through the document text to find the function body
		for (let i = bodyStart; i < document.getText().length; i++) {
			const char = document.getText()[i];
			// start of the fucntion
			if (char === "{") {
				braceCount++;
			}
			// end og the function
			else if (char === "}") {
				braceCount--;
				if (braceCount === 0) {
					endLine = document.positionAt(i).line;
					endChar = i;
					break;
				}
			}
		}

		// Create CodeLens for the function
		lenses.push(
			new vscode.CodeLens(
				new vscode.Range(startLine, startChar, endLine, endChar),
				{
					title: "Generate Comment 👨‍💻",
					command: "noComments.generateComment",
					arguments: [
						document.uri,
						startLine,
						endLine,
						startChar,
						endChar,
					],
				}
			)
		);
	}

	// returning the generated lenses for the whole file functions
	return lenses;
}

module.exports = {
	activate,
	deactivate,
};

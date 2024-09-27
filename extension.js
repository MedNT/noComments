import { generateCommentForCode } from "./utils/service";

const { exampleComment, openAIApiKey } = require("./utils/statics");
const vscode = require("vscode");

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	const jsCodeLensProvider = vscode.languages.registerCodeLensProvider(
		"javascript",
		{
			provideCodeLenses(document, __token) {
				return getCodeLens(document);
			},
		}
	);

	const tsCodeLensProvider = vscode.languages.registerCodeLensProvider(
		"typescript",
		{
			provideCodeLenses(document, __token) {
				return getCodeLens(document);
			},
		}
	);

	const generateComment = vscode.commands.registerCommand(
		"noComments.generateComment",
		function (uri, startLine, endLine, startChar, endChar) {
			vscode.workspace.openTextDocument(uri).then((doc) => {
				const functionContent = doc.getText(
					new vscode.Range(startLine, startChar, endLine, endChar)
				);
				
				// generating a comment using AI
				const generatedComment = generateCommentForCode(functionContent, openAIApiKey);

				// adding the generated code on top of the function
				const editor = vscode.window.activeTextEditor;
				if (editor) {
					const position = new vscode.Position(startLine, 0);
					editor.edit((editBuilder) => {
						editBuilder.insert(position, `${generatedComment}\n`);
					});
				}
			});
		}
	);

	const inputApiKey = vscode.commands.registerCommand('noComments.inputApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            placeHolder: 'Enter your OpenAI API key',
            prompt: 'API Key must be a valid OpenAI key - See Docs on how to get one!',
            validateInput: (input) => {
                if (!input) {
                    return 'API key cannot be empty';
                }
                return // No error
            }
        });

		vscode.window.showInformationMessage(apiKey);

        if (apiKey) {
            // Save the API key to the workspace configuration
            const config = vscode.workspace.getConfiguration('noComments');
            await config.update('apiKey', apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('API Key saved successfully!');
        }
    });

	context.subscriptions.push(
		jsCodeLensProvider,
		tsCodeLensProvider,
		generateComment
	);
}

// This method is called when your extension is deactivated
function deactivate() {}

// This function creates a CodeLens for each function in the document
function getCodeLens(document) {
	const lenses = [];
	const regex = /function\s+(\w+)\s*\(/g; // Simple regex to find functions

	let match;
	while ((match = regex.exec(document.getText())) !== null) {
		const functionName = match[1];
		const startLine = document.positionAt(match.index).line;
		const startChar = match.index;

		// Find the start of the function's body
		let bodyStart = regex.lastIndex; // Set body start after function declaration

		let braceCount = 0;
		let endLine = startLine;
		let endChar = startChar;

		// Loop through the document text to find the function body
		for (let i = bodyStart; i < document.getText().length; i++) {
			const char = document.getText()[i];

			if (char === "{") {
				braceCount++;
			} else if (char === "}") {
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
					title: "Generate Comment",
					command: "noComments.generateComment",
					arguments: [
						document.uri,
						startLine,
						endLine,
						startChar,
						endChar,
					], // Pass the start and end positions
				}
			)
		);
	}

	return lenses;
}

module.exports = {
	activate,
	deactivate,
};

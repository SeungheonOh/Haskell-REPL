import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let configuration = vscode.workspace.getConfiguration("haskell-repl");
	console.log('haskell-repl plugin started');

	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.startRepl', () => {
		let replTerminal = getTerm(configuration.get("replTerminalName", ""));
		if (replTerminal === undefined) {
			console.log("Making new REPL terminal");
			let term = vscode.window.createTerminal(configuration.get("replTerminalName", ""));

			term.sendText(configuration.get("shellSetup", ""));
			term.sendText(configuration.get("replCommand", ""));
		} else {
			vscode.window.showInformationMessage("Found running REPL terminal");
			console.log("Haskell REPL terminal is already running"); 
		}
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.restartRepl', () => {
		vscode.commands.executeCommand("haskell-repl.killRepl");
		vscode.commands.executeCommand("haskell-repl.startRepl");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.killRepl', () => {
		let replTerminal = getTerm(configuration.get("replTerminalName", ""));
		if (replTerminal === undefined) {
			vscode.window.showInformationMessage("Haskell REPL terminal is not running");
		} else {
			replTerminal.dispose();
		}
	}));

	
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (document.languageId === configuration.get("fileType", "") 
			&& document.uri.scheme === "file") {
			let term = getTerm(configuration.get("replTerminalName", ""));
			if(!term) {return;}
			term.sendText(configuration.get("replReload", ""));
		}
	});
}

function getTerm(name: string): vscode.Terminal | void {
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	return terminals.find(x => x.name === name);
}

export function deactivate() {}

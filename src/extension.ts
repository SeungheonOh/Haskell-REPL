import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	let configuration = vscode.workspace.getConfiguration("haskell-repl");
	console.log('haskell-repl plugin started');

	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.startRepl', () => {
		getTerm(configuration.get("replTerminalName", "")).then((t) => {
			console.log("start");
			vscode.window.showInformationMessage("Found running REPL terminal");
			console.log("Haskell REPL terminal is already running"); 
		}, () => {
			console.log("Making new REPL terminal");
			let term = vscode.window.createTerminal(configuration.get("replTerminalName", ""));

			term.sendText(configuration.get("shellSetup", ""));
			term.sendText(configuration.get("replCommand", ""));
		});
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.restartRepl', () => {
		vscode.commands.executeCommand("haskell-repl.killRepl");
		vscode.commands.executeCommand("haskell-repl.startRepl");
	}));

	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.killRepl', () => {
		getTerm(configuration.get("replTerminalName", "")).then((t) => {
			t.dispose();
		}, () => {
			vscode.window.showInformationMessage("Haskell REPL is not running");
		});
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('haskell-repl.sendCommand', () => {
		vscode.window.showInputBox().then((s) => {
			if(s === undefined) {return;}
			getTerm(configuration.get("replTerminalName", "")).then((t) => {
				t.sendText(s);
			}, () => {
				vscode.window.showInformationMessage("Haskell REPL is not running");
			});
		});
	}));
	
	vscode.workspace.onDidSaveTextDocument((document: vscode.TextDocument) => {
		if (document.languageId === configuration.get("fileType", "") 
			&& document.uri.scheme === "file") {
			getTerm(configuration.get("replTerminalName", "")).then((t) => {
				t.sendText(configuration.get("replReload", ""));
			});
		}
	});
}

function getTerm(name: string): Thenable <vscode.Terminal> {
	const terminals = <vscode.Terminal[]>(<any>vscode.window).terminals;
	return new Promise ((resolve, reject) => {
		let term = terminals.find(x => x.name === name);
		if (term === undefined) { console.log("terminal does not exist"); reject(); }
		resolve(term!);
	});
}

export function deactivate() {}

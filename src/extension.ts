import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
    let statusBarEntry: vscode.StatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarEntry.tooltip = "Go to offset";
    statusBarEntry.command = "extension.goto-offset";

    function updateOffset() {
        const editor = vscode.window.activeTextEditor;
        const offset = editor?.document.offsetAt(editor.selection.active) || 0;
        statusBarEntry.text = `Offset: ${offset}`;
        statusBarEntry.show();
    }

    async function gotoOffset() {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        const maxOffset = editor.document.getText().length;
        const offsetInputValue = await vscode.window.showInputBox({ prompt: `Type offset between 0 and ${maxOffset} to navigate to` });
        if (offsetInputValue === undefined) {
            return;
        }

        const offset = Number.parseInt(offsetInputValue, 10);

        if (Number.isNaN(offset)) {
            return;
        }

        // Clamp offset to the range `0 - maxOffset`
        const newPosition = editor.document.positionAt(Math.max(Math.min(offset, maxOffset), 0));
        editor.selection = new vscode.Selection(newPosition, newPosition);
        editor.revealRange(editor.selection);
    }

    updateOffset();

    vscode.window.onDidChangeTextEditorSelection(updateOffset, null, context.subscriptions);
    vscode.workspace.onDidChangeConfiguration(updateOffset, null, context.subscriptions);

    context.subscriptions.push(vscode.commands.registerCommand("extension.goto-offset", gotoOffset));
}

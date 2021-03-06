'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

import { BpmnModelerBuilder } from './bpmnModelerBuilder';

const fs = require('fs');

export class EditingProvider implements vscode.TextDocumentContentProvider {

  public constructor(private _context: vscode.ExtensionContext) { }

  private getUri(...p: string[]): vscode.Uri {
    return vscode.Uri.file(path.join(this._context.extensionPath, ...p))
      .with({ scheme: 'vscode-resource' });
  }

  public provideTextDocumentContent(uri: vscode.Uri): string {
    const { fsPath: docPath } = uri.with({ scheme: 'vscode-resource' });

    const contents = fs.readFileSync(docPath, { encoding: 'utf8' });

    const filePath: vscode.Uri = vscode.Uri.file(path.join(this._context.extensionPath, 'out', 'assets', 'editing.html'));
    var tmplContent:string = fs.readFileSync(filePath.fsPath, 'utf8');

    const builder = new BpmnModelerBuilder(contents, tmplContent, {
      modelerDistro: this.getUri('node_modules', 'bpmn-js', 'dist', 'bpmn-modeler.development.js'),
      diagramStyles: this.getUri('node_modules', 'bpmn-js', 'dist', 'assets', 'diagram-js.css'),
      bpmnFont: this.getUri('node_modules', 'bpmn-js', 'dist', 'assets', 'bpmn-font', 'css', 'bpmn.css'),
      modelerStyles: this.getUri('out', 'assets', 'modeler.css'),
      resourceUri: uri
    });

    return builder.buildModelerView();
  }
}
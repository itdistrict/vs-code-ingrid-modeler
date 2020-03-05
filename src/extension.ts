'use strict';

import * as vscode from 'vscode';

import { ExtensionContext, Uri, WebviewPanel } from 'vscode';

import * as os from 'os';
import * as path from 'path';

const fs = require('fs');
const jsdom = require("jsdom");

import { EditingProvider } from './features/editing';
import { Repository } from './data/repository';

const editingType = 'bpmn-io.editing';
const extName = 'vs-code-ingrid-modeler';

const COMMANDS = {
  EDIT_CMD: 'extension.bpmn-io.edit'
};

var repository = new Repository();
let unsaved = false;

interface BpmnEditorPanel {
  panel: WebviewPanel;
  resource: Uri;
  provider: EditingProvider;
}

function createPanel(
  context: ExtensionContext,
  uri: Uri,
  provider: EditingProvider
): BpmnEditorPanel {

  const editorColumn =
    (vscode.window.activeTextEditor &&
      vscode.window.activeTextEditor.viewColumn) ||
    vscode.ViewColumn.One;

  const panel = vscode.window.createWebviewPanel(
    editingType,
    getPanelTitle(uri, provider),
    editorColumn,
    getWebviewOptions(context, uri)
  );

  // set content
  panel.webview.html = provider.provideTextDocumentContent(uri);

  // set panel icons
  const {
    extensionPath
  } = context;

  panel.iconPath = {
    light: getUri(extensionPath, 'resources', 'logo_light_panel.png'),
    dark: getUri(extensionPath, 'resources', 'logo_dark_panel.png')
  };

  // handling messages from the webview content
  panel.webview.onDidReceiveMessage(
    message => {
      switch (message.command) {
        case 'openEditor':
          openEditor(uri, getDocumentationFromElement(uri, message.id), message.id);
          return;
        case 'saveContent':
          /*
                    var dom = new jsdom.JSDOM(message.content, { contentType: "text/xml" });
                    var elNode = dom
                      .window.document
                      .querySelectorAll(`bpmn2\\:documentation`);
          
                    elNode.forEach(element => {
                      console.log(element.textContent);
                      console.log("----------------------");
                      var lines = element.textContent.split(/\r\n|\r|\n/g);
                      var linesString = "";
                      lines.forEach(line => {
                        linesString += ((line.length && line[0] == ' ') ? line.slice(1) : line) + "&#xD;\r\n"
                      });
          
                      element.textContent = linesString;
          
          
                      console.log(linesString);
                      console.log("\n----------next element------------\n");
                    });
                    console.log(dom.serialize());
          */

          //saveFile(uri, message.content);
          return;
        case 'bufferDiagram':
          var index = repository.getIndex(uri);
          if (index > -1) {
            repository.cache[index].buffer = message.content;
          }
          return;
      }
    },
    undefined,
    context.subscriptions
  );

  return { panel, resource: uri, provider };
}

function getDocumentationFromElement(uri: vscode.Uri, id: String) {
  var content = getFileContent(uri);
  var elNode = new jsdom.JSDOM(content, { contentType: "text/xml" })
    .window.document
    .querySelector(`[id="${id}"] > bpmn2\\:documentation`);

  if (elNode !== null) {
    return elNode.textContent;
  }
  return "";
}

function makeid(length: number) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}


function openEditor(uri: vscode.Uri, content: String, id: string) {
  let tempdir = vscode.workspace.getConfiguration(extName).get('tmpDir') || os.tmpdir();
  var filepath = vscode.Uri.file(tempdir + path.sep + path.basename(uri.fsPath) + "." + makeid(5) + ".tmpl");

  var index = repository.getIndex(uri);
  if (index > -1) {
    if (repository.cache[index].unsaved) {
      vscode.window.showErrorMessage("Could not load editor because you have unsaved changes.");
      return;
    }
    filepath = repository.cache[index].tmpFile;
  }
  saveFile(filepath, content);
  repository.newOrUpdateFile(uri, filepath);
  repository.updateLastElement(uri, id);

  vscode.workspace
    .openTextDocument(filepath)
    .then(document => {
      console.log("SHOW THIS SHIT");
      vscode.window.showTextDocument(document, vscode.ViewColumn.Beside, false);
      //vscode.languages.setTextDocumentLanguage(document, "gohtml");
    });
}

function getFileContent(uri: vscode.Uri) {
  const { fsPath: docPath } = uri.with({ scheme: 'vscode-resource' });
  return fs.readFileSync(docPath, { encoding: 'utf8' });
}

function saveFile(uri: vscode.Uri, content: String) {
  const { fsPath: docPath } = uri.with({ scheme: 'vscode-resource' });
  if (!content) {
    fs.unlinkSync(docPath);
  }
  fs.writeFileSync(docPath, content, { encoding: 'utf8' });
}

function refresh(
  editor: BpmnEditorPanel
) {
  const { resource, panel, provider } = editor;

  panel.webview.html = provider.provideTextDocumentContent(resource);
}

export function activate(context: ExtensionContext) {

  const openedPanels: BpmnEditorPanel[] = [];
  const editingProvider = new EditingProvider(context);


  const _revealIfAlreadyOpened = (
    uri: Uri,
    provider: EditingProvider
  ): boolean => {

    const opened = openedPanels.find(panel => {
      const {
        resource,
        provider: panelProvider
      } = panel;

      return resource.fsPath === uri.fsPath && panelProvider === provider;
    });

    if (!opened) {
      return false;
    }

    opened.panel.reveal(opened.panel.viewColumn);

    return true;
  };

  const _registerPanel = (
    editorPanel: BpmnEditorPanel
  ): void => {

    // on closed
    editorPanel.panel.onDidDispose(() => {
      openedPanels.splice(openedPanels.indexOf(editorPanel), 1);
    });

    // on changed
    editorPanel.panel.onDidChangeViewState(() => {
      refresh(editorPanel);
    });

    openedPanels.push(editorPanel);
  };

  const _registerCommands = (): void => {
    const {
      EDIT_CMD
    } = COMMANDS;

    vscode.commands.registerCommand(EDIT_CMD, (uri: Uri) => {
      if (!_revealIfAlreadyOpened(uri, editingProvider)) {
        _registerPanel(createPanel(context, uri, editingProvider));
      }
    });
  };

  const _serializePanel = (
    provider: EditingProvider
  ): void => {

    const viewType = editingType;

    if (vscode.window.registerWebviewPanelSerializer) {
      vscode.window.registerWebviewPanelSerializer(viewType, {
        async deserializeWebviewPanel(panel: WebviewPanel, state: any) {

          if (!state || !state.resourcePath) {
            return;
          }

          const resource = Uri.parse(state.resourcePath);

          panel.title = panel.title || getPanelTitle(resource, provider);
          panel.webview.options = getWebviewOptions(context, resource);
          panel.webview.html = provider.provideTextDocumentContent(resource);

          _registerPanel({ panel, resource, provider });
        }
      });
    }
  };

  _registerCommands();
  _serializePanel(editingProvider);
}

export function deactivate() { }

// listener

vscode.workspace.onDidSaveTextDocument((document) => {
  var index = repository.getIndexByTmp(document.uri);
  var content = "";
  if (index > -1) {
    if (repository.cache[index].buffer) {
      // Save buffer first
      console.log("Using from buffer");
      content = repository.cache[index].buffer;
      repository.cache[index].buffer = "";
    } else {
      content = getFileContent(repository.cache[index].uri);
    }

    const dom = new jsdom.JSDOM(content, { contentType: "text/xml" });
    let id = repository.cache[index].lastElement;

    var elNode = dom.window.document.querySelector(`[id="${id}"]`);
    if (elNode !== null) {
      var elDoc = elNode.querySelector(`bpmn2\\:documentation`)
      if (elDoc !== null) {
        elDoc.textContent = document.getText();
      } else {
        var element = dom.window.document.createElement("bpmn2:documentation");
        element.textContent = document.getText();
        element.id = "Documentation_" + makeid(8)
        elNode.appendChild(element);
      }
      saveFile(repository.cache[index].uri, dom.serialize());
    }
  }
});

vscode.workspace.onDidChangeTextDocument((document) => {
  var index = repository.getIndexByTmp(document.document.uri);
  if (index > -1) {
    repository.cache[index].unsaved = document.document.isDirty;
  }
});


// helper ///////

function getPanelTitle(
  uri: Uri,
  provider: EditingProvider
): string {

  const prefix = 'Edit';

  return `${prefix}: ${path.basename(uri.fsPath)}`;
}

function getWebviewOptions(context: ExtensionContext, uri: Uri) {
  return {
    enableScripts: true,
    retainContextWhenHidden: true,
    localResourceRoots: getLocalResourceRoots(context, uri)
  };
}

function getLocalResourceRoots(
  context: ExtensionContext,
  resource: vscode.Uri
): vscode.Uri[] {

  const baseRoots = [vscode.Uri.file(context.extensionPath)];
  const folder = vscode.workspace.getWorkspaceFolder(resource);

  if (folder) {
    return baseRoots.concat(folder.uri);
  }

  if (!resource.scheme || resource.scheme === 'file') {
    return baseRoots.concat(vscode.Uri.file(path.dirname(resource.fsPath)));
  }

  return baseRoots;
}

function getUri(...p: string[]): vscode.Uri {
  return vscode.Uri.file(path.join(...p));
}

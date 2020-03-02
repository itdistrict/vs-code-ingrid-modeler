import { expect } from 'chai';
import { before } from 'mocha';
import * as path from 'path';

import * as vscode from 'vscode';

const TEST_FILE = path.join(__dirname, '..', 'fixtures', 'simple.bpmn');

suite('Extension Test Suite', () => {

  before(() => {
    vscode.window.showInformationMessage('Start all tests.');
  });

  test('should start without error', async () => {

    // when
    const editor = await openFile(TEST_FILE);

    // given
    expect(editor).not.to.be.empty;
  });

});


// helpers //////

async function openFile(path: string): Promise<vscode.TextEditor> {
  const uri = vscode.Uri.file(path);
  const document = await vscode.workspace.openTextDocument(uri);
  const editor = await vscode.window.showTextDocument(document);

  // wait for editor to open
  await sleep(500);

  return editor;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

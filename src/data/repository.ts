'use strict';
import * as vscode from 'vscode';

export class Repository {
    cache: BPMNFile[];
    constructor() {
        this.cache = [];
    }
    newOrUpdateFile(uri: vscode.Uri, tmpFile: vscode.Uri) {
        let index = this.getIndex(uri);
        if (index > -1) {
            return; // Nothing to do yet
        }
        this.cache.push(new BPMNFile(uri,tmpFile));
    }

    getIndex(uri: vscode.Uri) {
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].uri.fsPath === uri.fsPath) {
                return i
            }
        }
        return -1;
    }

    getIndexByTmp(uri: vscode.Uri) {
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].tmpFile.fsPath === uri.fsPath) {
                return i
            }
        }
        return -1;
    }

    updateLastElement(uri: vscode.Uri, lastElement: String) {
        let index = this.getIndex(uri);
        if (index > -1) {
            this.cache[index].lastElement = lastElement;
        }
    }
}

class BPMNFile {
    lastElement: String
    uri: vscode.Uri
    tmpFile: vscode.Uri
    constructor(uri: vscode.Uri, tmpFile: vscode.Uri) {
        this.lastElement = "";
        this.uri = uri;
        this.tmpFile = tmpFile;
    }
}
'use strict';
import * as vscode from 'vscode';

export class Repository {
    cache: BPMNFile[];
    constructor() {
        this.cache = [];
    }

    newFile(uri: vscode.Uri) {
        this.cache.push(new BPMNFile(uri));
    }

    newOrUpdateFile(uri: vscode.Uri, tmpFile: vscode.Uri) {
        let index = this.getIndex(uri);
        if (index > -1) {
            this.cache[index].setTmpFile(tmpFile);
            return; // Nothing to do yet
        }
        let file = new BPMNFile(uri);
        file.setTmpFile(tmpFile);
        this.cache.push(file);
    }

    getIndex(uri: vscode.Uri) {
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].uri && this.cache[i].uri.fsPath === uri.fsPath) {
                return i
            }
        }
        return -1;
    }

    getIndexByTmp(uri: vscode.Uri) {
        for (let i = 0; i < this.cache.length; i++) {
            if (this.cache[i].tmpFile && this.cache[i].tmpFile.fsPath === uri.fsPath) {
                return i
            }
        }
        return -1;
    }

    updateLastElement(uri: vscode.Uri, lastElement: string) {
        let index = this.getIndex(uri);
        if (index > -1) {
            this.cache[index].lastElement = lastElement;
        }
    }
}

class BPMNFile {
    lastElement: string;
    uri: vscode.Uri;
    tmpFile: vscode.Uri;
    unsaved: boolean;
    buffer: string;
    constructor(uri: vscode.Uri) {
        this.lastElement = '';
        this.uri = uri;
        this.unsaved = false;
        //this.tmpFile = {} as vscode.Uri;
        this.buffer = '';
    }

    setTmpFile(tmpFile: vscode.Uri) {
        this.tmpFile = tmpFile;
    }
}
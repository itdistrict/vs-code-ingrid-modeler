'use strict';
import * as vscode from 'vscode';
import * as path from 'path';

const fs = require('fs');

export class BpmnModelerBuilder {
  contents: string;
  tmplContent: string;
  resources: any;

  public constructor(contents: string, tmplContent: string, resources: any) {
    this.contents = contents;
    this.tmplContent = tmplContent;
    this.resources = resources;
  }

  private removeNewLines(contents: string): string {
    return contents.replace(/(\r\n|\n|\r)/gm, ' ');
  }

  public buildModelerView(): string {
    this.contents = this.removeNewLines(this.contents);
    let content = this.tmplContent;
    content = content.replace("${this.resources.modelerDistro}", this.resources.modelerDistro);
    content = content.replace("${this.resources.diagramStyles}", this.resources.diagramStyles);
    content = content.replace("${this.resources.bpmnFont}", this.resources.bpmnFont);
    content = content.replace("${this.resources.modelerStyles}", this.resources.modelerStyles);
    content = content.replace("${this.resources.resourceUri}", this.resources.resourceUri);
    content = content.replace("${this.contents}", this.contents);
    return content;
  }
}

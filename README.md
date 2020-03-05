# Ingrid Modeler

![GitHub package.json version](https://img.shields.io/github/package-json/v/bpmn-io/vs-code-bpmn-io) ![vs-code-support](https://img.shields.io/badge/Visual%20Studio%20Code-1.38.0+-blue.svg) [![Build Status](https://travis-ci.com/bpmn-io/vs-code-bpmn-io.svg?branch=master)](https://travis-ci.com/bpmn-io/vs-code-bpmn-io)

Create and edit ingrid BPMN diagrams in VS Code using [bpmn.io](https://bpmn.io/) tools.

## Features

* Open BPMN 2.0 in a Modeler to make changes to your diagrams
* Save changes to your local file

![alt](./resources/screencast_preview.gif?raw=true)

## How to get it

Type `vs-code-ingrid-modeler` in the Extensions section and directly install it. You can also download it in the [Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=bpmn-io.vs-code-bpmn-io) or [setup it locally](#development-setup).

## Known Issues

**HIGHT PRIO**

* I am not escaping the newlines, which means that some formatter will remove them in your xml file
* (FIXED) Before you can write documentation code to a NEW Task you just created, you have to save the BPMN diagram first
* (FIXED) Having bpmn files with the same name and task might cause problems
* (FIXED) Changes check is globally but should be set per file
* (FIXED) only supported bpmn2 tags
* (FIXED -> pseudiounique: 8 length random generated string) Documentation ID is static

**LOW PRIO**

* No New Button yet for new bpmn diagrams
* Syntax highlighting not working yet, might create another extension or include it in this one
* Should not load all node_modules, makes it slower --> bundle scripts
* adding highlight but check beforehand if document is saved
* Everytime you reopen the workspace, close the Edit BPMN Window and Temporary Element Editor
* Saving diagrams only only possible with `CTRL + s`
* highlights and other states like zoom positioning get lost after saving a task because modeler gets refreshed

## Development Setup

First step, clone this project to your local machine.

```sh
$ git clone https://github.com/itdistrict/vs-code-ingrid-modeler.git
$ cd ./vs-code-ingrid-modeler
$ npm install
$ code .
```

Press `F5` to load and debug the extension in a new VS Code instance.

To execute the test suite simply use

```bash
npm run test
```

The extension integration tests can also be executed from VS Code itself, simple choose the *Extension Tests* in the Debug mode.

## Go further

* Get a [Quickstart](./docs/DEVELOPMENT_QUICKSTART.md) on how to develop VS Code extensions
* Learn how to [release a new version](./docs/RELEASING.md)

## License

MIT

Contains parts ([bpmn-js](https://github.com/bpmn-io/bpmn-js)) released under the [bpmn.io license](http://bpmn.io/license).

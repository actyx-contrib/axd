# Actyx Diagnostics

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/axd.svg)](https://npmjs.org/package/axd)
[![Downloads/week](https://img.shields.io/npm/dw/axd.svg)](https://npmjs.org/package/axd)
[![License](https://img.shields.io/npm/l/axd.svg)](https://github.com/Actyx/axd/blob/master/package.json)

A tool to diagnose issues with your ActyxOS nodes.

![](https://github.com/o1iver/actyx-diagnostics/raw/master/images/actyx-diagnostics-overview.png)
![](https://github.com/o1iver/actyx-diagnostics/raw/master/images/actyx-diagnostics-detail.png)
![](https://github.com/o1iver/actyx-diagnostics/raw/master/images/actyx-diagnostics-map.png)


## Prerequistes

You need to have Node running on your machine.

## Usage

Start the diagnostics server:

<!-- usage -->
```sh-session
$ npx axd
Open the AXD UI at http://localhost:1234/
```

If you want to enable debug logs, start the server as follows:
- Windows: `$env:DEBUG = 'axd*'; npx axd`
- Linux / macOS: `DEBUG=axd* npx axd`
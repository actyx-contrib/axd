const fs = require('fs')
const path = require('path')
var copydir = require('copy-dir');
var mkdirp = require('mkdirp');

const targetDir = path.join(__dirname, '..', 'static', 'client')
const sourceDir = path.join(__dirname, '..', '..', 'client', 'build')

if (!fs.existsSync(sourceDir)) {
    console.error(`Unable to find client build at ${sourceDir}. Did you build the client?`)
    process.exit(1)
}

mkdirp(targetDir).then(() => {
    copydir(sourceDir, targetDir, {}, err => {
        if (err) { throw err }
    })
})
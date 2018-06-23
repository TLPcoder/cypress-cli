'use strict'
var inquirer = require('inquirer')
var fs = require('fs')
var child = require('child_process')

function CypressCommand() {}

CypressCommand.prototype.init = function () {
    inquirer.prompt([{
            type: 'input',
            name: 'project_name',
            message: 'Project Name'
        },
        {
            type: 'input',
            name: 'project_description',
            message: 'Project Description'
        },
        {
            type: 'input',
            name: 'project_directory',
            message: 'Project Directory'
        },
    ]).then(function (answers) {
        this.project_name = answers.project_name
        this.project_description = answers.project_description
        this.project_directory = answers.project_directory
        this.createFileTree()
    }.bind(this))
}

CypressCommand.prototype.createFileTree = function () {
    var cypressConfig = fs.readFileSync(__dirname + '/boiler-plates/cypress.txt')

    fs.mkdirSync(this.project_directory)
    fs.mkdirSync('./' + this.project_directory + '/server')
    fs.writeFileSync('./' + this.project_directory + '/server/app.js')
    fs.writeFileSync('./' + this.project_directory + '/server/cypress.json', cypressConfig)
    this.npmInit()
}

CypressCommand.prototype.npmInit = function () {
    var packageJson = fs.readFileSync(__dirname + '/boiler-plates/package.txt', 'utf8')
    var structuredPackageJson = this.structurePackageJson(packageJson)

    fs.writeFileSync('./' + this.project_directory + '/package.json', structuredPackageJson)
    child.execSync('cd ' + this.project_directory + ' && npm install', {
        cwd: process.cwd()
    });
}

CypressCommand.prototype.structurePackageJson = function (packageJson) {
    var projectName = this.project_name
    var projectDescription = this.project_description

    packageJson = this.templateReplacement(packageJson, '{{project-name}}', projectName)
    packageJson = this.templateReplacement(packageJson, '{{description}}', projectDescription)

    return packageJson
}

CypressCommand.prototype.templateReplacement = function (template, placeholder, value) {
    return template.replace(placeholder, '"' + value + '"')
}

module.exports = new CypressCommand()
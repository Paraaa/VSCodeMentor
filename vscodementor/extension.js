const vscode = require('vscode')
const Model = require('./src/model')
const ConfigManager = require('./src/configManager')

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	new ConfigManager(context) // The context has to be passed in the activate function otherwise it is undefined in the ConfigManger is passed through a function
	registerCommands(context)
}

function registerCommands(context) {
	const model = new Model()

	let askModel = vscode.commands.registerCommand(
		'vscodementor.askModel',
		async function () {
			model.askModel()
		}
	)

	let changeModel = vscode.commands.registerCommand(
		'vscodementor.changeModel',
		async function () {
			model.changeModel()
		}
	)

	let disableModel = vscode.commands.registerCommand(
		'vscodementor.disableModel',
		async function () {
			model.disableModel()
		}
	)

	let clearChatHistory = vscode.commands.registerCommand(
		'vscodementor.clearChatHistory',
		function () {
			model.clearChatHistory()
		}
	)

	let startModel = vscode.commands.registerCommand(
		'vscodementor.startModel',
		function () {
			model.restoreModelState()
		}
	)
	let improveCode = vscode.commands.registerCommand(
		'vscodementor.improveCode',
		function () {
			model.improveCode()
		}
	)

	let toggleGpuSupport = vscode.commands.registerCommand(
		'vscodementor.toggleGpuSupport',
		function () {
			model.toggleGpuSupport()
		}
	)

	context.subscriptions.push(askModel)
	context.subscriptions.push(changeModel)
	context.subscriptions.push(disableModel)
	context.subscriptions.push(clearChatHistory)
	context.subscriptions.push(startModel)
	context.subscriptions.push(improveCode)
	context.subscriptions.push(toggleGpuSupport)
}

function deactivate() {
	// TODO: Check if this is working properly
	vscode.commands.executeCommand('vscodementor.disableModel')
}

module.exports = {
	activate,
	deactivate,
}

const ConfigManager = require('./configManager')
const vscode = require('vscode')
const fs = require('fs')
const path = require('path')

class VSCodeMentorSidebar {
	/**
	 * Using singleton model to prevent multiple Sidebars running on the same machine.
	 *
	 * @returns {VSCodeMentorSidebar} Singletone instance of a Sidebar
	 */
	constructor(model) {
		// If there is no instance yet, create and build a new one
		if (!VSCodeMentorSidebar.instance) {
			this.registerSidebar()
			this.model = model
			this.context = new ConfigManager().getContext()
			VSCodeMentorSidebar.instance = this
		}
		return VSCodeMentorSidebar.instance
	}

	registerSidebar() {
		vscode.window.registerWebviewViewProvider('vscodementor-sidebar', {
			resolveWebviewView: (webviewView) => {
				// Storing the webview to update the content later
				this.webviewView = webviewView
				webviewView.webview.options = {
					enableScripts: true,
				}
				webviewView.webview.html = this.getWebviewContent()
				webviewView.webview.onDidReceiveMessage((message) =>
					this.handleWebviewMessage(message)
				)
			},
		})
	}

	sendChatHistoryToWebview(chatHistory) {
		this.webviewView.webview.postMessage({
			command: 'vscodementor.updateChatHistory',
			chatHistory: chatHistory,
		})
	}

	sendModelStatusToWebview(modelStatus) {
		this.webviewView.webview.postMessage({
			command: 'vscodementor.updateModelStatus',
			modelStatus: modelStatus,
		})
	}

	sendGPUStatusToWebview(gpuStatus) {
		this.webviewView.webview.postMessage({
			command: 'vscodementor.updateGpuStatus',
			gpuStatus: gpuStatus,
		})
	}

	handleWebviewMessage(message) {
		switch (message.command) {
			case 'vscodementor.askModel':
				this.model.askModel(message.prompt)
				break
			default:
				vscode.commands.executeCommand(message.command)
		}
	}

	getWebviewContent() {
		const filePath = path.join(__dirname, '../resources/webview/sidebar.html')
		let fileContents = fs.readFileSync(filePath, 'utf8')

		// Create a URI for the CSS file
		const vscodeCssUri = this.webviewView.webview.asWebviewUri(
			vscode.Uri.file(
				path.join(
					this.context.extensionPath,
					'resources/webview/styles/vscode.css'
				)
			)
		)
		const resetCssUri = this.webviewView.webview.asWebviewUri(
			vscode.Uri.file(
				path.join(
					this.context.extensionPath,
					'resources/webview/styles/reset.css'
				)
			)
		)

		// Inject the CSS URI into the HTML content
		fileContents = fileContents.replace(
			'<!-- STYLESHEET -->',
			`<link rel="stylesheet" href="${vscodeCssUri}">
			<link rel="stylesheet" href="${resetCssUri}">`
		)

		const markdownItPath = vscode.Uri.file(
			path.join(
				this.context.extensionPath,
				'node_modules',
				'markdown-it/dist/markdown-it.js'
			)
		)

		const scriptMarkdownIt =
			this.webviewView.webview.asWebviewUri(markdownItPath)

		fileContents = fileContents.replace(
			'<!-- MARKDOWN-IT -->',
			`<script src='${scriptMarkdownIt}'></script>`
		)
		return fileContents
	}
}

module.exports = VSCodeMentorSidebar

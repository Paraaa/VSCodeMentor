const { createCompletion, loadModel } = require('gpt4all')
const vscode = require('vscode')
const ConfigManager = require('./configManager')
const VSCodeMentorSidebar = require('./vsCodeMentorSidebar')
const fs = require('fs')
const os = require('os')
const path = require('path')

class Model {
	/**
	 * Using singleton model to prevent multiple models running on the same machine.
	 *
	 * @returns {Model} Singletone instance of a Model
	 */
	constructor() {
		// If there is no instance yet, create and build a new one
		if (!Model.instance) {
			this.gpt = null
			this.chatHistory = []
			this.modelChatHistory = []
			this.modelConfiguration = []
			this.systemPromptTemplate = ' '
			this.gpuSupport = false
			this.configManager = new ConfigManager()
			this.sidebar = new VSCodeMentorSidebar(this)

			this.loadAvailableModels()
			this.restoreModelState(true)
			Model.instance = this
		}
		return Model.instance
	}

	restoreModelState(verbose) {
		const modelName = this.configManager.getSelectedModelName()
		if (modelName) {
			this.changeModel(modelName, verbose)
		}
		this.restoreModelConfiguration()
	}

	async loadAvailableModels() {
		const filePath = path.join(__dirname, '../resources/availableModels.json')
		const fileContents = fs.readFileSync(filePath, 'utf8')
		this.availableModels = JSON.parse(fileContents)
	}

	async loadGPT(modelId, verbose = true) {
		const options = {
			verbose: true,
			device: 'cpu',
		}
		const isGpuModel = this.isOnlyGPUModel(modelId)
		if (!this.gpuSupport && isGpuModel) {
			vscode.window.showErrorMessage('Selected model only works on GPU!')
			return
		}
		if (this.gpuSupport) {
			// device: 'gpu', add this to enable GPU support
			options.device = 'gpu'
		}
		try {
			this.gpt = await loadModel(modelId, options)
			if (verbose) {
				vscode.window.showInformationMessage('Model loaded successfully!')
			}
			// Notify the sidebar that the checkbox has to be enabled
			this.sidebar.sendModelStatusToWebview(true)
		} catch (error) {
			console.error(error)
		}
	}

	async improveCode() {
		const editor = vscode.window.activeTextEditor
		if (!editor) {
			vscode.window.showErrorMessage('No open text editor found.')
			return
		}
		const document = editor.document
		const codeContent = document.getText()
		await this.askModel(codeContent)
	}

	async askModel(input = null) {
		let prompt = input
		// Open a quick pick menu if there is no input prompt given
		if (!input) {
			prompt = await vscode.window.showInputBox({
				prompt: 'Please enter a question!',
			})
		}

		// Check if there is still no input
		if (!prompt) {
			return
		}

		if (!this.gpt) {
			vscode.window.showInformationMessage('The model is not loaded yet!')
			return
		}
		this.chatHistory.push(`You: ${prompt}\n`)
		this.modelChatHistory.push({ role: 'user', content: prompt })
		this.prompt = this.modelConfiguration.concat(
			this.modelChatHistory.slice(-3) // Use only the last 3 message to keep the context
		)

		const response = await createCompletion(this.gpt, this.prompt, {
			verbose: true,
			nCtx: 1024,
			nPredict: 512,
			nBatch: 16,
			systemPromptTemplate: this.systemPromptTemplate,
		})

		const model_response = response.choices[0].message.content

		this.chatHistory.push(`Model: ${model_response}\n`)
		this.modelChatHistory.push({ role: 'assistant', content: model_response })

		this.sidebar.sendChatHistoryToWebview(this.chatHistory)

		// Workaround: Restart the model after each prompt to prevent
		// LLaMA ERROR: Failed to process prompt.
		// LLaMA ERROR: Failed to generate next token.
		// This is not a good solution but GPT4ALL is currently in alpha.
		this.disableModel(false)
		this.restoreModelState(false)
	}

	async changeModel(modelName = null, verbose = true) {
		if (!modelName) {
			const modelNames = this.getAllModelNames()
			modelName = await vscode.window.showQuickPick(modelNames, {
				placeHolder: 'Select a model to load',
			})
		}

		const modelId = this.getModelIdByName(modelName)
		if (!modelId) {
			vscode.window.showInformationMessage(
				'Could not find model with the name:' + modelName
			)
			return
		}

		if (!this.checkMemoryAvailability(modelName)) {
			vscode.window.showInformationMessage(
				'Not enough memory to load the model: ' + modelName
			)
			return
		}

		if (modelId) {
			// Unload the current model if there is an instance
			if (this.gpt) {
				this.gpt.dispose()
				this.gpt = null
			}
			if (verbose) {
				vscode.window.showInformationMessage(`Loading model ${modelName}...`)
			}
			this.systemPromptTemplate = this.getSystemPromptTemplate(modelName)
			const success = this.loadGPT(modelId, verbose)
			if (success) {
				// Store selected model name persistent
				await this.configManager.saveSelectedModelName(modelName)
			}
		}
	}

	async disableModel(verbose = true) {
		if (!this.gpt) {
			vscode.window.showInformationMessage('There is no model loaded')
			return
		}
		this.gpt.dispose() // Unload the current model
		this.gpt = null
		if (verbose) {
			vscode.window.showInformationMessage('Model unloaded successfully!')
		}
		// Notify the sidebar that the checkbox has to be disabled
		this.sidebar.sendModelStatusToWebview(false)
	}

	async toggleGpuSupport() {
		this.gpuSupport = !this.gpuSupport
		if (this.gpuSupport) {
			vscode.window.showInformationMessage('GPU support enabled!')
		} else {
			vscode.window.showInformationMessage('GPU support disabled!')
		}
		// Restart the model with new settings
		this.disableModel()
		this.restoreModelState()
		this.sidebar.sendGPUStatusToWebview(this.gpuSupport)
	}

	/**
	 * Returns the model ID for a given model name.
	 *
	 * @param {string} modelName - The name of the model in set in vscode
	 * @returns {string|null} The model ID, or null if the model is not found
	 */
	getModelIdByName(modelName) {
		for (let model of this.availableModels) {
			if (model.name === modelName) {
				return model.model_id
			}
		}
		return null
	}

	isOnlyGPUModel(modelId) {
		for (let model of this.availableModels) {
			if (model.model_id === modelId) {
				return model.onlyDevice === 'gpu'
			}
		}
	}

	getAllModelNames() {
		let modelNames = []
		for (let model of this.availableModels) {
			modelNames.push(model.name)
		}
		return modelNames
	}

	getModelRamSize(modelName) {
		for (let model of this.availableModels) {
			if (model.name === modelName) {
				return model.ram
			}
		}
		return null
	}

	getSystemPromptTemplate(modelName) {
		for (let model of this.availableModels) {
			if (model.name === modelName) {
				return model.systemPromptTemplate
			}
		}
		return null
	}

	checkMemoryAvailability(modelName) {
		// There is no general way to check the VRAM availability of a system through node.js (afaik)
		// If the user activates gpu support the user has to make sure that there is enough VRAM available!
		if (this.gpuSupport) {
			return true
		}

		let freeMemory = os.freemem() / 1024 / 1024 / 1024 // Divide by 1024 to get the free memory in GB
		let requiredMemory = parseFloat(
			this.getModelRamSize(modelName).split(' ')[0]
		)

		let currentlyUsedRam = 0 // We will free this memory if there is a model running
		if (this.gpt) {
			currentlyUsedRam = parseFloat(this.gpt.config.ramrequired)
		}
		return freeMemory + currentlyUsedRam > requiredMemory
	}

	restoreModelConfiguration() {
		// Load the model configuration from the modelConfiguration.json
		const filePath = path.join(
			__dirname,
			'../resources/modelConfiguration.json'
		)
		const fileContents = fs.readFileSync(filePath, 'utf8')
		this.modelConfiguration = JSON.parse(fileContents)
	}

	clearChatHistory() {
		this.chatHistory = []
		this.modelChatHistory = []
		this.restoreModelConfiguration()
		vscode.window.showInformationMessage('Chat history cleared!')
	}
}

module.exports = Model

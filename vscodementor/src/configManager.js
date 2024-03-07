class ConfigManager {
	constructor(context) {
		// If there is no instance yet, create and build a new one
		if (!ConfigManager.instance) {
			this.context = context
			ConfigManager.instance = this
		}
		return ConfigManager.instance
	}

	async saveSelectedModelName(modelName) {
		await this.context.globalState.update('selectedModelName', modelName)
	}

	getSelectedModelName() {
		return this.context.globalState.get('selectedModelName')
	}

	getContext() {
		return this.context
	}
}

module.exports = ConfigManager

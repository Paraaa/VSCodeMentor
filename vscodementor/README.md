# VSCodeMentor

<img src="./resources/vscodementorIcon.svg" alt="Your SVG Image" width="100" height="100">


VSCodeMentor is a Visual Studio Code extension designed to enhance code quality by providing immediate feedback on best practices and clean code principles.
Running the models locally ensures that sensitive code remains on the developer machine. 

## Table of Content


- [Installation](#installation)
- [Post Installation](#post-installation)
- [Available Models](#available-models)
- [Commands](#commands)
- [Model Configuration](#model-configuration)
- [License](#license)

## Requirements

- [Visual Studio Code](https://code.visualstudio.com/download).
- Minimum of  8 GB RAM running on CPU (Recommended >32 GB).
- Minimum of  8 GB VRAM running on GPU (Recommended >12 GB).
- [CPU with AVX or AVX2 instruction](https://docs.gpt4all.io/gpt4all_faq.html#what-are-the-system-requirements)


## Installation

1. Locate your local extension folder
    - Windows: `\Users\USERNAME\.vscode\extensions`
    - Linux: `~/.vscode/extensions`
2. Drag and drop the `vscodementor` folder inside your `extensions` folder
3. Restart VSCode

## Post Installation

1. Open the extension on sidebar and press `Change Model`.
2. Select a model from the quickpick which fits your system from the menu.
3. The model will now be downloaded if it not yet present in the `.cache\gpt4all\` folder.
    - Note: If the model requires a GPU it will only download the model if the GPU support is active!
4. If everything worked correctly you will be prompted with a `Model loaded successfully!` notification. Or the `Toggle Model` checkbox will be selected!
5. Now you can communicate with the LLM!

## Available Models

| Model ID | Model Name | Description | Size | Required RAM | GPU Required |
|----------|------------|-------------|------|--------------|--------------|
| mistral-7b-openorca.Q4_0.gguf | OpenOrca Chat Model  | A model designed for chat interactions. |   3.83 GB |   8 GB | Yes |
| mistral-7b-instruct-v0.1.Q4_0.gguf | OpenOrca Instruction Model | A model optimized for providing instructions. |   3.83 GB |   8 GB | Yes |
| gpt4all-falcon-newbpe-q4_0.gguf | Falcon Newbpe Model | A model with a new byte-pair encoding (BPE) for improved performance. |   3.92 GB |   8 GB | Yes |
| nous-hermes-llama2-13b.Q4_0.gguf | Nous Hermes Llama2   13b Model  | A high-capacity model for advanced tasks. |   6.86 GB |   16 GB | Yes |
| gpt4all-13b-snoozy-q4_0.gguf | Gpt4all   13b Snoozy Model | A model with a focus on generating snoozy responses. |   6.86 GB |   16 GB | Yes |
| mpt-7b-chat-newbpe-q4_0.gguf | Mpt   7b Chat Newbpe Model  | A chat model with a new BPE for better performance. |   3.64 GB |   8 GB | Yes |
| orca-mini-3b-gguf2-q4_0.gguf | Orca Mini   3b Gguf2 Model | A lightweight model for basic tasks. |   1.84 GB |   4 GB | No |

Currently nearly all models require a GPU to be run. Not using a GPU and trying to run the model may lead to [crashes](https://github.com/nomic-ai/gpt4all/issues?q=is%3Aissue+is%3Aopen+crash) currently.

## Commands

The commands can be excuted using the `Ctrl+Shift+P` quickpick menu.

| Quickpick Name | Command | Description |
|---------------|---------|-------------|
| VSCodeMentor: Start Model | `vscodementor.startModel` | Start the model. This command initializes the model and prepares it for use. |
| VSCodeMentor: Disable Model | `vscodementor.disableModel` | Disable the model. This command stops the model from running and freeing up system resources. |
| VSCodeMentor: Change Model | `vscodementor.changeModel` | Change the active model. This command allows you to switch between different models that are available for use. |
| VSCodeMentor: Ask the Model | `vscodementor.askModel` | Ask the model a question. The model will respond with its best effort to answer the question or improve the code. |
| VSCodeMentor: Improve Code | `vscodementor.improveCode` | Request the model to improve the current code in the editor. The model will analyze the code and suggest improvements based on best practices and readability. |
| VSCodeMentor: Clear Chat History | `vscodementor.clearChatHistory` | Clear the chat history in the sidebar. This is useful for starting a new conversation with the model. |
| VSCodeMentor: Toggle GPU Support | `vscodementor.toggleGpuSupport` | Toggle GPU support for the model. This command allows you to enable or disable GPU acceleration for the model. |


## Model Configuration

The VSCodeMentor extension uses a configuration file named `modelConfiguration.json` which defines the system prompts of the model:

| Role | Content | Source |
|------|---------|--------|
| system | You are an AI assistant that is designed to improve code quality and readability of code. | |
| system | For each given code, check if the following things can be improved:<br>1. Write as few lines as possible.<br>2. Use appropriate naming conventions.<br>3. Segment blocks of code in the same section into paragraphs.<br>4. Use indentation to mark the beginning and end of control structures and specify the code between them.<br>5. Avoid lengthy functions.<br>6. Apply the Don't Repeat Yourself principle.<br>7. Avoid deep nesting.<br>8. Avoid long lines. | [Coding Standards and Best Practices to Follow](https://www.browserstack.com/guide/coding-standards-best-practices) (Summarized by ChatGPT) |
| system | Return an improved version of the code and explain the changes you made very briefly. | |
## License
GNU General Public License v3.0


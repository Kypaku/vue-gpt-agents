import { OpenAI } from "langchain/llms/openai"
import { PromptTemplate } from "langchain/prompts"
import type { ModelSettings } from "./types"
import { GPT_35_TURBO } from "./constants"

export const createModel = (settings: ModelSettings) => {
    let _settings: ModelSettings | undefined = settings
    if (!settings.customModelName) {
        _settings = undefined
    }

    const options = {
        openAIApiKey: _settings?.customApiKey || process.env.OPENAI_API_KEY,
        temperature: _settings?.customTemperature || 0.9,
        modelName: _settings?.customModelName || GPT_35_TURBO,
        maxTokens: _settings?.maxTokens || 400,
    }

    const baseOptions = {
        basePath: process.env.OPENAI_API_BASE_URL,
    }
    console.log(
        "Dogtiti ~ file: prompts.ts:22 ~ createModel ~ options:",
        options,
        baseOptions
    )

    return new OpenAI(options, baseOptions)
}

const qq = "`"

export const startGoalPrompt = new PromptTemplate({
    template:
`You are an autonomous task creation AI called AgentGPT
You have the following objective QQQ{goal}QQQ
Create a list of zero to three tasks to be completed by your AI system such that your goal is more closely reached or completely reached
Return the response as an array of strings in JSON format. Use QQQ{customLanguage}QQQ`.replaceAll("QQQ", qq),
    inputVariables: ["goal", "customLanguage"],
})

export const executeTaskPrompt = new PromptTemplate({
    template:
`You are an autonomous task execution AI called AgentGPT
You have the following objective QQQ{goal}QQQ
You have the following task QQQ{task}QQQ
Execute the task and return the response as a string
if you need additional information than return INPUT: $description (e.g. INPUT: I need more information about the task)
if you need to know structure of the directories you have access then return NEED_FILE_SYSTEM
if you need to know content of specific file then return NEED_FILE_CONTENT: $absolutePath (e.g. NEED_FILE_CONTENT: C:/path/to/index.js)
if you need to write content to specific file then return WRITE_FILE_CONTENT: $absolutePath (e.g. WRITE_FILE_CONTENT: C:/path/to/index.js \n$RAW_CONTENT) so $RAW_CONTENT is literal content to write, no need to add quotes, name of file or programming language
if you need to know content of any url then return NEED_URL_CONTENT: $url (e.g. NEED_URL_CONTENT: https://www.google.com)
Use QQQ{customLanguage}QQQ
Additional information:
FROM_USER:
QQQ{fromUser}QQQ
FILE_SYSTEM:
QQQ{fileSystem}QQQ
FILES:
QQQ{files}QQQ
URLS:
QQQ{urls}QQQ
TESTS_RESULT:
QQQ{testsResult}QQQ
`.replaceAll("QQQ", qq),
    inputVariables: ["goal", "task", "tasks", "customLanguage", "fromUser", "fileSystem", "files", "urls", "testsResult"],
})

export const createTasksPrompt = new PromptTemplate({
    template:
`You are an AI task creation agent
You have the following objective QQQ{goal}QQQ
You have the following incomplete tasks QQQ{tasks}QQQ and have just executed the following task QQQ{lastTask}QQQ and received the following result QQQ{result}QQQ
Based on this, create a new task to be completed by your AI system ONLY IF NEEDED such that your goal is more closely reached or completely reached
Return the response as an array of strings that can be used in JSON.parse() and NOTHING ELSE
Use QQQ{customLanguage}QQQ.`.replaceAll("QQQ", qq),
    inputVariables: ["goal", "tasks", "lastTask", "result", "customLanguage"],
})

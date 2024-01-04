import {
    createModel,
    startGoalPrompt,
    executeTaskPrompt,
    createTasksPrompt,
} from "../utils/prompts"
import type { ModelSettings } from "../utils/types"
import { LLMChain } from "langchain/chains"
import { extractTasks } from "../utils/helpers"
import { ITask } from "@/types"

async function startGoalAgent(modelSettings: ModelSettings, goal: string): Promise<ITask[]> {
    (window as any).numRequests++
    const completion = await new LLMChain({
        llm: createModel(modelSettings),
        prompt: startGoalPrompt,
    }).call({
        goal,
        customLanguage: modelSettings.customLanguage,
    })
    console.log("Completion:" + (completion.text as string))
    return extractTasks(completion.text as string, []).map((stringOne) => {
        return {
            content: stringOne,
            created: new Date().toISOString(),
        }
    })
}

export function renderFromUser(fromUser: any[]): string {
    if (!fromUser) return ""
    return `Additional information from the user:\n` + fromUser.filter((fromUserOne) => fromUserOne.answer)
        .map((fromUserOne) => {
            return 'The Question: ' + fromUserOne.ask + ":\nThe Answer: " + fromUserOne.answer
        }).join("\n")
}

export function renderFiles(files: any[]): string {
    if (!files) return ""
    return `Files:\n` + files.map((fileOne) => {
        return 'The Path: ' + fileOne.path + ":\nThe Content: " + fileOne.content
    }).join("\n")
}

export function renderUrls(urls: any[]): string {
    if (!urls) return ""
    return `Web resources:\n` + urls.map((urlOne) => {
        return 'The Url: ' + urlOne.url + ":\nThe Content: " + urlOne.content
    }).join("\n")
}

async function executeTaskAgent(
    modelSettings: ModelSettings,
    goal: string,
    task: ITask
) {
    (window as any).numRequests++
    const completion = await new LLMChain({
        llm: createModel(modelSettings),
        prompt: executeTaskPrompt,
    }).call({
        goal,
        task: task.content,
        customLanguage: modelSettings.customLanguage,
        // "fromUser", "fileSystem", "files", "urls"
        fromUser: renderFromUser(task.additionalInformation?.fromUser),
        fileSystem: task.additionalInformation?.fileSystem,
        files: renderFiles(task.additionalInformation?.files),
        urls: renderUrls(task.additionalInformation?.urls),

    })

    return completion.text as string
}

async function createTasksAgent(
    modelSettings: ModelSettings,
    goal: string,
    tasks: ITask[],
    lastTask: ITask,
    result: string,
    completedTasks: string[] | undefined
) {
    (window as any).numRequests++
    const completion = await new LLMChain({
        llm: createModel(modelSettings),
        prompt: createTasksPrompt,
    }).call({
        goal,
        tasks: tasks.map((task) => task.content),
        lastTask: lastTask.content,
        result,
        customLanguage: modelSettings.customLanguage,
    })

    return extractTasks(completion.text as string, completedTasks || []).map((stringOne) => {
        return {
            content: stringOne,
            created: new Date().toISOString(),
        }
    })
}

interface AgentService {
  startGoalAgent: (
    modelSettings: ModelSettings,
    goal: string
  ) => Promise<ITask[]>;
  executeTaskAgent: (
    modelSettings: ModelSettings,
    goal: string,
    task: ITask
  ) => Promise<string>;
  createTasksAgent: (
    modelSettings: ModelSettings,
    goal: string,
    tasks: ITask[],
    lastTask: ITask,
    result: string,
    completedTasks: string[] | undefined
  ) => Promise<ITask[]>;
}

const OpenAIAgentService: AgentService = {
    startGoalAgent: startGoalAgent,
    executeTaskAgent: executeTaskAgent,
    createTasksAgent: createTasksAgent,
}

export default OpenAIAgentService

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

async function executeTaskAgent(
    modelSettings: ModelSettings,
    goal: string,
    task: ITask
) {
    const completion = await new LLMChain({
        llm: createModel(modelSettings),
        prompt: executeTaskPrompt,
    }).call({
        goal,
        task: task.content,
        customLanguage: modelSettings.customLanguage,
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

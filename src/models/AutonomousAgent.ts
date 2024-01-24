import axios from "axios"
import type { ModelSettings, GuestSettings } from "../utils/types"
import AgentService, { executeTaskAgent } from "../services/agent-service"
import {
    AgentCommands,
    DEFAULT_MAX_LOOPS_CUSTOM_API_KEY,
    DEFAULT_MAX_LOOPS_FREE,
    DEFAULT_MAX_LOOPS_PAID,
} from "../utils/constants"
import type { Message } from "../types/agentTypes"
import { v4 } from "uuid"
import type { RequestBody } from "../utils/interfaces"
import { updateAgent } from "@/api/json"
import { IAgent, ITask } from "@/types"
import { getFilesInDirectory } from "@/helpers"
import { readFile, runAsync, runSync, writeFile } from "@/helpers/node_gm"
import { handleContentBeforeWrite } from "@/utils/contentHandlers"
import { fixPrompt } from "@/utils/prompts"

const TIMEOUT_LONG = 1000
const TIMOUT_SHORT = 800
class AutonomousAgent {
    name: string;
    goal: string;
    tasks: ITask[] = [];
    completedTasks: string[] = [];
    modelSettings: ModelSettings;
    isRunning = false;
    renderMessage: (message: Message) => void;
    shutdown: () => void;
    numLoops = 0;
    _id: string;
    id: string
    guestSettings: GuestSettings;
    agent: IAgent
    constructor(
        name: string,
        goal: string,
        renderMessage: (message: Message) => void,
        shutdown: () => void,
        modelSettings: ModelSettings,
        guestSettings: GuestSettings,
        agent: IAgent
    ) {
        this.name = name
        this.goal = goal
        this.renderMessage = renderMessage
        this.shutdown = shutdown
        this.modelSettings = modelSettings
        this._id = v4()
        this.guestSettings = guestSettings
        this.tasks = agent.tasks?.map((task) => task.content ? task : { content: task } as any) || []
        this.agent = agent
    }

    async run(agent: IAgent) {
        const { isGuestMode, isValidGuest } = this.guestSettings
        if (isGuestMode && !isValidGuest && !this.modelSettings.customApiKey) {
            this.sendErrorMessage("errors.invalid-guest-key")
            this.stopAgent()
            return
        }
        this.id = agent.id
        this.isRunning = true

        //   this.sendGoalMessage()

        // Initialize by getting tasks
        try {
            if (!this.tasks?.length) {
                this.tasks = await this.getInitialTasks()
                this.saveTasks()
            }
            for (const task of this.tasks) {
                await new Promise((resolve) => setTimeout(resolve, TIMOUT_SHORT))
                this.sendTaskMessage(task.content)
            }
        } catch (e) {
            console.log(e)
            this.sendErrorMessage(getMessageFromError(e))
            this.shutdown()
            return
        }

        await this.loop()
    }

    saveTasks() {
        updateAgent({ id: this.id, tasks: this.tasks })
    }

    async loop() {
        console.log(`Loop ${this.numLoops}`)
        console.log(this.tasks)

        if (!this.isRunning) {
            return
        }

        if (this.tasks.length === 0) {
            this.sendCompletedMessage()
            this.shutdown()
            return
        }

        this.numLoops += 1
        const maxLoops = this.maxLoops()
        if (this.numLoops > maxLoops) {
            this.sendLoopMessage()
            this.shutdown()
            return
        }

        // Wait before starting
        await new Promise((r) => setTimeout(r, TIMEOUT_LONG))

        if (this.agent.settings.sequentialMode) {
            const currentTask = this.tasks[0]
            this.sendThinkingMessage(currentTask.content)

            const result = await this.executeTask(currentTask as ITask)

            this.saveTasks()
            this.sendExecutionMessage(currentTask, result)
        } else {
            // Execute first task
            // Get and remove first task
            this.completedTasks.push(this.tasks[0]?.content || "")
            const currentTask = this.tasks.shift()

            this.sendThinkingMessage(currentTask.content)

            this.tasks.push(currentTask as ITask)

            const result = await this.executeTask(currentTask as ITask)
            this.saveTasks()
            this.sendExecutionMessage(currentTask, result)

            // Wait before adding tasks
            await new Promise((r) => setTimeout(r, TIMEOUT_LONG))
            this.sendThinkingMessage('Add new tasks')

            // Add new tasks
            if (this.tasks.filter((task) => !task.completed).length < 4) {
                try {
                    const newTasks = await this.getAdditionalTasks(
                currentTask as ITask,
                result
                    )
                    this.tasks = newTasks.concat(this.tasks)
                    this.saveTasks()
                    for (const task of newTasks) {
                        await new Promise((r) => setTimeout(r, TIMOUT_SHORT))
                        this.sendTaskMessage(task.content)
                    }

                    if (newTasks.length == 0) {
                        this.sendActionMessage("task-marked-as-complete", "Task marked as complete: " + currentTask)
                    }
                } catch (e) {
                    console.log(e)
                    this.sendErrorMessage(`errors.adding-additional-task`)
                    this.sendActionMessage("task-marked-as-complete", "Task marked as complete: " + currentTask)
                }
            }
        }

        await this.loop()
    }

    completeTask(currentTask: ITask, result: string) {
        if (currentTask) {
            currentTask.result = result
            currentTask.completed = new Date().toISOString()
            this.saveTasks()
        }
    }

    private maxLoops() {
        const defaultLoops = DEFAULT_MAX_LOOPS_FREE

        return this.modelSettings.customApiKey
            ? this.modelSettings.customMaxLoops || DEFAULT_MAX_LOOPS_CUSTOM_API_KEY
            : defaultLoops
    }

    async getInitialTasks(): Promise<ITask[]> {
        if (this.shouldRunClientSide()) {
            return await AgentService.startGoalAgent(this.modelSettings, this.goal)
        }

        const data = {
            modelSettings: this.modelSettings,
            goal: this.goal,
        }
        const res = await this.post(`/api/agent/start`, data)

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        return res.data.newTasks as ITask[]
    }

    async getAdditionalTasks(
        currentTask: ITask,
        result: string
    ): Promise<ITask[]> {
        if (this.shouldRunClientSide()) {
            return await AgentService.createTasksAgent(
                this.modelSettings,
                this.goal,
                this.tasks,
                currentTask,
                result,
                this.completedTasks
            )
        }

        const data = {
            modelSettings: this.modelSettings,
            goal: this.goal,
            tasks: this.tasks,
            lastTask: currentTask,
            result: result,
            completedTasks: this.completedTasks,
        }
        //   const res = await this.post(`/api/agent/create`, data)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        //   return res.data.newTasks as ITask[]
    }

    async handleTaskResult(task: ITask, taskResult: string) {
        !task.additionalInformation && (task.additionalInformation = {})
        if (taskResult.trim() === AgentCommands.NEED_FILE_SYSTEM && this.agent.settings.allowRead) {
            task.additionalInformation.fileSystem = this.getFileSystem()
        } else if (!taskResult.indexOf(AgentCommands.NEED_FILE_CONTENT) && this.agent.settings.allowRead) {
            const path = taskResult.split(AgentCommands.NEED_FILE_CONTENT + ':')[1]
            path && this.addFileToTask(path, task)
        } else if (!taskResult.indexOf(AgentCommands.WRITE_FILE_CONTENT)) {
            const path = taskResult.split(AgentCommands.WRITE_FILE_CONTENT + ':')[1]?.split('\n')[0]?.trim()
            const content = taskResult.split('\n').slice(1).join('\n')
            path && this.writeFile(path, content)
        } else if (!taskResult.indexOf(AgentCommands.NEED_URL_CONTENT)) {
            console.log("NEED_URL_CONTENT", taskResult)
            const url = taskResult.split(':').slice(1).join(':').trim()
            url && await this.addUrlToTask(url, task)
        } else if (!taskResult.indexOf(AgentCommands.INPUT + ':')) {
            !task.additionalInformation.fromUser && (task.additionalInformation.fromUser = [])
            task.additionalInformation.fromUser.push({ ask: taskResult.split(AgentCommands.INPUT + ':')[1] })
        } else if (Object.values(AgentCommands).some(el => taskResult.includes(el))) {
            !task.additionalInformation.fromUser && (task.additionalInformation.fromUser = [])
            task.additionalInformation.fromUser.push(fixPrompt(taskResult) as any)
        } else {
            // clear fromUser but only strings
            if (task.additionalInformation.fromUser) {
                task.additionalInformation.fromUser = task.additionalInformation.fromUser.filter((el) => typeof el === "string")
            }
            // save task
            this.completeTask(task as ITask, taskResult)
        }
    }

    async runTests(task: ITask) {
        let testsResult = ''
        if (this.agent.settings.tests) {
            for await (const test of this.agent.settings.tests) {
                const result = await runAsync(test)
                testsResult += result + '\n'
            }
        }
        console.log("runTests", { testsResult })
        this.sendMessage({ type: "tests", value: testsResult })
        task.additionalInformation.testsResult = testsResult
    }

    addFileToTask(path: string, task: ITask) {
        const content = this.getFileContent(path.trim())
        //   content && (task.additionalInformation.files = [{ path, content }])
        // Check file is already in task and if so, don't just update it
        this.agent.settings.dirs = this.agent.settings.dirs || []
        // Check if file is in the allowed directories (this.agent.settings.dirs) and if not, don't add it
        if (!this.agent.settings.dirs.some((dir) => path.startsWith(dir))) {
            !task.additionalInformation.files && (task.additionalInformation.files = [])
            const existingFile = task.additionalInformation.files?.find((file) => file.path === path)
            if (existingFile) {
                existingFile.content = content
                return
            } else {
                task.additionalInformation.files.push({ path, content })
            }
        } else {
            this.sendErrorMessage(`errors.file-not-in-allowed-dirs: ` + path)
        }
    }

    writeFile(path: string, content: string) {
        // check if the agent is allowed to write files
        this.sendMessage({ type: "system", value: `File write: the feature temporarily disabled` })
        // if (!this.agent.settings.allowWrite) {
        //     this.sendErrorMessage(`errors.agent-not-allowed-to-write`)
        //     return
        // }
        // // check if file is in the allowed directories (this.agent.settings.dirs) and if not, don't add it
        // if (!this.agent.settings.dirs.some((dir) => path.startsWith(dir))) {
        //     this.sendErrorMessage(`errors.file-not-in-allowed-dirs: ` + path)
        //     return
        // }
        // writeFile(path, handleContentBeforeWrite(path, content))
        // setTimeout(() => {
        //     this.sendMessage({ type: "system", value: `File written: ${path}` })
        // }, 0)
    }

    getFileContent(path: string): string {
        const content = readFile(path)
        return content
    }

    getFileSystem(): string[] {
        const fileSystem = this.agent.settings.dirs.map((dir) => getFilesInDirectory(dir, dir).map((dirOne) => dirOne.fullPath)).flat()
        return fileSystem
    }

    async addUrlToTask(url: string, task: ITask) {
        const content = await this.getUrlContent(url)
        //             const content = await this.getUrlContent(url)
        //  content && (task.additionalInformation.urls = [{ url, content }])
        // Check file is already in task and if so, don't just update it
        const existingUrl = task.additionalInformation.urls?.find((_url) => _url.url === url)
        if (existingUrl) {
            existingUrl.content = content
            return
        } else {
            !task.additionalInformation.urls && (task.additionalInformation.urls = [])
            task.additionalInformation.urls.push({ url, content })
        }
    }

    async getUrlContent(url: string): Promise<string> {
        const res = await axios.get(url)
        return res.data
    }

    async executeTask(task: ITask): Promise<string> {
        if (this.shouldRunClientSide()) {
            const taskResult = await executeTaskAgent(
                this.modelSettings,
                this.goal,
                task,
                this.agent.settings
            )
            this.handleTaskResult(task, taskResult)
            await this.runTests(task)
            return taskResult
        }

        const data = {
            modelSettings: this.modelSettings,
            goal: this.goal,
            task: task,
        }
        //   const res = await this.post("/api/agent/execute", data)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        //   return res.data.response as string
    }

    private async post(url: string, data: RequestBody) {
        try {
            return await axios.post(url, data)
        } catch (e) {
            this.shutdown()

            if (axios.isAxiosError(e) && e.response?.status === 429) {
                this.sendErrorMessage("rate-limit")
            }

            throw e
        }
    }

    private shouldRunClientSide() {
        return true //! !this.modelSettings.customApiKey
    }

    stopAgent() {
        this.sendManualShutdownMessage()
        this.isRunning = false
        this.shutdown()
        return
    }

    sendMessage(message: Message) {
        if (this.isRunning) {
            this.renderMessage(message)
        }
    }

    sendGoalMessage() {
        this.sendMessage({ type: "goal", value: this.goal })
    }

    sendLoopMessage() {
        this.sendMessage({
            type: "system",
            value:
        this.modelSettings.customApiKey !== ""
            ? "errors.loop-with-filled-customApiKey"
            : "errors.loop-with-empty-customApiKey",
        })
    }

    sendManualShutdownMessage() {
        this.sendMessage({
            type: "system",
            value: "manually-shutdown",
        })
    }

    sendCompletedMessage() {
        this.sendMessage({
            type: "system",
            value: "All tasks completed!",
        })
    }

    sendThinkingMessage(msg: string) {
        this.sendMessage({ type: "thinking", value: "Thinking... " + msg })
    }

    sendTaskMessage(task: string) {
        this.sendMessage({ type: "task", value: task })
    }

    sendErrorMessage(error: string) {
        this.sendMessage({ type: "system", value: error })
    }

    sendExecutionMessage(task: ITask, execution: string) {
        this.sendMessage({
            type: "action",
            info: `Executing "${task.content}"`,
            value: execution,
        })
    }

    sendActionMessage(message: string, value?: string) {
        this.sendMessage({
            type: "action",
            info: message,
            value: "",
        })
    }
}

const testConnection = async (modelSettings: ModelSettings) => {
    // A dummy connection to see if the key is valid
    // Can't use LangChain / OpenAI libraries to test because they have retries in place
    return await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
            model: modelSettings.customModelName,
            messages: [{ role: "user", content: "Say this is a test" }],
            max_tokens: 7,
            temperature: 0,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${modelSettings.customApiKey ?? ""}`,
            },
        }
    )
}

const getMessageFromError = (e: unknown) => {
    let message = "errors.accessing-apis"
    if (axios.isAxiosError(e)) {
        const axiosError = e
        if (axiosError.response?.status === 429) {
            message = "errors.accessing-using-apis"
        }
        if (axiosError.response?.status === 404) {
            message = "errors.accessing-gtp4"
        }
    } else {
        message = "errors.initial-tasks"
    }
    return message
}

export default AutonomousAgent

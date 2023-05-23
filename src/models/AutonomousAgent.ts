import axios from "axios"
import type { ModelSettings, GuestSettings } from "../utils/types"
import AgentService from "../services/agent-service"
import {
    DEFAULT_MAX_LOOPS_CUSTOM_API_KEY,
    DEFAULT_MAX_LOOPS_FREE,
    DEFAULT_MAX_LOOPS_PAID,
} from "../utils/constants"
import type { Message } from "../types/agentTypes"
import { v4 } from "uuid"
import type { RequestBody } from "../utils/interfaces"
import { updateAgent } from "@/api/json"
import { Agent, ITask } from "@/types"

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
  agent: Agent
  constructor(
      name: string,
      goal: string,
      renderMessage: (message: Message) => void,
      shutdown: () => void,
      modelSettings: ModelSettings,
      guestSettings: GuestSettings,
      agent: Agent
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

  async run(agent: Agent) {
      const { isGuestMode, isValidGuest } = this.guestSettings
      if (isGuestMode && !isValidGuest && !this.modelSettings.customApiKey) {
          this.sendErrorMessage("errors.invalid-guest-key")
          this.stopAgent()
          return
      }
      this.id = agent.id
      this.isRunning = true

      //   this.sendGoalMessage()
      this.sendThinkingMessage()

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

      // Execute first task
      // Get and remove first task
      this.completedTasks.push(this.tasks[0]?.content || "")
      const currentTask = this.tasks.shift()
      this.sendThinkingMessage()

      const result = await this.executeTask(currentTask as ITask)
      this.sendExecutionMessage(currentTask as string, result)

      // Wait before adding tasks
      await new Promise((r) => setTimeout(r, TIMEOUT_LONG))
      this.sendThinkingMessage()

      // Add new tasks
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

      await this.loop()
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
      if (taskResult === 'NEED_FILE_SYSTEM') {

      } else if (taskResult === 'NEED_FILE_CONTENT') {

      } else if (taskResult === 'NEED_URL_CONTENT') {

      } else if (!taskResult.indexOf('INPUT:')) {

      } else {
        //save task

      }
  }

  async executeTask(task: ITask): Promise<string> {
      if (this.shouldRunClientSide()) {
          const taskResult = await AgentService.executeTaskAgent(
              this.modelSettings,
              this.goal,
              task
          )
          this.handleTaskResult(task, taskResult)
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

  sendThinkingMessage() {
      this.sendMessage({ type: "thinking", value: "Thinking..." })
  }

  sendTaskMessage(task: string) {
      this.sendMessage({ type: "task", value: task })
  }

  sendErrorMessage(error: string) {
      this.sendMessage({ type: "system", value: error })
  }

  sendExecutionMessage(task: string, execution: string) {
      this.sendMessage({
          type: "action",
          info: `Executing "${task}"`,
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

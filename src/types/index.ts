import AutonomousAgent from "@/models/AutonomousAgent"
export interface ITask {
    content?: string
    created?: string
    completed?: string
    deleted?: string
    result: string
} 
export interface Agent {
    id: string
    name: string
    description?: string
    goal: string
    state: 'pending' | 'running' | 'stopped' | 'error'
    tasks?: ITask[]
    instance?: AutonomousAgent
}

export interface IMessage {
    id?: string
    message: string
    value?: string
    type?: 'system' | 'action' | 'thinking' | 'goal' | 'task'
    time: number
}



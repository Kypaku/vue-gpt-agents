
export interface Agent {
    id: string
    name: string
    description?: string
    goal: string
    state: 'pending' | 'running' | 'stopped' | 'error'
}

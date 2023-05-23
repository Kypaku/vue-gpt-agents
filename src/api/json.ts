
import { appendFileJSON, readFileJSON, readFileJSONLines, updateFileJSON, writeFile } from '@/helpers/node_gm'
import { Agent } from '@/types'
import * as path from 'path'

export const DB_DIR = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'db')
export const agentsFile = path.resolve(DB_DIR, 'agents.json')
export const agentsDir = path.resolve(DB_DIR, 'agents')

export function addAgent(agent: Agent): Agent {
    const newAgent = {...agent, id: Math.random() + '' + +new Date()}
    updateFileJSON(agentsFile, (agents: Agent[]) => {
        agents.push(newAgent)
        return agents
    })
    return newAgent
}

export function delAgent(id: string) {
    updateFileJSON(agentsFile, (agents: Agent[]) => {
        return agents.filter(agent => agent.id !== id)
    })
}

export function updateAgent(agent: Partial<Agent>) {
    updateFileJSON(agentsFile, (agents: Agent[]) => {
        return agents.map(a => a.id === agent.id ? {...a, ...agent} : a)
    })
}

export function getAgents(): Agent[] {
    return readFileJSON(agentsFile)
}

export function addMessage(agentId: string, messageObj: any) {
    appendFileJSON(path.resolve(agentsDir, agentId + '.jsonlines'), {time: +new Date(), ...messageObj})
}

export function getMessages(agentId: string): {message: string}[] {
    return readFileJSONLines(path.resolve(agentsDir, agentId + '.jsonlines'))?.filter(Boolean)
}


export function clearAgentMessages(agentId: string) {
    const filePath = path.resolve(agentsDir, agentId + '.jsonlines')
    writeFile(filePath, '')
}

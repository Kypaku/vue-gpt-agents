
import { appendFileJSON, existFile, readFileJSON, readFileJSONLines, updateFileJSON, writeFile } from '@/helpers/node_gm'
import { IAgent } from '@/types'
import * as path from 'path'

export const DB_DIR = path.resolve(__dirname, '..', '..', '..', '..', '..', '..', 'db')
export const agentsFile = path.resolve(DB_DIR, 'agents.json')
export const agentsDir = path.resolve(DB_DIR, 'agents')

export function addAgent(agent: IAgent): IAgent {
    const newAgent = {...agent, id: Math.random() + '' + +new Date()}
    updateFileJSON(agentsFile, (agents: IAgent[]) => {
        agents.push(newAgent)
        return agents
    })
    return newAgent
}

export function delAgent(id: string) {
    updateFileJSON(agentsFile, (agents: IAgent[]) => {
        return agents.filter(agent => agent.id !== id)
    })
}

export function updateAgent(agent: Partial<IAgent>) {
    updateFileJSON(agentsFile, (agents: IAgent[]) => {
        return agents.map(a => a.id === agent.id ? {...a, ...agent} : a)
    })
}

export function getAgents(): IAgent[] {
    if (!existFile(agentsFile)) {
        return []
    }
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

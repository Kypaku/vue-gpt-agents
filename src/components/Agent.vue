<template>
    <div class="agent">
        <div class="name">
            <InputText
                class="w-full"
                :label="'Name: '"
                :value="agent?.name"
                @update:value="val => updateAgent('name', val)"/>
        </div>
        <div class="goal mt-2">
            <InputTextarea
                class="w-full"
                :label="'Goal: '"
                :value="agent?.goal"
                @update:value="val => updateAgent('goal', val)"/>
        </div>
        <div class="panel flex-center-between w-full">
            <button class="py-1 px-4 bg-yellow-600 rounded mt-2" @click="agent.state !== 'running' ? run() : stop()" >{{ agent.state !== 'running' ? 'Run' : 'Stop' }}</button>
            <div class="flex-center" >
                <button class="py-1 px-4 bg-blue-900 rounded mr-2 ml-2" @click="clearMessages">Clear</button>
                <button @click="deleteAgent" class="rounded hover:bg-gray-600 bg-gray-700 text-white p-1" >
                    <TrashIcon />
                </button>
            </div>
        </div>
        <div class="tasks mt-4" v-if="tasks.length">
            <b class="text-lg">Tasks:</b>
            <Task @deleteTask="deleteTask(i)" :task="task" :index="i + 1" v-for="(task, i) in tasks" :key="i"/>
        </div>
        <div class="log mt-6">
            <b class="text-xl">Log <span class="text-base" >({{ messages?.length }})</span>: </b>
            <Message :message="item" v-for="(item, i) in [...messages].reverse()" :key="i"/>
        </div>
    </div>
</template>

<script lang='ts'>
    import { clearAgentMessages, addMessage, delAgent, getMessages, updateAgent } from './../api/json'
    import AutonomousAgent from '@/models/AutonomousAgent'
    import { Agent, IMessage } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import ls from 'local-storage'
    import InputText from './misc/InputText.vue'
    import InputTextarea from './misc/InputTextarea.vue'
    import Message from './Message.vue'
    import Task from './Task.vue'
    import TrashIcon from './misc/TrashIcon.vue'

    export default defineComponent({
        props: {

        },
        components: {
            TrashIcon,
            Task,
            Message,
            InputText,
            InputTextarea
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                agentInstance: null as AutonomousAgent,
                messages: [] as IMessage[],
            }
        },
        computed: {

            agent(): Agent | undefined {
                return this.$root.agents?.find(a => a.id === this.$route.params.id) ?? null
            },
            tasks(): any[] {
                return this.agentInstance?.tasks || []
            }
        },
        methods: {
            deleteTask(index: number) {
                this.agentInstance.tasks = this.agentInstance.tasks.filter((task, i) => i !== index);
                this.updateAgent('tasks', this.agentInstance.tasks)
            },
           
            clearMessages() {
                if (confirm("Are you sure you want to clear all messages?")) {
                    this.messages = []
                    // Clear messages from storage as well
                    clearAgentMessages(this.$route.params.id)
                }
            },

            deleteAgent() {
                if (confirm("Are you sure you want to delete the agent?")) {
                    delAgent(this.$route.params.id)
                    this.$root.agents = this.$root.agents.filter(a => a.id !== this.$route.params.id)
                    this.$router.push('/')
                }
            },

            updateAgent(field: string, val: any, noSave?: boolean) {
                this.$root.agents.forEach((a) => {
                    if (a.id === this.$route.params.id) {
                        a[field] = val
                        !noSave && updateAgent({ id: this.$route.params.id, [field]: val })
                    }
                    return a
                })
            },

            stop() {
                this.agentInstance.stopAgent()
                this.updateAgent('state', 'stopped', true)
            },

            async run() {
                this.agentInstance.run(this.agent)
                this.updateAgent('state', 'running', true)
                console.log("run", { "this.agentInstance": this.agentInstance })
            },

        },
        created() {
            if (this.agent) {
                this.agentInstance = new AutonomousAgent(
                    this.agent.name.trim(),
                    this.agent.goal.trim(),
                    (message) => {
                        addMessage(this.agent.id, { ...(message || {}) })
                        console.log(message)
                        this.messages.push({ time: +new Date(), ...(message || {}) })
                    },
                    console.log,
                    { customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo' } as any,
                    { customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo' } as any,
                    this.agent,
                )
                this.updateAgent('agentInstance', this.agentInstance, true)
                this.messages = getMessages(this.$route.params.id) || []
            }
        },
    })

    </script>

<style lang="scss" scoped>
    .log{
        max-height: 500px;
        overflow-y: scroll;
    }

</style>

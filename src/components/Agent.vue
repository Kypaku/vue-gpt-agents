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
        <div class="log">
            <b class="text-xl">Log:</b>
            <div class="message text-sm" v-for="(item, i) in messages" :key="i">
                {{ item }}
            </div>
        </div>
        <div class="panel">
            <button class="py-1 px-4 bg-yellow-600 rounded mt-2" @click="!agentInstance?.isRunning ? run() : stop()" >{{ !agentInstance?.isRunning ? 'Run' : 'Stop' }}</button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { addMessage, getMessages, updateAgent } from '@/api/json'
    import AutonomousAgent from '@/models/AutonomousAgent'
    import { Agent } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import ls from 'local-storage'
    import InputText from './misc/InputText.vue'
    import InputTextarea from './misc/InputTextarea.vue'

    export default defineComponent({
        props: {

        },
        components: {
            InputText,
            InputTextarea
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                agentInstance: null as AutonomousAgent
            }
        },
        computed: {
            messages(): string[] {
                return getMessages(this.$route.params.id)?.map((idOne) => idOne.message)
            },

            agent(): Agent | undefined {
                return this.$root.agents?.find(a => a.id === this.$route.params.id) ?? null
            },

        },
        methods: {
            updateAgent(field: string, val: any) {
                this.$root.agents.forEach((a) => {
                    if (a.id === this.$route.params.id) {
                        a[field] = val
                        updateAgent({id: this.$route.params.id, [field]: val })
                    }
                    return a
                })
            },

            stop() {
                this.agentInstance.stopAgent()
            },

            run() {
                this.agentInstance.run().then(console.log).catch(console.error)
                console.log("run", {"this.agentInstance": this.agentInstance})
            },

        },
        created() {
            if (this.agent) {
                this.agentInstance = new AutonomousAgent(
                    this.agent.name.trim(),
                    this.agent.goal.trim(),
                    (message) => { addMessage(this.agent.id, { ...(message || {}) }); console.log(message) },
                    console.log,
                    { customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo' } as any,
                    { customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo' } as any,
                )
            }
        },
    })

    </script>

<style lang="scss" scoped>

</style>

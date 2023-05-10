<template>
    <div class="agent">
        <div class="name">
            {{ agent?.name }}
        </div>
        <div class="goal">
            {{ agent?.goal }}
        </div>
        <div class="log">
            {{ messages }}
        </div>
        <div class="panel">
            <button @click="agent?.state !== 'running' ? run() : stop()" >{{ agent?.state !== 'running' ? 'Run' : 'Stop' }}</button>
        </div>
    </div>
</template>

<script lang='ts'>
    import { getMessages } from '@/api/json'
    import AutonomousAgent from '@/models/AutonomousAgent'
    import { Agent } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import ls from 'local-storage' 

    export default defineComponent({
        props: {

        },
        components: {

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

            agent(): Agent {
                return this.$root.agents.find(a => a.id === this.$route.params.id) ?? null
            },

        },
        methods: {
            stop() {

            },

            run() {
                this.agentInstance.run().then(console.log).catch(console.error)
            },

        },
        created() {
            if (this.agent) {
                this.agentInstance = new AutonomousAgent(
                    this.agent.name.trim(),
                    this.agent.goal.trim(),
                    (message) => { console.log(message) },
                    console.log,
                    {customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo'} as any,
                    {customApiKey: ls("apiKey"), customModelName: 'gpt-3.5-turbo'} as any,
                )
            }
        },
    })

    </script>

<style lang="scss" scoped>

</style>

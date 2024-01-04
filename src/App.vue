<template>
    <div class="app text-white">
        <TheHeader/>
        <router-view></router-view>
        <TheFooter/>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import TheHeader from '@/components/partials/TheHeader.vue'
    import TheFooter from '@/components/partials/TheFooter.vue'
    import { IAgent } from '@/types'
    import { getAgents } from './api/json'

    (window as any).numRequests = 0

    export default defineComponent({
        components: {
            TheFooter,
            TheHeader,

        },
        data() {
            return {
                agents: [] as IAgent[],
                numRequests: (window as any).numRequests,
            }
        },
        computed: {

        },
        methods: {
            updateAgents() {
                this.agents = getAgents()
            },
        },
        created() {
            this.updateAgents()
            this.agents.forEach(agent => {
                agent.state = 'pending'
            })
            setInterval(() => {
                this.numRequests = (window as any).numRequests
            }, 500)
        },
    })

  </script>

<style lang="scss" scoped>
    .app{
        height: 100vh;
    }


</style>

<style lang="scss">

.flex-center{
        display: flex;
        align-items: center;
    }
    .flex-center-between{
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
</style>

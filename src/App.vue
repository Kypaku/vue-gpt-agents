<template>
    <div class="app text-white">
        <TheHeader/>
        <router-view></router-view>
        <TheFooter/>
    </div>
</template>

<script lang='ts'>
    import {update} from 'lodash'
    import { defineComponent } from 'vue'
    import TheHeader from '@/components/partials/TheHeader.vue'
    import TheFooter from '@/components/partials/TheFooter.vue'
    import { Agent } from '@/types'
    import { getAgents } from './api/json'

    export default defineComponent({
        components: {
            TheFooter,
            TheHeader,

        },
        data() {
            return {
                agents: [] as Agent[]
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
        },
    })

  </script>

<style lang="scss" scoped>
    .app{
        height: 100vh;
    }

</style>

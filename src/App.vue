<template>
    <div class="app">
        <TheHeader/>
        <router-view></router-view>
        <TheFooter/>
    </div>
</template>

<script lang='ts'>
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

        },
        created() {
            this.agents = getAgents()
        },
    })

  </script>

<style lang="scss" scoped>

</style>

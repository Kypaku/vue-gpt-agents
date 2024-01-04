<template>
    <div class="main flex">
        <div class="right bg-gray-900 p-2 flex flex-col">
            <div class="count-requests">
                <span class="text-gray-400">Requests: </span>
                <span class="text-gray-400">{{ ($root as any).numRequests }}</span>
            </div>
            <Agents class="flex-grow" />
            <div class="bottom-panel">
                <router-link to="/settings">Settings</router-link>
            </div>
        </div>
        <div class="body flex-grow bg-gray-800 p-3">
            <InputApiKey/>
            <Agent :key="$route.params.id" v-if="$route.params.id"/>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import Agents from '@/components/Agents.vue'
    import Agent from '@/components/Agent.vue'
    import InputApiKey from '@/components/misc/InputApiKey.vue'

    export default defineComponent({
        components: {
            Agent,
            Agents,
            InputApiKey
        },
        data() {
            return {

            }
        },
        computed: {

        },
        methods: {

        },
    })

  </script>

<style lang="scss" scoped>
    .main{
        min-height: 100vh;
    }

    .right{
        width: 300px;
        min-width: 300px;
    }

</style>

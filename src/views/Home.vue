<template>
    <div class="main flex h-full">
        <div class="right bg-gray-900 p-2 flex flex-col">
            <Agents class="flex-grow" />
            <div class="bottom-panel">
                <router-link to="/settings">Settings</router-link>
            </div>
        </div>
        <div class="body flex-grow bg-gray-800 p-2">
            <InputApiKey/>
            <Agent/>
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
    .right{
        width: 300px;
    }

</style>

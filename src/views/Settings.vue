<template>
    <div class="page settings-page flex">
        <div class="right bg-gray-900 p-2 flex flex-col">
            <Agents/>
        </div>
        <div class="body flex-grow bg-gray-800 p-3">
            <div class="bottom-panel">
                <router-link to="/">← Home</router-link>
            </div>
            <Settings/>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import Settings from '@/components/partials/Settings.vue'
    import Agents from '@/components/Agents.vue'

    export default defineComponent({
        components: {
            Agents,
            Settings,

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
    .body{
        min-height: 100vh;
    }

</style>

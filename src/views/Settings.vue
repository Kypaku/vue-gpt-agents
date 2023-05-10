<template>
    <div class="page settings-page">
        <div class="right">
            <Agents/>
            <div class="bottom-panel">
                <router-link to="/">Home</router-link>
            </div>
        </div>
        <div class="body">
            <Settings/>
        </div>
    </div>
</template>

<script lang='ts'>
    import { defineComponent } from 'vue'
    import Settings from '@/components/partials/Settings.vue'

    export default defineComponent({
        components: {
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

</style>

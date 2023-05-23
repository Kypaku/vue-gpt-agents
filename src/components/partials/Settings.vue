<template>
    <div>
        <Accordeon class="settings bg-gray-100 rounded" title="Settings">
            <InputText
                class="mb-2 max-queries"
                :value="settings.maxQueries"
                :placeholder="settings.maxQueries || 5"
                label="Maximum number of requests simultaneously"
                @update:value="val => ls('settings', {...settings, maxQueries: +val})"  />
            <InputText
                class="mt-2"
                label="Model"
                :value="settings.model"
                :placeholder="settings.maxQueries || 'gpt-3.5-turbo-0301'"
                @update:value="val => ls('settings', {...settings, model: val} )" />
            <InputText
                class="mt-2"
                label="Temperature"
                :value="settings.temperature"
                :placeholder="settings.temperature || 0"
                @update:value="val => ls('settings', {...settings, temperature: +val} )" />
        </Accordeon>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import InputText from '@/components/misc/InputText.vue'
    // import Accordeon from './misc/Accordeon.vue'
    // import ToggleSwitch from './misc/ToggleSwitch.vue'
    import ls from 'local-storage'
    // import Warning from './misc/Warning.vue'
    import * as path from 'path'

    export default defineComponent({
        props: {

        },
        components: {
            InputText,
            // Accordeon,
            // ToggleSwitch,
            // Warning
        },
        data() {
            return {
                couldNotRunScript: '',
                isPythonInstalled: false,
                ls,
                settings: (ls as any)('settings') || {},
            }
        },
        computed: {

        },
        methods: {

        },

        created () {

        },
    })

    </script>

<style lang="scss" scoped>
    ::v-deep .settings{
        width: 100%;
    }

</style>

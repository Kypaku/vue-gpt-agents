<template>
    <div class="bg-gray-700 p-2 rounded" >
        <InputText
            class="mb-2 max-queries"
            :value="settings.maxLoops"
            :placeholder="settings.maxLoops || defaultSettings.maxLoops"
            label="Maximum loops"
            @update:value="val => setSettings('maxLoops', val)"  />
        <InputText
            class="mt-2"
            label="Model"
            :value="settings.model"
            :placeholder="settings.maxQueries || defaultSettings.model"
            :suggestions="modelsSuggestions"
            @update:value="val => setSettings('model', val)" />
        <InputText
            class="mt-2"
            label="Max Tokens for answers"
            :value="settings.maxTokens"
            :placeholder="settings.maxTokens || defaultSettings.maxTokens"
            @update:value="val => setSettings('maxTokens', val)" />
        <ToggleSwitch
            class="mt-2"
            label="Run tasks sequentially"
            :value="settings.sequentialMode"
            @update:value="val => setSettings('sequentialMode', val)" />
        <ToggleSwitch
            class="mt-2"
            label="Allow write access to files"
            :value="settings.allowWrite"
            @update:value="val => setSettings('allowWrite', val)" />
        <InputText
            class="mt-2"
            label="Temperature"
            :value="settings.temperature"
            :placeholder="settings.temperature || defaultSettings.temperature"
            @update:value="val => setSettings('temperature', val)" />
        <InputText
            class="mt-2"
            label="Language"
            :value="settings.language"
            :placeholder="settings.language || defaultSettings.language"
            @update:value="val => setSettings('language', val)" />
        <div class="dirs mt-4">
            <b class="" >Allowed directories:</b>
            <List :addPlaceholder="'/path/to/dir'" :items="settings?.dirs || defaultSettings?.dirs || []" @add="({name, pos}) => setSettings('dirs', [name, ...(settings?.dirs || defaultSettings?.dirs || [])])">
                <template #default="{item}">
                    {{ item  }}
                </template>
            </List>
        </div>
        <div class="tests">
            <b class="mt-4" >Tests:</b>
            <List :addPlaceholder="'npm run test'" :items="settings?.tests || defaultSettings?.tests || []" @add="({name, pos}) => setSettings('tests', [name, ...(settings?.tests || defaultSettings?.tests || [])])">
                <template #default="{item}">
                    {{ item  }}
                </template>
            </List>
        </div>
    </div>
</template>

<script lang='ts'>
    import { set } from 'lodash'
    import { defineComponent, PropType } from 'vue'
    import InputText from '@/components/misc/InputText.vue'
    import Accordeon from '../misc/Accordeon.vue'
    // import ToggleSwitch from './misc/ToggleSwitch.vue'
    import ls from 'local-storage'
    // import Warning from './misc/Warning.vue'
    import * as path from 'path'
    import { IAgentSettings } from '@/types'
    import List from '../misc/list/List.vue'
    import ToggleSwitch from '../misc/ToggleSwitch.vue'
    import { InputTextSuggestion } from '../misc/InputTextarea.vue'
    import SimpleGPT from 'gpt-simple-api-ts'

    const api = new SimpleGPT({ key: (ls as any)("apiKey") as string })

    export default defineComponent({
        props: {
            value: Object as PropType<IAgentSettings>,
        },
        components: {
            InputText,
            List,
            ToggleSwitch,
            Accordeon,
        },
        data() {
            return {
                models: [],
                couldNotRunScript: '',
                isPythonInstalled: false,
                ls,
                settings: this.value || (ls as any)('settings') || {},
                defaultSettings: this.value ? ((ls as any)('settings') || {}) : {
                    maxLoops: 5,
                    model: 'gpt-3.5-turbo-0301',
                    temperature: 0,
                    maxTokens: 400,
                },
            }
        },
        computed: {
            modelsSuggestions(): InputTextSuggestion[] {
                return this.models.map((model) => ({ name: model, value: model }))
            },

        },
        methods: {
            setSettings(key: string, val: any) {
                if (this.value) {
                    this.$emit('update:value', { ...this.settings, [key]: val })
                } else {
                    ls('settings', { ...this.settings, [key]: val })
                }
                this.settings = { ...this.settings, [key]: val }
            },
        },

        async created () {
            this.models = (await api.getModels()) || []
        },
    })

    </script>

<style lang="scss" scoped>
    ::v-deep .settings{
        width: 100%;
    }

</style>

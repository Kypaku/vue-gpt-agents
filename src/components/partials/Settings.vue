<template>
    <div class="bg-gray-700 p-2 rounded" >
        <Accordeon class="settings rounded" title="Settings">
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
                @update:value="val => setSettings('model', val)" />
            <InputText
                class="mt-2"
                label="Max Tokens for answers"
                :value="settings.maxTokens"
                :placeholder="settings.maxTokens || defaultSettings.maxTokens"
                @update:value="val => setSettings('maxTokens', val)" />
            <InputText
                class="mt-2"
                label="Temperature"
                :value="settings.temperature"
                :placeholder="settings.temperature || defaultSettings.temperature"
                @update:value="val => setSettings('temperature', val)" />
            <div class="dirs mt-4">
                <b class="" >Allowed directories:</b>
                <List :addPlaceholder="'/path/to/dir'" :items="settings?.dirs || defaultSettings?.dirs || []" @add="({name, pos}) => setSettings('dirs', [name, ...(settings?.dirs || defaultSettings?.dirs || [])])">
                    <template #default="{item}">
                        {{ item  }}
                    </template>
                </List>
            </div>
        </Accordeon>
    </div>
</template>

<script lang='ts'>
    import { set } from 'lodash'
    import { defineComponent, PropType } from 'vue'
    import InputText from '@/components/misc/InputText.vue'
    // import Accordeon from './misc/Accordeon.vue'
    // import ToggleSwitch from './misc/ToggleSwitch.vue'
    import ls from 'local-storage'
    // import Warning from './misc/Warning.vue'
    import * as path from 'path'
    import { IAgentSettings } from '@/types'
    import List from '../misc/list/List.vue'

    export default defineComponent({
        props: {
            value: Object as PropType<IAgentSettings>,
        },
        components: {
            InputText,
            List
        },
        data() {
            return {
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

        },
        methods: {
            setSettings(key: string, val: any) {
                if (this.value) {
                    this.$emit('update:value', { ...this.settings, [key]: val })
                } else {
                    ls('settings', { ...this.settings, [key]: val })
                }
            },
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

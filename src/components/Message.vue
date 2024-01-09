<template>
    <div class="message text-sm mt-2" >
        <div>
            <span class="text-xs text-gray-400"  v-if="message.time">{{ new Date(message.time).toLocaleString() }}</span>
        </div>
        <span v-if="message?.type === 'task'" class="mr-2 text-xs text-gray-300 rounded bg-gray-700 px-1">Add task</span>
        <template v-if="message?.type !== 'tests'">
            <template v-for="(segment, i) in segments">
                <div :key="i" class="code-block mb-1" v-if="segment.isCode">
                    <pre class="overflow-auto max-h-80"><code>{{ segment.text.trim()}}</code></pre>
                </div>
                <span :key="i + 'text'" v-else>{{ segment.text }}</span>
            </template>
        </template>
        <div class="tests" v-else>
            <Accordeon :title="'Tests'">
                <span class="pre-wrap" >
                    <pre class="overflow-auto max-h-80"><code>{{ message?.value?.trim()}}</code></pre>
                </span>
            </Accordeon>
        </div>
    </div>
</template>

<script lang='ts'>
    import { IMessage } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import Accordeon from './misc/Accordeon.vue'

    export default defineComponent({
        props: {
            message: Object as PropType<IMessage>,

        },
        components: {
            Accordeon,

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {

            }
        },
        computed: {
            segments(): {isCode?: boolean, text: string}[] {
                const divider = "`" + "`" + "`"
                return (this.message.message || this.message.value)?.split(divider)?.map((dividerOne, i) => ({ isCode: !!(i % 2), text: dividerOne.trim() })) || []
            },
        },
        methods: {

        },
    })

    </script>

<style lang="scss" scoped>
    .message{
        span {
            white-space: pre-wrap;
        }
    }

</style>

<template>
    <div class="task mt-2 text-sm" >
        <span class="mr-2" >{{ index }}.</span>{{ task.content }}
        <button @click="$emit('deleteTask')" class="ml-2 text-sm text-gray-600">
            <TrashIcon />
        </button>
    </div>
</template>

<script lang='ts'>
    import { ITask } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import TrashIcon from './misc/TrashIcon.vue'

    export default defineComponent({
        props: {
            task: Object as PropType<ITask>,
            index: Number,

        },
        components: {
            TrashIcon,

        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
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

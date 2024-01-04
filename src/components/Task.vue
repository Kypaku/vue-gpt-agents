<template>
    <div class="task mt-2 text-sm" >
        <span class="mr-2" >{{ index }}.</span>{{ task.content }}
        <button @click="$emit('editTask')" class="ml-2 text-sm text-gray-600">
            ✏️
        </button>
        <button @click="$emit('completeTask')" class="ml-2 text-sm text-gray-600">
            ✔️
        </button>
        <button @click="$emit('deleteTask')" class="ml-2 text-sm text-gray-600">
            <TrashIcon />
        </button>
        <div v-if="task.additionalInformation && task.additionalInformation.fromUser" class="mt-2">
            <label for="user-answer" class="block">Answer:</label>
            <!-- <input type="text" id="user-answer" v-model.lazy.trim="userAnswer" @change="updateUserAnswer" class="border rounded p-1 w-full"> -->
        </div>
        <Accordeon v-if="task.additionalInformation" class="additional-info mt-2 ml-4" title="Additional data">
            <!-- Display user questions and answers -->
            <div v-if="task.additionalInformation.fromUser" class="from-user">
                <h4>User Questions & Answers:</h4>
                <ul>
                    <li v-for="(item, idx) in task.additionalInformation.fromUser" :key="idx">
                        Q: {{ item.ask }} | A: {{ item.answer }}
                    </li>
                </ul>
            </div>

            <!-- Display files -->
            <div v-if="task.additionalInformation.files" class="files">
                <h4>Files:</h4>
                <ul>
                    <li v-for="(file, idx) in task.additionalInformation.files" :key="'file-' + idx">
                        Path: {{ file.path }} | Content: {{ file.content }}
                    </li>
                </ul>
            </div>

            <!-- Display URLs -->
            <div v-if="task.additionalInformation.urls" class="urls">
                <h4>URLs:</h4>
                <ul>
                    <li v-for="(url, idx) in task.additionalInformation.urls" :key="'url-' + idx">
                        URL: {{ url.url }} | Content: {{ url.content }}
                    </li>
                </ul>
            </div>

            <!-- Display file system -->
            <div v-if="task.additionalInformation.fileSystem" class="file-system">
                <h4>File System:</h4>
                <ul>
                    <li v-for="(item, idx) in task.additionalInformation.fileSystem" :key="'fs-' + idx">
                        {{ item }}
                    </li>
                </ul>
            </div>
        </Accordeon>
    </div>
</template>

<script lang='ts'>
    import { ITask } from '@/types'
    import { defineComponent, PropType } from 'vue'
    import TrashIcon from './misc/icons/TrashIcon.vue'
    import Accordeon from './misc/Accordeon.vue'

    export default defineComponent({
        props: {
            task: Object as PropType<ITask>,
            index: Number,

        },
        // setup(props) {
        //     const userAnswer = ref(props.task.additionalInformation?.fromUser?.[0]?.answer || '')

        //     function updateUserAnswer() {
        //         if (props.task.additionalInformation && props.task.additionalInformation.fromUser) {
        //             props.task.additionalInformation.fromUser[0].answer = userAnswer.value
        //         }
        //     }

        //     return {
        //         userAnswer,
        //         updateUserAnswer,
        //     }
        // },
        components: {
            TrashIcon,
            Accordeon,
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

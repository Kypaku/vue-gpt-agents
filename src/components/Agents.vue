<template>
    <div class="agents">
        <List :items="$root.agents">
            <template #default="{item}">
                <router-link :to="'/agents/' + item.id">{{ item.name }}</router-link>
            </template>
            <template #add>
                <InputText :label="'Name: '"  v-model:value="name"/>
                <InputTextarea :label="'Goal: '"  v-model:value="goal"/>
                <button @click="add" >Add</button>
            </template>
        </List>
    </div>
</template>

<script lang='ts'>
    import { defineComponent, PropType } from 'vue'
    import List from './misc/list/List.vue'
    import { addAgent, addMessage } from '@/api/json'
    import InputText from './misc/InputText.vue'
    import InputTextarea from './misc/InputTextarea.vue'
    import AutonomousAgent from '@/models/AutonomousAgent'

    export default defineComponent({
        props: {

        },
        components: {
            List,
            InputText,
            InputTextarea
        },
        // emits: ['update:modelValue'], this.$emit('update:modelValue', title)
        data() {
            return {
                goal: "",
                name: "",

            }
        },
        computed: {

        },
        methods: {
            add() {
                const agent = addAgent({ name: this.name, goal: this.goal, id: '-1', state: 'pending' })
                addMessage(agent.id, { message: 'Agent added' })
                // const agent = new AutonomousAgent(
                //     this.name.trim(),
                //     this.goal.trim(),
                //     handleAddMessage,
                //     () => setAgent(null),
                //     settings,
                //     { isValidGuest, isGuestMode },
                //     session ?? undefined
                // )
            },

        },
    })

    </script>

<style lang="scss" scoped>

</style>

<template>
    <div class="agents w-full">
        <List :items="$root.agents" @select="item => $router.push('/agents/' + item.id)">
            <template #default="{item}">
                <div @click="$router.push('/agents/' + item.id)" :class="{active: item.id === $route.params.id}">
                    <router-link :to="'/agents/' + item.id" class="mt-1">{{ item.name }}</router-link>
                </div>
            </template>
            <template #add>
                <div class="flex flex-col w-full mb-4">
                    <InputText class="w-full"  :label="'Name: '"  v-model:value="name"/>
                    <InputTextarea
                        class="w-full"
                        :label="'Goal: '"
                        v-model:value="goal"
                        v-if="name"/>
                    <button @click="add" class="py-1 px-4 bg-yellow-900 rounded mt-2" >Add</button>
                </div>
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
                addMessage(agent.id, { message: 'Agent added', date: +new Date() })
                this.$root.agents.push(agent.id)
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
    .active{
        color: #d2692d;
    font-weight: 700;
    }

</style>

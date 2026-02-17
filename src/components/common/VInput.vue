<script setup lang="ts">
withDefaults(defineProps<{
    id: string;
    label?: string | null;
    type?: string;
    name?: string;
    placeholder?: string;
    modelValue: string | number | Date | number;
}>(), {
    type: 'text',
    modelValue: '',
});

const emit = defineEmits(['update:modelValue'])
const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    if (!target) return;

    let value: string | number = target.value;

    if (target.type === 'number') {
        value = target.value === '' ? '' : Number(target.value);
    }

    emit('update:modelValue', target.value);
    
}
</script>

<template>
    <div class="flex flex-col gap-1 w-full">
        <label :for="id" v-if="label">{{ label }}</label>
        <input :id="id" :type="type" :name="name" 
            :value="modelValue" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            @input="handleInput"
            :placeholder="placeholder"
        />
    </div>
</template>
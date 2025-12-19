<template>
    <div class="color-card"
         :style="{ backgroundColor: color.hex }"
         :class="{ 'is-locked': color.locked }">
        <div class="color-actions">
            <button class="lock-btn" @click.stop="$emit('toggle-lock')">
                <span v-if="color.locked">🔒</span>
                <span v-else>🔓</span>
            </button>

            <button class="copy-btn" @click="$emit('copy', color.hex)">
                {{ color.hex.toUpperCase() }}
            </button>

            <div class="contrast-badge" :style="{ color: getContrastColor(color.hex) }">
                Text
            </div>
        </div>
    </div>
</template>

<script setup>
// Определяем входные параметры (props)
const props = defineProps({
  color: {
    type: Object,
    required: true
  }
})

// Определяем события (emits)
defineEmits(['toggle-lock', 'copy'])

// Простая функция для определения цвета текста (черный или белый)
const getContrastColor = (hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
}
</script>

<style scoped>
    /* Стили из твоего App.vue для .color-card */
    .color-card {
        flex: 1;
        height: 400px;
        display: flex;
        align-items: flex-end;
        padding: 20px;
        transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        position: relative;
    }
    /* ... остальные стили карточки ... */
</style>
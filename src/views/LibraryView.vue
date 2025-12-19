<template>
    <div class="library-view glass-panel">
        <h2>Моя Коллекция</h2>

        <div v-if="savedPalettes.length === 0" class="empty-state">
            <p>Пока нет сохраненных палитр. Создайте шедевр в Генераторе!</p>
        </div>

        <div class="palette-grid">
            <div v-for="p in savedPalettes" :key="p.id" class="saved-item">
                <div class="saved-header">
                    <h3>{{ p.name }}</h3>
                    <button @click="deletePalette(p.id)" class="del-btn">×</button>
                </div>
                <div class="mini-preview">
                    <div v-for="c in p.colors" :key="c.id"
                         class="mini-color" :style="{background: c.hex}"></div>
                </div>
                <div class="saved-footer">
                    <small>{{ p.date }}</small>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const savedPalettes = ref([]);

onMounted(() => {
    loadPalettes();
});

const loadPalettes = () => {
    savedPalettes.value = JSON.parse(localStorage.getItem('myPalettes') || '[]');
}

const deletePalette = (id) => {
    if(confirm('Удалить эту палитру?')) {
        const updated = savedPalettes.value.filter(p => p.id !== id);
        localStorage.setItem('myPalettes', JSON.stringify(updated));
        savedPalettes.value = updated;
    }
}
</script>

<style scoped>
    .library-view {
        min-height: 50vh;
        padding: 2rem;
        width: 100%;
    }

    .palette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }

    .saved-item {
        background: white;
        padding: 15px;
        border-radius: 12px;
        border: 1px solid #eee;
        transition: transform 0.2s;
    }

        .saved-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

    .saved-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }

    .mini-preview {
        display: flex;
        height: 50px;
        border-radius: 8px;
        overflow: hidden;
    }

    .mini-color {
        flex: 1;
    }

    .del-btn {
        background: #ffaaaa;
        border: none;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        cursor: pointer;
        color: white;
    }
</style>
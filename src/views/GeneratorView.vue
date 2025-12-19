<template>
    <div class="generator-view">

        <section class="controls-section glass-panel">
            <div class="control-row">
                <div class="control-group">
                    <label>База:</label>
                    <input type="color" v-model="baseColor" class="color-picker-input">
                </div>

                <div class="control-group">
                    <label>Режим:</label>
                    <select v-model="harmonyMode" class="art-select">
                        <option value="random">Случайный</option>
                        <option value="analogous">Аналогичная</option>
                        <option value="monochromatic">Монохром</option>
                        <option value="triad">Триада</option>
                        <option value="complementary">Комплемент</option>
                    </select>
                </div>

                <div class="control-group">
                    <button v-for="num in [3, 5, 7]" :key="num"
                            @click="count = num" :class="{active: count === num}"
                            class="art-btn small">
                        {{ num }}
                    </button>
                </div>
            </div>

            <button @click="generate" class="art-btn generate-btn">
                <span>Генерировать</span>
                <span class="icon">↺</span>
            </button>
        </section>

        <section class="palette-strip">
            <div v-for="(color, index) in palette" :key="color.id"
                 class="color-card" :style="{ backgroundColor: color.hex }">

                <div class="color-info-overlay">
                    <span class="color-name">{{ color.name }}</span>
                    <span class="color-val">{{ color.hex }}</span>

                    <span class="wcag-badge" :class="getWcagClass(color.hex)">
                        {{ getWcagRating(color.hex) }}
                    </span>
                </div>

                <div class="color-actions">
                    <button class="lock-btn" @click.stop="toggleLock(index)">
                        {{ color.locked ? '🔒' : '🔓' }}
                    </button>
                    <button class="copy-btn" @click="copyColor(color.hex)">COPY</button>
                </div>
            </div>
        </section>

        <section class="actions-panel glass-panel">
            <div class="save-group">
                <input v-model="paletteName" placeholder="Название палитры" class="art-input">
                <button @click="savePalette" class="art-btn">Сохранить в библиотеку</button>
            </div>

            <div class="export-group">
                <button @click="showExport = !showExport" class="art-btn outline">Экспорт CSS</button>
            </div>
        </section>

        <div v-if="showExport" class="export-modal glass-panel">
            <h3>CSS Variables</h3>
            <textarea readonly :value="cssOutput" class="code-area"></textarea>
            <h3>SCSS</h3>
            <textarea readonly :value="scssOutput" class="code-area"></textarea>
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { generateHarmony, getContrastRatio, fetchColorName } from '../utils/colorUtils'

// State
const palette = ref([])
const baseColor = ref('#667eea')
const harmonyMode = ref('random')
const count = ref(5)
const paletteName = ref('')
const showExport = ref(false)

// ГЕНЕРАЦИЯ
const generate = async () => {
    // 1. Генерируем цвета математически
    const newColors = generateHarmony(baseColor.value, harmonyMode.value, count.value);

    // 2. Слияние с заблокированными
    const finalPalette = [];
    for(let i=0; i < count.value; i++) {
        if(palette.value[i] && palette.value[i].locked) {
            finalPalette.push(palette.value[i]);
        } else {
            finalPalette.push(newColors[i] || newColors[newColors.length-1]);
        }
    }
    palette.value = finalPalette;

    // 3. API запрос имен (асинхронно для каждого незаблокированного цвета)
    palette.value.forEach(async (c) => {
        if(c.name === 'Loading...') {
            c.name = await fetchColorName(c.hex);
        }
    });
}

// Блокировка
const toggleLock = (idx) => {
    if(palette.value[idx]) palette.value[idx].locked = !palette.value[idx].locked;
}

// Копирование
const copyColor = (hex) => {
    navigator.clipboard.writeText(hex);
    alert('Скопировано: ' + hex); // Можно заменить на красивый тост
}

// WCAG Анализ
const getWcagRating = (hex) => {
    const ratio = getContrastRatio(hex, '#FFFFFF'); // Сравниваем с белым фоном
    if(ratio >= 7) return 'AAA';
    if(ratio >= 4.5) return 'AA';
    return 'Fail';
}
const getWcagClass = (hex) => {
    const r = getContrastRatio(hex, '#FFFFFF');
    return r < 4.5 ? 'bad-contrast' : 'good-contrast';
}

// Сохранение
const savePalette = () => {
    if(!paletteName.value) { alert('Введите название!'); return; }

    const saved = JSON.parse(localStorage.getItem('myPalettes') || '[]');
    saved.push({
        id: Date.now(),
        name: paletteName.value,
        colors: palette.value,
        date: new Date().toLocaleDateString()
    });
    localStorage.setItem('myPalettes', JSON.stringify(saved));
    alert('Палитра сохранена!');
    paletteName.value = '';
}

// Экспорт
const cssOutput = computed(() => {
    return `:root {\n` +
    palette.value.map((c, i) => `  --color-${i+1}: ${c.hex};`).join('\n') +
    `\n}`;
});

const scssOutput = computed(() => {
    return palette.value.map((c, i) => `$color-${i+1}: ${c.hex};`).join('\n');
});

onMounted(() => {
    generate();
});
</script>

<style scoped>
    /* Дополнительные стили для генератора */
    .generator-view {
        display: flex;
        flex-direction: column;
        gap: 2rem;
        width: 100%;
    }

    .control-row {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        align-items: center;
    }

    .color-picker-input {
        border: none;
        width: 40px;
        height: 40px;
        cursor: pointer;
        background: none;
    }

    .art-select {
        padding: 8px;
        border-radius: 8px;
        border: 1px solid #333;
        font-family: 'Space Mono';
    }

    .art-input {
        padding: 10px;
        border-radius: 8px;
        border: 1px solid #ccc;
        font-family: 'Space Mono';
    }

    .color-card {
        height: 300px;
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 20px;
        transition: flex 0.3s;
    }

        .color-card:hover {
            flex-grow: 1.5;
        }

    .color-info-overlay {
        background: rgba(255,255,255,0.9);
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 10px;
        display: flex;
        flex-direction: column;
        gap: 5px;
        text-align: center;
    }

    .wcag-badge {
        font-weight: bold;
        padding: 2px 5px;
        border-radius: 4px;
        font-size: 0.8em;
    }

    .good-contrast {
        color: green;
        background: #ccffcc;
    }

    .bad-contrast {
        color: red;
        background: #ffcccc;
    }

    .code-area {
        width: 100%;
        height: 100px;
        margin-top: 10px;
        font-family: monospace;
        padding: 10px;
        border-radius: 5px;
        border: 1px solid #ccc;
    }
</style>
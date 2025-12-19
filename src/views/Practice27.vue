<template>
    <div class="art-container">
        <div class="shape shape-circle"></div>
        <div class="shape shape-rect"></div>
        <div class="shape shape-blob"></div>

        <main class="app-content">
            <header class="app-header">
                <div class="header-decoration"></div>
                <h1>Color<br>Abstract<br>Generator</h1>
                <p>Практика №27: Composition API</p>
            </header>

            <section class="controls-section glass-panel">
                <div class="control-group">
                    <label>Количество:</label>
                    <div class="radio-group">
                        <button v-for="num in [3, 5, 7]"
                                :key="num"
                                @click="updateCount(num)"
                                :class="{ active: paletteSize === num }"
                                class="art-btn small">
                            {{ num }}
                        </button>
                    </div>
                </div>

                <div class="control-group">
                    <label>Формат:</label>
                    <button @click="toggleFormat" class="art-btn small">
                        {{ colorFormat.toUpperCase() }}
                    </button>
                </div>

                <button @click="generatePalette" class="art-btn generate-btn">
                    <span>Случайная палитра</span>
                    <span class="icon">↺</span>
                </button>
            </section>

            <section class="palette-strip">
                <div v-for="(color, index) in palette"
                     :key="color.id"
                     class="color-card"
                     :style="{ backgroundColor: color.hex }"
                     :class="{ 'is-locked': color.locked }">
                    <div class="color-actions">
                        <button class="lock-btn"
                                @click.stop="toggleLock(index)"
                                :title="color.locked ? 'Разблокировать' : 'Закрепить'">
                            <span v-if="color.locked">🔒</span>
                            <span v-else>🔓</span>
                        </button>

                        <button class="copy-btn"
                                @click="copyToClipboard(color.hex)">
                            {{ formatColor(color.hex) }}
                            <span class="copy-hint">COPY</span>
                        </button>
                    </div>
                </div>
            </section>

            <section class="preview-section glass-panel">
                <div class="preview-header">
                    <h2>UI Preview</h2>
                    <button @click="isDarkPreview = !isDarkPreview" class="theme-toggle">
                        {{ isDarkPreview ? 'Light Mode' : 'Dark Mode' }}
                    </button>
                </div>

                <div class="mockup-container"
                     :style="{
            backgroundColor: isDarkPreview ? '#1a1a1a' : '#f4f4f4',
            color: isDarkPreview ? '#fff' : '#333'
          }">
                    <div class="mockup-card" :style="{ borderColor: palette[0]?.hex }">
                        <h3 :style="{ color: palette[1]?.hex || palette[0]?.hex }">Заголовок карточки</h3>
                        <p>Это пример того, как цвета выглядят в реальном интерфейсе.</p>
                        <button class="mockup-btn"
                                :style="{ backgroundColor: palette[palette.length - 1]?.hex, color: getContrastColor(palette[palette.length - 1]?.hex) }">
                            Действие
                        </button>
                    </div>

                    <div class="mockup-tags">
                        <span v-for="c in palette.slice(0, 3)"
                              :key="c.id"
                              class="mockup-tag"
                              :style="{ backgroundColor: c.hex + '40', color: c.hex, borderColor: c.hex }">
                            #Tag
                        </span>
                    </div>
                </div>
            </section>
        </main>

        <transition name="fade">
            <div v-if="notification" class="toast-notification">
                {{ notification }}
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch } from 'vue'

    // --- Состояние (State) ---

    // Хранит массив объектов цветов: { id, hex, locked }
    const palette = ref([])
    const paletteSize = ref(5) // По умолчанию 5 цветов
    const colorFormat = ref('hex') // 'hex' или 'rgb'
    const notification = ref(null)
    const isDarkPreview = ref(false)

    // --- Логика генерации цветов (Гармоничные цвета) ---

    // Простая функция для генерации случайного HEX
    const getRandomHex = () => {
        const letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    // Генерация палитры
    const generatePalette = () => {
        const newPalette = []

        // Если палитры нет (первый запуск), создаем пустой массив нужной длины
        const currentLength = palette.value.length

        for (let i = 0; i < paletteSize.value; i++) {
            // Проверяем, есть ли старый цвет на этой позиции и заблокирован ли он
            if (i < currentLength && palette.value[i].locked) {
                newPalette.push(palette.value[i])
            } else {
                // Генерируем новый цвет
                newPalette.push({
                    id: Date.now() + i, // Уникальный ключ
                    hex: getRandomHex(),
                    locked: false
                })
            }
        }

        palette.value = newPalette
    }

    // Изменение количества цветов
    const updateCount = (num) => {
        paletteSize.value = num
        generatePalette() // Перегенерировать, сохраняя заблокированные
    }

    // --- Управление цветами ---

    const toggleLock = (index) => {
        if (palette.value[index]) {
            palette.value[index].locked = !palette.value[index].locked
        }
    }

    const copyToClipboard = (hex) => {
        const textToCopy = formatColor(hex)

        navigator.clipboard.writeText(textToCopy).then(() => {
            showNotification(`Скопировано: ${textToCopy}`) //
        }).catch(err => {
            console.error('Ошибка копирования', err)
        })
    }

    const showNotification = (msg) => {
        notification.value = msg
        setTimeout(() => {
            notification.value = null
        }, 2000)
    }

    // --- Форматирование и Утилиты ---

    // Переключение формата HEX <-> RGB
    const toggleFormat = () => {
        colorFormat.value = colorFormat.value === 'hex' ? 'rgb' : 'hex'
    }

    // Конвертация HEX в RGB для отображения
    const hexToRgb = (hex) => {
        let r = 0, g = 0, b = 0
        if (hex.length === 4) {
            r = parseInt("0x" + hex[1] + hex[1])
            g = parseInt("0x" + hex[2] + hex[2])
            b = parseInt("0x" + hex[3] + hex[3])
        } else if (hex.length === 7) {
            r = parseInt("0x" + hex[1] + hex[2])
            g = parseInt("0x" + hex[3] + hex[4])
            b = parseInt("0x" + hex[5] + hex[6])
        }
        return `rgb(${r}, ${g}, ${b})`
    }

    const formatColor = (hex) => {
        if (colorFormat.value === 'rgb') {
            return hexToRgb(hex)
        }
        return hex
    }

    // Определение контрастного цвета текста (черный или белый) для кнопок превью
    const getContrastColor = (hex) => {
        if (!hex) return '#000'
        const r = parseInt(hex.substr(1, 2), 16)
        const g = parseInt(hex.substr(3, 2), 16)
        const b = parseInt(hex.substr(5, 2), 16)
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000
        return (yiq >= 128) ? '#000000' : '#ffffff'
    }

    // --- Сохранение (LocalStorage) ---

    // Сохраняем состояние при любых изменениях
    watch([palette, paletteSize, colorFormat], () => {
        localStorage.setItem('palette-app-data', JSON.stringify({
            palette: palette.value,
            size: paletteSize.value,
            format: colorFormat.value
        }))
    }, { deep: true })

    // Загрузка при старте
    onMounted(() => {
        const savedData = localStorage.getItem('palette-app-data')
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData)
                paletteSize.value = parsed.size || 5
                colorFormat.value = parsed.format || 'hex'
                // Восстанавливаем палитру, если она соответствует размеру, иначе генерируем новую
                if (parsed.palette && parsed.palette.length === paletteSize.value) {
                    palette.value = parsed.palette
                } else {
                    generatePalette()
                }
            } catch (e) {
                generatePalette()
            }
        } else {
            generatePalette()
        }
    })

</script>


<style scoped>
    /* --- Глобальный стиль: Абстрактное искусство --- */
    @import url('https://fonts.googleapis.com/css2?family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Syne:wght@400;700;800&display=swap');

    .art-container {
        font-family: 'Syne', sans-serif; /* Необычный геометрический шрифт */
        min-height: 100vh;
        background-color: #F9F7F2; /* Светлый, бумажный цвет фона */
        color: #2C2C2C;
        position: relative;
        padding: 2rem;
        display: flex;
        justify-content: center;
    }

    /* --- Декоративные фигуры --- */
    .shape {
        position: absolute;
        z-index: 0;
        opacity: 0.6;
        pointer-events: none;
    }

    .shape-circle {
        width: 400px;
        height: 400px;
        background-color: #E0DDCF;
        border-radius: 50%;
        top: 50px;
        right: 50px;
    }

    .shape-rect {
        width: 400px;
        height: 800px;
        background-color: #D4D8D2;
        top: 20%;
        left: 40px;
        transform: rotate(15deg);
    }

    .shape-blob {
        width: 550px;
        height: 500px;
        background-color: #E6E2D6;
        bottom: 1px;
        right: 1px;
        border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
    }

    /* --- Основной контент --- */
    .app-content {
        position: relative;
        z-index: 1;
        width: 100%;
        max-width: 1000px;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    /* --- Хедер --- */
    .app-header h1 {
        font-size: 3.5rem;
        line-height: 0.9;
        font-weight: 800;
        margin-bottom: 0.5rem;
        letter-spacing: -2px;
    }

    .app-header p {
        font-family: 'Space Mono', monospace;
        color: #666;
        margin-left: 5px;
    }

    /* --- Кнопки и контроллеры (Glassmorphism + Art) --- */
    .glass-panel {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .controls-section {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 1rem;
    }

    .control-group {
        display: flex;
        align-items: center;
        gap: 1rem;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
    }

    .art-btn {
        background: transparent;
        border: 1px solid #2C2C2C;
        padding: 0.5rem 1rem;
        cursor: pointer;
        font-family: 'Space Mono', monospace;
        transition: all 0.3s ease;
        border-radius: 50px; /* Овальные кнопки */
    }

        .art-btn:hover {
            background: #2C2C2C;
            color: #fff;
        }

        .art-btn.active {
            background: #2C2C2C;
            color: #fff;
        }

    .generate-btn {
        background: #2C2C2C;
        color: #fff;
        border: none;
        padding: 0.8rem 1.5rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 8px 24px 8px 24px; /* Асимметричная форма */
    }

        .generate-btn:hover {
            transform: translateY(-2px) rotate(-1deg);
            box-shadow: 5px 5px 0px rgba(0,0,0,0.1);
        }

    /* --- Полоса палитры --- */
    .palette-strip {
        display: flex;
        height: 250px;
        width: 100%;
        gap: 0;
        border-radius: 30px;
        overflow: hidden;
        box-shadow: 0 20px 40px -10px rgba(0,0,0,0.1);
    }

    .color-card {
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* Контент внизу */
        align-items: center;
        padding-bottom: 2rem;
        transition: all 0.4s ease;
        position: relative;
    }

        /* Эффект при наведении на карточку цвета */
        .color-card:hover {
            flex: 1.5; /* Увеличивается при наведении */
        }

    .color-actions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        opacity: 0;
        transform: translateY(20px);
        transition: all 0.3s ease;
    }

    .color-card:hover .color-actions,
    .color-card.is-locked .color-actions {
        opacity: 1;
        transform: translateY(0);
    }

    .copy-btn {
        background: rgba(255,255,255,0.9);
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        cursor: pointer;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .lock-btn {
        background: none;
        border: none;
        font-size: 1.2rem;
        cursor: pointer;
        background: rgba(255,255,255,0.5);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .copy-hint {
        display: block;
        font-size: 0.6rem;
        text-align: center;
        opacity: 0.5;
        margin-top: 2px;
    }

    /* --- Превью UI (Mockup) --- */
    .preview-section {
        margin-top: 2rem;
    }

    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
    }

    .theme-toggle {
        background: none;
        border: 1px solid currentColor;
        padding: 5px 10px;
        cursor: pointer;
        border-radius: 4px;
    }

    .mockup-container {
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid rgba(0,0,0,0.05);
        transition: background-color 0.3s ease;
    }

    .mockup-card {
        border: 2px solid; /* Цвет границы задается динамически */
        padding: 1.5rem;
        border-radius: 8px;
        max-width: 400px;
        margin-bottom: 1rem;
    }

    .mockup-btn {
        border: none;
        padding: 0.8rem 1.5rem;
        border-radius: 4px;
        font-weight: bold;
        cursor: default;
        margin-top: 1rem;
    }

    .mockup-tags {
        display: flex;
        gap: 0.5rem;
    }

    .mockup-tag {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
        border: 1px solid;
        font-family: 'Space Mono', monospace;
    }

    /* --- Toast Notification --- */
    .toast-notification {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background-color: #2C2C2C;
        color: #fff;
        padding: 12px 24px;
        border-radius: 50px;
        font-family: 'Space Mono', monospace;
        z-index: 100;
        box-shadow: 0 10px 20px rgba(0,0,0,0.2);
    }

    /* Анимация уведомления */
    .fade-enter-active,
    .fade-leave-active {
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .fade-enter-from,
    .fade-leave-to {
        opacity: 0;
        transform: translate(-50%, 20px);
    }
</style>
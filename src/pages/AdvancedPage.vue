<template>
    <div class="advanced-container">
        <header class="app-header">
            <div class="header-decoration"></div>
            <h1>Advanced<br>Color<br>Generator</h1>
        </header>

        <section class="controls-section glass-panel">
            <!-- Выбор базового цвета -->
            <div class="control-group">
                <label>Базовый цвет:</label>
                <div class="color-picker-container">
                    <input type="color" v-model="baseColor" class="color-picker">
                    <span class="color-hex">{{ baseColor }}</span>
                </div>
            </div>

            <!-- Выбор типа палитры -->
            <div class="control-group">
                <label>Тип палитры:</label>
                <div class="palette-types">
                    <button v-for="type in paletteTypes"
                            :key="type.id"
                            @click="selectPaletteType(type.id)"
                            :class="{ active: selectedType === type.id }"
                            class="art-btn small">
                        {{ type.name }}
                    </button>
                </div>
            </div>

            <!-- Настроение -->
            <div class="control-group" v-if="selectedType === 'mood'">
                <label>Настроение:</label>
                <div class="mood-selector">
                    <button v-for="mood in moods"
                            :key="mood.id"
                            @click="selectMood(mood.id)"
                            :class="{ active: selectedMood === mood.id }"
                            class="mood-btn">
                        <span class="mood-icon">{{ mood.icon }}</span>
                        <span class="mood-name">{{ mood.name }}</span>
                    </button>
                </div>
            </div>

            <!-- Количество цветов -->
            <div class="control-group">
                <label>Количество:</label>
                <div class="count-slider">
                    <input type="range"
                           v-model="paletteSize"
                           min="3"
                           max="12"
                           step="1"
                           class="slider">
                    <span class="count-value">{{ paletteSize }}</span>
                </div>
            </div>

            <!-- Кнопка генерации -->
            <button @click="generateAdvancedPalette" class="art-btn generate-btn">
                <span>Сгенерировать палитру</span>
                <span class="icon">🎨</span>
            </button>
        </section>

        <!-- Палитра -->
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
                        {{ color.hex }}
                        <span class="copy-hint">COPY</span>
                    </button>
                </div>
            </div>
        </section>

        <!-- Инструменты анализа доступности -->
        <section class="analysis-section glass-panel">
            <h2>Анализ доступности</h2>

            <div class="contrast-checker">
                <div class="contrast-controls">
                    <div class="contrast-group">
                        <label>Передний план:</label>
                        <div class="contrast-picker">
                            <input type="color" v-model="foregroundColor" class="color-picker-small">
                            <span class="color-hex-small">{{ foregroundColor }}</span>
                        </div>
                    </div>

                    <div class="contrast-group">
                        <label>Фон:</label>
                        <div class="contrast-picker">
                            <input type="color" v-model="backgroundColor" class="color-picker-small">
                            <span class="color-hex-small">{{ backgroundColor }}</span>
                        </div>
                    </div>

                    <button @click="checkRandomContrast" class="art-btn small">
                        Случайная проверка
                    </button>
                </div>

                <div class="contrast-results">
                    <div class="wcag-level" :class="contrastLevel.class">
                        <div class="level-icon">{{ contrastLevel.icon }}</div>
                        <div class="level-info">
                            <h4>{{ contrastLevel.title }}</h4>
                            <p>Контрастность: {{ contrastRatio.toFixed(2) }}:1</p>
                            <p>{{ contrastLevel.description }}</p>
                        </div>
                    </div>

                    <div class="contrast-details">
                        <div class="contrast-bar">
                            <div class="bar-labels">
                                <span>0</span>
                                <span>3</span>
                                <span>4.5</span>
                                <span>7</span>
                                <span>21</span>
                            </div>
                            <div class="bar-track">
                                <div class="bar-fill"
                                     :style="{ width: getContrastBarWidth() + '%' }"></div>
                                <div class="bar-marker" :style="{ left: getContrastBarWidth() + '%' }">
                                    {{ contrastRatio.toFixed(2) }}
                                </div>
                            </div>
                            <div class="bar-requirements">
                                <span>Недостаточно</span>
                                <span>AA (нормальный)</span>
                                <span>AAA (улучшенный)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Автоподбор акцентных цветов -->
            <div class="accent-colors">
                <h3>Акцентные цвета для палитры</h3>
                <div class="accent-grid">
                    <div v-for="(accent, index) in accentColors"
                         :key="index"
                         class="accent-item"
                         :style="{ backgroundColor: accent.hex }">
                        <div class="accent-info">
                            <span>{{ accent.hex }}</span>
                            <span class="accent-contrast">
                                {{ getContrastWithWhite(accent.hex).toFixed(2) }}:1
                            </span>
                            <button @click="useAsForeground(accent.hex)"
                                    class="accent-action"
                                    :style="{ color: getContrastColor(accent.hex) }">
                                Использовать
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Цветовой круг -->
        <section class="color-wheel-section glass-panel">
            <h2>Цветовой круг</h2>
            <div class="wheel-container">
                <canvas ref="wheelCanvas" class="color-wheel"></canvas>
                <div class="wheel-controls">
                    <button @click="highlightAnalogous" class="wheel-btn">Аналогичные</button>
                    <button @click="highlightTriadic" class="wheel-btn">Триада</button>
                    <button @click="highlightComplementary" class="wheel-btn">Комплементарные</button>
                    <button @click="clearHighlights" class="wheel-btn">Очистить</button>
                </div>
            </div>
        </section>

        <LibraryManager ref="libraryManager"
                        :current-colors="paletteColors"
                        @load-palette="loadPaletteFromLibrary" />

        <ExportPanel :colors="paletteColors"
                     :palette-name="currentPaletteName" />
    </div>
</template>

<script setup>
    import { ref, computed, onMounted, watch, nextTick } from 'vue'
    import {
        hexToHSL,
        hslToHex,
        generateAnalogousColors,
        generateMonochromaticColors,
        generateTriadicColors,
        generateComplementaryColors,
        generateMoodPalette
    } from '../utils/colorUtils'

    import LibraryManager from '../components/LibraryManager.vue'
    import ExportPanel from '../components/ExportPanel.vue'

    // Состояние
    const palette = ref([])
    const baseColor = ref('#4A90E2')
    const selectedType = ref('analogous')
    const selectedMood = ref('calm')
    const paletteSize = ref(5)

    // Анализ доступности
    const foregroundColor = ref('#000000')
    const backgroundColor = ref('#FFFFFF')
    const contrastRatio = ref(21)
    const contrastLevel = ref({
        class: 'aaa',
        icon: '✅',
        title: 'Отличная доступность',
        description: 'Соответствует уровню AAA'
    })

    // Акцентные цвета
    const accentColors = ref([])

    // Canvas для цветового круга
    const wheelCanvas = ref(null)

    // Типы палитр
    const paletteTypes = ref([
        { id: 'analogous', name: 'Аналогичная' },
        { id: 'monochromatic', name: 'Монохромная' },
        { id: 'triadic', name: 'Триада' },
        { id: 'complementary', name: 'Комплементарная' },
        { id: 'mood', name: 'По настроению' },
        { id: 'random', name: 'Случайная' }
    ])

    // Настроения
    const moods = ref([
        { id: 'calm', name: 'Спокойные', icon: '🌿' },
        { id: 'energetic', name: 'Энергичные', icon: '🔥' },
        { id: 'professional', name: 'Профессиональные', icon: '💼' },
        { id: 'vibrant', name: 'Яркие', icon: '🌈' },
        { id: 'pastel', name: 'Пастельные', icon: '🎀' }
    ])

    // Информация о типах палитр
    const paletteInfo = {
        analogous: {
            name: 'Аналогичная палитра',
            description: 'Цвета, расположенные рядом на цветовом круге. Создает гармоничные и спокойные сочетания.'
        },
        monochromatic: {
            name: 'Монохромная палитра',
            description: 'Оттенки одного цвета с разной насыщенностью и яркостью. Элегантно и минималистично.'
        },
        triadic: {
            name: 'Триада',
            description: 'Три равноудаленных цвета на цветовом круге. Ярко и сбалансированно.'
        },
        complementary: {
            name: 'Комплементарная палитра',
            description: 'Противостоящие цвета на цветовом круге. Максимальный контраст и динамика.'
        },
        mood: {
            name: 'Палитра по настроению',
            description: 'Цвета, подобранные под определенное настроение или эмоцию.'
        },
        random: {
            name: 'Случайная палитра',
            description: 'Полностью случайная подборка цветов. Для смелых экспериментов!'
        }
    }

    // Функция для уведомлений (простая версия)
    const showNotification = (message) => {
        console.log(message) // Можно заменить на настоящий toast
        alert(message) // Временное решение
    }

    // Выбор типа палитры
    const selectPaletteType = (type) => {
        selectedType.value = type
    }

    // Выбор настроения
    const selectMood = (mood) => {
        selectedMood.value = mood
    }

    // Случайный HEX
    const getRandomHex = () => {
        const letters = '0123456789ABCDEF'
        let color = '#'
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)]
        }
        return color
    }

    // Генерация палитры
    const generateAdvancedPalette = () => {
        let colors = []

        switch (selectedType.value) {
            case 'analogous':
                colors = generateAnalogousColors(baseColor.value, paletteSize.value)
                break
            case 'monochromatic':
                colors = generateMonochromaticColors(baseColor.value, paletteSize.value)
                break
            case 'triadic':
                colors = generateTriadicColors(baseColor.value)
                break
            case 'complementary':
                colors = generateComplementaryColors(baseColor.value)
                break
            case 'mood':
                colors = generateMoodPalette(selectedMood.value, paletteSize.value)
                break
            case 'random':
            default:
                colors = Array.from({ length: paletteSize.value }, () => getRandomHex())
                break
        }

        // Если цвета меньше, чем нужно (например, у триады всего 3 цвета)
        while (colors.length < paletteSize.value) {
            colors.push(getRandomHex())
        }

        // Сохраняем заблокированные цвета
        const newPalette = []
        const currentLength = palette.value.length

        for (let i = 0; i < paletteSize.value; i++) {
            if (i < currentLength && palette.value[i].locked) {
                newPalette.push(palette.value[i])
            } else {
                newPalette.push({
                    id: Date.now() + i,
                    hex: colors[i],
                    locked: false
                })
            }
        }

        palette.value = newPalette

        // Генерируем акцентные цвета
        generateAccentColors()

        // Сохраняем в localStorage
        saveToLocalStorage()
    }

    // Блокировка цвета
    const toggleLock = (index) => {
        if (palette.value[index]) {
            palette.value[index].locked = !palette.value[index].locked
            saveToLocalStorage()
        }
    }

    // Копирование в буфер
    const copyToClipboard = async (hex) => {
        try {
            await navigator.clipboard.writeText(hex)
            showNotification(`Скопировано: ${hex}`)
        } catch (err) {
            console.error('Ошибка копирования', err)
            showNotification('Ошибка копирования')
        }
    }

    // ======= Анализ доступности =======

    // HEX в RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0]
    }

    // Яркость цвета по WCAG
    const getLuminance = (hex) => {
        const rgb = hexToRgb(hex)
        const sRGB = rgb.map(c => c / 255)

        const linear = sRGB.map(c =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
        )

        return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]
    }

    // Расчет контрастности
    const calculateContrast = (hex1, hex2) => {
        const luminance1 = getLuminance(hex1)
        const luminance2 = getLuminance(hex2)

        const lighter = Math.max(luminance1, luminance2)
        const darker = Math.min(luminance1, luminance2)

        return (lighter + 0.05) / (darker + 0.05)
    }

    // Определение уровня доступности
    const getWCAGLevel = (ratio) => {
        if (ratio >= 7) {
            return {
                class: 'aaa',
                icon: '✅',
                title: 'Отличная доступность',
                description: 'Соответствует уровню AAA (контрастность 7:1 и выше)'
            }
        } else if (ratio >= 4.5) {
            return {
                class: 'aa',
                icon: '⚠️',
                title: 'Хорошая доступность',
                description: 'Соответствует уровню AA (контрастность 4.5:1 и выше)'
            }
        } else if (ratio >= 3) {
            return {
                class: 'aa-large',
                icon: '⚠️',
                title: 'Для крупного текста',
                description: 'Соответствует уровню AA только для текста 18pt+ (контрастность 3:1)'
            }
        } else {
            return {
                class: 'fail',
                icon: '❌',
                title: 'Недостаточный контраст',
                description: 'Не соответствует требованиям WCAG'
            }
        }
    }

    // Проверка контраста при изменении цветов
    watch([foregroundColor, backgroundColor], () => {
        contrastRatio.value = calculateContrast(foregroundColor.value, backgroundColor.value)
        contrastLevel.value = getWCAGLevel(contrastRatio.value)
    })

    // Случайная проверка
    const checkRandomContrast = () => {
        if (palette.value.length >= 2) {
            const randomColors = [...palette.value]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2)

            foregroundColor.value = randomColors[0].hex
            backgroundColor.value = randomColors[1].hex
        }
    }

    // Ширина для графика контраста
    const getContrastBarWidth = () => {
        const maxRatio = 21
        const clampedRatio = Math.min(contrastRatio.value, maxRatio)
        return (clampedRatio / maxRatio) * 100
    }

    // Генерация акцентных цветов
    const generateAccentColors = () => {
        if (palette.value.length === 0) return

        const baseColors = palette.value.map(c => c.hex)
        const accents = []

        // Создаем акцентные цвета на основе палитры
        baseColors.forEach(hex => {
            const hsl = hexToHSL(hex)

            // Более темные варианты
            accents.push({
                hex: hslToHex(hsl.h, hsl.s, Math.max(20, hsl.l - 30)),
                type: 'dark'
            })

            // Более светлые варианты
            accents.push({
                hex: hslToHex(hsl.h, hsl.s, Math.min(90, hsl.l + 30)),
                type: 'light'
            })

            // Комплементарный цвет
            accents.push({
                hex: hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
                type: 'complementary'
            })
        })

        // Убираем дубликаты
        const uniqueColors = [...new Set(accents.map(a => a.hex))]
            .map(hex => ({ hex }))
            .slice(0, 8) // Ограничиваем 8 цветами

        accentColors.value = uniqueColors
    }

    // Контраст с белым
    const getContrastWithWhite = (hex) => {
        return calculateContrast(hex, '#FFFFFF')
    }

    // Использовать как передний план
    const useAsForeground = (hex) => {
        foregroundColor.value = hex
        showNotification(`Цвет ${hex} установлен как передний план`)
    }

    // Контрастный цвет текста
    const getContrastColor = (hex) => {
        const luminance = getLuminance(hex)
        return luminance > 0.179 ? '#000000' : '#FFFFFF'
    }

    // ======= Цветовой круг =======

    // Отрисовка цветового круга
    const drawColorWheel = () => {
        const canvas = wheelCanvas.value
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 10

        // Очищаем canvas
        ctx.clearRect(0, 0, width, height)

        // Рисуем цветовой круг
        for (let angle = 0; angle < 360; angle += 1) {
            const hue = angle
            const radian = angle * Math.PI / 180

            // Рисуем сектор
            for (let r = 0; r < radius; r++) {
                const saturation = r / radius * 100
                const lightness = 50

                const color = hslToHex(hue, saturation, lightness)
                const x = centerX + Math.cos(radian) * r
                const y = centerY + Math.sin(radian) * r

                ctx.beginPath()
                ctx.arc(x, y, 1.5, 0, Math.PI * 2)
                ctx.fillStyle = color
                ctx.fill()
            }
        }

        // Отмечаем цвета из палитры
        palette.value.forEach(color => {
            const hsl = hexToHSL(color.hex)
            const radian = hsl.h * Math.PI / 180
            const x = centerX + Math.cos(radian) * (hsl.s / 100 * radius)
            const y = centerY + Math.sin(radian) * (hsl.s / 100 * radius)

            // Белая точка
            ctx.beginPath()
            ctx.arc(x, y, 6, 0, Math.PI * 2)
            ctx.fillStyle = '#FFFFFF'
            ctx.fill()

            // Цветная обводка
            ctx.beginPath()
            ctx.arc(x, y, 8, 0, Math.PI * 2)
            ctx.strokeStyle = color.hex
            ctx.lineWidth = 2
            ctx.stroke()
        })
    }

    // Подсветка аналогичных цветов
    const highlightAnalogous = () => {
        if (palette.value.length === 0) return

        const canvas = wheelCanvas.value
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 10

        drawColorWheel() // Перерисовываем сначала

        // Подсветка аналогичных цветов (±30°)
        const baseColor = palette.value[0].hex
        const hsl = hexToHSL(baseColor)

        for (let offset = -30; offset <= 30; offset += 5) {
            const hue = (hsl.h + offset + 360) % 360
            const radian = hue * Math.PI / 180

            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            for (let r = 0; r <= radius; r += 5) {
                const x = centerX + Math.cos(radian) * r
                const y = centerY + Math.sin(radian) * r
                if (r === 0) {
                    ctx.moveTo(x, y)
                } else {
                    ctx.lineTo(x, y)
                }
            }
            ctx.strokeStyle = 'rgba(44, 44, 44, 0.2)'
            ctx.lineWidth = 2
            ctx.stroke()
        }
    }

    // Подсветка триады
    const highlightTriadic = () => {
        if (palette.value.length === 0) return

        const canvas = wheelCanvas.value
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 10

        drawColorWheel()

        const baseColor = palette.value[0].hex
        const hsl = hexToHSL(baseColor)

        // Триада: 120° и 240° от базового
        for (let offset of [0, 120, 240]) {
            const hue = (hsl.h + offset) % 360
            const radian = hue * Math.PI / 180

            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            ctx.lineTo(centerX + Math.cos(radian) * radius, centerY + Math.sin(radian) * radius)
            ctx.strokeStyle = 'rgba(220, 53, 69, 0.4)'
            ctx.lineWidth = 3
            ctx.stroke()
        }
    }

    // Подсветка комплементарных
    const highlightComplementary = () => {
        if (palette.value.length === 0) return

        const canvas = wheelCanvas.value
        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height
        const centerX = width / 2
        const centerY = height / 2
        const radius = Math.min(centerX, centerY) - 10

        drawColorWheel()

        const baseColor = palette.value[0].hex
        const hsl = hexToHSL(baseColor)

        // Комплементарный цвет: 180° от базового
        const complementaryHue = (hsl.h + 180) % 360

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(hsl.h * Math.PI / 180) * radius,
            centerY + Math.sin(hsl.h * Math.PI / 180) * radius)
        ctx.strokeStyle = 'rgba(40, 167, 69, 0.4)'
        ctx.lineWidth = 3
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.lineTo(centerX + Math.cos(complementaryHue * Math.PI / 180) * radius,
            centerY + Math.sin(complementaryHue * Math.PI / 180) * radius)
        ctx.strokeStyle = 'rgba(40, 167, 69, 0.4)'
        ctx.lineWidth = 3
        ctx.stroke()
    }

    // Очистка подсветки
    const clearHighlights = () => {
        drawColorWheel()
    }

    // ======= Сохранение и загрузка =======

    // Сохранение в localStorage
    const saveToLocalStorage = () => {
        localStorage.setItem('advanced-palette-app', JSON.stringify({
            palette: palette.value,
            baseColor: baseColor.value,
            type: selectedType.value,
            mood: selectedMood.value,
            size: paletteSize.value,
            foreground: foregroundColor.value,
            background: backgroundColor.value
        }))
    }

    // Загрузка из localStorage
    const loadFromLocalStorage = () => {
        const savedData = localStorage.getItem('advanced-palette-app')
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData)
                baseColor.value = parsed.baseColor || '#4A90E2'
                selectedType.value = parsed.type || 'analogous'
                selectedMood.value = parsed.mood || 'calm'
                paletteSize.value = parsed.size || 5
                foregroundColor.value = parsed.foreground || '#000000'
                backgroundColor.value = parsed.background || '#FFFFFF'

                if (parsed.palette && parsed.palette.length === paletteSize.value) {
                    palette.value = parsed.palette
                } else {
                    generateAdvancedPalette()
                }
            } catch (e) {
                generateAdvancedPalette()
            }
        } else {
            generateAdvancedPalette()
        }
    }


    // Получаем цвета для передачи в компоненты
    const paletteColors = computed(() =>
        palette.value.map(color => color.hex)
    )

    // Имя текущей палитры
    const currentPaletteName = computed(() => {
        return `Палитра от ${new Date().toLocaleDateString('ru-RU')}`
    })

    // Загрузка палитры из библиотеки
    const loadPaletteFromLibrary = (colors) => {
        const newPalette = colors.map((hex, i) => ({
            id: Date.now() + i,
            hex: hex,
            locked: false
        }))

        palette.value = newPalette

        // Обновляем базовый цвет на первый цвет палитры
        if (colors.length > 0) {
            baseColor.value = colors[0]
        }

        showNotification('Палитра загружена из библиотеки!')
    }


    // ======= Инициализация =======

    // Инициализация при монтировании
    onMounted(() => {
        loadFromLocalStorage()
        nextTick(() => {
            drawColorWheel()
        })
    })

    // При изменении палитры обновляем акцентные цвета
    watch(() => palette.value, () => {
        generateAccentColors()
        nextTick(() => {
            drawColorWheel()
        })
    }, { deep: true })
</script>

<style scoped>
    .advanced-container {
        width: 100%;
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    /* Хедер */
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

    /* Glass панель */
    .glass-panel {
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        padding: 1.5rem;
        border-radius: 20px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    /* Контролы */
    .controls-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .control-group {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
    }

        .control-group label {
            font-family: 'Space Mono', monospace;
            font-weight: bold;
            color: #2C2C2C;
        }

    /* Пипетка цвета */
    .color-picker-container {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .color-picker {
        width: 60px;
        height: 60px;
        border: none;
        border-radius: 12px;
        cursor: pointer;
        padding: 0;
        background: none;
    }

    .color-hex {
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        padding: 0.5rem 1rem;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 8px;
    }

    /* Типы палитр */
    .palette-types {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.5rem;
    }

    .art-btn.small {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
        white-space: nowrap;
        min-height: 50px;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        line-height: 1.2;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.8);
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 10px;
        font-family: 'Space Mono', monospace;
        cursor: pointer;
    }

        .art-btn.small:hover {
            background: rgba(44, 44, 44, 0.1);
            transform: translateY(-2px);
        }

        .art-btn.small.active {
            background: #2C2C2C;
            color: #fff;
            border-color: #2C2C2C;
            transform: scale(0.98);
        }

    /* Настроение */
    .mood-selector {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .mood-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.25rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(44, 44, 44, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        min-width: 80px;
    }

        .mood-btn:hover {
            background: rgba(44, 44, 44, 0.05);
            transform: translateY(-2px);
        }

        .mood-btn.active {
            background: #2C2C2C;
            color: white;
            border-color: #2C2C2C;
        }

    .mood-icon {
        font-size: 1.5rem;
    }

    .mood-name {
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
    }

    /* Слайдер */
    .count-slider {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .slider {
        flex: 1;
        height: 6px;
        border-radius: 3px;
        background: rgba(44, 44, 44, 0.1);
        outline: none;
        -webkit-appearance: none;
    }

        .slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: #2C2C2C;
            cursor: pointer;
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

    .count-value {
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        font-size: 1.2rem;
        min-width: 30px;
        text-align: center;
    }

    /* Кнопка генерации */
    .generate-btn {
        align-self: flex-start;
        background: #2C2C2C;
        color: #fff;
        border: none;
        padding: 1rem 2rem;
        font-weight: bold;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-radius: 8px 24px 8px 24px;
        margin-top: 0.5rem;
    }

        .generate-btn:hover {
            transform: translateY(-2px) rotate(-1deg);
            box-shadow: 5px 5px 0px rgba(0,0,0,0.1);
        }

    /* Палитра */
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
        justify-content: flex-end;
        align-items: center;
        padding-bottom: 2rem;
        transition: all 0.4s ease;
        position: relative;
    }

        .color-card:hover {
            flex: 1.5;
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

    /* Анализ доступности */
    .analysis-section {
        margin-top: 1rem;
    }

    .contrast-checker {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .contrast-controls {
        display: flex;
        gap: 2rem;
        align-items: flex-end;
        flex-wrap: wrap;
    }

    .contrast-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .contrast-picker {
        display: flex;
        align-items: center;
        gap: 0.75rem;
    }

    .color-picker-small {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        border: 2px solid rgba(44, 44, 44, 0.1);
        cursor: pointer;
    }

    .color-hex-small {
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 6px;
        font-size: 0.9rem;
    }

    .contrast-results {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        padding: 1.5rem;
    }

    .wcag-level {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1.5rem;
    }

        .wcag-level.aaa {
            background: rgba(40, 167, 69, 0.1);
            border-left: 4px solid #28a745;
        }

        .wcag-level.aa {
            background: rgba(255, 193, 7, 0.1);
            border-left: 4px solid #ffc107;
        }

        .wcag-level.aa-large {
            background: rgba(253, 126, 20, 0.1);
            border-left: 4px solid #fd7e14;
        }

        .wcag-level.fail {
            background: rgba(220, 53, 69, 0.1);
            border-left: 4px solid #dc3545;
        }

    .level-icon {
        font-size: 1.5rem;
    }

    .level-info h4 {
        margin: 0 0 0.5rem 0;
        font-size: 1.1rem;
    }

    .level-info p {
        margin: 0.25rem 0;
        font-size: 0.9rem;
        color: #666;
    }

    /* График контраста */
    .contrast-bar {
        margin-top: 1.5rem;
    }

    .bar-labels {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-size: 0.8rem;
        color: #666;
    }

    .bar-track {
        height: 24px;
        background: linear-gradient(90deg, #dc3545 0%, #dc3545 15%, #fd7e14 15%, #fd7e14 21%, #ffc107 21%, #ffc107 33%, #28a745 33% );
        border-radius: 12px;
        position: relative;
        margin-bottom: 0.5rem;
    }

    .bar-fill {
        height: 100%;
        background: rgba(44, 44, 44, 0.1);
        border-radius: 12px;
    }

    .bar-marker {
        position: absolute;
        top: -30px;
        transform: translateX(-50%);
        background: #2C2C2C;
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        font-weight: bold;
        white-space: nowrap;
    }

        .bar-marker::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid #2C2C2C;
        }

    .bar-requirements {
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        color: #666;
    }

    /* Акцентные цвета */
    .accent-colors {
        margin-top: 2rem;
    }

    .accent-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 1rem;
        margin-top: 1rem;
    }

    .accent-item {
        border-radius: 12px;
        padding: 1rem;
        height: 120px;
        display: flex;
        align-items: flex-end;
        position: relative;
        overflow: hidden;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }

        .accent-item:hover {
            transform: translateY(-5px);
        }

    .accent-info {
        background: rgba(255, 255, 255, 0.9);
        padding: 0.5rem;
        border-radius: 6px;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.8rem;
    }

    .accent-contrast {
        font-family: 'Space Mono', monospace;
        font-weight: bold;
    }

    .accent-action {
        background: none;
        border: 1px solid rgba(44, 44, 44, 0.2);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        transition: all 0.2s ease;
    }

        .accent-action:hover {
            background: rgba(44, 44, 44, 0.1);
        }

    /* Цветовой круг */
    .color-wheel-section {
        margin-top: 2rem;
    }

    .wheel-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1.5rem;
    }

    .color-wheel {
        width: 600px;
        height: 300px;
        border-radius: 50%;
        box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        background: #f9f7f2;
    }

    .wheel-controls {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
        justify-content: center;
    }

    .wheel-btn {
        padding: 0.5rem 1rem;
        background: rgba(44, 44, 44, 0.1);
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 6px;
        cursor: pointer;
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        transition: all 0.2s ease;
    }

        .wheel-btn:hover {
            background: rgba(44, 44, 44, 0.2);
        }

    /* Адаптивность */
    @media (max-width: 768px) {
        .accent-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .contrast-controls {
            flex-direction: column;
            align-items: flex-start;
        }

        .color-wheel {
            width: 250px;
            height: 250px;
        }

        .palette-types {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    .analysis-section,
    .color-wheel-section {
        margin-top: 2rem;
    }
</style>
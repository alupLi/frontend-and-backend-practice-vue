<template>
    <div class="export-panel glass-panel">
        <h2>Экспорт и интеграция</h2>

        <div class="export-tabs">
            <button v-for="tab in tabs"
                    :key="tab.id"
                    @click="activeTab = tab.id"
                    :class="{ active: activeTab === tab.id }"
                    class="tab-btn">
                {{ tab.name }}
            </button>
        </div>

        <!-- CSS Variables -->
        <div v-if="activeTab === 'css'" class="export-content">
            <div class="code-preview">
                <pre class="code-block"><code>{{ cssCode }}</code></pre>
            </div>
            <div class="export-actions">
                <button @click="copyCode(cssCode)" class="art-btn small">
                    📋 Копировать CSS
                </button>
                <button @click="downloadFile('palette.css', cssCode)" class="art-btn small">
                    ⬇️ Скачать .css
                </button>
            </div>
        </div>

        <!-- SCSS Variables -->
        <div v-else-if="activeTab === 'scss'" class="export-content">
            <div class="code-preview">
                <pre class="code-block"><code>{{ scssCode }}</code></pre>
            </div>
            <div class="export-actions">
                <button @click="copyCode(scssCode)" class="art-btn small">
                    📋 Копировать SCSS
                </button>
                <button @click="downloadFile('palette.scss', scssCode)" class="art-btn small">
                    ⬇️ Скачать .scss
                </button>
            </div>
        </div>

        <!-- Tailwind Config -->
        <div v-else-if="activeTab === 'tailwind'" class="export-content">
            <div class="code-preview">
                <pre class="code-block"><code>{{ tailwindCode }}</code></pre>
            </div>
            <div class="export-actions">
                <button @click="copyCode(tailwindCode)" class="art-btn small">
                    📋 Копировать Tailwind
                </button>
                <button @click="downloadFile('tailwind.config.js', tailwindCode)" class="art-btn small">
                    ⬇️ Скачать config
                </button>
            </div>
        </div>

        <!-- UI Preview -->
        <div v-else-if="activeTab === 'preview'" class="export-content">
            <div class="ui-preview">
                <div class="preview-header">
                    <h3>UI Preview</h3>
                    <div class="preview-themes">
                        <button v-for="theme in themes"
                                :key="theme.id"
                                @click="selectedTheme = theme.id"
                                :class="{ active: selectedTheme === theme.id }"
                                class="theme-btn">
                            {{ theme.name }}
                        </button>
                    </div>
                </div>

                <div class="preview-container" :class="selectedTheme">
                    <!-- Кнопки -->
                    <div class="preview-section">
                        <h4>Кнопки</h4>
                        <div class="button-grid">
                            <button v-for="(color, index) in props.colors"
                                    :key="index"
                                    class="preview-button"
                                    :style="{ backgroundColor: color, color: getContrastColor(color) }">
                                Кнопка {{ index + 1 }}
                            </button>
                        </div>
                    </div>

                    <!-- Карточки -->
                    <div class="preview-section">
                        <h4>Карточки</h4>
                        <div class="card-grid">
                            <div v-for="(color, index) in props.colors.slice(0, 3)"
                                 :key="index"
                                 class="preview-card"
                                 :style="{ borderTop: `4px solid ${color}` }">
                                <h5>Заголовок карточки</h5>
                                <p>Пример текста карточки с использованием цветов палитры</p>
                            </div>
                        </div>
                    </div>

                    <!-- Навигация -->
                    <div class="preview-section">
                        <h4>Навигация</h4>
                        <div class="preview-nav" :style="{ backgroundColor: props.colors[0] }">
                            <div class="nav-logo">Logo</div>
                            <div class="nav-links">
                                <a v-for="(color, index) in props.colors.slice(1, 4)"
                                   :key="index"
                                   class="nav-link"
                                   :style="{ color: getContrastColor(props.colors[0]) }">
                                    Ссылка {{ index + 1 }}
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- Формы -->
                    <div class="preview-section">
                        <h4>Формы</h4>
                        <div class="preview-form">
                            <input type="text"
                                   placeholder="Текстовое поле"
                                   class="preview-input"
                                   :style="{ borderColor: props.colors[2] }">
                            <select class="preview-select" :style="{ borderColor: props.colors[3] }">
                                <option>Выпадающий список</option>
                                <option>Опция 1</option>
                                <option>Опция 2</option>
                            </select>
                            <button class="preview-submit"
                                    :style="{
                  backgroundColor: props.colors[4],
                  color: getContrastColor(props.colors[4])
                }">
                                Отправить
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Шаринг - только ссылки -->
        <div v-else-if="activeTab === 'share'" class="export-content">
            <div class="share-section">
                <h3>Шаринг палитры</h3>

                <div class="share-methods">
                    <!-- Ссылка -->
                    <div class="share-method">
                        <h4>Ссылка на палитру</h4>
                        <p>Поделитесь этой ссылкой, чтобы другие могли загрузить вашу палитру:</p>
                        <div class="link-container">
                            <input type="text"
                                   :value="shareLink"
                                   readonly
                                   class="link-input"
                                   ref="linkInput">
                            <button @click="copyShareLink" class="art-btn small">
                                📋 Копировать
                            </button>
                        </div>
                    </div>

                    <!-- JSON -->
                    <div class="share-method">
                        <h4>JSON данные</h4>
                        <p>Скопируйте JSON для использования в других приложениях:</p>
                        <div class="code-preview small">
                            <pre class="code-block"><code>{{ paletteJson }}</code></pre>
                        </div>
                        <button @click="copyCode(paletteJson)" class="art-btn small">
                            📋 Копировать JSON
                        </button>
                    </div>
                </div>

                <!-- Предпросмотр ссылки -->
                <div class="link-preview">
                    <h4>Предпросмотр:</h4>
                    <div class="preview-card">
                        <div class="preview-palette">
                            <div v-for="(color, index) in props.colors"
                                 :key="index"
                                 class="preview-color"
                                 :style="{ backgroundColor: color }"
                                 :title="color">
                                <span class="color-hex">{{ color }}</span>
                            </div>
                        </div>
                        <div class="preview-info">
                            <h5>{{ props.paletteName }}</h5>
                            <p>Поделитесь этой палитрой с друзьями!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed } from 'vue'

    const props = defineProps({
        colors: {
            type: Array,
            default: () => []
        },
        paletteName: {
            type: String,
            default: 'Моя палитра'
        }
    })

    // Состояние
    const activeTab = ref('css')
    const selectedTheme = ref('light')

    // Табы
    const tabs = [
        { id: 'css', name: 'CSS Variables' },
        { id: 'scss', name: 'SCSS Variables' },
        { id: 'tailwind', name: 'Tailwind Config' },
        { id: 'preview', name: 'UI Preview' },
        { id: 'share', name: 'Шаринг' }
    ]

    // Темы для превью
    const themes = [
        { id: 'light', name: 'Светлая' },
        { id: 'dark', name: 'Темная' }
    ]

    // Функция для определения контрастного цвета
    const getContrastColor = (hexColor) => {
        // Простая проверка яркости
        const r = parseInt(hexColor.slice(1, 3), 16)
        const g = parseInt(hexColor.slice(3, 5), 16)
        const b = parseInt(hexColor.slice(5, 7), 16)
        const brightness = (r * 299 + g * 587 + b * 114) / 1000
        return brightness > 128 ? '#000000' : '#FFFFFF'
    }

    // CSS код
    const cssCode = computed(() => {
        return `/* Color Palette: ${props.paletteName} */
:root {
${props.colors.map((color, i) => `  --color-${i + 1}: ${color};`).join('\n')}
}

/* Примеры использования */
.button-primary {
  background-color: var(--color-1);
  color: ${getContrastColor(props.colors[0] || '#000000')};
}

.card {
  border: 1px solid var(--color-2);
  background: linear-gradient(135deg, var(--color-3), var(--color-4));
}`
    })

    // SCSS код
    const scssCode = computed(() => {
        return `/* Color Palette: ${props.paletteName} */
$palette: (
${props.colors.map((color, i) => `  "color-${i + 1}": ${color},`).join('\n')}
);

// Функция для получения цвета
@function palette($color-name) {
  @return map-get($palette, $color-name);
}

// Использование
.primary-button {
  background-color: palette("color-1");
  color: ${getContrastColor(props.colors[0] || '#000000')};
}

.gradient-card {
  background: linear-gradient(
    135deg,
    palette("color-3"),
    palette("color-4")
  );
}`
    })

    // Tailwind config
    const tailwindCode = computed(() => {
        const colorsObject = {}
        props.colors.forEach((color, i) => {
            colorsObject[`color-${i + 1}`] = color
        })

        const colorsString = JSON.stringify(colorsObject, null, 2)
            .replace(/"(\w+)":/g, '$1:')
            .replace(/"/g, "'")

        return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        palette: ${colorsString}
      }
    }
  }
}

// Примеры использования в HTML
// <button class="bg-palette-color-1 text-white">Кнопка</button>
// <div class="border-palette-color-2"></div>`
    })

    // JSON палитры
    const paletteJson = computed(() => {
        return JSON.stringify({
            name: props.paletteName,
            colors: props.colors,
            createdAt: new Date().toISOString(),
            source: 'Color Abstract Generator'
        }, null, 2)
    })

    // Ссылка для шаринга
    const shareLink = computed(() => {
        const colors = props.colors.map(color => color.replace('#', '')).join('-')
        const name = encodeURIComponent(props.paletteName)
        return `${window.location.origin}${window.location.pathname}?palette=${colors}&name=${name}`
    })

    // Копирование кода
    const copyCode = async (code) => {
        try {
            await navigator.clipboard.writeText(code)
            alert('Код скопирован в буфер обмена!')
        } catch (err) {
            console.error('Ошибка копирования:', err)
            alert('Не удалось скопировать код')
        }
    }

    // Копирование ссылки
    const copyShareLink = async () => {
        try {
            await navigator.clipboard.writeText(shareLink.value)
            alert('Ссылка скопирована в буфер обмена!')
        } catch (err) {
            console.error('Ошибка копирования:', err)
        }
    }

    // Скачивание файла
    const downloadFile = (filename, content) => {
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    }
</script>

<style scoped>
    .export-panel {
        margin-top: 2rem;
    }

    .export-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        border-bottom: 1px solid rgba(44, 44, 44, 0.1);
        padding-bottom: 1rem;
    }

    .tab-btn {
        padding: 0.75rem 1.5rem;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #666;
    }

        .tab-btn:hover {
            color: #2C2C2C;
        }

        .tab-btn.active {
            color: #2C2C2C;
            border-bottom-color: #2C2C2C;
            font-weight: bold;
        }

    /* Контент экспорта */
    .export-content {
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }

        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    /* Код */
    .code-preview {
        background: rgba(44, 44, 44, 0.05);
        border-radius: 12px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        max-height: 300px;
        overflow-y: auto;
    }

        .code-preview.small {
            max-height: 200px;
            padding: 1rem;
        }

    .code-block {
        margin: 0;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
        line-height: 1.5;
        color: #2C2C2C;
        white-space: pre-wrap;
    }

    .export-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    /* UI Preview */
    .ui-preview {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        padding: 1.5rem;
    }

    .preview-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

        .preview-header h3 {
            margin: 0;
        }

    .preview-themes {
        display: flex;
        gap: 0.5rem;
    }

    .theme-btn {
        padding: 0.5rem 1rem;
        background: rgba(44, 44, 44, 0.1);
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 6px;
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        cursor: pointer;
    }

        .theme-btn.active {
            background: #2C2C2C;
            color: white;
        }

    /* Превью контейнер */
    .preview-container {
        border-radius: 8px;
        padding: 2rem;
        transition: background-color 0.3s ease;
    }

        .preview-container.light {
            background-color: #ffffff;
            color: #333333;
        }

        .preview-container.dark {
            background-color: #1a1a1a;
            color: #ffffff;
        }

    .preview-section {
        margin-bottom: 2rem;
    }

        .preview-section h4 {
            margin: 0 0 1rem 0;
            font-size: 1rem;
            color: inherit;
            opacity: 0.8;
        }

    /* Кнопки превью */
    .button-grid {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
    }

    .preview-button {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
        cursor: default;
        transition: transform 0.2s ease;
        min-width: 120px;
    }

        .preview-button:hover {
            transform: translateY(-2px);
        }

    /* Карточки превью */
    .card-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 1rem;
    }

    .preview-card {
        padding: 1.5rem;
        border-radius: 8px;
        background: rgba(44, 44, 44, 0.05);
    }

        .preview-card h5 {
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
        }

        .preview-card p {
            margin: 0;
            font-size: 0.9rem;
            opacity: 0.7;
        }

    /* Навигация превью */
    .preview-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem 2rem;
        border-radius: 8px;
    }

    .nav-logo {
        font-weight: bold;
        font-size: 1.2rem;
    }

    .nav-links {
        display: flex;
        gap: 2rem;
    }

    .nav-link {
        text-decoration: none;
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        cursor: default;
    }

    /* Формы превью */
    .preview-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        max-width: 400px;
    }

    .preview-input, .preview-select {
        padding: 0.75rem;
        border: 2px solid;
        border-radius: 6px;
        background: transparent;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
    }

        .preview-input::placeholder {
            color: inherit;
            opacity: 0.5;
        }

    .preview-submit {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 6px;
        font-family: 'Space Mono', monospace;
        font-weight: bold;
        cursor: default;
    }

    /* Шаринг */
    .share-section {
        background: rgba(255, 255, 255, 0.6);
        border-radius: 12px;
        padding: 1.5rem;
    }

    .share-methods {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-bottom: 2rem;
    }

    .share-method {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 12px;
        padding: 1.5rem;
    }

        .share-method h4 {
            margin: 0 0 0.5rem 0;
            color: #2C2C2C;
        }

        .share-method p {
            margin: 0 0 1rem 0;
            color: #666;
            font-size: 0.9rem;
        }

    .link-container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .link-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 8px;
        background: white;
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
    }

    .link-preview {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        border: 1px solid rgba(44, 44, 44, 0.1);
    }

        .link-preview h4 {
            margin: 0 0 1rem 0;
        }

    .preview-palette {
        display: flex;
        height: 60px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
        border: 1px solid rgba(0,0,0,0.1);
    }

    .preview-color {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        transition: flex 0.3s ease;
    }

        .preview-color:hover {
            flex: 1.5;
        }

            .preview-color:hover .color-hex {
                opacity: 1;
            }

    .color-hex {
        position: absolute;
        bottom: 5px;
        left: 0;
        right: 0;
        text-align: center;
        font-family: 'Space Mono', monospace;
        font-size: 0.7rem;
        font-weight: bold;
        color: white;
        text-shadow: 0 1px 2px rgba(0,0,0,0.5);
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .preview-info {
        text-align: center;
    }

        .preview-info h5 {
            margin: 0 0 0.5rem 0;
            font-size: 1.2rem;
        }

        .preview-info p {
            margin: 0;
            color: #666;
            font-size: 0.9rem;
        }

    /* Адаптивность */
    @media (max-width: 768px) {
        .export-tabs {
            overflow-x: auto;
            padding-bottom: 0.5rem;
        }

        .tab-btn {
            padding: 0.5rem 1rem;
            white-space: nowrap;
        }

        .share-methods {
            grid-template-columns: 1fr;
        }

        .preview-nav {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
        }

        .nav-links {
            gap: 1rem;
        }

        .link-container {
            flex-direction: column;
            align-items: stretch;
        }
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
</style>
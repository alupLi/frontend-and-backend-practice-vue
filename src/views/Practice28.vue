<!--<template>
    <div class="art-container">
        <nav class="practice-nav glass-panel">
            <router-link to="/practice-27">Практика 27</router-link>
            <router-link to="/practice-28">Практика 28</router-link>
        </nav>

        <main class="app-content">
            <header class="app-header">
                <h1>Advanced<br>Color<br>Studio</h1>
                <p>Продвинутая генерация и анализ</p>
            </header>

            <section class="controls-section glass-panel">
                <div class="control-grid">
                    <div class="control-group">
                        <label>Базовый цвет:</label>
                        <input type="color" v-model="baseColor" class="base-input">
                    </div>

                    <div class="control-group">
                        <label>Гармония:</label>
                        <select v-model="harmonyType" class="art-select">
                            <option value="analogous">Аналогичная</option>
                            <option value="monochromatic">Монохромная</option>
                            <option value="triad">Триада</option>
                            <option value="complementary">Комплементарная</option>
                        </select>
                    </div>

                    <div class="control-group">
                        <label>Настроение:</label>
                        <select v-model="currentMood" class="art-select">
                            <option value="any">Любое</option>
                            <option value="calm">Спокойное (Pastel)</option>
                            <option value="energetic">Энергичное (Vivid)</option>
                            <option value="pro">Профессиональное (Deep)</option>
                        </select>
                    </div>
                </div>

                <button @click="generateAdvancedPalette" class="art-btn generate-btn">
                    Сгенерировать по правилам
                </button>
            </section>

            <section class="palette-strip">
                <div v-for="color in palette" :key="color.id"
                     class="color-card"
                     :style="{ backgroundColor: color.hex }">
                    <div class="color-info">
                        <span>{{ color.hex }}</span>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>-->

<template>
    <div class="art-container">
        <main class="app-content">
            <section class="controls-section glass-panel">
                <div class="control-group">
                    <label>Кол-во цветов (Computed): {{ paletteCount }}</label>
                    <input type="range" v-model="paletteSize" min="3" max="7">
                </div>
            </section>

            <section class="palette-strip">
                <ColorCard v-for="(color, index) in palette"
                           :key="color.id"
                           :color="color"
                           @toggle-lock="toggleLock(index)"
                           @copy="handleCopy" />
            </section>

            <section v-if="palette.length" class="analysis-section glass-panel">
                <h2>Анализ доступности (WCAG)</h2>
                <div class="contrast-grid">
                    <div v-for="color in palette" :key="color.id" class="contrast-item">
                        <span :style="{ color: color.hex }">■</span>
                        <span>{{ checkContrast(color.hex) }}</span>
                    </div>
                </div>
            </section>
        </main>
    </div>
</template>

<script setup>
    import ColorCard from '../components/ColorCard.vue'

    const palette = ref([])
    const paletteSize = ref(5)
    const baseColor = ref('#667eea')
    const harmonyType = ref('analogous')
    const currentMood = ref('any')

    // 1. ВЫЧИСЛЯЕМОЕ СВОЙСТВО (Computed)
    const paletteCount = computed(() => palette.value.length)

    // 2. ИНТЕГРАЦИЯ С API (Пункт 4 тех. требований)
    const getColorName = async (hex) => {
        const cleanHex = hex.replace('#', '')
        try {
            const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}`)
            const data = await response.json()
            console.log('Название цвета:', data.name.value)
        } catch (e) { console.error('API Error') }
    }

    // 3. WATCHER (Следим за базовым цветом и запрашиваем API)
    watch(baseColor, (newVal) => {
        getColorName(newVal)
        generateAdvancedPalette()
    })

    // 4. ПРОВЕРКА КОНТРАСТНОСТИ (WCAG - Пункт 2 из задания 28)
    const checkContrast = (hex) => {
        // Упрощенная логика для примера (в финале сделаем расчет коэффициента)
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 125 ? 'AA (Good for dark text)' : 'AAA (Good for light text)';
    }

    const toggleLock = (index) => {
        palette.value[index].locked = !palette.value[index].locked
    }

    const handleCopy = (hex) => {
        navigator.clipboard.writeText(hex)
        // Тут можно вызвать твой Toast уведомление
    }
//import { ref, watch, computed } from 'vue'

//// Состояние
//const baseColor = ref('#667eea')
//const harmonyType = ref('analogous')
//const currentMood = ref('any')
//const palette = ref([])

//// Вспомогательная функция: HEX в HSL для математики
//const hexToHsl = (hex) => {
//  let r = parseInt(hex.slice(1, 3), 16) / 255,
//      g = parseInt(hex.slice(3, 5), 16) / 255,
//      b = parseInt(hex.slice(5, 7), 16) / 255;
//  let max = Math.max(r, g, b), min = Math.min(r, g, b);
//  let h, s, l = (max + min) / 2;
//  if (max === min) h = s = 0;
//  else {
//    let d = max - min;
//    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
//    switch (max) {
//      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
//      case g: h = (b - r) / d + 2; break;
//      case b: h = (r - g) / d + 4; break;
//    }
//    h /= 6;
//  }
//  return { h: h * 360, s: s * 100, l: l * 100 };
//}

//const hslToHex = (h, s, l) => {
//  l /= 100; s /= 100;
//  const a = s * Math.min(l, 1 - l);
//  const f = n => {
//    const k = (n + h / 30) % 12;
//    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
//    return Math.round(255 * color).toString(16).padStart(2, '0');
//  };
//  return `#${f(0)}${f(8)}${f(4)}`;
//}

//// 1. ИСПОЛЬЗОВАНИЕ WATCHERS (Следим за изменением базы или типа)
//watch([baseColor, harmonyType, currentMood], () => {
//  generateAdvancedPalette()
//})

// Логика генерации по "Гармониям"
const generateAdvancedPalette = () => {
  const baseHsl = hexToHsl(baseColor.value)
  let newPalette = []

  // Настройки настроения
  let sMod = 1, lMod = 1;
  if (currentMood.value === 'calm') { sMod = 0.4; lMod = 1.4 }
  if (currentMood.value === 'energetic') { sMod = 1.5; lMod = 1 }

  for (let i = 0; i < 5; i++) {
    let h = baseHsl.h
    let s = Math.min(100, baseHsl.s * sMod)
    let l = Math.min(90, baseHsl.l * lMod)

    if (harmonyType.value === 'analogous') h = (h + (i * 30)) % 360
    if (harmonyType.value === 'triad') h = (h + (i * 120)) % 360
    if (harmonyType.value === 'complementary') h = i % 2 === 0 ? h : (h + 180) % 360
    if (harmonyType.value === 'monochromatic') l = (20 + (i * 15)) % 100

    newPalette.push({
      id: i,
      hex: hslToHex(h, s, l)
    })
  }
  palette.value = newPalette
}

// Первоначальный запуск
generateAdvancedPalette()
</script>

<style scoped>
    /* Твоя стилистика */
    .practice-nav {
        display: flex;
        gap: 20px;
        padding: 15px;
        justify-content: center;
        margin-bottom: 20px;
    }

        .practice-nav a {
            text-decoration: none;
            color: #667eea;
            font-weight: bold;
            padding: 5px 15px;
            border-radius: 20px;
        }

            .practice-nav a.router-link-active {
                background: #667eea;
                color: white;
            }

    .control-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 20px;
    }

    .base-input {
        width: 100%;
        height: 40px;
        border-radius: 8px;
        border: none;
        cursor: pointer;
    }

    .art-select {
        width: 100%;
        padding: 10px;
        border-radius: 8px;
        background: rgba(255,255,255,0.7);
        border: 1px solid rgba(0,0,0,0.1);
    }
</style>
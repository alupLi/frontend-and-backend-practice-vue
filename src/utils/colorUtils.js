// Утилиты для работы с цветами

// Преобразование HEX в HSL
export function hexToHSL(hex) {
    // Удаляем # если есть
    hex = hex.replace(/^#/, '')

    // Преобразуем 3-значный HEX в 6-значный
    if (hex.length === 3) {
        hex = hex.split('').map(char => char + char).join('')
    }

    // Конвертируем HEX в RGB
    const r = parseInt(hex.slice(0, 2), 16) / 255
    const g = parseInt(hex.slice(2, 4), 16) / 255
    const b = parseInt(hex.slice(4, 6), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)

    let h, s, l = (max + min) / 2

    if (max === min) {
        h = s = 0 // ахроматический
    } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break
            case g: h = (b - r) / d + 2; break
            case b: h = (r - g) / d + 4; break
        }
        h /= 6
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    }
}

// Преобразование HSL в HEX
export function hslToHex(h, s, l) {
    s /= 100
    l /= 100

    const c = (1 - Math.abs(2 * l - 1)) * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = l - c / 2

    let r, g, b

    if (0 <= h && h < 60) {
        [r, g, b] = [c, x, 0]
    } else if (60 <= h && h < 120) {
        [r, g, b] = [x, c, 0]
    } else if (120 <= h && h < 180) {
        [r, g, b] = [0, c, x]
    } else if (180 <= h && h < 240) {
        [r, g, b] = [0, x, c]
    } else if (240 <= h && h < 300) {
        [r, g, b] = [x, 0, c]
    } else if (300 <= h && h < 360) {
        [r, g, b] = [c, 0, x]
    }

    r = Math.round((r + m) * 255)
    g = Math.round((g + m) * 255)
    b = Math.round((b + m) * 255)

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

// Генерация гармоничных цветов
export function generateAnalogousColors(baseHex, count = 5) {
    const hsl = hexToHSL(baseHex)
    const colors = []

    for (let i = 0; i < count; i++) {
        const h = (hsl.h + (i - Math.floor(count / 2)) * 30 + 360) % 360
        colors.push(hslToHex(h, hsl.s, hsl.l))
    }

    return colors
}

export function generateMonochromaticColors(baseHex, count = 5) {
    const hsl = hexToHSL(baseHex)
    const colors = []

    for (let i = 0; i < count; i++) {
        const l = Math.max(10, Math.min(90, hsl.l + (i - Math.floor(count / 2)) * 10))
        colors.push(hslToHex(hsl.h, hsl.s, l))
    }

    return colors
}

export function generateTriadicColors(baseHex) {
    const hsl = hexToHSL(baseHex)
    const colors = [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l)
    ]
    return colors
}

export function generateComplementaryColors(baseHex) {
    const hsl = hexToHSL(baseHex)
    const colors = [
        hslToHex(hsl.h, hsl.s, hsl.l),
        hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
    ]
    return colors
}

// Генерация по настроению
export function generateMoodPalette(mood, count = 5) {
    const moods = {
        calm: { h: 220, s: 60, l: 50 },
        energetic: { h: 0, s: 80, l: 50 },
        professional: { h: 200, s: 30, l: 50 },
        vibrant: { h: 120, s: 80, l: 50 },
        pastel: { h: 280, s: 40, l: 70 }
    }

    const base = moods[mood] || moods.calm
    const colors = []

    for (let i = 0; i < count; i++) {
        const h = (base.h + i * 30) % 360
        const s = Math.max(20, Math.min(100, base.s + (i % 2 === 0 ? 10 : -10)))
        const l = Math.max(20, Math.min(80, base.l + (i - Math.floor(count / 2)) * 5))
        colors.push(hslToHex(h, s, l))
    }

    return colors
}

// Функция для отрисовки цветового круга
export function drawColorWheel(canvas, palette = [], highlight = null) {
    const ctx = canvas.getContext('2d')
    const width = canvas.width
    const height = canvas.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Очищаем canvas
    ctx.clearRect(0, 0, width, height)

    // Рисуем цветовой круг
    const imageData = ctx.createImageData(width, height)
    const data = imageData.data

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const dx = x - centerX
            const dy = y - centerY
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance <= radius) {
                const angle = Math.atan2(dy, dx) * 180 / Math.PI
                const hue = (angle + 180) % 360
                const saturation = (distance / radius) * 100
                const lightness = 50

                const color = hslToHex(hue, saturation, lightness)
                const hex = color.substring(1)
                const index = (y * width + x) * 4

                data[index] = parseInt(hex.substring(0, 2), 16)
                data[index + 1] = parseInt(hex.substring(2, 4), 16)
                data[index + 2] = parseInt(hex.substring(4, 6), 16)
                data[index + 3] = 255
            }
        }
    }

    ctx.putImageData(imageData, 0, 0)

    // Отмечаем цвета из палитры
    palette.forEach(color => {
        const hsl = hexToHSL(color.hex || color)
        const radian = hsl.h * Math.PI / 180
        const x = centerX + Math.cos(radian) * (hsl.s / 100 * radius)
        const y = centerY + Math.sin(radian) * (hsl.s / 100 * radius)

        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, 8, 0, Math.PI * 2)
        ctx.strokeStyle = color.hex || color
        ctx.lineWidth = 2
        ctx.stroke()
    })

    // Подсветка (если нужно)
    if (highlight) {
        // Логика подсветки
    }
}
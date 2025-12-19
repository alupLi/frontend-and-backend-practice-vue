// src/utils/colorUtils.js

// Преобразование HEX в HSL и обратно для генерации гармоний
export function hexToHsl(H) {
    let r = 0, g = 0, b = 0;
    if (H.length == 4) {
        r = "0x" + H[1] + H[1]; g = "0x" + H[2] + H[2]; b = "0x" + H[3] + H[3];
    } else if (H.length == 7) {
        r = "0x" + H[1] + H[2]; g = "0x" + H[3] + H[4]; b = "0x" + H[5] + H[6];
    }
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r, g, b), cmax = Math.max(r, g, b), delta = cmax - cmin, h = 0, s = 0, l = 0;

    if (delta == 0) h = 0;
    else if (cmax == r) h = ((g - b) / delta) % 6;
    else if (cmax == g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;
    l = (cmax + cmin) / 2;
    s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);
    return { h, s, l };
}

export function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    let c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = l - c / 2, r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    r = Math.round((r + m) * 255).toString(16);
    g = Math.round((g + m) * 255).toString(16);
    b = Math.round((b + m) * 255).toString(16);
    if (r.length == 1) r = "0" + r;
    if (g.length == 1) g = "0" + g;
    if (b.length == 1) b = "0" + b;
    return "#" + r + g + b;
}

// Генерация гармоний
export function generateHarmony(baseHex, mode = 'analogous', count = 5) {
    const { h, s, l } = hexToHsl(baseHex);
    let colors = [];

    for (let i = 0; i < count; i++) {
        let newH = h;
        let newS = s;
        let newL = l;

        if (i === 0) {
            // Первый цвет - базовый
        } else {
            switch (mode) {
                case 'analogous': // Аналогичная: сдвиг по кругу на 30 градусов
                    newH = (h + (30 * i)) % 360;
                    break;
                case 'monochromatic': // Монохромная: меняем светлость
                    newL = Math.max(10, Math.min(95, l + (i % 2 === 0 ? 10 * i : -10 * i)));
                    break;
                case 'triad': // Триада
                    newH = (h + (120 * i)) % 360;
                    break;
                case 'complementary': // Комплементарная
                    newH = (h + (180 * i)) % 360;
                    break;
                case 'random':
                default:
                    newH = Math.floor(Math.random() * 360);
                    newS = Math.floor(Math.random() * 40) + 60;
                    newL = Math.floor(Math.random() * 40) + 40;
            }
        }
        colors.push({
            id: Date.now() + i,
            hex: hslToHex(newH, newS, newL),
            locked: false,
            name: 'Loading...'
        });
    }
    return colors;
}

// WCAG Contrast
export function getContrastRatio(hex1, hex2) {
    const getLuminance = (hex) => {
        const rgb = parseInt(hex.slice(1), 16);
        const r = (rgb >> 16) & 0xff;
        const g = (rgb >> 8) & 0xff;
        const b = (rgb >> 0) & 0xff;
        const [lr, lg, lb] = [r, g, b].map(c => {
            c /= 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    };
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    return ratio.toFixed(2);
}

// Внешний API для получения названия цвета
export async function fetchColorName(hex) {
    try {
        const cleanHex = hex.replace('#', '');
        const response = await fetch(`https://www.thecolorapi.com/id?hex=${cleanHex}`);
        const data = await response.json();
        return data.name.value;
    } catch (e) {
        return hex;
    }
}
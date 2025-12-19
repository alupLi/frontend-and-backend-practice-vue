<template>
    <div class="app-container">
        <!-- Декоративные фигуры -->
        <div class="shape shape-circle"></div>
        <div class="shape shape-rect"></div>
        <div class="shape shape-blob"></div>

        <!-- Навигация между страницами -->
        <nav class="main-nav glass-panel">
            <router-link to="/" class="nav-link">
                <span class="nav-icon">🎨</span>
                <span class="nav-text">Базовый</span>
            </router-link>
            <router-link to="/advanced" class="nav-link">
                <span class="nav-icon">✨</span>
                <span class="nav-text">Продвинутый</span>
            </router-link>
        </nav>

        <!-- Основной контент -->
        <main class="main-content">
            <router-view />
        </main>

        <!-- Toast уведомление -->
        <transition name="fade">
            <div v-if="notification" class="toast-notification">
                {{ notification }}
            </div>
        </transition>
    </div>
</template>

<script setup>
    import { ref, provide } from 'vue'

    // Общее состояние для уведомлений
    const notification = ref(null)

    // Функция для показа уведомлений
    const showNotification = (msg) => {
        notification.value = msg
        setTimeout(() => {
            notification.value = null
        }, 2000)
    }

    // Предоставляем функцию уведомлений дочерним компонентам
    provide('showNotification', showNotification)
</script>

<style scoped>
    .app-container {
        font-family: 'Syne', sans-serif;
        min-height: 100vh;
        background-color: #F9F7F2;
        color: #2C2C2C;
        position: relative;
        padding: 2rem;
        display: flex;
        flex-direction: column;
    }

    /* Декоративные фигуры */
    .shape {
        position: fixed;
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

    /* Навигация */
    .main-nav {
        position: fixed;
        top: 2rem;
        right: 2rem;
        z-index: 100;
        display: flex;
        gap: 1rem;
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        background: rgba(255, 255, 255, 0.4);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.8);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }

    .nav-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: #2C2C2C;
        padding: 0.5rem 1rem;
        border-radius: 25px;
        transition: all 0.3s ease;
    }

        .nav-link:hover {
            background: rgba(44, 44, 44, 0.1);
        }

        .nav-link.router-link-active {
            background: #2C2C2C;
            color: #fff;
        }

    .nav-icon {
        font-size: 1.2rem;
    }

    .nav-text {
        font-family: 'Space Mono', monospace;
        font-weight: bold;
    }

    /* Основной контент */
    .main-content {
        position: relative;
        z-index: 1;
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    /* Toast Notification */
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
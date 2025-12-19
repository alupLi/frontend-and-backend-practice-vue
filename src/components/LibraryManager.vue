<template>
    <div class="library-manager glass-panel">
        <div class="library-header">
            <h2>Библиотека палитр</h2>
            <div class="library-actions">
                <button @click="saveCurrentPalette" class="art-btn small">
                    <span>💾</span> Сохранить текущую
                </button>
            </div>
        </div>

        <!-- Поиск и фильтры -->
        <div class="library-filters">
            <div class="search-box">
                <input v-model="searchQuery"
                       placeholder="Поиск по названию или тегам..."
                       class="search-input">
                <span class="search-icon">🔍</span>
            </div>

            <div class="filter-tags">
                <button v-for="tag in allTags"
                        :key="tag"
                        @click="toggleTagFilter(tag)"
                        :class="{ active: tagFilters.includes(tag) }"
                        class="tag-btn">
                    {{ tag }}
                </button>
            </div>
        </div>

        <!-- Список сохраненных палитр -->
        <div class="palette-library">
            <div v-if="filteredPalettes.length === 0" class="empty-library">
                <p>Библиотека пуста. Сохраните свою первую палитру!</p>
            </div>

            <div v-else class="palette-grid">
                <div v-for="palette in filteredPalettes"
                     :key="palette.id"
                     class="library-item"
                     :class="{ favorite: palette.favorite }">
                    <div class="item-header">
                        <h3>{{ palette.name }}</h3>
                        <div class="item-actions">
                            <button @click="toggleFavorite(palette.id)"
                                    class="fav-btn"
                                    :title="palette.favorite ? 'Убрать из избранного' : 'В избранное'">
                                {{ palette.favorite ? '★' : '☆' }}
                            </button>
                            <button @click="editPalette(palette)"
                                    class="edit-btn"
                                    title="Редактировать">
                                ✏️
                            </button>
                            <button @click="loadPalette(palette)"
                                    class="load-btn"
                                    title="Загрузить">
                                ↺
                            </button>
                            <button @click="deletePalette(palette.id)"
                                    class="delete-btn"
                                    title="Удалить">
                                🗑️
                            </button>
                        </div>
                    </div>

                    <div class="item-colors">
                        <div v-for="color in palette.colors"
                             :key="color"
                             class="mini-color"
                             :style="{ backgroundColor: color }"
                             :title="color"></div>
                    </div>

                    <div class="item-footer">
                        <div class="item-tags">
                            <span v-for="tag in palette.tags"
                                  :key="tag"
                                  class="mini-tag">
                                {{ tag }}
                            </span>
                        </div>
                        <div class="item-date">
                            {{ formatDate(palette.createdAt) }}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно сохранения -->
        <div v-if="showSaveModal" class="modal-overlay">
            <div class="modal-content glass-panel">
                <h3>Сохранение палитры</h3>

                <div class="modal-form">
                    <div class="form-group">
                        <label>Название палитры:</label>
                        <input v-model="newPaletteName"
                               placeholder="Моя потрясающая палитра"
                               class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Теги (через запятую):</label>
                        <input v-model="newPaletteTags"
                               placeholder="весна, пастель, интерфейс"
                               class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Цвета:</label>
                        <div class="preview-colors">
                            <div v-for="color in currentColors"
                                 :key="color"
                                 class="preview-color"
                                 :style="{ backgroundColor: color }"></div>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button @click="confirmSave" class="art-btn small">Сохранить</button>
                        <button @click="cancelSave" class="art-btn small">Отмена</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Модальное окно редактирования -->
        <div v-if="showEditModal" class="modal-overlay">
            <div class="modal-content glass-panel">
                <h3>Редактирование палитры</h3>

                <div class="modal-form">
                    <div class="form-group">
                        <label>Название палитры:</label>
                        <input v-model="editingPalette.name"
                               class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Теги (через запятую):</label>
                        <input v-model="editingPalette.tagsStr"
                               placeholder="весна, пастель, интерфейс"
                               class="form-input">
                    </div>

                    <div class="form-group">
                        <label>Цвета (по одному HEX на строку):</label>
                        <textarea v-model="editingPalette.colorsStr"
                                  rows="6"
                                  class="form-textarea"></textarea>
                    </div>

                    <div class="modal-actions">
                        <button @click="confirmEdit" class="art-btn small">Сохранить изменения</button>
                        <button @click="cancelEdit" class="art-btn small">Отмена</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const props = defineProps({
  currentColors: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['loadPalette'])

// Состояние
const savedPalettes = ref([])
const searchQuery = ref('')
const tagFilters = ref([])
const showSaveModal = ref(false)
const showEditModal = ref(false)
const newPaletteName = ref('')
const newPaletteTags = ref('')
const editingPalette = ref(null)

// Все уникальные теги
const allTags = computed(() => {
  const tags = new Set()
  savedPalettes.value.forEach(palette => {
    palette.tags.forEach(tag => tags.add(tag))
  })
  return Array.from(tags).sort()
})

// Отфильтрованные палитры
const filteredPalettes = computed(() => {
  let filtered = savedPalettes.value

  // Поиск по названию и тегам
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(palette =>
      palette.name.toLowerCase().includes(query) ||
      palette.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  // Фильтрация по тегам
  if (tagFilters.value.length > 0) {
    filtered = filtered.filter(palette =>
      tagFilters.value.every(tag => palette.tags.includes(tag))
    )
  }

  return filtered
})

// Сохранение текущей палитры
const saveCurrentPalette = () => {
  if (props.currentColors.length === 0) return

  newPaletteName.value = `Палитра ${formatDate(new Date(), true)}`
  newPaletteTags.value = ''
  showSaveModal.value = true
}

// Подтверждение сохранения
const confirmSave = () => {
  if (!newPaletteName.value.trim()) {
    alert('Введите название палитры')
    return
  }

  const tags = newPaletteTags.value
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0)

  const newPalette = {
    id: Date.now(),
    name: newPaletteName.value,
    colors: [...props.currentColors],
    tags: tags,
    favorite: false,
    createdAt: new Date().toISOString()
  }

  savedPalettes.value.unshift(newPalette)
  saveToLocalStorage()

  showSaveModal.value = false
  newPaletteName.value = ''
  newPaletteTags.value = ''

  alert('Палитра сохранена!')
}

// Отмена сохранения
const cancelSave = () => {
  showSaveModal.value = false
  newPaletteName.value = ''
  newPaletteTags.value = ''
}

// Редактирование палитры
const editPalette = (palette) => {
  editingPalette.value = {
    ...palette,
    tagsStr: palette.tags.join(', '),
    colorsStr: palette.colors.join('\n')
  }
  showEditModal.value = true
}

// Подтверждение редактирования
const confirmEdit = () => {
  if (!editingPalette.value.name.trim()) {
    alert('Введите название палитры')
    return
  }

  try {
    const colors = editingPalette.value.colorsStr
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.startsWith('#'))

    if (colors.length === 0) {
      alert('Добавьте хотя бы один цвет в формате HEX (#FFFFFF)')
      return
    }

    const tags = editingPalette.value.tagsStr
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)

    const index = savedPalettes.value.findIndex(p => p.id === editingPalette.value.id)
    if (index !== -1) {
      savedPalettes.value[index] = {
        ...savedPalettes.value[index],
        name: editingPalette.value.name,
        colors: colors,
        tags: tags
      }
      saveToLocalStorage()
    }

    showEditModal.value = false
    editingPalette.value = null
  } catch (error) {
    alert('Ошибка при разборе цветов. Убедитесь, что каждый цвет начинается с #')
  }
}

// Отмена редактирования
const cancelEdit = () => {
  showEditModal.value = false
  editingPalette.value = null
}

// Загрузка палитры
const loadPalette = (palette) => {
  emit('loadPalette', palette.colors)
  alert(`Палитра "${palette.name}" загружена!`)
}

// Удаление палитры
const deletePalette = (id) => {
  if (confirm('Удалить эту палитру?')) {
    savedPalettes.value = savedPalettes.value.filter(p => p.id !== id)
    saveToLocalStorage()
  }
}

// Добавление/удаление из избранного
const toggleFavorite = (id) => {
  const palette = savedPalettes.value.find(p => p.id === id)
  if (palette) {
    palette.favorite = !palette.favorite
    saveToLocalStorage()
  }
}

// Фильтрация по тегам
const toggleTagFilter = (tag) => {
  const index = tagFilters.value.indexOf(tag)
  if (index === -1) {
    tagFilters.value.push(tag)
  } else {
    tagFilters.value.splice(index, 1)
  }
}

// Форматирование даты
const formatDate = (dateString, forName = false) => {
  const date = new Date(dateString)
  if (forName) {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\./g, '-')
  }
  return date.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Сохранение в localStorage
const saveToLocalStorage = () => {
  localStorage.setItem('palette-library', JSON.stringify(savedPalettes.value))
}

// Загрузка из localStorage
const loadFromLocalStorage = () => {
  const saved = localStorage.getItem('palette-library')
  if (saved) {
    try {
      savedPalettes.value = JSON.parse(saved)
    } catch (error) {
      savedPalettes.value = []
    }
  }
}

// Инициализация
onMounted(() => {
  loadFromLocalStorage()
})
</script>

<style scoped>
    .library-manager {
        margin-top: 2rem;
    }

    .library-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

        .library-header h2 {
            margin: 0;
            font-size: 1.8rem;
        }

    .library-filters {
        margin-bottom: 2rem;
    }

    .search-box {
        position: relative;
        margin-bottom: 1rem;
    }

    .search-input {
        width: 100%;
        padding: 0.75rem 1rem 0.75rem 2.5rem;
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 25px;
        background: rgba(255, 255, 255, 0.8);
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
    }

    .search-icon {
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        opacity: 0.5;
    }

    .filter-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .tag-btn {
        padding: 0.4rem 0.8rem;
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(44, 44, 44, 0.1);
        border-radius: 15px;
        font-family: 'Space Mono', monospace;
        font-size: 0.8rem;
        cursor: pointer;
        transition: all 0.2s ease;
    }

        .tag-btn:hover {
            background: rgba(44, 44, 44, 0.1);
        }

        .tag-btn.active {
            background: #2C2C2C;
            color: white;
            border-color: #2C2C2C;
        }

    /* Сетка палитр */
    .palette-library {
        min-height: 300px;
    }

    .empty-library {
        text-align: center;
        padding: 3rem;
        color: #666;
        font-style: italic;
    }

    .palette-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .library-item {
        background: rgba(255, 255, 255, 0.6);
        border: 1px solid rgba(44, 44, 44, 0.1);
        border-radius: 15px;
        padding: 1.25rem;
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

        .library-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }

        .library-item.favorite {
            border-color: #ffc107;
            background: rgba(255, 193, 7, 0.05);
        }

            .library-item.favorite::before {
                content: '★';
                position: absolute;
                top: 10px;
                right: 10px;
                color: #ffc107;
                font-size: 1.2rem;
            }

    .item-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

        .item-header h3 {
            margin: 0;
            font-size: 1.1rem;
            flex: 1;
        }

    .item-actions {
        display: flex;
        gap: 0.25rem;
    }

    .fav-btn, .edit-btn, .load-btn, .delete-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 0.25rem;
        font-size: 1rem;
        opacity: 0.6;
        transition: opacity 0.2s ease;
    }

        .fav-btn:hover, .edit-btn:hover, .load-btn:hover, .delete-btn:hover {
            opacity: 1;
        }

    .fav-btn {
        color: #ffc107;
    }

    .edit-btn {
        color: #007bff;
    }

    .load-btn {
        color: #28a745;
    }

    .delete-btn {
        color: #dc3545;
    }

    .item-colors {
        display: flex;
        height: 40px;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
        border: 1px solid rgba(0,0,0,0.1);
    }

    .mini-color {
        flex: 1;
        transition: flex 0.3s ease;
    }

        .mini-color:hover {
            flex: 2;
        }

    .item-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .item-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
    }

    .mini-tag {
        padding: 0.15rem 0.5rem;
        background: rgba(44, 44, 44, 0.1);
        border-radius: 10px;
        font-size: 0.7rem;
        color: #666;
    }

    .item-date {
        font-size: 0.75rem;
        color: #999;
    }

    /* Модальные окна */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .modal-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

        .form-group label {
            font-family: 'Space Mono', monospace;
            font-weight: bold;
            font-size: 0.9rem;
        }

    .form-input, .form-textarea {
        padding: 0.75rem;
        border: 1px solid rgba(44, 44, 44, 0.2);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.8);
        font-family: 'Space Mono', monospace;
        font-size: 0.9rem;
    }

    .form-textarea {
        resize: vertical;
        min-height: 100px;
    }

    .preview-colors {
        display: flex;
        height: 40px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.1);
    }

    .preview-color {
        flex: 1;
    }

    .modal-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

        .modal-actions .art-btn {
            min-width: 120px;
        }

    .art-btn.cancel {
        background: rgba(44, 44, 44, 0.1);
        color: #2C2C2C;
    }

    /* Адаптивность */
    @media (max-width: 768px) {
        .palette-grid {
            grid-template-columns: 1fr;
        }

        .library-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
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
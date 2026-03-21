<template>
  <div class="collections-section">
    <div class="collections-header">
      <h2>Категорії</h2>
    </div>

    <div class="collections-list">
      <div
        v-for="cat in categories"
        :key="cat.id"
        class="collection-item"
        :class="{ selected: selectedCategoryId === cat.id }"
        @click="$emit('select', cat.id)"
      >
        <div class="collection-thumb">
          <img v-if="cat.image" :src="cat.image" :alt="cat.name || cat.id" />
          <div v-else class="collection-thumb-placeholder" />
        </div>
        <div class="collection-info">
          <p class="collection-name">{{ cat.name || cat.id }}</p>
          <p class="collection-location" v-if="cat.description">{{ cat.description }}</p>
        </div>
        <div class="collection-actions">
          <NavButton
            label="обкладинка"
            variant="edit"
            :disabled="isSaving || uploadingCategoryId === cat.id"
            @click.stop="$emit('setCover', cat.id)"
          />
          <span v-if="uploadingCategoryId === cat.id" class="uploading-text">Завантаження...</span>
          <NavButton
            label="видалити"
            variant="delete"
            :disabled="isSaving"
            @click.stop="$emit('delete', cat.id)"
          />
          <NavButton
            label="редагувати"
            variant="edit"
            :disabled="isSaving"
            @click.stop="$emit('edit', cat.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavButton from '@/components/NavButton.vue'

export default {
  name: 'AdminCategoryList',
  components: { NavButton },
  props: {
    categories: {
      type: Array,
      default: () => []
    },
    selectedCategoryId: {
      type: String,
      default: ''
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    uploadingCategoryId: {
      type: String,
      default: ''
    }
  }
}
</script>

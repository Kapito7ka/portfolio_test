<template>
  <div class="collections-section">
    <div class="collections-header">
      <h2>Колекції до категорії</h2>
      <NavButton label="+" variant="add" @click="$emit('toggleNew')" />
    </div>

    <div class="collections-list">
      <div
        v-for="collection in collections"
        :key="collection.id"
        class="collection-item"
        :class="{ selected: selectedCollectionId === collection.id }"
        @click="$emit('select', collection.id)"
      >
        <div class="collection-info">
          <p class="collection-name">{{ collection.name }}</p>
          <p class="collection-location" v-if="collection.location">{{ collection.location }}</p>
        </div>
        <div class="collection-actions">
          <NavButton
            label="видалити"
            variant="delete"
            :disabled="isSaving"
            @click.stop="$emit('delete', collection.id)"
          />
          <NavButton
            label="редагувати"
            variant="edit"
            :disabled="isSaving"
            @click.stop="$emit('edit', collection.id)"
          />
          <NavButton
            label="додати фото"
            variant="add"
            :disabled="isSaving || uploadingCollectionId === collection.id"
            @click.stop="$emit('addPhotos', collection.id)"
          />
          <NavButton
            label="обл. колекції"
            variant="edit"
            :disabled="isSaving || uploadingCollectionId === collection.id"
            @click.stop="$emit('setCollectionCover', collection.id)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavButton from '@/components/NavButton.vue'

export default {
  name: 'AdminCollectionList',
  components: { NavButton },
  props: {
    collections: {
      type: Array,
      default: () => []
    },
    selectedCollectionId: {
      type: String,
      default: ''
    },
    isSaving: {
      type: Boolean,
      default: false
    },
    uploadingCollectionId: {
      type: String,
      default: ''
    }
  }
}
</script>

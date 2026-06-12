<script setup>
import { computed, defineEmits, onMounted, onUnmounted, ref, watch } from 'vue'
import BaseImage from '@/components/BaseImage.vue'

const emit = defineEmits(['loadMore'])

const props = defineProps({
  photos: {
    type: Array,
    default: () => []
  },
  fallbackImage: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  photoOffset: {
    type: Number,
    default: 0
  },
  totalPhotos: {
    type: Number,
    default: 0
  }
})

const selectedPhotoIndex = ref(-1)
const pendingNext = ref(false)

const selectedPhoto = computed(() => {
  return selectedPhotoIndex.value >= 0 && selectedPhotoIndex.value < props.photos.length
    ? props.photos[selectedPhotoIndex.value]
    : null
})

const displayedPhotoIndex = computed(() => selectedPhotoIndex.value + 1 + props.photoOffset)
const totalPhotoCount = computed(() => props.totalPhotos || props.photos.length)

const isLastDisplayedPhoto = computed(() => selectedPhotoIndex.value === props.photos.length - 1)
const hasMoreOutside = computed(() => props.photoOffset + props.photos.length < totalPhotoCount.value)
const hasPrev = computed(() => selectedPhotoIndex.value > 0)
const hasNext = computed(() => selectedPhotoIndex.value >= 0 && (selectedPhotoIndex.value < props.photos.length - 1 || hasMoreOutside.value))

watch(
  () => props.photos.length,
  (newLen, oldLen) => {
    if (pendingNext.value && newLen > oldLen) {
      selectedPhotoIndex.value = oldLen
      pendingNext.value = false
      return
    }

    if (selectedPhotoIndex.value >= newLen) {
      selectedPhotoIndex.value = Math.max(newLen - 1, 0)
    }
  }
)

const openPhoto = (index) => {
  if (props.photos[index]?.url) {
    selectedPhotoIndex.value = index
  }
}

const closeModal = () => {
  selectedPhotoIndex.value = -1
}

const prevPhoto = () => {
  if (hasPrev.value) {
    selectedPhotoIndex.value -= 1
  }
}

const nextPhoto = () => {
  if (!hasNext.value) return

  if (selectedPhotoIndex.value < props.photos.length - 1) {
    selectedPhotoIndex.value += 1
    return
  }

  if (isLastDisplayedPhoto.value && hasMoreOutside.value) {
    pendingNext.value = true
    emit('loadMore')
  }
}

const onKeydown = (event) => {
  if (selectedPhotoIndex.value < 0) return
  if (event.key === 'ArrowLeft') {
    prevPhoto()
  } else if (event.key === 'ArrowRight') {
    nextPhoto()
  } else if (event.key === 'Escape') {
    closeModal()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="collection-gallery">
    <div v-if="photos.length" class="gallery-grid">
      <button
        v-for="(p, idx) in photos"
        :key="p.fileName || p.url || idx"
        type="button"
        class="gallery-thumb"
        @click="openPhoto(idx)"
        :aria-label="`Відкрити фото ${idx + 1}`"
      >
        <BaseImage :src="p.url" :alt="name" />
      </button>
    </div>

    <div v-else class="collection-gallery__empty">
      <BaseImage v-if="fallbackImage" :src="fallbackImage" :alt="name" />
      <p v-else>Фото ще не додані.</p>
    </div>

    <div v-if="selectedPhoto" class="photo-modal" @click="closeModal">
      <div class="photo-modal__content" @click.stop>
        <button
          v-if="hasPrev"
          type="button"
          class="photo-modal__nav photo-modal__nav--prev"
          @click="prevPhoto"
          aria-label="Попереднє фото"
        >
          ←
        </button>

        <img
          :src="selectedPhoto.url"
          :alt="name"
          class="photo-modal__image"
        />

        <button
          v-if="hasNext"
          type="button"
          class="photo-modal__nav photo-modal__nav--next"
          @click="nextPhoto"
          aria-label="Наступне фото"
        >
          →
        </button>

        <button
          type="button"
          class="photo-modal__close"
          @click="closeModal"
          aria-label="Закрити"
        >
          ✕
        </button>

        <div class="photo-modal__meta">
          {{ displayedPhotoIndex }} / {{ totalPhotoCount }}
        </div>
      </div>
    </div>
  </div>
</template>

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
    <div v-if="photos.length" class="grid gallery-grid">
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

    <div v-else>
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

<style scoped>
.collection-gallery {
  margin-top: 20px;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(220px, auto);
  grid-auto-flow: dense;
  gap: 18px;
}

.gallery-thumb:nth-child(1),
.gallery-thumb:nth-child(3) {
  grid-row: span 2;
}

@media (max-width: 1024px) {
  .gallery-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .gallery-thumb:nth-child(1),
  .gallery-thumb:nth-child(3) {
    grid-row: span 1;
  }
}

@media (max-width: 640px) {
  .gallery-grid {
    grid-template-columns: 1fr;
  }
}

.gallery-thumb {
  border: none;
  background: transparent;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  display: block;
}

.gallery-thumb:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.12);
}

.gallery-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.photo-modal {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.photo-modal__content {
  position: relative;
  width: 100%;
  max-width: 1200px;
  max-height: 92vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-modal__image {
  width: 100%;
  max-height: 92vh;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 28px 100px rgba(0, 0, 0, 0.45);
}

.photo-modal__nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(6px);
}

.photo-modal__nav--prev {
  left: 16px;
}

.photo-modal__nav--next {
  right: 16px;
}

.photo-modal__close {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  font-size: 1rem;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.photo-modal__meta {
  position: absolute;
  bottom: 18px;
  left: 50%;
  transform: translateX(-50%);
  color: #fff;
  font-size: 0.92rem;
  letter-spacing: 0.06em;
}
</style>


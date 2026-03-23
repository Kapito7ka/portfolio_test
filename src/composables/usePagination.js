import { ref, computed, watch } from 'vue'

export function usePagination(items, perPage = 20) {
  const currentPage = ref(1)

  const totalPages = computed(() => {
    return Math.ceil((items.value?.length || 0) / perPage)
  })

  const paginatedItems = computed(() => {
    const start = (currentPage.value - 1) * perPage
    const end = start + perPage
    return (items.value || []).slice(start, end)
  })

  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++
    }
  }

  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--
    }
  }

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  // скидання при зміні даних
  watch(items, () => {
    currentPage.value = 1
  })

  const reset = () => {
    currentPage.value = 1
  }

  return {
    currentPage,
    totalPages,
    paginatedItems,
    nextPage,
    prevPage,
    goToPage,
    reset
  }
}
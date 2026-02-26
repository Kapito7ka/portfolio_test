import { createClient } from '@supabase/supabase-js'

// Підключення через змінні оточення
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL або ключ не встановлені')
}

// Клієнт Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// --- Функція завантаження фото ---
export async function uploadPhoto(file) {
  if (!file) return null
  const fileName = `${Date.now()}_${file.name}`

  // Завантаження файлу
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Помилка завантаження:', uploadError.message) // Виводимо текст помилки
    return null
  }

  // Отримання URL (ОДИН раз оголошуємо змінні)
  const { data } = supabase.storage.from('photos').getPublicUrl(fileName)
  
  return { 
    publicUrl: data.publicUrl, 
    fileName: fileName 
  }
}

// --- Функція видалення фото ---
export async function deletePhoto(fileName) {
  const { data, error } = await supabase.storage
    .from('photos')
    .remove([fileName])

  if (error) {
    console.error('Помилка видалення:', error)
    return false
  }
  return true
}

// --- Функція отримання публічного URL за назвою файлу ---
export function getPhotoUrl(fileName) {
  const { publicUrl } = supabase.storage.from('photos').getPublicUrl(fileName)
  return publicUrl
}
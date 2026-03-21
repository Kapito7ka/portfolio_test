import { createClient } from '@supabase/supabase-js'

// Підключення через змінні оточення
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL або ключ не встановлені')
}

// Клієнт Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

const generateSafeFileName = (originalName) => {
  const name = typeof originalName === 'string' ? originalName : 'file'
  const parts = name.split('.')
  const rawExt = parts.length > 1 ? parts.pop() : 'jpg'
  const ext = (rawExt || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'

  const timestamp = Date.now()
  const random = Math.random().toString(36).slice(2, 8)

  return `${timestamp}_${random}.${ext}`
}

// --- Функція завантаження фото категорії/колекції ---
export async function uploadPhoto(file, categoryId, collectionId) {
  if (!file || !categoryId || !collectionId) return null

  const safeCategory = categoryId.replace(/[^a-z0-9-_]/gi, '')
  const safeCollection = collectionId.replace(/[^a-z0-9-_]/gi, '')

  const safeName = generateSafeFileName(file.name)
  const fileName = `${safeCategory}/${safeCollection}/photos/${safeName}`

  // Завантаження файлу
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Помилка завантаження:', uploadError.message) // Виводимо текст помилки
    return null
  }

  // Отримання URL
  const { data } = supabase.storage.from('photos').getPublicUrl(fileName)
  
  return {
    publicUrl: data.publicUrl,
    fileName: fileName
  }
}

// --- Функція завантаження обкладинки категорії ---
export async function uploadCategoryCover(file, categoryId) {
  if (!file || !categoryId) return null

  const safeCategory = categoryId.replace(/[^a-z0-9-_]/gi, '')
  const safeName = generateSafeFileName(file.name)
  const fileName = `${safeCategory}/cover/${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Помилка завантаження:', uploadError.message)
    return null
  }

  const { data } = supabase.storage.from('photos').getPublicUrl(fileName)

  return {
    publicUrl: data.publicUrl,
    fileName: fileName
  }
}

// --- Функція завантаження обкладинки колекції ---
export async function uploadCollectionCover(file, categoryId, collectionId) {
  if (!file || !categoryId || !collectionId) return null

  const safeCategory = categoryId.replace(/[^a-z0-9-_]/gi, '')
  const safeCollection = collectionId.replace(/[^a-z0-9-_]/gi, '')
  const safeName = generateSafeFileName(file.name)
  const fileName = `${safeCategory}/${safeCollection}/cover/${safeName}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('photos')
    .upload(fileName, file)

  if (uploadError) {
    console.error('Помилка завантаження:', uploadError.message)
    return null
  }

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
// LOGIN
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    throw error
  }

  return data
}

// LOGOUT
export async function logout() {
  await supabase.auth.signOut()
}

// GET USER
export async function getUser() {
  const { data } = await supabase.auth.getUser()
  return data.user
}
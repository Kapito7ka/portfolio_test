import { db } from '@/firebase'
import { collection, deleteField, deleteDoc, doc, getDoc, getDocs, updateDoc, setDoc } from 'firebase/firestore'

export const getCollections = async () => {
  const categoriesSnapshot = await getDocs(collection(db, 'categories'))
  const allCollections = []
  
  categoriesSnapshot.forEach(catDoc => {
    const catId = catDoc.id
    const catData = catDoc.data() || {}
    const catName = catData.name
    const collections = catData.collections || {}
    
    Object.entries(collections).forEach(([colId, colValue]) => {
      if (!colValue) return
      allCollections.push({
        id: `${catId}_${colId}`,
        categoryId: catId,
        collectionId: colId,
        categoryName: catName,
        ...colValue,
      })
    })
  })
  
  return allCollections
}

/** Підтримка рядка або об'єкта фото (url / publicUrl / src — як у адмінці). */
const resolvePhotoRef = (p) => {
  if (typeof p === 'string') return p.trim()
  if (p && typeof p === 'object') {
    const u = p.url || p.publicUrl || p.src || ''
    return typeof u === 'string' ? u.trim() : ''
  }
  return ''
}

const firstCollectionCoverFromMap = (collections) => {
  for (const col of Object.values(collections || {})) {
    if (!col) continue
    const cover = typeof col.image === 'string' ? col.image.trim() : ''
    if (cover) return cover
    if (Array.isArray(col.photos) && col.photos.length) {
      const u = resolvePhotoRef(col.photos[0])
      if (u) return u
    }
  }
  return ''
}

export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, 'categories'))
  const out = []
  snapshot.forEach((d) => {
    const data = d.data() || {}
    const collections = data.collections || {}
    const categoryCover = typeof data.image === 'string' ? data.image.trim() : ''
    const image = categoryCover || firstCollectionCoverFromMap(collections)
    out.push({ id: d.id, ...data, image: image || '' })
  })
  return out
}

export const getCategory = async (categoryId) => {
  if (!categoryId) return null
  const snap = await getDoc(doc(db, 'categories', categoryId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() || {}) }
}

export const createCategory = async ({ id, name, description }) => {
  const trimmedId = (id || '').trim()
  if (!trimmedId) return { ok: false, reason: 'empty_id' }
  try {
    const ref = doc(db, 'categories', trimmedId)
    const snap = await getDoc(ref)
    if (snap.exists()) {
      return { ok: false, reason: 'exists' }
    }

    await setDoc(ref, {
      name: name || trimmedId,
      description: description || '',
      collections: {}
    })

    return { ok: true }
  } catch (error) {
    console.error('Firestore error (createCategory):', error)
    return { ok: false, reason: 'error' }
  }
}

export const getCollection = async (categoryId, collectionId) => {
  const category = await getCategory(categoryId)
  if (!category) return null
  const collections = category.collections || {}
  const col = collections?.[collectionId]
  if (!col) return null
  return {
    id: `${categoryId}_${collectionId}`,
    categoryId,
    collectionId,
    categoryName: category.name,
    ...col
  }
}

export const setCollectionPhotos = async (categoryId, collectionId, photos) => {
  if (!categoryId || !collectionId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    await updateDoc(ref, {
      [`collections.${collectionId}.photos`]: Array.isArray(photos) ? photos : []
    })
    return true
  } catch (error) {
    console.error('Firestore error (setCollectionPhotos):', error)
    return false
  }
}

export const setCollectionData = async (categoryId, collectionId, data) => {
  if (!categoryId || !collectionId || !data) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    await updateDoc(ref, {
      [`collections.${collectionId}`]: data
    })
    return true
  } catch (error) {
    console.error('Firestore error (setCollectionData):', error)
    return false
  }
}

export const setCollectionCoverImage = async (categoryId, collectionId, imageUrl, coverFileName) => {
  if (!categoryId || !collectionId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    const data = {
      [`collections.${collectionId}.image`]: imageUrl || ''
    }
    if (typeof coverFileName !== 'undefined') {
      data[`collections.${collectionId}.coverFileName`] = coverFileName || ''
    }
    await updateDoc(ref, data)
    return true
  } catch (error) {
    console.error('Firestore error (setCollectionCoverImage):', error)
    return false
  }
}

export const setCategoryCoverImage = async (categoryId, imageUrl, coverFileName) => {
  if (!categoryId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    const data = {
      image: imageUrl || ''
    }
    if (typeof coverFileName !== 'undefined') {
      data.coverFileName = coverFileName || ''
    }
    await updateDoc(ref, data)
    return true
  } catch (error) {
    console.error('Firestore error (setCategoryCoverImage):', error)
    return false
  }
}

export const updateCollection = async (categoryId, collectionId, updates) => {
  if (!categoryId || !collectionId || !updates) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    const updateObj = {}
    Object.keys(updates).forEach(key => {
      updateObj[`collections.${collectionId}.${key}`] = updates[key]
    })
    await updateDoc(ref, updateObj)
    return true
  } catch (error) {
    console.error('Firestore error (updateCollection):', error)
    return false
  }
}

export const deleteCategory = async (categoryId) => {
  if (!categoryId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    await deleteDoc(ref)
    return true
  } catch (error) {
    console.error('Firestore error (deleteCategory):', error)
    return false
  }
}

export const deleteCollection = async (categoryId, collectionId) => {
  if (!categoryId || !collectionId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    await updateDoc(ref, {
      [`collections.${collectionId}`]: deleteField()
    })
    return true
  } catch (error) {
    console.error('Firestore error (deleteCollection):', error)
    return false
  }
}

const INSTAGRAM_SPOTLIGHTS_DOC = ['app_config', 'instagram_spotlights']

const emptyInstagramSlots = () => [
  { imageUrl: '', postUrl: '', fileName: '' },
  { imageUrl: '', postUrl: '', fileName: '' },
  { imageUrl: '', postUrl: '', fileName: '' }
]

/** До трьох елементів: превʼю та посилання на пост Instagram */
export const getInstagramSpotlights = async () => {
  try {
    const snap = await getDoc(doc(db, ...INSTAGRAM_SPOTLIGHTS_DOC))
    if (!snap.exists()) return emptyInstagramSlots()
    const raw = snap.data()?.items
    if (!Array.isArray(raw)) return emptyInstagramSlots()
    const normalized = raw
      .slice(0, 3)
      .map((it) => ({
        imageUrl: String(it?.imageUrl || '').trim(),
        postUrl: String(it?.postUrl || '').trim(),
        fileName: String(it?.fileName || '').trim()
      }))
    while (normalized.length < 3) {
      normalized.push({ imageUrl: '', postUrl: '', fileName: '' })
    }
    return normalized
  } catch (error) {
    console.error('Firestore error (getInstagramSpotlights):', error)
    return emptyInstagramSlots()
  }
}

export const saveInstagramSpotlights = async (items) => {
  try {
    const cleaned = (Array.isArray(items) ? items : []).slice(0, 3).map((it) => ({
      imageUrl: String(it?.imageUrl || '').trim(),
      postUrl: String(it?.postUrl || '').trim(),
      fileName: String(it?.fileName || '').trim()
    }))
    while (cleaned.length < 3) {
      cleaned.push({ imageUrl: '', postUrl: '', fileName: '' })
    }
    await setDoc(doc(db, ...INSTAGRAM_SPOTLIGHTS_DOC), { items: cleaned }, { merge: true })
    return true
  } catch (error) {
    console.error('Firestore error (saveInstagramSpotlights):', error)
    return false
  }
}


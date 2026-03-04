import { db } from '@/firebase'
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore'

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

export const getCategories = async () => {
  const snapshot = await getDocs(collection(db, 'categories'))
  const out = []
  snapshot.forEach((d) => {
    const data = d.data() || {}
    const collections = data.collections || {}
    const firstCol = Object.values(collections).find((c) => c && (c.image || (c.photos && c.photos[0])))
    const image = data.image || (firstCol && (firstCol.image || (firstCol.photos && firstCol.photos[0] && (typeof firstCol.photos[0] === 'string' ? firstCol.photos[0] : firstCol.photos[0]?.url))))
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

export const setCollectionCoverImage = async (categoryId, collectionId, imageUrl) => {
  if (!categoryId || !collectionId) return false
  try {
    const ref = doc(db, 'categories', categoryId)
    await updateDoc(ref, {
      [`collections.${collectionId}.image`]: imageUrl || ''
    })
    return true
  } catch (error) {
    console.error('Firestore error (setCollectionCoverImage):', error)
    return false
  }
}

import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'

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
        categoryName: catName,
        ...colValue,
      })
    })
  })
  
  return allCollections
}

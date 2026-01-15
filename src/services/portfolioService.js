import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
export const getCollections = async () => {
  const snapshot = await getDocs(collection(db, 'collections'))
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }))
}

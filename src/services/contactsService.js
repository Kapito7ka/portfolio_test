import { db } from '@/firebase'
import { collection, getDocs } from 'firebase/firestore'
export const getContacts = async () => {
  const snapshot = await getDocs(collection(db, 'contacts'))
  if (!snapshot.empty) {
    return snapshot.docs[0].data()
  }
  return null
}

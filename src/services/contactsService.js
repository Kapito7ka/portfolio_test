import { rtdb } from '@/firebase'
import { ref, child, get } from 'firebase/database'
export const getContacts = async () => {
  try {
    const dbRef = ref(rtdb)
    const snapshot = await get(child(dbRef, 'contacts/main'))
    if (snapshot.exists()) {
      return snapshot.val()
    }
    return null
  } catch (error) {
    console.error('Database error:', error)//помилка бд
    return null
  }
}

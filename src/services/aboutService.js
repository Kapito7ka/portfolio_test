import { db } from '@/firebase'
import { doc, getDoc } from 'firebase/firestore'

export async function getAbout() {
  const aboutRef = doc(db, 'about_us', 'main')
  const snap = await getDoc(aboutRef)

  if (!snap.exists()) return null

  const data = snap.data()

  return {
    name: data.full_name?.ua || '',
    description: data.description?.ua || '',
    image: data.image || null
  }
}

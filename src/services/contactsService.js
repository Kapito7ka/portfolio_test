export const getContacts = async () => {
  try {
    const { db } = await import('@/firebase')
    const { doc, getDoc } = await import('firebase/firestore')

    const docRef = doc(db, 'contacts', 'main')
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) return docSnap.data()
    return null
  } catch (error) {
    console.error('Firestore error:', error)
    return null
  }
}

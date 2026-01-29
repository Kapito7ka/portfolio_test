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

export const setContactField = async (key, value) => {
  try {
    const { db } = await import('@/firebase')
    const { doc, setDoc } = await import('firebase/firestore')

    const docRef = doc(db, 'contacts', 'main')
    await setDoc(docRef, { [key]: value }, { merge: true })
    return true
  } catch (error) {
    console.error('Firestore error (setContactField):', error)
    return false
  }
}

export const deleteContactField = async (key) => {
  try {
    const { db } = await import('@/firebase')
    const { doc, updateDoc, deleteField } = await import('firebase/firestore')

    const docRef = doc(db, 'contacts', 'main')
    await updateDoc(docRef, { [key]: deleteField() })
    return true
  } catch (error) {
    console.error('Firestore error (deleteContactField):', error)
    return false
  }
}

export const normalizeContactEntries = (contacts) => {
  if (!contacts) return []
  return Object.entries(contacts)
    .filter(([k, v]) => k && v !== undefined && v !== null && String(v).trim() !== '')
    .map(([k, v]) => ({ key: k, value: String(v) }))
}

export const isContactUrl = (v) => /^https?:\/\//i.test(v)


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

const GARBAGE_TOKENS = new Set(['null', 'undefined', 'none', 'nan', '-1'])

export const normalizeContactKey = (key) => (key == null ? '' : String(key).trim())

export const normalizeContactValue = (value) => (value == null ? '' : String(value).trim())

export const isValidContactKey = (key) => {
  const k = normalizeContactKey(key)
  if (!k) return false

  const lower = k.toLowerCase()
  if (GARBAGE_TOKENS.has(lower)) return false
  if (/^-?\d+(\.\d+)?$/.test(k)) return false

  return true
}

export const isValidContactValue = (value) => {
  if (value == null) return false
  if (typeof value === 'object' || typeof value === 'function') return false

  const v = normalizeContactValue(value)
  if (!v) return false

  const lower = v.toLowerCase()
  if (GARBAGE_TOKENS.has(lower)) return false

  return true
}

export const normalizeContactEntries = (contacts) => {
  if (!contacts) return []
  return Object.entries(contacts)
    .filter(([k, v]) => isValidContactKey(k) && isValidContactValue(v))
    .map(([k, v]) => ({ key: String(k), value: normalizeContactValue(v) }))
}

export const isContactUrl = (v) => /^https?:\/\//i.test(v)


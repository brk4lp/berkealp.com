import { useEffect, useState } from 'react'
import { sound } from '../lib/sound.js'

/**
 * Ses sessize-alma durumunu izler; toggle UI'ları için yeniden render tetikler.
 * Döner: [muted, toggle]
 */
export function useMuted() {
  const [muted, setMuted] = useState(sound.muted)
  useEffect(() => sound.subscribe(setMuted), [])
  return [muted, () => sound.toggleMuted()]
}

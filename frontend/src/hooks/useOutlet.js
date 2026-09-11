import { useEffect, useState } from 'react'
import { listProperties } from '../services/propertyService'

// The kitchen vertical is single-outlet for this demo; use the first property
// returned by the API as the active outlet everywhere inventory/reorder need one.
export function useOutlet() {
  const [outlet, setOutlet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    listProperties()
      .then((properties) => setOutlet(properties[0] ?? null))
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [])

  return { outlet, isLoading, error }
}

export default useOutlet

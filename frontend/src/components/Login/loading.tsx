import { Loader2 } from 'lucide-react'

export function Loading({ size = 20 }: { size?: number }) {
 return (
  <span className="flex items-center justify-center gap-2">
   <Loader2 className="animate-spin" size={size} />
  </span>
 )
}

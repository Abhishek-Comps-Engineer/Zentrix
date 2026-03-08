"use client"

import { useState } from "react"

type MediaVideoProps = {
  src: string
  className?: string
}

export function MediaVideo({ src, className }: MediaVideoProps) {
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">
        Video could not be loaded.
      </div>
    )
  }

  return (
    <video
      controls
      className={className || "w-full rounded-md border"}
      src={src}
      onError={() => setHasError(true)}
    />
  )
}


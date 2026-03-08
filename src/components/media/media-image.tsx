"use client"

/* eslint-disable @next/next/no-img-element */
import { useMemo } from "react"
import { cn } from "@/lib/utils"

const DEFAULT_FALLBACK = "/images/project-fallback.svg"

function normalizeImageSrc(src: string | null | undefined) {
  if (!src) return DEFAULT_FALLBACK
  if (src.startsWith("/") || src.startsWith("http://") || src.startsWith("https://")) {
    return src
  }
  return `/${src.replace(/^\/+/, "")}`
}

type MediaImageProps = {
  src?: string | null
  alt: string
  className?: string
  wrapperClassName?: string
  fallbackSrc?: string
  loading?: "eager" | "lazy"
}

export function MediaImage({
  src,
  alt,
  className,
  wrapperClassName,
  fallbackSrc = DEFAULT_FALLBACK,
  loading = "lazy"
}: MediaImageProps) {
  const normalizedSrc = useMemo(() => normalizeImageSrc(src), [src])

  return (
    <div className={cn("relative overflow-hidden bg-muted", wrapperClassName)}>
      <img
        src={normalizedSrc}
        alt={alt}
        loading={loading}
        className={cn("h-full w-full object-cover", className)}
        onError={(event) => {
          const target = event.currentTarget
          if (target.dataset.fallbackApplied !== "true") {
            target.dataset.fallbackApplied = "true"
            target.src = fallbackSrc
          }
        }}
      />
    </div>
  )
}

"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error("Global Error Boundary caught:", error)
    }, [error])

    return (
        <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4 px-4 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-bold tracking-tight">Something went wrong!</h2>
            <p className="max-w-[500px] text-muted-foreground">
                An unexpected error occurred while rendering this page. We have been notified about this issue.
            </p>
            <div className="flex space-x-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
            </div>
        </div>
    )
}

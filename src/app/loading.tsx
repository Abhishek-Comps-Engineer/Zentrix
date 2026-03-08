import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-8">
            <div className="space-y-4">
                <Skeleton className="h-12 w-[300px]" />
                <Skeleton className="h-4 w-[500px]" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[250px] w-full rounded-xl" />
                ))}
            </div>
        </div>
    )
}

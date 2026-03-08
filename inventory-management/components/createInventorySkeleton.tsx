import { Skeleton } from "@heroui/skeleton";

export default function CreateInventorySkeleton() {
  return (
    <div className="flex flex-col justify-center items-center gap-8 p-8">
      <div className="max-w-4xl w-full flex flex-col gap-2 border border-default shadow-md p-8 rounded-2xl">
        <Skeleton className="h-3 w-3/5 rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>

      <div className="max-w-4xl w-full flex flex-col gap-4 px-4 mt-4">
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>
      <div className="w-full max-w-4xl flex flex-col gap-4 mt-8">
        <div className="border-2 border-default rounded-2xl w-full flex flex-col gap-3 p-3">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>

        <div className="border-2 border-default rounded-2xl w-full flex flex-col gap-3 p-3">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
          <div className="h-6"></div>
        </div>
        <div className="border-2 border-default rounded-2xl w-full flex flex-col gap-3 p-3">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>
        <div className="border-2 border-default rounded-2xl w-full flex flex-col gap-3 p-3">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>

        <div className="border-2 border-default rounded-2xl w-full flex flex-col gap-3 p-3">
          <Skeleton className="h-3 w-3/5 rounded-lg" />
          <Skeleton className="h-3 w-4/5 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

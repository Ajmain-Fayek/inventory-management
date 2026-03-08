import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";

export default function ItemSkeleton() {
  return (
    <div className="flex flex-col justify-center items-center gap-8 py-8 px-4">
      <div className="max-w-3xl w-full flex flex-col gap-2 border border-default shadow-md p-8 rounded-2xl">
        <Skeleton className="h-3 w-3/5 rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>

      <div className="w-full max-w-3xl border border-default rounded-2xl shadow-md p-10 flex flex-col gap-4">
        <div className="w-full flex flex-col gap-4">
          <Skeleton className="h-3 w-4/5 rounded-lg" />
          <Divider />
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

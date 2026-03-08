import { Divider } from "@heroui/divider";
import { Skeleton } from "@heroui/skeleton";

export default function InventorySkeleton() {
  return (
    <div className="flex flex-col gap-8 py-8 px-4">
      <div className="max-w-4/6 w-full flex flex-col gap-2">
        <Skeleton className="h-3 w-3/5 rounded-lg" />
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>

      <div className="w-full flex flex-col gap-2 mt-10">
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>
      <Divider />
      <div className="w-full flex flex-col gap-2">
        <Skeleton className="h-3 w-4/5 rounded-lg" />
      </div>

      <div className="border border-default rounded-2xl shadow-md p-6 flex flex-col gap-2">
        <div className="w-full flex items-center gap-3 p-2">
          <div>
            <Skeleton className="flex rounded-md w-5 h-5" />
          </div>
          <Skeleton className="h-3 w-full rounded-lg" />
        </div>
        <div className="w-full flex items-center gap-3 p-2">
          <div>
            <Skeleton className="flex rounded-md w-5 h-5" />
          </div>
          <Skeleton className="h-3 w-full rounded-lg" />
        </div>
        <div className="w-full flex items-center gap-3 p-2">
          <div>
            <Skeleton className="flex rounded-md w-5 h-5" />
          </div>
          <Skeleton className="h-3 w-full rounded-lg" />
        </div>
        <div className="w-full flex items-center gap-3 p-2">
          <div>
            <Skeleton className="flex rounded-md w-5 h-5" />
          </div>
          <Skeleton className="h-3 w-full rounded-lg" />
        </div>
        <div className="w-full flex items-center gap-3 p-2">
          <div>
            <Skeleton className="flex rounded-md w-5 h-5" />
          </div>
          <Skeleton className="h-3 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

import { Checkbox } from "./ui/checkbox";
import { Skeleton } from "./ui/skeleton";

interface CheckboxListProps {
  title: string;
  items: string[];
  idPrefix?: string;
}

export function CheckboxList({ title, items, idPrefix }: CheckboxListProps) {
  // Use idPrefix if provided, otherwise generate from title
  const prefix = idPrefix || title.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      <h5 className="text-2xl font-bold text-neutral-900">{title}</h5>
      <div className="space-y-1 h-64 w-96 overflow-y-auto">
        {items.map((item, index) => (
          <div key={index} className="flex space-x-3">
            <Checkbox
              id={`${prefix}-${index}`}
              className="bg-neutral-50 mt-1"
            />
            <label
              htmlFor={`${prefix}-${index}`}
              className="text-base text-neutral-700 cursor-pointer font-medium"
            >
              {item}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CheckboxListSkeleton({ title }: { title: string }) {
  return (
    <div className="space-y-2">
      <h5 className="text-2xl font-bold text-neutral-900">{title}</h5>
      <div className="space-y-1 h-64 w-96 overflow-y-auto">
        {[1, 2, 3, 4, 5].map((index) => (
          <div key={index} className="flex items-center space-x-3">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}

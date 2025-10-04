import { Checkbox } from "./ui/checkbox";

interface CheckboxListProps {
  title: string;
  items: string[];
}

export function CheckboxList({ title, items }: CheckboxListProps) {
  return (
    <div className="space-y-2">
      <h5 className="text-2xl font-bold text-neutral-900">{title}</h5>
      <div className="space-y-1">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <Checkbox id={`item-${index}`} className="bg-neutral-50" />
            <label
              htmlFor={`item-${index}`}
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

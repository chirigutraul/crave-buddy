import { Card, CardContent, CardHeader } from "./ui/card";
import { Checkbox } from "./ui/checkbox";

interface CheckboxListCardProps {
  title: string;
  items: string[];
  idPrefix?: string;
  action?: React.ReactNode;
}

export function CheckboxListCard({
  title,
  items,
  idPrefix,
  action,
}: CheckboxListCardProps) {
  // Use idPrefix if provided, otherwise generate from title
  const prefix = idPrefix || title.toLowerCase().replace(/\s+/g, "-");

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader className="gap-0">
        <div className="flex items-center justify-between">
          <h5 className="font-bold text-neutral-800">{title}</h5>
          {action}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-end gap-2 cursor-pointer">
              <Checkbox id={`${prefix}-${index}`} className="mt-0.5" />
              <label
                htmlFor={`${prefix}-${index}`}
                className="text-sm text-neutral-700 cursor-pointer font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item}
              </label>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FormField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface AddAssetFormProps {
  title: string;
  description: string;
  buttonLabel: string;
  inputLabel?: string;
  inputPlaceholder?: string;
  inputValue?: string;
  fields?: FormField[];
  onInputChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AddAssetForm = ({
  title,
  description,
  buttonLabel,
  inputLabel,
  inputPlaceholder,
  inputValue,
  fields,
  onInputChange,
  onSubmit,
}: AddAssetFormProps) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 py-4">
          {inputLabel && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                {inputLabel}
              </Label>
              <Input
                id="name"
                placeholder={inputPlaceholder}
                value={inputValue}
                onChange={onInputChange}
                className="col-span-3"
              />
            </div>
          )}
          {fields?.map((field) => (
            <div key={field.name} className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor={field.name} className="text-right">
                {field.label}
              </Label>
              <Input
                id={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={field.value}
                onChange={field.onChange}
                className="col-span-3"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button type="submit">{buttonLabel}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AddAssetForm;

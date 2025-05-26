
import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Trash2 } from "lucide-react";

interface EditableSelectCellProps {
  value: string;
  options: string[];
  onUpdate: (value: string) => void;
  onAddOption?: (option: string) => void;
  onRemoveOption?: (option: string) => void;
  className?: string;
  placeholder?: string;
  createPlaceholder?: string;
}

const EditableSelectCell: React.FC<EditableSelectCellProps> = ({
  value,
  options,
  onUpdate,
  onAddOption,
  onRemoveOption,
  className,
  placeholder = "Selecionar...",
  createPlaceholder = "Adicionar novo...",
}) => {
  const [open, setOpen] = useState(false);
  const [newOption, setNewOption] = useState("");
  const [addingOption, setAddingOption] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (addingOption && inputRef.current) {
      inputRef.current.focus();
    }
  }, [addingOption]);

  const handleAddOption = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      setNewOption("");
      setAddingOption(false);
    }
  };

  const handleOptionSelect = (selectedValue: string) => {
    if (value !== selectedValue) {
      onUpdate(selectedValue);
    }
    setOpen(false);
  };

  const handleRemoveOption = (e: React.MouseEvent, optionValue: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemoveOption) {
      onRemoveOption(optionValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddOption();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setAddingOption(false);
      setNewOption("");
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between hover:bg-muted/50 h-8 px-2 py-1 w-full",
            className
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-popover border shadow-lg z-50" align="start">
        <Command>
          <CommandInput placeholder={placeholder} />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={() => handleOptionSelect(option)}
                  className="flex justify-between items-center cursor-pointer"
                >
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="truncate">{option}</span>
                    {value === option && <Check className="h-4 w-4 ml-2" />}
                  </div>
                  {onRemoveOption && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive ml-auto"
                      onClick={(e) => handleRemoveOption(e, option)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {onAddOption && (
              <>
                <CommandSeparator />
                <div className="p-2">
                  {addingOption ? (
                    <div className="flex space-x-2">
                      <Input
                        ref={inputRef}
                        value={newOption}
                        onChange={(e) => setNewOption(e.target.value)}
                        placeholder={createPlaceholder}
                        className="h-8"
                        onKeyDown={handleKeyDown}
                      />
                      <Button
                        size="sm"
                        className="h-8"
                        onClick={handleAddOption}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setAddingOption(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar opção
                    </Button>
                  )}
                </div>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export { EditableSelectCell };

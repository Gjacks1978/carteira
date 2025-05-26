import React, { useState, useRef, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  placeholder = 'Selecionar...',
  createPlaceholder = 'Nova opção...',
}) => {
  const [newOption, setNewOption] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddNewOption = () => {
    if (newOption.trim() && onAddOption) {
      onAddOption(newOption.trim());
      setNewOption('');
      setIsAdding(false);
    }
  };

  const handleRemove = (
    e: React.MouseEvent<HTMLButtonElement>,
    optionToRemove: string
  ) => {
    e.stopPropagation(); // Impede que o select feche ou selecione o item
    if (onRemoveOption) {
      onRemoveOption(optionToRemove);
    }
  };

  return (
    <Select value={value} onValueChange={onUpdate}>
      <SelectTrigger className={cn('h-8 px-2 py-1 w-full', className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <div key={option} className="flex items-center justify-between pr-2 hover:bg-accent">
            <SelectItem value={option} className="flex-grow cursor-pointer">
              {option}
            </SelectItem>
            {onRemoveOption && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 ml-1 hover:bg-destructive/10 hover:text-destructive"
                onClick={(e) => handleRemove(e, option)}
                // Adicionar onMouseDown para tentar evitar fechamento, se necessário
                onMouseDown={(e) => e.preventDefault()} 
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
        {onAddOption && (
          <div className="p-2 mt-1 border-t">
            {isAdding ? (
              <div className="flex items-center space-x-2">
                <Input
                  ref={inputRef}
                  type="text"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  placeholder={createPlaceholder}
                  className="h-8 flex-grow"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddNewOption();
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      setIsAdding(false);
                      setNewOption('');
                    }
                  }}
                />
                <Button size="sm" onClick={handleAddNewOption} className="h-8">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar opção
              </Button>
            )}
          </div>
        )}
      </SelectContent>
    </Select>
  );
};

export { EditableSelectCell };


import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface EditableCellProps {
  value: string | number;
  onUpdate: (value: string | number) => void;
  className?: string;
  type?: "text" | "number";
  placeholder?: string;
  formatter?: (value: string | number) => string;
}

const EditableCell: React.FC<EditableCellProps> = ({
  value,
  onUpdate,
  className,
  type = "text",
  placeholder = "Enter value...",
  formatter = (val) => String(val),
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | number>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleBlur = () => {
    setIsEditing(false);
    let newValue = editValue;
    
    // Convert string to number if type is number
    if (type === "number" && typeof editValue === "string") {
      const parsedValue = parseFloat(editValue);
      if (!isNaN(parsedValue)) {
        newValue = parsedValue;
      } else {
        newValue = value; // Revert to original if invalid
      }
    }
    
    if (newValue !== value) {
      onUpdate(newValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(value); // Reset to original value
    }
  };

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        type={type}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={cn("h-8 w-full min-w-[4rem] py-1", className)}
        placeholder={placeholder}
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className={cn(
        "cursor-pointer hover:bg-muted/50 p-1 rounded transition-colors",
        className
      )}
    >
      {formatter(value)}
    </div>
  );
};

export { EditableCell };

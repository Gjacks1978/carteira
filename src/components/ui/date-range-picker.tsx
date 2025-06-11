"use client"

import * as React from "react"
import { format, subMonths, subYears } from "date-fns"
import { ptBR } from 'date-fns/locale';
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "./separator"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  date: DateRange | undefined
  onDateChange: (date: DateRange | undefined) => void
}

export function DateRangePicker({ className, date, onDateChange }: DateRangePickerProps) {
  const handlePresetClick = (preset: '1m' | '3m' | '6m' | '1y' | 'all') => {
    const to = new Date();
    let from: Date | undefined;

    switch (preset) {
      case '1m':
        from = subMonths(to, 1);
        break;
      case '3m':
        from = subMonths(to, 3);
        break;
      case '6m':
        from = subMonths(to, 6);
        break;
      case '1y':
        from = subYears(to, 1);
        break;
      case 'all':
        from = undefined;
        break;
    }
    onDateChange(from ? { from, to } : undefined);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {
              date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "dd/MM/y", { locale: ptBR })} -{" "}
                    {format(date.to, "dd/MM/y", { locale: ptBR })}
                  </>
                ) : (
                  format(date.from, "dd/MM/y", { locale: ptBR })
                )
              ) : (
                <span>Selecione um período</span>
              )
            }
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="flex items-center justify-center space-x-2 p-2">
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('1m')}>1 Mês</Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('3m')}>3 Meses</Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('6m')}>6 Meses</Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('1y')}>1 Ano</Button>
            <Button variant="outline" size="sm" onClick={() => handlePresetClick('all')}>Sempre</Button>
          </div>
          <Separator />
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

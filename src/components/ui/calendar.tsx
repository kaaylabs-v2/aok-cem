import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { DayPicker, useNavigation, CaptionProps } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function CustomCaption({ displayMonth }: CaptionProps) {
  const { goToMonth, fromDate, toDate } = useNavigation();
  const [monthOpen, setMonthOpen] = React.useState(false);
  const [yearOpen, setYearOpen] = React.useState(false);
  const currentYear = displayMonth.getFullYear();
  const currentMonth = displayMonth.getMonth();

  const fromYear = fromDate ? fromDate.getFullYear() : currentYear - 10;
  const toYear = toDate ? toDate.getFullYear() : currentYear + 10;

  const yearListRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (yearOpen && yearListRef.current) {
      const el = yearListRef.current.querySelector<HTMLButtonElement>(`[data-year="${currentYear}"]`);
      el?.scrollIntoView({ block: "center" });
    }
  }, [yearOpen, currentYear]);

  const years: number[] = [];
  for (let y = fromYear; y <= toYear; y++) years.push(y);

  const pick = (m: number, y: number) => {
    const d = new Date(displayMonth);
    d.setFullYear(y, m, 1);
    goToMonth(d);
  };

  return (
    <div className="flex items-center justify-center gap-2 pt-1">
      {/* Month pill */}
      <Popover open={monthOpen} onOpenChange={setMonthOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-sm font-medium hover:bg-secondary transition-colors"
          >
            {displayMonth.toLocaleString("en-US", { month: "long" })}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[220px] p-2" align="center">
          <div className="grid grid-cols-3 gap-1">
            {MONTHS_SHORT.map((m, i) => {
              const selected = i === currentMonth;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => { pick(i, currentYear); setMonthOpen(false); }}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-foreground/80",
                  )}
                >
                  {m}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Year pill */}
      <Popover open={yearOpen} onOpenChange={setYearOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-full bg-secondary/60 px-3 py-1 text-sm font-medium hover:bg-secondary transition-colors"
          >
            {currentYear}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-2" align="center">
          <div ref={yearListRef} className="grid max-h-[220px] grid-cols-3 gap-1 overflow-y-auto pr-1">
            {years.map((y) => {
              const selected = y === currentYear;
              return (
                <button
                  key={y}
                  data-year={y}
                  type="button"
                  onClick={() => { pick(currentMonth, y); setYearOpen(false); }}
                  className={cn(
                    "rounded-lg px-2 py-2 text-xs font-medium tabular-nums transition-colors",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent text-foreground/80",
                  )}
                >
                  {y}
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        vhidden: "sr-only",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption,
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };

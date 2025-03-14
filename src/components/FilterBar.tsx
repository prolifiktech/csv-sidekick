
import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { ColumnFilter } from "./Dashboard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface FilterBarProps {
  columns: string[];
  onFilterChange: (filters: ColumnFilter[]) => void;
  onSearchChange: (search: string) => void;
  searchTerm: string;
}

const FilterBar: React.FC<FilterBarProps> = ({
  columns,
  onFilterChange,
  onSearchChange,
  searchTerm,
}) => {
  const [columnFilters, setColumnFilters] = useState<ColumnFilter[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);

  // Preset filters for quick selection
  const presetFilters = [
    { name: "Non-empty values", filter: (column: string) => ({ column, value: "[^]" }) },
    { name: "Empty values", filter: (column: string) => ({ column, value: "^$" }) },
    { name: "Numeric values", filter: (column: string) => ({ column, value: "^[0-9]" }) },
  ];

  const addFilter = () => {
    if (selectedColumn && filterValue) {
      const newFilter = {
        column: selectedColumn,
        value: filterValue,
      };
      
      const updatedFilters = [...columnFilters, newFilter];
      setColumnFilters(updatedFilters);
      onFilterChange(updatedFilters);
      
      setSelectedColumn("");
      setFilterValue("");
      setIsOpen(false);
    }
  };

  const removeFilter = (index: number) => {
    const updatedFilters = columnFilters.filter((_, i) => i !== index);
    setColumnFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  const clearAllFilters = () => {
    setColumnFilters([]);
    onFilterChange([]);
  };

  const applyPresetFilter = (columnName: string, presetIndex: number) => {
    if (!columnName) return;
    
    const filter = presetFilters[presetIndex].filter(columnName);
    const updatedFilters = [...columnFilters, filter];
    setColumnFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search in all columns..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 w-full"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter button - only shown if we have columns to filter on */}
        {columns.length > 0 && (
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span>Filter</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="space-y-4">
                <h3 className="font-medium">Add Filter</h3>
                <div className="space-y-2">
                  <Select
                    value={selectedColumn}
                    onValueChange={setSelectedColumn}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {columns.map((column) => (
                          <SelectItem key={column} value={column}>
                            {column}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Input
                    type="text"
                    placeholder="Filter value"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                  />

                  <div className="pt-2">
                    <Button 
                      onClick={addFilter} 
                      disabled={!selectedColumn || !filterValue}
                      className="w-full"
                    >
                      Add Filter
                    </Button>
                  </div>
                </div>

                {selectedColumn && (
                  <div className="border-t pt-2">
                    <h4 className="text-sm font-medium mb-2">Quick Filters for "{selectedColumn}"</h4>
                    <div className="flex flex-wrap gap-2">
                      {presetFilters.map((preset, idx) => (
                        <Badge
                          key={idx}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => applyPresetFilter(selectedColumn, idx)}
                        >
                          {preset.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters */}
      {columnFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-gray-500">Filters:</span>
          {columnFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1"
            >
              <span className="font-medium">{filter.column}:</span>
              <span className="max-w-[100px] overflow-hidden text-ellipsis">
                {filter.value}
              </span>
              <button
                onClick={() => removeFilter(index)}
                className="ml-1 hover:text-gray-700"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {columnFilters.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs h-7"
            >
              Clear All
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;

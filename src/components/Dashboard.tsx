
import { useState } from "react";
import FileDropZone from "./FileDropZone";
import FilterBar from "./FilterBar";
import DataTable from "./DataTable";
import WorkflowProcessor from "./WorkflowProcessor";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";

// Define the expected data structure
export type DataRow = Record<string, string | number | boolean | null>;
export type ColumnFilter = {
  column: string;
  value: string;
};

const Dashboard = () => {
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<ColumnFilter[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showWorkflow, setShowWorkflow] = useState(false);

  const handleFileUpload = (fileData: DataRow[], headers: string[]) => {
    setData(fileData);
    setColumns(headers);
    setFilters([]);
    toast.success("File uploaded successfully!");
    setShowWorkflow(true);
  };

  const handleFilterChange = (newFilters: ColumnFilter[]) => {
    setFilters(newFilters);
  };

  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  const filteredData = data.filter((row) => {
    // Apply column filters
    const passesColumnFilters = filters.every((filter) => {
      if (!filter.value) return true;
      const cellValue = String(row[filter.column] || "").toLowerCase();
      return cellValue.includes(filter.value.toLowerCase());
    });

    // Apply search term
    const passesSearch = searchTerm
      ? Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      : true;

    return passesColumnFilters && passesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">CSV Manager</h1>
        <p className="text-gray-600 mt-2">
          Upload and process CSV and Excel files easily
        </p>
      </header>

      <FilterBar
        columns={columns}
        onFilterChange={handleFilterChange}
        onSearchChange={handleSearchChange}
        searchTerm={searchTerm}
      />

      <Card className="mt-6 bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          {data.length === 0 ? (
            <FileDropZone onFileLoaded={handleFileUpload} isLoading={isLoading} setIsLoading={setIsLoading} />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Data Preview</h2>
                <button
                  onClick={() => {
                    setData([]);
                    setColumns([]);
                    setFilters([]);
                    setSearchTerm("");
                    setShowWorkflow(false);
                  }}
                  className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition"
                >
                  Upload New File
                </button>
              </div>
              <DataTable data={filteredData} columns={columns} />
              <WorkflowProcessor data={data} isActive={showWorkflow} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;


import { useState } from "react";
import FileDropZone from "./FileDropZone";
import FilterBar from "./FilterBar";
import DataTable from "./DataTable";
import WorkflowProcessor from "./WorkflowProcessor";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Link, Upload } from "lucide-react";

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
  const [showWorkflow, setShowWorkflow] = useState(true);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [verifyingConnections, setVerifyingConnections] = useState(false);

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

  const resetData = () => {
    setData([]);
    setColumns([]);
    setFilters([]);
    setSearchTerm("");
    setWorkflowStarted(false);
    setCurrentStepId(null);
  };

  const startWorkflow = () => {
    if (data.length === 0) {
      toast.error("No data available. Please upload a file first.");
      return;
    }
    setWorkflowStarted(true);
  };

  const verifyConnections = async () => {
    setVerifyingConnections(true);
    
    try {
      // This would be replaced with actual endpoint checks
      // Simulating API checks with a timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Example of successful verification
      toast.success("All connections verified successfully!");
    } catch (error) {
      toast.error("Failed to verify connections. Please check network settings.");
      console.error("Connection verification error:", error);
    } finally {
      setVerifyingConnections(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">CSV Manager</h1>
          <p className="text-gray-600 mt-2">
            Upload and process CSV and Excel files easily
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={verifyConnections}
            disabled={verifyingConnections}
            variant="blue"
            className="flex items-center gap-2"
          >
            <Link className="h-4 w-4" />
            {verifyingConnections ? "Verifying..." : "Verify Connections"}
          </Button>
          <Button
            onClick={startWorkflow}
            disabled={data.length === 0 || currentStepId !== null || workflowStarted}
            variant="green"
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Processing
          </Button>
          <Button
            onClick={resetData}
            variant="outline"
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700"
          >
            <Upload className="h-4 w-4" />
            Upload New File
          </Button>
        </div>
      </header>
      
      {/* Display workflow processor first, above everything */}
      <Card className="mt-6 border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <WorkflowProcessor 
            data={data} 
            isActive={showWorkflow} 
            workflowStarted={workflowStarted}
            onWorkflowComplete={() => setWorkflowStarted(false)}
            onStepChange={setCurrentStepId}
          />
        </CardContent>
      </Card>

      {/* Moved FilterBar here between workflow and data */}
      <div className="mt-6">
        <FilterBar
          columns={columns}
          onFilterChange={handleFilterChange}
          onSearchChange={handleSearchChange}
          searchTerm={searchTerm}
        />
      </div>

      <Card className="mt-6 bg-white shadow-sm border-gray-200">
        <CardContent className="p-6">
          {data.length === 0 ? (
            <FileDropZone onFileLoaded={handleFileUpload} isLoading={isLoading} setIsLoading={setIsLoading} />
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-700">Data Preview</h2>
              </div>
              
              <DataTable data={filteredData} columns={columns} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

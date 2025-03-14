
import React, { useState, useCallback } from "react";
import { Upload, FileText, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { DataRow } from "./Dashboard";

interface FileDropZoneProps {
  onFileLoaded: (data: DataRow[], headers: string[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const FileDropZone: React.FC<FileDropZoneProps> = ({ 
  onFileLoaded, 
  isLoading, 
  setIsLoading 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processCSV = (csvText: string) => {
    Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          const headers = Object.keys(results.data[0] as Record<string, any>);
          onFileLoaded(results.data as DataRow[], headers);
        } else {
          setError("No data found in the CSV file");
          toast.error("No data found in the CSV file");
        }
        setIsLoading(false);
      },
      error: (error) => {
        setError(`Error parsing CSV: ${error.message}`);
        toast.error(`Error parsing CSV: ${error.message}`);
        setIsLoading(false);
      },
    });
  };

  const processExcel = (arrayBuffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json<DataRow>(worksheet);
      
      if (jsonData.length === 0) {
        setError("No data found in the Excel file");
        toast.error("No data found in the Excel file");
        setIsLoading(false);
        return;
      }
      
      const headers = Object.keys(jsonData[0]);
      onFileLoaded(jsonData, headers);
      setIsLoading(false);
    } catch (err) {
      setError(`Error parsing Excel file: ${err instanceof Error ? err.message : String(err)}`);
      toast.error(`Error parsing Excel file: ${err instanceof Error ? err.message : String(err)}`);
      setIsLoading(false);
    }
  };

  const handleFile = useCallback(
    (file: File) => {
      setIsLoading(true);
      setError(null);

      if (!file) {
        setError("No file selected");
        toast.error("No file selected");
        setIsLoading(false);
        return;
      }

      const fileType = file.name.split(".").pop()?.toLowerCase();

      if (fileType === "csv") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvText = e.target?.result as string;
          processCSV(csvText);
        };
        reader.onerror = () => {
          setError("Error reading file");
          toast.error("Error reading file");
          setIsLoading(false);
        };
        reader.readAsText(file);
      } else if (["xlsx", "xls"].includes(fileType || "")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            processExcel(e.target.result as ArrayBuffer);
          }
        };
        reader.onerror = () => {
          setError("Error reading file");
          toast.error("Error reading file");
          setIsLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        setError("Unsupported file format. Please upload CSV or Excel files.");
        toast.error("Unsupported file format. Please upload CSV or Excel files.");
        setIsLoading(false);
      }
    },
    [onFileLoaded, setIsLoading]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  return (
    <div
      className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 md:p-12 transition-all duration-200 ${
        isDragging
          ? "border-business-400 bg-business-50"
          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className="text-center">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-business-200 border-t-business-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600">Processing your file...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <div className="mx-auto bg-business-100 text-business-600 rounded-full p-3 w-16 h-16 flex items-center justify-center">
                {error ? (
                  <AlertCircle className="w-8 h-8" />
                ) : isDragging ? (
                  <FileText className="w-8 h-8 animate-pulse-gentle" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              {error ? "Upload Error" : "Upload your file"}
            </h3>
            {error ? (
              <p className="text-red-500 mb-4">{error}</p>
            ) : (
              <p className="text-gray-500 mb-4">
                Drag & drop a CSV or Excel file here, or click to browse
              </p>
            )}
            <input
              type="file"
              id="fileInput"
              accept=".csv,.xlsx,.xls"
              className="hidden"
              onChange={handleFileInputChange}
            />
            <button
              onClick={() => document.getElementById("fileInput")?.click()}
              className="px-4 py-2 bg-business-600 text-white rounded-md hover:bg-business-700 transition-colors"
              disabled={isLoading}
            >
              Browse Files
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Supports CSV, XLSX and XLS files
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileDropZone;

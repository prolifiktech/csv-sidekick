
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, RefreshCw, AlertCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// Define the workflow step states
type StepStatus = "idle" | "running" | "completed" | "failed";

export interface WorkflowStep {
  id: number;
  name: string;
  description: string;
  status: StepStatus;
  progress: number;
}

interface WorkflowProcessorProps {
  data: any[];
  isActive: boolean;
}

const WorkflowProcessor = ({ data, isActive }: WorkflowProcessorProps) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, name: "Data Validation", description: "Validating data format and integrity", status: "idle", progress: 0 },
    { id: 2, name: "Data Transformation", description: "Converting data to required format", status: "idle", progress: 0 },
    { id: 3, name: "System Integration", description: "Sending data to external systems", status: "idle", progress: 0 },
    { id: 4, name: "Report Generation", description: "Creating summary reports", status: "idle", progress: 0 },
  ]);
  
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [workflowStarted, setWorkflowStarted] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Calculate overall progress
  useEffect(() => {
    if (workflowStarted) {
      const totalProgress = steps.reduce((sum, step) => sum + step.progress, 0);
      setOverallProgress(Math.floor(totalProgress / steps.length));
    }
  }, [steps, workflowStarted]);

  // Simulate processing for a specific step
  const processStep = async (stepId: number) => {
    if (data.length === 0) {
      toast.error("No data available. Please upload a file first.");
      return;
    }

    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // Update the current step
    setCurrentStepId(stepId);
    
    // Set the step status to running
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[stepIndex] = { ...newSteps[stepIndex], status: "running", progress: 0 };
      return newSteps;
    });

    // Simulate progress updates
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      setSteps(prevSteps => {
        const newSteps = [...prevSteps];
        newSteps[stepIndex] = { ...newSteps[stepIndex], progress: i };
        return newSteps;
      });
    }

    // Simulate success or failure (90% success rate)
    const success = Math.random() > 0.1;
    
    // Update the step status
    setSteps(prevSteps => {
      const newSteps = [...prevSteps];
      newSteps[stepIndex] = { 
        ...newSteps[stepIndex], 
        status: success ? "completed" : "failed", 
        progress: success ? 100 : newSteps[stepIndex].progress 
      };
      return newSteps;
    });

    // Show toast notification
    if (success) {
      toast.success(`${steps[stepIndex].name} completed successfully.`);
    } else {
      toast.error(`${steps[stepIndex].name} failed. Please try again.`);
    }

    // Move to next step if this was successful and not the last step
    if (success && stepId < steps.length) {
      const nextStepId = stepId + 1;
      const allPreviousCompleted = steps
        .filter(step => step.id < nextStepId)
        .every(step => step.status === "completed");
      
      if (allPreviousCompleted) {
        setCurrentStepId(nextStepId);
        processStep(nextStepId);
      } else {
        setCurrentStepId(null);
      }
    } else {
      setCurrentStepId(null);
    }
  };

  // Start the workflow from the beginning
  const startWorkflow = () => {
    // Reset all steps
    setSteps(prevSteps =>
      prevSteps.map(step => ({
        ...step,
        status: "idle",
        progress: 0
      }))
    );
    
    setWorkflowStarted(true);
    processStep(1);
  };

  // Rerun a specific step
  const rerunStep = (stepId: number) => {
    processStep(stepId);
  };

  // Get status color
  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "running": return "bg-blue-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-200";
    }
  };

  // Get status icon
  const getStatusIcon = (status: StepStatus, isActive: boolean = false) => {
    switch (status) {
      case "completed": return <CheckCircle className={`h-5 w-5 ${isActive ? "text-white" : "text-green-500"}`} />;
      case "running": return <RefreshCw className={`h-5 w-5 ${isActive ? "text-white" : "text-blue-500"} animate-spin`} />;
      case "failed": return <AlertCircle className={`h-5 w-5 ${isActive ? "text-white" : "text-red-500"}`} />;
      default: return <Circle className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-400"}`} />;
    }
  };

  // Get step background color for the circle
  const getStepBackground = (step: WorkflowStep) => {
    switch (step.status) {
      case "completed": return "bg-green-500 text-white";
      case "running": return "bg-blue-500 text-white";
      case "failed": return "bg-red-500 text-white";
      default: return "bg-gray-100 text-gray-500";
    }
  };

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Data Processing Workflow</h2>
          {!workflowStarted ? (
            <Button 
              onClick={startWorkflow} 
              disabled={data.length === 0 || currentStepId !== null}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              Start Processing
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Overall Progress:</span>
              <Progress value={overallProgress} className="w-36 h-2" />
              <span className="text-sm text-gray-500">{overallProgress}%</span>
            </div>
          )}
        </div>
        
        {/* Horizontal Workflow Progress Steps */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center">
                {/* Step circles with connector lines */}
                <div className="flex items-center">
                  {/* Connector line before (not for first step) */}
                  {index > 0 && (
                    <div className={cn(
                      "h-1 w-16 -ml-8",
                      steps[index-1].status === "completed" ? "bg-green-500" : "bg-gray-200"
                    )}></div>
                  )}
                  
                  {/* Circle with number or icon */}
                  <div className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                    getStepBackground(step)
                  )}>
                    {step.status === "idle" ? step.id : getStatusIcon(step.status, true)}
                  </div>
                  
                  {/* Connector line after (not for last step) */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "h-1 w-16 -mr-8",
                      step.status === "completed" ? "bg-green-500" : "bg-gray-200"
                    )}></div>
                  )}
                </div>
                
                {/* Step name below circle */}
                <span className="text-xs font-medium mt-2 text-center">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Details */}
        <div className="grid grid-cols-1 gap-4">
          {steps.map((step) => (
            <Card key={step.id} className={cn(
              "border-l-4",
              step.status === "completed" ? "border-l-green-500" : 
              step.status === "running" ? "border-l-blue-500" :
              step.status === "failed" ? "border-l-red-500" :
              "border-l-gray-200"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(step.status)}
                    </div>
                    <div>
                      <h3 className="font-medium">{step.name}</h3>
                      <p className="text-sm text-gray-500">{step.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end">
                      <div className="w-24">
                        <Progress 
                          value={step.progress} 
                          className={cn("h-1.5", getStatusColor(step.status))} 
                        />
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{step.progress}%</span>
                    </div>
                    {(step.status === "failed" || step.status === "completed") && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => rerunStep(step.id)}
                        disabled={currentStepId !== null || data.length === 0}
                        className="flex items-center gap-1"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Rerun
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowProcessor;

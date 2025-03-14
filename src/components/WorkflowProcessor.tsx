
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, CheckCircle, RefreshCw, AlertCircle, Circle, ArrowRight } from "lucide-react";
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

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">Data Processing Workflow</h2>
          
          <Button 
            onClick={startWorkflow} 
            disabled={data.length === 0 || currentStepId !== null}
            className="flex items-center gap-2"
          >
            <Play className="h-4 w-4" />
            Start Processing
          </Button>
        </div>
        
        {/* New progress indicator similar to the image */}
        <div className="mt-6 mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                {/* Step circle */}
                <div 
                  className={cn(
                    "relative flex items-center justify-center w-12 h-12 rounded-full text-white text-sm font-medium transition-all duration-200",
                    step.status === "completed" ? "bg-blue-600" : 
                    step.status === "running" ? "bg-blue-500" : 
                    step.status === "failed" ? "bg-red-500" : 
                    "bg-gray-200 text-gray-600"
                  )}
                >
                  {step.status === "completed" ? (
                    <CheckCircle className="h-6 w-6" />
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                
                {/* Step name below circle */}
                <div className="absolute mt-14 text-xs font-medium text-center w-24 -ml-6">
                  {step.name}
                </div>
                
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 relative">
                    <div className={cn(
                      "absolute inset-0 transition-all duration-300",
                      steps[index].status === "completed" ? "bg-blue-600" : "bg-gray-200"
                    )}></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step details cards */}
        <div className="grid gap-4 mt-16">
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
                      {step.status === "completed" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {step.status === "running" && <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />}
                      {step.status === "failed" && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {step.status === "idle" && <Circle className="h-5 w-5 text-gray-300" />}
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
                          className={cn(
                            "h-1.5", 
                            step.status === "completed" ? "bg-green-100" : 
                            step.status === "running" ? "bg-blue-100" :
                            step.status === "failed" ? "bg-red-100" :
                            "bg-gray-100",
                            "[&>div]:transition-all [&>div]:duration-300",
                            step.status === "completed" ? "[&>div]:bg-green-500" : 
                            step.status === "running" ? "[&>div]:bg-blue-500" :
                            step.status === "failed" ? "[&>div]:bg-red-500" :
                            "[&>div]:bg-gray-300"
                          )} 
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

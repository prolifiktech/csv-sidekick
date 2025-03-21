
import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, RefreshCw, AlertCircle, Circle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

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
  workflowStarted: boolean;
  onWorkflowComplete: () => void;
  onStepChange: (stepId: number | null) => void;
}

const WorkflowProcessor = ({ 
  data, 
  isActive, 
  workflowStarted, 
  onWorkflowComplete,
  onStepChange
}: WorkflowProcessorProps) => {
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { id: 1, name: "Fetching Fresh Desk Data", description: "Retrieving current data from Fresh Desk API", status: "idle", progress: 0 },
    { id: 2, name: "Comparing Upload to Fresh Desk", description: "Analyzing differences between uploaded and existing data", status: "idle", progress: 0 },
    { id: 3, name: "Generating New Tickets", description: "Creating new tickets based on analysis", status: "idle", progress: 0 },
    { id: 4, name: "Generating Child Tickets", description: "Creating related child tickets", status: "idle", progress: 0 },
    { id: 5, name: "Generating Report", description: "Creating summary report of all actions", status: "idle", progress: 0 },
  ]);
  
  const [currentStepId, setCurrentStepId] = useState<number | null>(null);
  const [overallProgress, setOverallProgress] = useState(0);

  // Calculate overall progress
  useEffect(() => {
    if (workflowStarted) {
      const totalProgress = steps.reduce((sum, step) => sum + step.progress, 0);
      setOverallProgress(Math.floor(totalProgress / steps.length));
    }
  }, [steps, workflowStarted]);

  // Start workflow when workflowStarted prop changes
  useEffect(() => {
    if (workflowStarted && currentStepId === null) {
      // Reset all steps
      setSteps(prevSteps =>
        prevSteps.map(step => ({
          ...step,
          status: "idle",
          progress: 0
        }))
      );
      processStep(1);
    }
  }, [workflowStarted]);

  // Simulate processing for a specific step
  const processStep = async (stepId: number) => {
    if (data.length === 0) {
      onWorkflowComplete();
      return;
    }

    const stepIndex = steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return;

    // Update the current step
    setCurrentStepId(stepId);
    onStepChange(stepId);
    
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
        onStepChange(nextStepId);
        processStep(nextStepId);
      } else {
        setCurrentStepId(null);
        onStepChange(null);
        onWorkflowComplete();
      }
    } else {
      setCurrentStepId(null);
      onStepChange(null);
      onWorkflowComplete();
    }
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
          {workflowStarted && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Overall Progress:</span>
              <Progress value={overallProgress} className="w-36 h-2" />
              <span className="text-sm text-gray-500">{overallProgress}%</span>
            </div>
          )}
        </div>
        
        {/* Horizontal Workflow Progress Steps with Connected Lines */}
        <div className="mb-6">
          <div className="flex items-center justify-between relative">
            {/* Continuous connector line with proper inset */}
            <div className="absolute top-4 left-[2rem] right-[2rem] h-1 bg-gray-200 z-0"></div>
            
            {/* Completed progress line with proper inset */}
            <div 
              className="absolute top-4 left-[2rem] h-1 bg-green-500 z-0 transition-all duration-300" 
              style={{ 
                width: `${steps.filter(step => step.status === "completed").length / steps.length * (100 - (100/steps.length))}%` 
              }}
            ></div>
            
            {/* Step circles positioned on top of the line */}
            {steps.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center z-10">
                {/* Circle with number or icon */}
                <div className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
                  getStepBackground(step)
                )}>
                  {step.status === "idle" ? step.id : getStatusIcon(step.status, true)}
                </div>
                
                {/* Step name below circle */}
                <span className="text-xs font-medium mt-2 text-center">{step.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowProcessor;

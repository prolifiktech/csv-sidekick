
import { useState } from "react";
import Dashboard from "@/components/Dashboard";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Dashboard />
      <Toaster />
    </div>
  );
};

export default Index;

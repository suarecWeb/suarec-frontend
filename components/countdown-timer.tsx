"use client";

import { Clock } from "lucide-react";

const CountdownTimer = () => {
  return (
    <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-3 mb-8">
      <Clock className="h-4 w-4 text-yellow-300" />
      <div className="text-white/90 text-sm font-eras-medium">
        <span className="font-eras-bold">Fase Beta</span> - 20 de julio
      </div>
    </div>
  );
};

export default CountdownTimer;

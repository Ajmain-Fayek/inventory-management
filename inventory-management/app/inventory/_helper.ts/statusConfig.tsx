import { CheckCircle, CloudOff } from "lucide-react";
import { Spinner } from "@heroui/spinner"; // Or your UI library
import { TSaveStatus } from "../_interface";

interface StatusDisplay {
  label: string;
  color: string;
  icon: React.ReactNode;
  pulse?: boolean;
}

export const getStatusConfig = (
  status: TSaveStatus,
  countdownValue: number | null,
): StatusDisplay => {
  const configs: Record<TSaveStatus, StatusDisplay> = {
    idle: {
      label: "All changes saved",
      color: "text-default-400",
      icon: <CheckCircle size={13} />,
    },
    editing: {
      label: "Editing...",
      color: "text-primary",
      icon: <Spinner size="sm" color="current" />,
      pulse: true,
    },
    countdown: {
      label: `Saving in ${countdownValue ?? 0}s`,
      color: "text-warning-600",
      icon: <div className="w-2 h-2 rounded-full bg-warning-500 animate-pulse" />,
    },
    saving: {
      label: "Saving...",
      color: "text-primary",
      icon: <Spinner size="sm" color="current" />,
    },
    saved: {
      label: "Saved ✓",
      color: "text-success-600",
      icon: <CheckCircle size={13} />,
    },
    error: {
      label: "Failed to save",
      color: "text-danger",
      icon: <CloudOff size={13} />,
    },
  };

  return configs[status];
};

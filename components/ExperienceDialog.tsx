import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import ExperienceForm from "./ExperienceForm";
import { Experience } from "@/interfaces/user.interface";

interface ExperienceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
  experience?: Experience;
  onSuccess?: () => void;
}

export default function ExperienceDialog({
  open,
  onOpenChange,
  userId,
  experience,
  onSuccess,
}: ExperienceDialogProps) {
  const handleSuccess = () => {
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {experience ? "Editar experiencia" : "Agregar experiencia"}
          </DialogTitle>
        </DialogHeader>
        <ExperienceForm
          userId={userId}
          experience={experience}
          onSuccess={handleSuccess}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 
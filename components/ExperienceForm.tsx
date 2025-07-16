import { useState, useEffect } from "react";
import { Experience } from "@/interfaces/user.interface";
import { ExperienceService } from "@/services/ExperienceService";
import { Calendar, Building2, MapPin, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "react-hot-toast";

interface ExperienceFormProps {
  userId: number;
  experience?: Experience;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ExperienceForm({
  userId,
  experience,
  onSuccess,
  onCancel,
}: ExperienceFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    currentPosition: false,
    description: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title,
        company: experience.company,
        location: experience.location || "",
        startDate: new Date(experience.startDate).toISOString().split("T")[0],
        endDate: experience.endDate
          ? new Date(experience.endDate).toISOString().split("T")[0]
          : "",
        currentPosition: experience.currentPosition,
        description: experience.description || "",
      });
    }
  }, [experience]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const experienceData = {
        ...formData,
        startDate: new Date(formData.startDate),
        endDate: formData.currentPosition
          ? undefined
          : formData.endDate
            ? new Date(formData.endDate)
            : undefined,
      };

      if (experience) {
        await ExperienceService.updateExperience(experience.id, experienceData);
        toast.success("Experiencia actualizada exitosamente");
      } else {
        await ExperienceService.createExperience(experienceData);
        toast.success("Experiencia agregada exitosamente");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error al guardar la experiencia:", error);
      toast.error("Error al guardar la experiencia");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Título del puesto
        </label>
        <div className="relative">
          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Ej: Desarrollador Frontend"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Empresa</label>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            value={formData.company}
            onChange={(e) =>
              setFormData({ ...formData, company: e.target.value })
            }
            placeholder="Ej: Google"
            className="pl-10"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Ubicación</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            type="text"
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Ej: Bogotá, Colombia"
            className="pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha de inicio
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="pl-10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha de finalización
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="pl-10"
              disabled={formData.currentPosition}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="currentPosition"
          checked={formData.currentPosition}
          onCheckedChange={(checked: boolean) => {
            setFormData({
              ...formData,
              currentPosition: checked as boolean,
              endDate: checked ? "" : formData.endDate,
            });
          }}
        />
        <label
          htmlFor="currentPosition"
          className="text-sm font-medium text-gray-700"
        >
          Trabajo actual
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Descripción</label>
        <Textarea
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Describe tus responsabilidades y logros..."
          className="min-h-[100px]"
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-[#097EEC] text-[#097EEC] hover:bg-[#097EEC]/10"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-[#097EEC] hover:bg-[#0A6BC7] text-white"
        >
          {loading ? "Guardando..." : experience ? "Actualizar" : "Agregar"}
        </Button>
      </div>
    </form>
  );
}

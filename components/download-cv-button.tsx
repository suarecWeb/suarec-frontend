"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { jsPDF } from "jspdf";
import { User } from "@/interfaces/user.interface";

interface DownloadCVButtonProps {
  user: User;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
  isPublicProfile?: boolean;
}

const DownloadCVButton: React.FC<DownloadCVButtonProps> = ({
  user,
  variant = "outline",
  size = "default",
  className = "",
  isPublicProfile = false,
}) => {
  // Función para convertir imagen a base64 manteniendo transparencia
  const getImageAsBase64 = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }
        
        canvas.width = img.width;
        canvas.height = img.height;
        
        // NO rellenar el canvas con ningún color de fondo para mantener transparencia
        // Simplemente dibujar la imagen sobre el canvas transparente
        ctx.drawImage(img, 0, 0);
        
        // Usar PNG para mantener la transparencia, con calidad máxima
        const dataURL = canvas.toDataURL("image/png");
        resolve(dataURL);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = url;
    });
  };

  const exportToPDF = async () => {
    if (!user) return;
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    // Encabezado SUAREC
    const headerHeight = 22;
    doc.setFillColor(9, 126, 236); // #097EEC
    doc.rect(0, 0, 210, headerHeight, "F");
    
    // Texto del encabezado
    doc.setFont("helvetica", "bolditalic");
    doc.setFontSize(30);
    doc.setTextColor(255, 255, 255);
    const suarecText = isPublicProfile
      ? "Perfil de candidato -"
      : "Hoja de vida -";
    const suarecWidth = doc.getTextWidth(suarecText);
    const textX = (210 - suarecWidth) / 2 - 15; // Centrar pero dejar espacio para el logo
    doc.text(suarecText, textX, headerHeight - 7);

    // Agregar logo SUAREC al lado derecho del texto
    try {
      const logoBase64 = await getImageAsBase64("/suarec-logo.png");
      const logoWidth = 50; // Ancho del logo en mm
      const logoHeight = 10; // Alto del logo en mm (mantener proporción)
      const logoX = textX + suarecWidth + 4; // Posición después del texto con un poco de espacio
      const logoY = (headerHeight - logoHeight) / 2 + 1; // Centrar verticalmente
      
      // Agregar el logo directamente sin fondo para mantener transparencia
      doc.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);
    } catch (error) {
      console.warn("No se pudo cargar el logo de SUAREC:", error);
    }

    // Dimensiones de columnas
    const leftColWidth = 85; // Reducido un poco para más espacio
    const rightColStart = 110;
    const rightColWidth = 210 - rightColStart - 15;

    // Línea divisoria vertical
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(100, headerHeight + 5, 100, 290);

    // --- Columna izquierda: Foto, Nombre, Contacto, Referencias, Redes ---
    let yLeft = headerHeight + 15;
    const xLeft = 15;

    // Foto de perfil
    if (user.profile_image) {
      try {
        const imageBase64 = await getImageAsBase64(user.profile_image);
        const imgSize = 30; // Tamaño de la imagen en mm
        doc.addImage(imageBase64, "JPEG", xLeft, yLeft, imgSize, imgSize);
        yLeft += imgSize + 8; // Espacio después de la imagen
      } catch (error) {
        console.warn("No se pudo cargar la imagen de perfil:", error);
        // Continuar sin la imagen
      }
    }

    // Nombre del usuario en la columna izquierda
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(33, 37, 41);
    if (user.name) {
      const nameLines = doc.splitTextToSize(user.name, leftColWidth);
      doc.text(nameLines, xLeft, yLeft);
      yLeft += nameLines.length * 6;
    }

    // Profesión debajo del nombre
    if (user.profession) {
      yLeft += 2;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(12);
      doc.text(user.profession, xLeft, yLeft);
      yLeft += 8;
    }

    // Contacto
    yLeft += 3;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);
    doc.text("Contacto", xLeft, yLeft);
    yLeft += 7;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);

    if (user.cellphone) {
      doc.text("Teléfono:", xLeft, yLeft);
      doc.text(user.cellphone, xLeft + 25, yLeft);
      yLeft += 6;
    }

    if (user.email) {
      doc.text("Email:", xLeft, yLeft);
      yLeft += 5;
      // Dividir el email si es muy largo para evitar que toque la línea divisoria
      const emailLines = doc.splitTextToSize(user.email, leftColWidth - 5);
      doc.text(emailLines, xLeft + 3, yLeft);
      yLeft += emailLines.length * 5;
      yLeft += 2; // Espacio extra después del email
    }

    // Referencias
    if (user.references && user.references.length > 0) {
      yLeft += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Referencias", xLeft, yLeft);
      yLeft += 6;
      doc.setFont("helvetica", "normal");
      user.references.forEach((ref) => {
        let refLine = "";
        if (ref.name) refLine += ref.name;
        if (ref.comment) refLine += " — " + ref.comment;
        const refLines = doc.splitTextToSize(refLine, leftColWidth - 5);
        doc.text(refLines, xLeft, yLeft);
        yLeft += refLines.length * 5.5;
        if (ref.contact) {
          doc.text("Teléfono: " + ref.contact, xLeft + 3, yLeft);
          yLeft += 5.5;
        }
      });
    }

    // Redes sociales
    if (user.socialLinks && user.socialLinks.length > 0) {
      yLeft += 3;
      doc.setFont("helvetica", "bold");
      doc.text("Redes", xLeft, yLeft);
      yLeft += 6;
      doc.setFont("helvetica", "normal");
      user.socialLinks.forEach((link) => {
        if (link.type && link.url) {
          const linkText = `${link.type}: ${link.url}`;
          const linkLines = doc.splitTextToSize(linkText, leftColWidth - 5);
          doc.text(linkLines, xLeft, yLeft);
          yLeft += linkLines.length * 5.5;
        }
      });
    }

    // --- Columna derecha: Contenido del perfil ---
    let yRight = headerHeight + 25;
    let xRight = rightColStart;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(33, 37, 41);

    // Sobre mí
    if (user.bio) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Sobre mí", xRight, yRight);
      yRight += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const bioLines = doc.splitTextToSize(user.bio, rightColWidth);
      doc.text(bioLines, xRight, yRight);
      yRight += bioLines.length * 5.5;
    }

    // Experiencia
    if (user.experiences && user.experiences.length > 0) {
      yRight += 8;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Experiencia", xRight, yRight);
      yRight += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      user.experiences.forEach((exp) => {
        let expLine = "";
        if (exp.startDate)
          expLine += new Date(exp.startDate).getFullYear() + " ";
        if (exp.title) expLine += exp.title;
        if (exp.company) expLine += " en " + exp.company;
        const expLines = doc.splitTextToSize(expLine, rightColWidth);
        doc.text(expLines, xRight, yRight);
        yRight += expLines.length * 5.5;
        if (exp.description) {
          const descLines = doc.splitTextToSize(
            exp.description,
            rightColWidth - 8,
          );
          doc.text(descLines, xRight + 4, yRight);
          yRight += descLines.length * 5.5;
        }
        yRight += 3; // Espacio entre experiencias
      });
    }

    // Educación
    if (user.education && user.education.length > 0) {
      yRight += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Educación", xRight, yRight);
      yRight += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      user.education.forEach((edu) => {
        let eduLine = "";
        if (edu.degree) eduLine += edu.degree + " ";
        if (edu.institution) eduLine += edu.institution;
        if (edu.startDate)
          eduLine += " (" + new Date(edu.startDate).getFullYear();
        if (edu.endDate) eduLine += " - " + new Date(edu.endDate).getFullYear();
        if (edu.startDate) eduLine += ")";
        const eduLines = doc.splitTextToSize(eduLine, rightColWidth);
        doc.text(eduLines, xRight, yRight);
        yRight += eduLines.length * 5.5;
        if (edu.description) {
          const descLines = doc.splitTextToSize(
            edu.description,
            rightColWidth - 8,
          );
          doc.text(descLines, xRight + 4, yRight);
          yRight += descLines.length * 5.5;
        }
        yRight += 3; // Espacio entre educaciones
      });
    }

    // Habilidades
    if (user.skills && user.skills.length > 0) {
      yRight += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("Habilidades", xRight, yRight);
      yRight += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      const skillsText = user.skills.join(", ");
      const skillsLines = doc.splitTextToSize(skillsText, rightColWidth);
      doc.text(skillsLines, xRight, yRight);
    }

    // Generar nombre del archivo
    const fileName = isPublicProfile
      ? `Candidato_${user.name || "usuario"}.pdf`
      : `Perfil_${user.name || "usuario"}.pdf`;

    doc.save(fileName);
  };

  return (
    <Button
      onClick={() => exportToPDF()}
      variant={variant}
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <Download className="h-4 w-4" />
      {isPublicProfile ? "Descargar CV" : "Exportar a PDF"}
    </Button>
  );
};

export default DownloadCVButton;

"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { jsPDF } from "jspdf"
import { User } from "@/interfaces/user.interface"

interface DownloadCVButtonProps {
  user: User
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  isPublicProfile?: boolean
}

const DownloadCVButton: React.FC<DownloadCVButtonProps> = ({
  user,
  variant = "outline",
  size = "default",
  className = "",
  isPublicProfile = false
}) => {
  const exportToPDF = () => {
    if (!user) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Encabezado SUAREC
    const headerHeight = 22;
    doc.setFillColor(9, 126, 236); // #097EEC
    doc.rect(0, 0, 210, headerHeight, 'F');
    doc.setFont('helvetica', 'bolditalic');
    doc.setFontSize(30);
    doc.setTextColor(255, 255, 255);
    const suarecText = isPublicProfile ? 'Perfil de candidato - SUAREC' : 'Hoja de vida SUAREC';
    const suarecWidth = doc.getTextWidth(suarecText);
    doc.text(suarecText, (210 - suarecWidth) / 2, headerHeight - 7);

    // Dimensiones de columnas
    const leftColWidth = 90;
    const rightColStart = 110;
    const rightColWidth = 210 - rightColStart - 15;

    // Línea divisoria vertical
    doc.setDrawColor(200);
    doc.setLineWidth(0.5);
    doc.line(100, headerHeight + 5, 100, 290);

    // --- Columna izquierda: Contacto, Referencias, Redes ---
    let yLeft = headerHeight + 15;
    const xLeft = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(33, 37, 41);
    doc.text('Contacto', xLeft, yLeft);
    yLeft += 7;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    
    if (user.cellphone) {
      doc.text('Teléfono:', xLeft, yLeft);
      doc.text(user.cellphone, xLeft + 25, yLeft);
      yLeft += 6;
    }
    if (user.email) {
      doc.text('Email:', xLeft, yLeft);
      doc.text(user.email, xLeft + 25, yLeft);
      yLeft += 6;
    }

    // Referencias
    if (user.references && user.references.length > 0) {
      yLeft += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Referencias', xLeft, yLeft);
      yLeft += 6;
      doc.setFont('helvetica', 'normal');
      user.references.forEach((ref) => {
        let refLine = '';
        if (ref.name) refLine += ref.name;
        if (ref.comment) refLine += ' — ' + ref.comment;
        doc.text(refLine, xLeft, yLeft);
        yLeft += 5.5;
        if (ref.contact) {
          doc.text('Teléfono: ' + ref.contact, xLeft + 3, yLeft);
          yLeft += 5.5;
        }
      });
    }

    // Redes sociales
    if (user.socialLinks && user.socialLinks.length > 0) {
      yLeft += 3;
      doc.setFont('helvetica', 'bold');
      doc.text('Redes', xLeft, yLeft);
      yLeft += 6;
      doc.setFont('helvetica', 'normal');
      user.socialLinks.forEach((link) => {
        if (link.type && link.url) {
          const linkText = `${link.type}: ${link.url}`;
          const linkLines = doc.splitTextToSize(linkText, leftColWidth - 25);
          doc.text(linkLines, xLeft, yLeft);
          yLeft += linkLines.length * 5.5;
        }
      });
    }

    // --- Columna derecha: Perfil ---
    let yRight = headerHeight + 25;
    let xRight = rightColStart;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(33, 37, 41);
    doc.text(user.name || '', xRight, yRight);
    yRight += 9.5;
    
    if (user.profession) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(13);
      doc.text(user.profession, xRight, yRight);
      yRight += 7.5;
    }
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    // Sobre mí
    if (user.bio) {
      yRight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Sobre mí', xRight, yRight);
      yRight += 5.5;
      doc.setFont('helvetica', 'normal');
      const bioLines = doc.splitTextToSize(user.bio, rightColWidth);
      doc.text(bioLines, xRight, yRight);
      yRight += bioLines.length * 5.5;
    }

    // Experiencia
    if (user.experiences && user.experiences.length > 0) {
      yRight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Experiencia', xRight, yRight);
      yRight += 5.5;
      doc.setFont('helvetica', 'normal');
      user.experiences.forEach((exp) => {
        let expLine = '';
        if (exp.startDate) expLine += new Date(exp.startDate).getFullYear() + ' ';
        if (exp.title) expLine += exp.title;
        if (exp.company) expLine += ' en ' + exp.company;
        doc.text(expLine, xRight, yRight);
        yRight += 5.5;
        if (exp.description) {
          const descLines = doc.splitTextToSize(exp.description, rightColWidth - 8);
          doc.text(descLines, xRight + 4, yRight);
          yRight += descLines.length * 5.5;
        }
      });
    }

    // Educación
    if (user.education && user.education.length > 0) {
      yRight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Educación', xRight, yRight);
      yRight += 5.5;
      doc.setFont('helvetica', 'normal');
      user.education.forEach((edu) => {
        let eduLine = '';
        if (edu.degree) eduLine += edu.degree + ' ';
        if (edu.institution) eduLine += edu.institution;
        if (edu.startDate) eduLine += ' (' + new Date(edu.startDate).getFullYear();
        if (edu.endDate) eduLine += ' - ' + new Date(edu.endDate).getFullYear();
        if (edu.startDate) eduLine += ')';
        doc.text(eduLine, xRight, yRight);
        yRight += 5.5;
        if (edu.description) {
          const descLines = doc.splitTextToSize(edu.description, rightColWidth - 8);
          doc.text(descLines, xRight + 4, yRight);
          yRight += descLines.length * 5.5;
        }
      });
    }

    // Habilidades
    if (user.skills && user.skills.length > 0) {
      yRight += 5;
      doc.setFont('helvetica', 'bold');
      doc.text('Habilidades', xRight, yRight);
      yRight += 5.5;
      doc.setFont('helvetica', 'normal');
      doc.text(user.skills.join(', '), xRight, yRight);
    }

    // Generar nombre del archivo
    const fileName = isPublicProfile 
      ? `Candidato_${user.name || 'usuario'}.pdf`
      : `Perfil_${user.name || 'usuario'}.pdf`;

    doc.save(fileName);
  };

  return (
    <Button
      onClick={exportToPDF}
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

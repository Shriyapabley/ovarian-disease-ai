import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileDown, Printer } from 'lucide-react';
import type { Prediction, DiseaseInfo } from '../lib/types';
import { getDiseaseInfo } from '../lib/diseaseData';

interface ReportGeneratorProps {
  prediction: Prediction;
  imageUrl: string;
  heatmapUrl?: string;
  onStatusChange?: (status: string) => void;
}

export default function ReportGenerator({
  prediction,
  imageUrl,
  heatmapUrl,
  onStatusChange,
}: ReportGeneratorProps) {
  const diseaseInfo: DiseaseInfo = getDiseaseInfo(prediction.predicted_disease);

  const generatePDF = async () => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Header with branding
    doc.setFillColor(168, 85, 247);
    doc.roundedRect(margin, margin, contentWidth, 22, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('OvaScan AI', margin + 8, margin + 10);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Clinical Decision Support System for Ovarian Disease Diagnosis', margin + 8, margin + 17);

    // Report title
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Clinical Diagnostic Report', pageWidth / 2, margin + 35, { align: 'center' });
    doc.setDrawColor(168, 85, 247);
    doc.setLineWidth(0.5);
    doc.line(margin + 40, margin + 38, pageWidth - margin - 40, margin + 38);

    // Report metadata
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Report ID: ${prediction.id.slice(0, 8).toUpperCase()}`, margin, margin + 45);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - margin, margin + 45, {
      align: 'right',
    });

    let y = margin + 52;

    // Patient details
    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('PATIENT INFORMATION', margin + 3, y + 5.5);
    y += 12;

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247], fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      head: [['Field', 'Value', 'Field', 'Value']],
      body: [
        [
          'Patient ID',
          prediction.patient_id,
          'Patient Name',
          prediction.patient_name,
        ],
        [
          'Age',
          prediction.patient_age ? `${prediction.patient_age} years` : 'N/A',
          'Scan Date',
          prediction.scan_date
            ? new Date(prediction.scan_date).toLocaleDateString()
            : 'N/A',
        ],
        ['Clinical Notes', prediction.notes || 'N/A', '', ''],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 25 },
        1: { cellWidth: 60 },
        2: { fontStyle: 'bold', cellWidth: 25 },
        3: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Image section
    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ULTRASOUND IMAGING', margin + 3, y + 5.5);
    y += 12;

    // Try to add image
    try {
      if (imageUrl) {
        const imgWidth = (contentWidth - 5) / 2;
        const imgHeight = 50;
        doc.addImage(imageUrl, 'JPEG', margin, y, imgWidth, imgHeight);
        if (heatmapUrl) {
          doc.addImage(heatmapUrl, 'JPEG', margin + imgWidth + 5, y, imgWidth, imgHeight);
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text('Original Image', margin, y + imgHeight + 4);
          doc.text('Grad-CAM Heatmap', margin + imgWidth + 5, y + imgHeight + 4);
        } else {
          doc.setFontSize(7);
          doc.setTextColor(100, 116, 139);
          doc.text('Ultrasound Image', margin, y + imgHeight + 4);
        }
        y += imgHeight + 10;
      }
    } catch {
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('[Image not available in report]', margin, y + 5);
      y += 12;
    }

    // Prediction results
    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('AI PREDICTION RESULTS', margin + 3, y + 5.5);
    y += 12;

    autoTable(doc, {
      startY: y,
      theme: 'grid',
      headStyles: { fillColor: [168, 85, 247], fontSize: 8 },
      bodyStyles: { fontSize: 8, cellPadding: 2 },
      head: [['Parameter', 'Result']],
      body: [
        ['Predicted Disease', prediction.predicted_disease],
        ['Confidence Score', `${Number(prediction.confidence_score).toFixed(1)}%`],
        ['Prediction Probability', Number(prediction.prediction_probability).toFixed(3)],
        ['Affected Ovary', prediction.affected_ovary],
        ['Severity Level', prediction.severity_level],
        ['AI Model Used', prediction.model_used],
        ['Processing Time', `${prediction.processing_time_ms} ms`],
        ['Image Quality', `${prediction.quality_assessment} (${Number(prediction.quality_score).toFixed(1)}/100)`],
      ],
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 'auto' },
      },
      margin: { left: margin, right: margin },
    });

    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    // Clinical interpretation
    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('CLINICAL INTERPRETATION', margin + 3, y + 5.5);
    y += 12;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const interpLines = doc.splitTextToSize(
      prediction.clinical_interpretation || diseaseInfo.summary,
      contentWidth
    );
    doc.text(interpLines, margin, y);
    y += interpLines.length * 4 + 6;

    // Disease information
    if (y > pageHeight - 80) {
      doc.addPage();
      y = margin;
    }

    doc.setFillColor(253, 242, 248);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setTextColor(168, 85, 247);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DISEASE INFORMATION', margin + 3, y + 5.5);
    y += 12;

    const diseaseSections: [string, string[]][] = [
      ['Description', [diseaseInfo.description]],
      ['Common Symptoms', diseaseInfo.symptoms],
      ['Recommended Investigations', diseaseInfo.investigations],
      ['Treatment Options', diseaseInfo.treatments],
      ['Lifestyle Recommendations', diseaseInfo.lifestyle],
      ['Follow-up Guidelines', diseaseInfo.follow_up],
    ];

    diseaseSections.forEach(([title, items]) => {
      if (y > pageHeight - 30) {
        doc.addPage();
        y = margin;
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(168, 85, 247);
      doc.text(title, margin, y);
      y += 4;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
      items.forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, contentWidth - 4);
        if (y > pageHeight - 15) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines, margin + 2, y);
        y += lines.length * 3.5 + 1;
      });
      y += 3;
    });

    // Physician comments
    if (y > pageHeight - 40) {
      doc.addPage();
      y = margin;
    }
    y += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Physician Comments:', margin, y);
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.2);
    for (let i = 0; i < 3; i++) {
      doc.line(margin, y + i * 6, pageWidth - margin, y + i * 6);
    }
    y += 22;

    // Signature
    doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text('Physician Signature & Stamp', pageWidth - margin - 30, y + 4, {
      align: 'center',
    });

    // Footer on each page
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setDrawColor(168, 85, 247);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'OvaScan AI — AI-Based Intelligent Clinical Decision Support System',
        margin,
        pageHeight - 10
      );
      doc.text(
        'This report is AI-generated and should be reviewed by a qualified physician',
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 10, {
        align: 'right',
      });
    }

    doc.save(`OvaScan_Report_${prediction.patient_id}_${Date.now()}.pdf`);
    onStatusChange?.('generated');
  };

  const handlePrint = () => {
    generatePDF();
    setTimeout(() => window.print(), 500);
    onStatusChange?.('printed');
  };

  return (
    <div className="flex flex-wrap gap-3 no-print">
      <button
        onClick={generatePDF}
        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-medium text-sm shadow-md shadow-pink-500/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
      >
        <FileDown className="w-4 h-4" />
        Download PDF
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-2.5 glass text-slate-700 rounded-xl font-medium text-sm hover:bg-white/60 transition-all duration-300"
      >
        <Printer className="w-4 h-4" />
        Print Report
      </button>
    </div>
  );
}

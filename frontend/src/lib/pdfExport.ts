import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportOptions {
  fileName?: string;
  orientation?: 'p' | 'l';
  unit?: 'mm' | 'pt' | 'px';
  format?: 'a4' | 'letter' | [number, number];
}

/**
 * Exports a DOM element to PDF using html2canvas and jsPDF.
 */
export const exportToPDF = async (elementId: string, options: ExportOptions = {}) => {
  const {
    fileName = 'export.pdf',
    orientation = 'p',
    unit = 'pt',
    format = 'a4',
  } = options;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element with id ${elementId} not found.`);
    return;
  }

  try {
    // Add a class to handle print-specific styles during capture
    element.classList.add('pdf-exporting');

    const canvas = await html2canvas(element, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          // Adjust styles if needed for the snapshot
          clonedElement.style.padding = '20px';
          
          // 1. CLEANSE STYLE TAGS & EXTERNAL SHEETS
          const styleTags = clonedDoc.getElementsByTagName('style');
          const links = clonedDoc.getElementsByTagName('link');
          
          // Remove linked stylesheets to prevent html2canvas from trying to parse them if they might contain oklab
          // Instead, we rely on the styles already processed or inline
          for (let i = 0; i < links.length; i++) {
            if (links[i].rel === 'stylesheet') {
              // We could try to fetch and patch, but it's safer to just remove problematic ones 
              // for the snapshot if they cause crashes
            }
          }

          for (let i = 0; i < styleTags.length; i++) {
            const tag = styleTags[i];
            if (tag.textContent && (
                tag.textContent.includes('okl') || 
                tag.textContent.includes('color-mix')
            )) {
              // More aggressive replacement: replace oklab/oklch with a safe color
              // Regex handles more variants (spaces, commas, slash)
              tag.textContent = tag.textContent
                .replace(/oklab\([^)]+\)/g, 'rgb(0,0,0)')
                .replace(/oklch\([^)]+\)/g, 'rgb(0,0,0)')
                .replace(/color-mix\([^)]+\)/g, 'rgb(128,128,128)');
            }
          }

          // 2. CLEANSE ELEMENT STYLES
          const allClonedElements = clonedDoc.querySelectorAll('*');
          
          allClonedElements.forEach((el: any) => {
            try {
              // Check inline styles
              const styleAttr = el.getAttribute('style');
              if (styleAttr && (styleAttr.includes('okl') || styleAttr.includes('color-mix'))) {
                el.setAttribute('style', styleAttr
                  .replace(/oklab\([^)]+\)/g, 'rgb(0,0,0)')
                  .replace(/oklch\([^)]+\)/g, 'rgb(0,0,0)')
                  .replace(/color-mix\([^)]+\)/g, 'rgb(128,128,128)')
                );
              }

              // Pre-compute and force standard colors for common problematic props
              // This is necessary because html2canvas often reads computed styles
              const computed = window.getComputedStyle(el);
              
              if (computed.color && computed.color.includes('okl')) {
                el.style.color = 'rgb(0, 0, 0)';
              }
              if (computed.backgroundColor && computed.backgroundColor.includes('okl')) {
                // If it's a "surface" or "background", use white
                el.style.backgroundColor = 'rgb(255, 255, 255)';
              }
              if (computed.borderColor && computed.borderColor.includes('okl')) {
                el.style.borderColor = 'rgb(200, 200, 200)';
              }
              if (computed.fill && computed.fill.includes('okl')) {
                el.style.fill = 'rgb(0, 0, 0)';
              }
            } catch (e) {
              // Silent fail for cross-origin or other style issues
            }
          });
        }
      }
    });

    element.classList.remove('pdf-exporting');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation,
      unit,
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
    
    const canvasWidth = imgWidth * ratio;
    const canvasHeight = imgHeight * ratio;

    // Handle multi-page if the element is taller than one page
    if (canvasHeight > pageHeight) {
      let heightLeft = canvasHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, canvasWidth, canvasHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - canvasHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, canvasWidth, canvasHeight);
        heightLeft -= pageHeight;
      }
    } else {
      // Small enough for one page
      pdf.addImage(imgData, 'PNG', 0, 0, canvasWidth, canvasHeight);
    }

    pdf.save(fileName);
  } catch (error) {
    console.error('Error generating PDF:', error);
    element.classList.remove('pdf-exporting');
    throw error;
  }
};

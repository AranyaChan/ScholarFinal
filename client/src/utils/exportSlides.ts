import pptxgen from 'pptxgenjs';
import { jsPDF } from 'jspdf';
import type { Slides } from '../components/Dashboard';

function safeFileName(title: string) {
  return title.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 80) || 'presentation';
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSlidesMarkdown(slides: Slides, paperTitle: string) {
  let markdown = `# ${slides.title}\n\n`;
  slides.slides.forEach((slide, index) => {
    markdown += `## Slide ${index + 1}: ${slide.title}\n\n`;
    slide.content.forEach((item) => {
      if (item.trim()) markdown += `${item}\n\n`;
    });
    markdown += `---\n\n`;
  });
  downloadBlob(
    new Blob([markdown], { type: 'text/markdown' }),
    `${safeFileName(paperTitle)}_slides.md`
  );
}

export async function exportSlidesPptx(slides: Slides, paperTitle: string) {
  const pptx = new pptxgen();
  pptx.author = 'ScholarAI';
  pptx.title = slides.title;
  pptx.layout = 'LAYOUT_16x9';

  const titleColor = '92400E';
  const bodyColor = '44403C';

  for (const slide of slides.slides) {
    const s = pptx.addSlide();
    s.background = { color: 'FFFBEB' };

    if (slide.type === 'title') {
      s.addText(slide.title, {
        x: 0.5,
        y: 1.6,
        w: 9,
        h: 1.2,
        fontSize: 32,
        bold: true,
        color: titleColor,
        align: 'center',
        valign: 'middle',
      });
      const subtitle = slide.content.filter((c) => c.trim()).join('\n');
      if (subtitle) {
        s.addText(subtitle, {
          x: 0.75,
          y: 3,
          w: 8.5,
          h: 2,
          fontSize: 16,
          color: bodyColor,
          align: 'center',
          valign: 'top',
        });
      }
    } else {
      s.addText(slide.title, {
        x: 0.5,
        y: 0.35,
        w: 9,
        h: 0.75,
        fontSize: 26,
        bold: true,
        color: titleColor,
      });
      const bullets = slide.content.filter((c) => c.trim());
      if (bullets.length > 0) {
        s.addText(
          bullets.map((text) => ({ text, options: { bullet: true, breakLine: true } })),
          {
            x: 0.6,
            y: 1.25,
            w: 8.8,
            h: 4.2,
            fontSize: 14,
            color: bodyColor,
            valign: 'top',
          }
        );
      }
    }
  }

  await pptx.writeFile({ fileName: `${safeFileName(paperTitle)}_slides.pptx` });
}

export function exportSlidesPdf(slides: Slides, paperTitle: string) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'in',
    format: [10, 5.625],
  });

  const pageW = doc.internal.pageSize.getWidth();
  const margin = 0.55;
  const maxW = pageW - margin * 2;

  slides.slides.forEach((slide, index) => {
    if (index > 0) doc.addPage([10, 5.625], 'landscape');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(slide.type === 'title' ? 26 : 20);
    doc.setTextColor(30, 58, 138);
    const titleLines = doc.splitTextToSize(slide.title, maxW);
    doc.text(titleLines, pageW / 2, 0.9, { align: 'center', maxWidth: maxW });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(31, 41, 55);

    let y = slide.type === 'title' ? 2.2 : 1.65;
    const x = slide.type === 'title' ? pageW / 2 : margin;
    const align = slide.type === 'title' ? 'center' : 'left';

    slide.content
      .filter((c) => c.trim())
      .forEach((item) => {
        const lines = doc.splitTextToSize(`• ${item}`, maxW);
        doc.text(lines, x, y, { align, maxWidth: maxW });
        y += lines.length * 0.22 + 0.12;
        if (y > 5) return;
      });
  });

  doc.save(`${safeFileName(paperTitle)}_slides.pdf`);
}

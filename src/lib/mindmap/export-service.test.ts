import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { exportPNG, exportPDF } from './export-service';

vi.mock('html-to-image', () => ({
  toPng: vi.fn(),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(function(this: Record<string, unknown>) {
    this.addImage = vi.fn();
    this.save = vi.fn();
    this.internal = {
      pageSize: {
        getWidth: vi.fn(() => 800),
        getHeight: vi.fn(() => 600),
      },
    };
    return this;
  }),
}));

function createMockElement(): HTMLElement {
  const el = document.createElement('div');
  Object.defineProperties(el, {
    scrollWidth: { value: 800 },
    scrollHeight: { value: 600 },
  });
  return el;
}

beforeEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('exportPNG', () => {
  it('calls toPng with correct options and triggers download', async () => {
    const mockDataUrl = 'data:image/png;base64,abc123';
    vi.mocked(toPng).mockResolvedValue(mockDataUrl);
    const element = createMockElement();
    const createElementSpy = vi.spyOn(document, 'createElement');

    const result = await exportPNG(element, 'mindmap.png');

    expect(toPng).toHaveBeenCalledWith(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });
    expect(result).toBe(mockDataUrl);
    const anchor = createElementSpy.mock.results.find(
      (r) => (r.value as HTMLElement).tagName === 'A',
    )?.value as HTMLAnchorElement | undefined;
    expect(anchor).toBeDefined();
    expect(anchor?.download).toBe('mindmap.png');
    expect(anchor?.href).toBe(mockDataUrl);
  });
});

describe('exportPDF', () => {
  it('creates a PDF with the captured image and saves it', async () => {
    const mockDataUrl = 'data:image/png;base64,pdfimg';
    vi.mocked(toPng).mockResolvedValue(mockDataUrl);
    const element = createMockElement();

    await exportPDF(element, 'mindmap.pdf');

    expect(toPng).toHaveBeenCalledWith(element, {
      backgroundColor: '#ffffff',
      pixelRatio: 2,
    });
    const pdfInstance = vi.mocked(jsPDF).mock.results[0]?.value;
    expect(pdfInstance?.addImage).toHaveBeenCalledWith(
      mockDataUrl,
      'PNG',
      0,
      0,
      800,
      600,
    );
    expect(pdfInstance?.save).toHaveBeenCalledWith('mindmap.pdf');
  });
});

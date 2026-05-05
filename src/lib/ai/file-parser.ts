const ALLOWED_EXTENSIONS = ['.txt', '.md', '.pdf'];
const MAX_SIZE = 1024 * 1024;

export function parseFile(file: File): Promise<string> {
  if (file.size > MAX_SIZE) {
    return Promise.reject(new Error('File too large (max 1MB)'));
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return Promise.reject(new Error('Unsupported file type'));
  }

  if (ext === '.pdf') {
    return parsePdf(file);
  }

  return parseTextFile(file);
}

function parseTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

async function parsePdf(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/ai/parse-pdf', {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to parse PDF');
  }

  const data = (await res.json()) as { text: string };
  return data.text;
}

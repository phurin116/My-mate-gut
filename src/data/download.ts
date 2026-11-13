/**
 * Offer a file to the viewer. Inside the Claude artifact viewer this goes
 * through its downloads capability; in a normal browser it uses a link.
 * Resolves true when the file was handed over.
 */
export async function saveFile(filename: string, data: Blob | string): Promise<boolean> {
  const host = (window as unknown as { claude?: { use?: (name: string) => Promise<unknown> } }).claude;
  if (host?.use) {
    const downloads = (await host.use('downloads')) as {
      save: (r: { filename: string; data: Blob | string }) => Promise<unknown>;
    } | null;
    if (downloads) {
      try {
        await downloads.save({ filename, data });
        return true;
      } catch (e) {
        if ((e as { code?: string })?.code === 'declined') return false;
        throw e;
      }
    }
  }
  const blob = typeof data === 'string' ? new Blob([data], { type: 'text/plain;charset=utf-8' }) : data;
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  return true;
}

import { useRef, useState } from 'react';
import { CircleAlert, Download, FileText, Trash2, Upload } from 'lucide-react';
import { formatDate } from '../domain/dates';
import type { StoredFile, Student } from '../domain/types';
import { setResume } from '../data/actions';
import { saveFile } from '../data/download';
import { checkResume, deleteFile, formatSize, readFile, storeFile } from '../data/files';
import { useT } from '../i18n';
import { Button, ConfirmDialog, useToast } from './ui';

/** Download a stored resume by its metadata. */
export function useResumeDownload() {
  const t = useT();
  const toast = useToast();
  return async (file: StoredFile) => {
    const blob = await readFile(file.id);
    if (!blob) {
      toast(t.stu.resume.missing, { kind: 'error' });
      return;
    }
    try {
      await saveFile(file.name, blob);
    } catch {
      toast(t.stu.resume.downloadFailed, { kind: 'error' });
    }
  };
}

export function ResumeFile({ file }: { file: StoredFile }) {
  const t = useT();
  const download = useResumeDownload();
  return (
    <div className="resume-file">
      <span className="resume-icon" aria-hidden="true">
        <FileText size={20} />
      </span>
      <span className="grow">
        <span className="resume-name truncate">{file.name}</span>
        <span className="small muted">
          {formatSize(file.size)} · {t.stu.resume.uploaded(formatDate(file.uploadedAt))}
        </span>
      </span>
      <button type="button" className="icon-btn" aria-label={`${t.stu.resume.download}: ${file.name}`} title={t.stu.resume.download} onClick={() => download(file)}>
        <Download size={18} aria-hidden="true" />
      </button>
    </div>
  );
}

/** Upload, replace, download and remove the student's resume. Stored in this browser in demo mode. */
export function ResumeManager({ student, compact }: { student: Student; compact?: boolean }) {
  const t = useT();
  const r = t.stu.resume;
  const toast = useToast();
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const problem = checkResume(file);
    if (problem) {
      setError(problem === 'type' ? r.errorType : r.errorSize);
      return;
    }
    setError('');
    setBusy(true);
    try {
      const meta = await storeFile(file);
      const old = setResume(student.id, meta);
      if (old) await deleteFile(old.id);
      toast(student.resume ? r.replaced : r.added);
    } catch {
      setError(r.errorStorage);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  const remove = async () => {
    setConfirm(false);
    const old = setResume(student.id, null);
    if (old) await deleteFile(old.id);
    toast(r.removed);
  };

  return (
    <div className="resume-manager">
      {student.resume ? (
        <ResumeFile file={student.resume} />
      ) : (
        <div className="resume-empty">
          <FileText size={20} aria-hidden="true" />
          <span>{r.none}</span>
        </div>
      )}
      <input
        ref={input}
        type="file"
        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => onFile(e.target.files?.[0])}
      />
      <div className="row-wrap">
        <Button
          size="sm"
          variant={student.resume ? 'secondary' : 'primary'}
          icon={<Upload size={15} aria-hidden="true" />}
          loading={busy}
          loadingText={r.uploading}
          onClick={() => input.current?.click()}
        >
          {student.resume ? r.replace : r.upload}
        </Button>
        {student.resume && (
          <Button size="sm" variant="ghost" icon={<Trash2 size={15} aria-hidden="true" />} onClick={() => setConfirm(true)}>
            {t.actions.remove}
          </Button>
        )}
      </div>
      {error ? (
        <p className="error-text" role="alert">
          <CircleAlert size={14} aria-hidden="true" />
          {error}
        </p>
      ) : (
        !compact && <p className="help">{r.help}</p>
      )}
      {confirm && (
        <ConfirmDialog
          title={r.removeTitle}
          body={r.removeBody}
          confirmLabel={t.actions.remove}
          danger
          onClose={() => setConfirm(false)}
          onConfirm={remove}
        />
      )}
    </div>
  );
}

"use client";
import { useRef, useState, useSyncExternalStore } from "react";
import { Upload, X } from "lucide-react";
import { counselorAccountSnapshot, serverCounselorAccountSnapshot, subscribeCounselorAccount, writeCounselorAccount } from "@/lib/counselorAccount";

/** DEMO-ONLY: original ink strokes for the fictional demo persona. Never substitutes for another counselor's signature. */
export function SignatureInk({ name, image }: { name: string; image?: string }) {
  if (image) return <img src={image} alt={`${name}'s uploaded signature`} className="publication-signature-image"/>; // eslint-disable-line @next/next/no-img-element
  if (name !== 'Sarah Chen') return <span className="publication-signature-space" aria-label="Space for signature"/>;
  return <svg className="publication-signature-ink" viewBox="0 0 250 75" role="img" aria-label="Sarah Chen sample signature"><g fill="none" stroke="#253b46" strokeLinecap="round" strokeLinejoin="round">
    <path strokeWidth="1.45" d="M60 14C49 4 24 18 20 31c-4 13 34-1 32 12-2 10-26 18-36 12-8-5 14-15 29-19M57 44c-9-8-19 11-12 12 8 1 15-15 12-12-7 17 8 8 12 0m-4 11 8-19-4 14c7-16 13-14 8-6m4 7c6-17 18-10 13-5-12 14-17 12-10 0m10-5c-8 17 4 15 11 1m-2 11c10-19 21-43 15-42-6 0-22 52-12 40 12-19 18-19 13-6-3 9 3 9 10 2"/>
    <path strokeWidth="1.7" d="M175 15c-14-13-38 11-42 25-5 22 20 14 34 1m-5 13c9-22 25-50 18-46-7 4-23 53-13 40 14-23 20-23 14-5-4 12 2 13 12 3m-2 3c15-9 13-16 6-12-13 8-10 27 7 10m-1 7 8-17-3 12c12-21 20-16 13-3-5 11 5 9 14 1"/>
    <path strokeWidth=".9" d="M30 65c52-10 121-11 195-7M81 65c52-6 92-6 119-4"/>
  </g></svg>;
}

export function SignatureSettings() {
  const account = useSyncExternalStore(subscribeCounselorAccount, counselorAccountSnapshot, serverCounselorAccountSnapshot);
  const input = useRef<HTMLInputElement>(null);
  const [error,setError] = useState('');
  const upload = (file?: File) => {
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2*1024*1024) { setError('Choose a PNG, JPG or WebP image under 2 MB.'); return; }
    const reader = new FileReader(); reader.onload = () => { writeCounselorAccount({ signatureDataUrl: String(reader.result) }); setError(''); }; reader.onerror = () => setError('The image could not be opened. Try another file.'); reader.readAsDataURL(file);
  };
  return <section className="v4-signature-settings"><header><strong>My Signature</strong>{account.signatureDataUrl && <button type="button" onClick={()=>writeCounselorAccount({signatureDataUrl:''})}>Remove <X size={12}/></button>}</header><div className="v4-signature-sample"><SignatureInk name={account.name || 'Sarah Chen'} image={account.signatureDataUrl}/></div><div className="v4-signature-caption"><span>{account.signatureDataUrl ? 'Uploaded signature' : 'Sample ink · replace with my own'}</span><button type="button" onClick={()=>input.current?.click()}><Upload size={12}/>Upload</button></div><input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp" aria-label="Upload signature image" onChange={e=>{ upload(e.target.files?.[0]); e.target.value=''; }}/><p>Transparent PNG works best. Used on recommendation letters.</p>{error && <p role="alert">{error}</p>}</section>;
}

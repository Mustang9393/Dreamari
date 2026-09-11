"use client";

import { useRef } from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { GPA_BELOW, GPA_HIGHER, GPA_NOT_USED, GPA_SCALE } from "./types";
import styles from "./GpaField.module.css";

const choices = [GPA_HIGHER, ...GPA_SCALE.slice(1, -1).reverse(), GPA_BELOW];
const normalize = (value: string) => value === "2.0" ? GPA_BELOW : value === "4.0" ? GPA_HIGHER : value;

/** Exact answers stay out of the form until requested. The native dialog
 * supplies modal focus containment, Escape dismissal and background inertness. */
export function GpaField({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const previous = useRef("");
  const selected = normalize(value);
  const notUsed = value === GPA_NOT_USED;

  function openPicker() {
    const panel = dialog.current;
    const field = trigger.current;
    if (!panel || !field) return;
    const rect = field.getBoundingClientRect();
    const width = Math.min(360, window.innerWidth - 32);
    panel.style.setProperty("--picker-left", `${Math.max(16, Math.min(rect.left, window.innerWidth - width - 16))}px`);
    panel.style.setProperty("--picker-top", `${Math.max(16, Math.min(rect.bottom + 8, window.innerHeight - 436))}px`);
    panel.showModal();
    const buttons = panel.querySelectorAll<HTMLButtonElement>("[data-gpa]");
    (Array.from(buttons).find(button => button.dataset.gpa === selected) ?? buttons[0])?.focus();
  }

  function closePicker() {
    dialog.current?.close();
    trigger.current?.focus();
  }

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor="build-gpa">GPA</label>
      <button ref={trigger} id="build-gpa" type="button" className={styles.trigger}
        data-selected={Boolean(value)} disabled={notUsed} aria-haspopup="dialog"
        aria-label={`GPA: ${notUsed ? "Not applicable" : selected || "Select GPA"}`}
        onClick={openPicker}>
        <span>{notUsed ? "Not applicable" : selected || "Select GPA"}</span>
        {value && !notUsed ? <Check size={17} aria-hidden /> : <ChevronDown size={17} aria-hidden />}
      </button>
      <label className={styles.optOut}>
        <input type="checkbox" checked={notUsed} onChange={event => {
          if (event.target.checked) { previous.current = value; onChange(GPA_NOT_USED); }
          else onChange(previous.current);
        }} />
        <span>My school does not use GPA</span>
      </label>
      <dialog ref={dialog} className={styles.dialog} aria-labelledby="gpa-picker-title"
        onClick={event => { if (event.target === event.currentTarget) closePicker(); }}
        onKeyDown={event => {
          const buttons = Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>("[data-gpa]") ?? []);
          const index = buttons.indexOf(event.target as HTMLButtonElement);
          if (index < 0) return;
          const offsets: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 5, ArrowUp: -5 };
          const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : offsets[event.key] !== undefined ? Math.max(0, Math.min(buttons.length - 1, index + offsets[event.key])) : null;
          if (next !== null) { event.preventDefault(); buttons[next]?.focus(); }
        }}>
        <div className={styles.panel}>
          <div className={styles.heading}>
            <div><h2 id="gpa-picker-title">Select your GPA</h2><p>Choose the closest value.</p></div>
            <button type="button" className={styles.close} aria-label="Close GPA picker" onClick={closePicker}><X size={19} aria-hidden /></button>
          </div>
          <div className={styles.grid} role="group" aria-label="GPA values">
            {choices.map((choice, index) => (
              <button key={choice} type="button" data-gpa={choice} aria-pressed={selected === choice}
                className={`${styles.choice} ${index === 0 || index === choices.length - 1 ? styles.boundary : ""}`}
                onClick={() => { onChange(choice); closePicker(); }}>
                {choice}<Check size={14} aria-hidden className={styles.check} />
              </button>
            ))}
          </div>
        </div>
      </dialog>
    </div>
  );
}

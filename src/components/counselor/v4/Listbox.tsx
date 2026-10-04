"use client";
import type { ComponentProps } from "react";
import { Listbox as BaseListbox } from "@/components/app/Listbox";
export type { ListboxOption } from "@/components/app/Listbox";
/** Keep the tested keyboard and viewport behavior; replace both trigger and portal material. */
export function Listbox({className="",panelClassName="",...props}:ComponentProps<typeof BaseListbox>){return <BaseListbox {...props} className={`v4-select ${className}`} panelClassName={`v4-popover ${panelClassName}`}/>;}

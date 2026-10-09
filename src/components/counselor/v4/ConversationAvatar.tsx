"use client";

import Image from "next/image";
import { studentPortraitSrc, useStudentAvatarSrc } from "@/lib/avatar";
import type { CounselorStudent } from "@/lib/counselorRoster";
import { LineAvatar } from "../v6/LineAvatar";
import { LIVE_TRAITS, PORTRAIT_TRAITS } from "../v6/avatarTraits";

export type ConversationAvatarStyle = "line" | "portrait";

/** Same roster identity in each of the two requested styles. */
export function ConversationAvatar({student, style, size=44}: {size?:number; student: Pick<CounselorStudent, "id" | "avatarIndex">; style: ConversationAvatarStyle}) {
 const live = useStudentAvatarSrc("Jordan");
 const traits = student.avatarIndex >= 0 ? PORTRAIT_TRAITS[student.avatarIndex] ?? LIVE_TRAITS : LIVE_TRAITS;
 if (style === "line") return <LineAvatar seed={student.id} tone={traits.t}/>;
 return <Image src={student.avatarIndex >= 0 ? studentPortraitSrc(student.avatarIndex) : live} alt="" width={size*2} height={size*2} className="h-full w-full object-cover"/>;
}

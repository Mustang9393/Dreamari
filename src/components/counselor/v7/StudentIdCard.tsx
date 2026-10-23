"use client";

// The student's ID tag, kept for v7 when v4 went back to its 20 Oct
// afternoon state for Maisha's demos (21 Oct 2026). Same design v4 had.

import "./studentIdCard.css";
import { Avatar } from "../v4/chips";
import { lastActiveLabel, type CounselorStudent } from "@/lib/counselorRoster";

const fmtDate = lastActiveLabel;

/** The student's ID tag (20 Oct 2026, Chandu: "the student id component is
 *  too cluttered, remove the bar code and the weird serial numbers. Remove
 *  the career images. Use the same tag like structure the counsellors have
 *  but distinctly different from it"). The counselor's badge hangs from a
 *  woven lanyard strap and is a tall dark card with a photo cover and a
 *  square photo. The student's hangs from a round retractable badge reel on
 *  a short cord, and is a light card: the school band, a round photo in the
 *  middle, the name, grade and class year, pathway, status and when they
 *  were last active. Nothing else. */
export function StudentIdCard({ student, rail = false }: { student: CounselorStudent; /** the profile's rail: the reel hangs above the card instead of taking room over it */ rail?: boolean }) {
  const classOf = 2027 + (12 - student.grade);
  return (
    <div className={`v7-sid-wrap${rail ? " is-rail" : ""}`}>
      <div className="v7-sid-reel" aria-hidden><span className="v7-sid-reel-disc"><i /></span><span className="v7-sid-cord" /><span className="v7-sid-clip" /></div>
      <section className="v7-sid" aria-label={`${student.name}, student ID`}>
        <span className="v7-sid-slot" aria-hidden />
        <header className="v7-sid-band"><span>{student.school}</span><span>Student</span></header>
        <div className="v7-sid-body">
          <span className="v7-sid-photo"><Avatar name={student.name} size={96} index={student.avatarIndex} /></span>
          <h1>{student.name}</h1>
          <p>Grade {student.grade} · Class of {classOf}</p>
          <p>{student.careerTrack}</p>
          <span className={`v7-sid-status ${student.status === "At Risk" ? "is-risk" : student.status === "Needs Attention" ? "is-warn" : ""}`}>{student.status}</span>
          <span className="v7-sid-active">Active {fmtDate(student.lastActive).toLowerCase()}</span>
        </div>
      </section>
    </div>
  );
}

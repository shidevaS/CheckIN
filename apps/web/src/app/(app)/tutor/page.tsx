import type { Metadata } from "next";
import TutorClient from "./TutorClient";

export const metadata: Metadata = { title: "AI Tutor" };

export default function TutorPage() {
  return <TutorClient />;
}

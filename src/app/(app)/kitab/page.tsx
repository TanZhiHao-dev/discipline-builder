import { redirect } from "next/navigation";

// The ICDT Kitab now lives inside Playbooks (📖 Kitab ICDT button).
export default function KitabPage() {
  redirect("/playbooks");
}

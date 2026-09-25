import { redirect } from "next/navigation";

// The essays are listed on the homepage now; old links to /writing land there.
export default function WritingIndex() {
  redirect("/#writing");
}

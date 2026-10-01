import { redirect } from "next/navigation";
import { POLICIES } from "@/lib/policies";

export default function PoliciesIndexPage() {
  redirect(`/policies/${POLICIES[0].slug}`);
}

import { redirect } from "next/navigation";
import { ADMIN_HOME_PATH } from "@/lib/site";

/** /admin → first shipped admin page (Settings). */
export default function AdminIndexPage() {
  redirect(ADMIN_HOME_PATH);
}

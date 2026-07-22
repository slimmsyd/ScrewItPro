import { redirect } from "next/navigation";
import { QUOTE_PATH } from "@/lib/site";

export default function QuoteIndexPage() {
  redirect(QUOTE_PATH);
}

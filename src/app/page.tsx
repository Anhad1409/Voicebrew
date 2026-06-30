import { redirect } from "next/navigation";

export default function Home() {
  // v6 is the live product — land here. (Other versions remain at their routes.)
  redirect("/dashboard-v6");
}

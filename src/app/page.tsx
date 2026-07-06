import { redirect } from "next/navigation";

export default function Home() {
  // The journey: land at the counter, sign in, pour into the dashboard.
  redirect("/login");
}

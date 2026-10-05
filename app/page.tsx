import { redirect } from "next/navigation";

// The app has no public landing page. The authenticated layout sends
// signed-out visitors on to /login.
export default function Home() {
  redirect("/dashboard");
}

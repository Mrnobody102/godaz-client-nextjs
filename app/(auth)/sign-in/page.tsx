import { redirect } from 'next/navigation';

export default function Page() {
  // Sign-in UI moved to `AuthModal` component — remove this page to avoid duplicate UI.
  // Redirect to default locale root to keep behavior predictable.
  redirect('/vi');
}

import { redirect } from 'next/navigation';

export default function CookieRedirectPage() {
  redirect('/privacy#cookies-telemetry');
}

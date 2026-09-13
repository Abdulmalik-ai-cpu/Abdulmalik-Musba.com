import { redirect } from 'next/navigation';
import { PortalShell } from '@/components/portal-shell';

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  // The portal requires an authenticated session. Because the app is fully
  // client-side authenticated (opaque bearer tokens live in localStorage),
  // we gate on the client: the shell redirects unauthenticated users to /login.
  return <PortalShell>{children}</PortalShell>;
}
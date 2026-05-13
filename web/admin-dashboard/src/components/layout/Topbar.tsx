import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";

export default function Topbar() {
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();

  const appUrl = window.location.origin + import.meta.env.BASE_URL;

  return (
    <header className='flex h-14 shrink-0 items-center justify-between border-b bg-background px-6'>
      <span className='font-medium'>Classic Rock Admin</span>

      <div className='flex items-center gap-3'>
        {isLoading ? (
          <Button variant='outline' size='sm' disabled>
            Loading...
          </Button>
        ) : isAuthenticated ? (
          <>
            <span className='hidden text-sm text-muted-foreground sm:inline'>
              {user?.name ?? user?.email}
            </span>

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                logout({
                  logoutParams: {
                    returnTo: appUrl,
                  },
                })
              }
            >
              Log out
            </Button>
          </>
        ) : (
          <Button size='sm' onClick={() => loginWithRedirect()}>
            Log in
          </Button>
        )}
      </div>
    </header>
  );
}

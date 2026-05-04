import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { changePasswordAction } from '@/actions/profile';
import { SuccessBanner, ErrorBanner } from '@/components/ui/banners';

interface ChangePasswordSectionProps {
  errorMsg: string | null;
  passwordChanged: boolean;
}

export function ChangePasswordSection({ errorMsg, passwordChanged }: ChangePasswordSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-card p-6 space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Change Password</h2>

      {passwordChanged && <SuccessBanner message="Password updated successfully." />}
      {errorMsg && <ErrorBanner message={errorMsg} />}

      <form action={changePasswordAction} className="space-y-3">
        <div className="space-y-1.5">
          <label htmlFor="currentPassword" className="text-sm font-medium">Current password</label>
          <Input
            id="currentPassword"
            name="currentPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="newPassword" className="text-sm font-medium">New password</label>
          <Input
            id="newPassword"
            name="newPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm new password</label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
          />
        </div>
        <Button type="submit">Update password</Button>
      </form>
    </section>
  );
}

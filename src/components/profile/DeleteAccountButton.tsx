'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { deleteAccountAction } from '@/actions/profile';

export function DeleteAccountButton() {
  const [confirming, setConfirming] = useState(false);

  if (confirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">
          This will permanently delete your account and all your data. This cannot be undone.
        </p>
        <div className="flex gap-2">
          <form action={deleteAccountAction}>
            <Button type="submit" variant="destructive" size="sm">
              Yes, delete my account
            </Button>
          </form>
          <Button variant="outline" size="sm" onClick={() => setConfirming(false)}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Button variant="destructive" size="sm" onClick={() => setConfirming(true)}>
      Delete Account
    </Button>
  );
}

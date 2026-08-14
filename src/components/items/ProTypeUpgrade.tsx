import { File, Image as ImageIcon, Lock } from 'lucide-react';
import { UpgradeCard } from '@/components/settings/UpgradeCard';

interface ProTypeUpgradeProps {
  /** The pro type slug being gated: 'files' or 'images'. */
  type: string;
  typeName: string;
  typeColor: string;
}

export function ProTypeUpgrade({ type, typeName, typeColor }: ProTypeUpgradeProps) {
  const Icon = type === 'images' ? ImageIcon : File;
  const label = typeName.charAt(0).toUpperCase() + typeName.slice(1);

  return (
    <div className="p-6">
      <div className="mx-auto max-w-md space-y-6 rounded-xl border bg-card p-8 text-center">
        <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: `${typeColor}1a` }}>
          <Icon className="h-7 w-7" style={{ color: typeColor }} />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border bg-background">
            <Lock className="h-3 w-3 text-muted-foreground" />
          </span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-lg font-semibold">{label} uploads are a Pro feature</h1>
          <p className="text-sm text-muted-foreground">
            Upgrade to Pro to store {typeName.toLowerCase()}s and unlock the rest of DevStash.
          </p>
        </div>

        <div className="rounded-lg border bg-background p-5 text-left">
          <UpgradeCard />
        </div>
      </div>
    </div>
  );
}

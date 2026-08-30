'use client';

import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { LogOut, Settings as SettingsIcon } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/lib/firebase/client';
import { useAppSelector } from '@/store/hooks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';

function initials(name: string | null, email: string | null) {
  const source = name || email || '?';
  return source
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AccountMenu() {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);

  if (!user) return null;

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none rounded-full">
        <Avatar>
          {user.photoURL && <AvatarImage src={user.photoURL} alt={user.name || 'Account'} />}
          <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5 py-1.5">
          <span className="text-sm font-medium text-foreground truncate">{user.name || 'Account'}</span>
          <span className="text-xs text-muted-foreground truncate">{user.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <SettingsIcon size={16} />
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut} className="cursor-pointer">
          <LogOut size={16} />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

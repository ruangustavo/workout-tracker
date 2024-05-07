"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ComponentProps, ReactNode } from "react";

type NavLinkProps = ComponentProps<typeof Link> & { children: ReactNode };

export function NavLink({ children, ...props }: NavLinkProps) {
  const pathname = usePathname();

  return (
    <div
      className="w-full hover:bg-muted data-[current=true]:bg-primary/5 rounded-md p-2"
      data-current={pathname === props.href}
    >
      <Link
        className="text-sm font-medium text-muted-foreground data-[current=true]:font-medium data-[current=true]:text-primary flex items-center gap-2"
        data-current={pathname === props.href}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

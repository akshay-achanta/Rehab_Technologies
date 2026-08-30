"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Briefcase, FileText, User } from "lucide-react";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { apiLogout } from "@/lib/api";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!(sessionStorage.getItem("rehab_token") || localStorage.getItem("rehab_token")));
  }, [pathname]); // re-check on every page change

  const allLinks = [
    { name: "Home", href: "/", icon: Home },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "My Requests", href: "/my-requests", icon: FileText },
    { name: "Profile", href: "/profile", icon: User },
  ];

  const links = loggedIn ? allLinks : allLinks.filter(l => l.name === "Home");

  const handleLogout = () => {
    apiLogout();
    setLoggedIn(false);
    router.push("/");
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-6 pb-safe pt-2">
        <ul className="flex justify-between items-center h-14">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <Link href={link.href} className={clsx("flex flex-col items-center justify-center space-y-1", isActive ? "text-navy" : "text-concrete hover:text-navy-deep")}>
                  <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                  <span className="text-[10px] font-medium tracking-wide">{link.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-navy rounded-sm flex items-center justify-center text-gold font-bold text-lg">R</div>
                  <span className="font-heading font-bold text-navy-deep tracking-wider text-xl">REHAB TECHNOLOGIES</span>
                </Link>
              </div>
              <div className="ml-10 flex space-x-8">
                {links.map((link) => (
                  <Link key={link.name} href={link.href} className={clsx("inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors", pathname === link.href ? "border-navy text-navy" : "border-transparent text-concrete hover:border-gray-300 hover:text-navy-deep")}>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {loggedIn ? (
                  <button onClick={handleLogout} className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-danger shadow-sm hover:bg-red-800 transition-colors">
                    Log Out
                  </button>
                ) : (
                  <Link href="/login" className="relative inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-navy shadow-sm hover:bg-navy-deep transition-colors">
                    Login / Register
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

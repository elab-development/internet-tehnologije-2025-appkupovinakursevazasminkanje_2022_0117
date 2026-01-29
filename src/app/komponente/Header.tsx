"use client";

import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import { AuthContext } from "../komponente/AuthContext";

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  const uloga = user?.uloga; 

  return (
    <header className="site-header">
      <nav className="site-nav">
        {/* LOGO */}
        <Link href="/" className="nav-logo">
          <Image src="/logo.png" alt="Logo" width={70} height={70} />
        
        </Link>

        {/* DESNO */}
        <div className="nav-links">
          {!user && (
            <>
              <Link href="/login" className="nav-link">Prijava</Link>
              <Link href="/register" className="nav-link">Registracija</Link>
              <Link href="/stranice/o-nama" className="nav-link">O nama</Link>
            </>
          )}

          {uloga === "ADMIN" && (
            <>
              <Link href="/stranice/administratori/admin" className="nav-link">Admin panel</Link>
              <Link href="/stranice/administratori/klijenti-edukatori" className="nav-link">Klijenti i edukatori</Link>
              <Link href="/stranice/administratori/statistika" className="nav-link">Statistika</Link>
              <button onClick={logout} className="nav-link">
              Logout
            </button>
            </>
          )}

          {uloga === "EDUKATOR" && (
            <>
            <Link href="/stranice/edukatori/moji-kursevi" className="nav-link">Moji kursevi</Link>
            <Link href="/stranice/edukatori/klijenti" className="nav-link">Klijenti</Link>
            <button onClick={logout} className="nav-link">
              Logout
            </button>
            </>
          )}

          {uloga === "KLIJENT" && ( <>
            <Link href="/stranice/klijent/kupljeni-kursevi" className="nav-link">Moji kursevi</Link>
            <Link href="/stranice/klijent/kursevi" className="nav-link">Dostupni kursevi</Link>
             <Link href="/stranice/klijent/korpa" className="nav-link">
            <Image src="/korpa3.png" alt="Korpa" width={30} height={40} />
            </Link>
             <button onClick={logout} className="nav-link">
              Logout
            </button> 
          
            </>
          )}

        </div>
      </nav>
    </header>
  );
}

"use client";

import RoleGuard from "../../components/RoleGuard";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { VideoUpload } from "../../components/VideoUpload";
import {
  getKurseviEdukatora,
  getKursSaLekcijama,
  izmeniKompletanKurs,
} from "@/app/actions/kurs";
import { validirajLekciju } from "@/app/utils/validacijalekcije";

import Image from "next/image";
import { X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function IzmeniKursPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [kursevi, setKursevi] = useState<any[]>([]);
  const [selectedKursId, setSelectedKursId] = useState("");

  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const [kursData, setKursData] = useState({
    naziv: "",
    opis: "",
    cena: "",
    kategorija: "",
    slika: "",
  });

  const [lekcije, setLekcije] = useState<any[]>([]);
  const [trenutnaLekcija, setTrenutnaLekcija] = useState({
    naziv: "",
    opis: "",
    video: "",
    trajanje: "",
  });

  // Dohvati sve kurseve edukatora
  useEffect(() => {
    getKurseviEdukatora().then((res) => {
      setKursevi(res);

      // Ako postoji query param ?kursId, selektuj odmah taj kurs
      const kursIdIzQuery = searchParams.get("kursId");
      if (kursIdIzQuery && res.find((k) => k.id === kursIdIzQuery)) {
        setSelectedKursId(kursIdIzQuery);
      }
    });
  }, [searchParams]);

  // Dohvati podatke za selektovani kurs
  useEffect(() => {
    if (!selectedKursId) return;

    getKursSaLekcijama(selectedKursId).then((kurs) => {
      setKursData({
        naziv: kurs.naziv,
        opis: kurs.opis,
        cena: kurs.cena,
        kategorija: kurs.kategorija,
        slika: kurs.slika,
      });
      setLekcije(kurs.lekcije || []);
    });
  }, [selectedKursId]);

  const handleDodajLekcijuUListu = () => {
    const error = validirajLekciju(trenutnaLekcija);
    if (error) {
      setNotification({ message: error, type: "error" });
      return;
    }

    setLekcije((prev) => [...prev, trenutnaLekcija]);
    setTrenutnaLekcija({ naziv: "", opis: "", video: "", trajanje: "" });
    setNotification(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedKursId) {
      setNotification({ message: "Izaberite kurs!", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await izmeniKompletanKurs({
        id: selectedKursId,
        ...kursData,
        lekcije,
      });

      if (res.success) {
        setNotification({ message: "Kurs uspešno izmenjen!", type: "success" });
        setTimeout(() => router.push("/stranice/svi-kursevi"), 2000);
      } else {
        setNotification({ message: res.error || "Greška.", type: "error" });
      }
    } catch {
      setNotification({ message: "Problem sa serverom.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RoleGuard allowedRoles={["EDUKATOR"]}>
      <div className="auth-wrap min-h-screen pb-20">
        {notification && (
          <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 shadow-2xl border-2 border-[--color-accent] max-w-sm w-full text-center">
              <div
                className={`mx-auto mb-4 p-3 rounded-full w-fit ${
                  notification.type === "success"
                    ? "bg-green-100 text-green-500"
                    : "bg-red-100 text-red-500"
                }`}
              >
                {notification.type === "success" ? (
                  <CheckCircle size={40} />
                ) : (
                  <AlertCircle size={40} />
                )}
              </div>
              <p className="text-lg font-bold mb-6">{notification.message}</p>
              <button onClick={() => setNotification(null)} className="auth-btn">
                Zatvori
              </button>
            </div>
          </div>
        )}

        {/* Dropdown za izbor kursa */}
        <div className="auth-card max-w-xl mx-auto mt-10">
          <label className="contact-label">Izaberite kurs za izmenu</label>
          <select
            className="auth-input"
            value={selectedKursId}
            onChange={(e) => setSelectedKursId(e.target.value)}
          >
            <option value="">-- Izaberite kurs --</option>
            {kursevi.map((k) => (
              <option key={k.id} value={k.id}>
                {k.naziv}
              </option>
            ))}
          </select>
        </div>

        {/* Forma za izmenu kursa */}
        {selectedKursId && (
          <div className="auth-card max-w-4xl mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center uppercase tracking-widest">
              Izmeni kurs
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                className="auth-input"
                value={kursData.naziv}
                onChange={(e) => setKursData((p) => ({ ...p, naziv: e.target.value }))}
                placeholder="Naziv kursa"
              />

              <textarea
                className="auth-input min-h-[80px]"
                value={kursData.opis}
                onChange={(e) => setKursData((p) => ({ ...p, opis: e.target.value }))}
                placeholder="Opis kursa"
              />

              {!kursData.slika ? (
                <VideoUpload
                  label="Promeni sliku"
                  onUploadSuccess={(url) => setKursData((p) => ({ ...p, slika: url }))}
                />
              ) : (
                <div className="relative h-40 rounded-xl overflow-hidden">
                  <Image src={kursData.slika} alt="Slika kursa" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setKursData((p) => ({ ...p, slika: "" }))}
                    className="absolute top-2 right-2 bg-white rounded-full p-1"
                  >
                    <X />
                  </button>
                </div>
              )}

              {/* Lekcije */}
              <div className="border-2 border-dashed border-black rounded-2xl p-5 mb-6">
                <h2 className="font-bold text-lg mb-4 text-center">
                  Lekcije u okviru kursa
                </h2>

                {lekcije.length === 0 && (
                  <p className="text-center text-gray-500 mb-3">
                    Trenutno nema dodatih lekcija
                  </p>
                )}

                {lekcije.map((l, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-white p-3 rounded-xl mb-2 shadow-sm"
                  >
                    <span className="font-medium">
                      {l.naziv} ({l.trajanje} min)
                    </span>
                  </div>
                ))}

                <input
                  className="auth-input mt-4"
                  placeholder="Naziv lekcije"
                  value={trenutnaLekcija.naziv}
                  onChange={(e) => setTrenutnaLekcija((p) => ({ ...p, naziv: e.target.value }))}
                />

                <textarea
                  className="auth-input mt-2 min-h-[60px]"
                  placeholder="Opis lekcije"
                  value={trenutnaLekcija.opis}
                  onChange={(e) => setTrenutnaLekcija((p) => ({ ...p, opis: e.target.value }))}
                />

                <input
                  type="number"
                  className="auth-input mt-2"
                  placeholder="Trajanje (min)"
                  value={trenutnaLekcija.trajanje}
                  onChange={(e) => setTrenutnaLekcija((p) => ({ ...p, trajanje: e.target.value }))}
                />

                {!trenutnaLekcija.video && (
                  <VideoUpload
                    label="Dodaj video lekcije"
                    onUploadSuccess={(url) => setTrenutnaLekcija((p) => ({ ...p, video: url }))}
                  />
                )}

                <button
                  type="button"
                  onClick={handleDodajLekcijuUListu}
                  className="auth-btn mt-4 w-full"
                >
                  + Dodaj lekciju
                </button>
              </div>

              <button type="submit" disabled={loading} className="auth-btn text-lg">
                {loading ? <Loader2 className="animate-spin mx-auto" /> : "SAČUVAJ IZMENE"}
              </button>
            </form>
          </div>
        )}
      </div>
    </RoleGuard>
  );
}

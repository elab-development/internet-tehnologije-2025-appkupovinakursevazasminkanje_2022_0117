export function validirajLekciju(lekcija: {
  naziv: string;
  opis: string;
  video: string;
  trajanje: string;
}): string | null {
  if (!lekcija.naziv.trim()) return "Unesite naziv lekcije!";
  if (!lekcija.opis.trim()) return "Unesite opis lekcije!";
  if (!lekcija.video) return "Otpremite video lekcije!";
  if (!lekcija.trajanje || Number(lekcija.trajanje) <= 0)
    return "Unesite ispravno trajanje lekcije!";

  return null;
}

import "./globals.css";
import Header from "./komponente/Header";
import Footer from "./komponente/Footer";
import { AuthProvider } from "./komponente/AuthContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr">
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}

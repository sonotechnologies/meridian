import "./globals.css";

export const metadata = {
  title: "Deutsche Bank ",
  description: "Deutsche Bank",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="demo-banner">
          {/* ⚠ DEMO APPLICATION — NOT A REAL BANK — NO DATA LEAVES YOUR BROWSER */}
        </div>
        {children}
      </body>
    </html>
  );
}

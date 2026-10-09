import Link from "next/link";
import PrescriptionScanner from "@/components/PrescriptionScanner";
import QrScanner from "@/components/QrScanner";
export default function Scanner({ searchParams }: { searchParams: { tab?: string } }) {
  const qr = searchParams.tab === "qr";
  return (<div className="mx-auto max-w-2xl space-y-6 px-5 py-10"><h1 className="font-display text-3xl">Scanner</h1>
    <div className="flex gap-3"><Link href="?tab=rx" className={`btn !py-2 text-sm ${qr ? "btn-ghost" : "btn-primary"}`}>Prescription</Link><Link href="?tab=qr" className={`btn !py-2 text-sm ${qr ? "btn-primary" : "btn-ghost"}`}>QR code</Link></div>
    {qr ? <QrScanner /> : <PrescriptionScanner />}</div>);
}

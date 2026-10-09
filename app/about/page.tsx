const cards = [["Connected healthcare","One place for hospitals, doctors and tools."],["Hospital discovery","Search and filter hospitals across Thrissur."],["Doctor discovery","Browse doctors by department and rating."],["Smart prescription tools","OCR and English standardization — never diagnosis."],["Location and maps","Every hospital has its own map and directions."],["Digital communication","Chat with doctors (demo mode until real accounts are connected)."]];
export default function About() {
  return (<div className="mx-auto max-w-6xl px-5 py-16">
    <h1 className="font-display text-4xl font-bold">What is MedInexa?</h1>
    <p className="mt-4 max-w-2xl text-slate-300">MedInexa is a connected healthcare discovery platform that helps users explore hospitals, departments, doctors, facilities, locations and digital healthcare utilities from one place.</p>
    <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([t, d]) => <div key={t} className="glass hov p-6"><h2 className="font-semibold text-cyan-200">{t}</h2><p className="mt-2 text-sm text-slate-300">{d}</p></div>)}</div>
  </div>);
}

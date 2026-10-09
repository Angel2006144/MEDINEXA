// ALL DATA BELOW IS SAMPLE/DEMO. Names, phones, coordinates and reviews are NOT verified. Replace before launch.
import { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { hash } from "../lib/password";
const db = new PrismaClient();
let s = 42; const rnd = () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
const many = <T,>(a: T[], n: number) => [...a].sort(() => rnd() - 0.5).slice(0, n);

const names = ["Jubilee Mission Medical College","Amala Institute of Medical Sciences","Elite Mission Hospital","West Fort Hi-Tech Hospital","Aswini Hospital","Daya General Hospital","Government Medical College Thrissur","Thrissur Heart Care","Mother Care Women's Hospital","Sacred Heart Clinic","Pooram City Hospital","Vadakkumnathan Specialty Hospital","Swaraj Round Medical Centre","Kerala Neuro Institute","Chembukkavu Family Hospital","Punkunnam Eye & ENT Centre","Ayyanthole Multispeciality","Kuttanellur Community Hospital","Ollur Care Hospital","Mannuthy Medical Centre","Wadakkanchery General Hospital","Irinjalakuda Medical Mission","Chalakudy Life Hospital","Guruvayur Temple Town Hospital","Kunnamkulam Metro Hospital","Kodungallur Coastal Hospital","Peramangalam Ortho Centre","Anthikad Child Care Hospital"];
const depts = ["Cardiology","Neurology","Orthopedics","Pediatrics","Dermatology","ENT","General Medicine","General Surgery","Gynecology","Oncology","Radiology","Psychiatry","Dentistry","Emergency Medicine"];
const facs = ["Emergency","ICU","Pharmacy","Laboratory","MRI","CT Scan","Ambulance","Blood Bank","Diagnostic Services","24/7 Services","Dialysis","Cath Lab","Physiotherapy","Parking"];
const first = ["Anil","Maya","Rajesh","Sreeja","Vinod","Lakshmi","Arun","Divya","Suresh","Anitha","Faisal","Meera","George","Nisha","Thomas"];
const last = ["Nair","Menon","Varghese","Pillai","Kurian","Das","Mathew","Warrier","Kumar","Thomas"];
const langs = ["Malayalam","English","Hindi","Tamil"];
const texts = ["Sample review: staff were helpful and the wait was short.","Sample review: clean facility and clear explanations.","Sample review: good experience overall, parking was busy.","Sample review: quick emergency response.","Sample review: reasonable billing and clear communication."];

const svcs = [{name:"Full health checkup",price:1500},{name:"Blood test panel",price:600},{name:"MRI scan",price:6000},{name:"CT scan",price:3500},{name:"Vaccination",price:400},{name:"Physiotherapy session",price:700},{name:"ECG",price:300},{name:"Dental cleaning",price:800}]; // sample prices
async function main() {
  await db.shareToken.deleteMany(); await db.appointment.deleteMany(); await db.service.deleteMany(); await db.message.deleteMany(); await db.chat.deleteMany(); await db.review.deleteMany();
  await db.doctor.deleteMany(); await db.hospitalFacility.deleteMany(); await db.hospitalDepartment.deleteMany();
  await db.hospital.deleteMany(); await db.department.deleteMany(); await db.facility.deleteMany();
  for (const [email, name, role] of [["patient@medinexa.demo", "Demo Patient", "PATIENT"], ["admin@medinexa.demo", "Demo Admin", "SUPER_ADMIN"]] as const)
    await db.user.upsert({ where: { email }, update: {}, create: { email, name, role, passwordHash: hash("demo1234") } }); // demo credentials only
  const D = await Promise.all(depts.map(name => db.department.create({ data: { name } })));
  const F = await Promise.all(facs.map(name => db.facility.create({ data: { name } })));
  for (let i = 0; i < names.length; i++) {
    const hd = many(D, 5 + Math.floor(rnd() * 5));
    const h = await db.hospital.create({ data: {
      slug: names[i].toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: names[i],
      shortDescription: "Sample listing — multispeciality care in the Thrissur region.",
      description: "Demo description. Replace with verified hospital information before publishing.",
      address: `Demo address ${i + 1}, Thrissur, Kerala`, pincode: "680001", phone: "+91 487 000 0000",
      email: "info@example.com", emergencyPhone: "+91 487 000 0001", hasAmbulance: rnd() > 0.3, open24x7: rnd() > 0.4,
      openingHours: "Mon–Sat 8:00–20:00 (sample)", landmark: "Near Swaraj Round (sample)", insuranceInfo: "Sample: major insurers accepted",
      lat: 10.5276 + (rnd() - 0.5) * 0.22, lng: 76.2144 + (rnd() - 0.5) * 0.22,
      departments: { create: hd.map(d => ({ departmentId: d.id })) },
      facilities: { create: many(F, 6 + Math.floor(rnd() * 6)).map(f => ({ facilityId: f.id, isNew: rnd() > 0.85, isFeatured: rnd() > 0.8 })) },
    }});
    await db.service.createMany({ data: many(svcs, 4).map(s => ({ ...s, description: "Sample service", hospitalId: h.id })) });
    for (const d of hd) for (let k = 0; k < (rnd() > 0.5 ? 2 : 1); k++) {
      const doc = await db.doctor.create({ data: {
        name: `Dr. ${pick(first)} ${pick(last)}`, specialization: d.name, experienceYears: 3 + Math.floor(rnd() * 25),
        qualifications: "MBBS, MD (sample)", languages: many(langs, 2), bio: "Demo doctor profile.", consultationFee: 300 + Math.floor(rnd() * 8) * 100,
        availability: "Mon–Fri 10:00–13:00 (sample)", online: rnd() > 0.5, hospitalId: h.id, departmentId: d.id } });
      for (let r = 0; r < 2; r++) await db.review.create({ data: { rating: 3 + Math.floor(rnd() * 3), text: pick(texts), displayName: "Demo User", doctorId: doc.id } });
    }
    for (let r = 0; r < 8; r++) await db.review.create({ data: { rating: 3 + Math.floor(rnd() * 3), text: pick(texts), displayName: "Demo User", category: pick(["Care","Staff","Facilities"]), hospitalId: h.id } });
  }
  const h0 = (await db.hospital.findFirst())!, d0 = (await db.doctor.findFirst({ where: { hospitalId: h0.id } }))!;
  await db.user.upsert({ where: { email: "hospital@medinexa.demo" }, update: { hospitalId: h0.id }, create: { email: "hospital@medinexa.demo", name: "Demo Hospital Admin", role: "HOSPITAL_ADMIN", hospitalId: h0.id, passwordHash: hash("demo1234") } });
  await db.user.upsert({ where: { email: "doctor@medinexa.demo" }, update: { doctorId: d0.id }, create: { email: "doctor@medinexa.demo", name: "Demo Doctor", role: "DOCTOR", doctorId: d0.id, passwordHash: hash("demo1234") } });
  for (const h of await db.hospital.findMany({ take: 3 })) { const t = randomBytes(8).toString("hex"); await db.shareToken.create({ data: { token: t, targetType: "hospital", targetId: h.slug } }); console.log("QR token (hospital)", h.name, t); }
  for (const d of await db.doctor.findMany({ take: 2 })) { const t = randomBytes(8).toString("hex"); await db.shareToken.create({ data: { token: t, targetType: "doctor", targetId: d.id } }); console.log("QR token (doctor)", d.name, t); }
  console.log("Seeded demo data. Demo logins (password demo1234): patient@ / hospital@ / doctor@ / admin@medinexa.demo");
}
main().finally(() => db.$disconnect());

import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Wrench,
  Camera,
  Laptop,
  Cpu,
  ShieldCheck,
  Phone,
  MessageCircle,
  Clock,
  MapPin,
  CheckCircle2,
  HardDrive,
  Wifi,
} from 'lucide-react';
import { business, getServiceWhatsAppLink } from '@/lib/business';

export const metadata: Metadata = {
  title: 'Computer & CCTV Servicing Moulvibazar | Repair & Maintenance',
  description:
    'Professional computer servicing, CCTV camera installation & repair in Moulvibazar. Call Service: 01608346407 or WhatsApp: 8801608346407. T.S Plaza, Kusumbagh, Moulvibazar.',
  keywords: [
    'Computer servicing Moulvibazar',
    'CCTV repair Moulvibazar',
    'Laptop repair Moulvibazar',
    'CCTV installation Moulvibazar',
    'PC maintenance Moulvibazar',
    'Trust Computer service',
  ],
  alternates: {
    canonical: 'https://trustcomputermb.com/services',
  },
};

export default function ServicesPage() {
  const serviceWhatsAppUrl = getServiceWhatsAppLink();

  const servicesList = [
    {
      icon: Camera,
      title: 'CCTV Camera Setup & Repair',
      description:
        'Professional installation, configuration, DVR/NVR repair, IP camera networking, and power maintenance for homes, retail stores, and commercial premises.',
      features: ['Hikvision & Dahua certified setup', 'Mobile app remote viewing configuration', 'Cable management & signal restoration', 'Annual Maintenance Contracts (AMC)'],
    },
    {
      icon: Laptop,
      title: 'Laptop Hardware & Screen Repair',
      description:
        'Chip-level motherboard diagnosis, display panel replacement, keyboard repair, hinge fixing, and cooling system servicing for HP, Dell, Asus, Lenovo & Acer laptops.',
      features: ['Broken display & backlight repair', 'Battery & charging port replacement', 'Overheating & thermal paste renewal', 'Liquid damage recovery'],
    },
    {
      icon: Cpu,
      title: 'Custom PC Assembly & Troubleshooting',
      description:
        'Custom desktop workstation & gaming rig building, component troubleshooting, BSOD fixing, hardware compatibility diagnosis, and performance tuning.',
      features: ['Custom gaming & editing PC build', 'RAM, GPU & PSU testing', 'BIOS updates & hardware diagnostics', 'Quiet cooling & airflow optimization'],
    },
    {
      icon: HardDrive,
      title: 'Storage Upgrade & OS Installation',
      description:
        'NVMe/SATA SSD upgrades to boost system speed by 5x–10x, genuine Windows/Linux installation, virus/malware eradication, and secure data backup.',
      features: ['High-speed M.2 SSD installation', 'Official Windows OS setup & drivers', 'Data transfer & partition management', 'Malware removal & security hardening'],
    },
    {
      icon: Wifi,
      title: 'Networking & Router Configuration',
      description:
        'Wi-Fi router setup, mesh system deployment, Gigabit switches, optical fiber patch cords, RJ45 termination, and office LAN connectivity troubleshooting.',
      features: ['Dual-band & Wi-Fi 6 router tuning', 'Dead-zone elimination & range extension', 'CAT6 cabling & patch panel punching', 'Bandwidth management & firewall setup'],
    },
    {
      icon: Wrench,
      title: 'Warranty Support & Hardware Servicing',
      description:
        'Authorized claim facilitation for official brand warranties, testing, component replacement, and manufacturer RMA tracking.',
      features: ['Direct manufacturer claim facilitation', 'Authentic replacement parts', 'Pre-service hardware inspection', 'Transparent status tracking'],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-6xl space-y-12">
      {/* Header Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2A3B97] text-xs font-bold">
          <Wrench className="w-3.5 h-3.5 text-[#2A3B97]" />
          <span>Trust Computer Official Technical Support</span>
        </div>

        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
          Computer & CCTV Servicing in Moulvibazar
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Expert diagnosis, precision hardware repair, CCTV surveillance installation, and technical support directly from our dedicated technical team at T.S Plaza, Kusumbagh.
        </p>

        {/* Primary Contact CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={business.service.tel}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#081621] hover:bg-slate-800 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Call Service: {business.service.phone}</span>
          </a>

          <a
            href={serviceWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition"
          >
            <MessageCircle className="w-4 h-4" />
            <span>WhatsApp Service: {business.service.phone}</span>
          </a>
        </div>
      </div>

      {/* Service Hotline Showcase Box */}
      <div className="bg-gradient-to-br from-slate-900 via-[#1E2B6C] to-[#0B1536] text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-700/60">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-300 text-xs font-bold">
            <Clock className="w-3.5 h-3.5" />
            <span>Service Center Hours: Saturday – Thursday (10:00 AM – 9:00 PM)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black">
            Need Immediate Technical Help or On-Site CCTV Setup?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Our specialized Service department is dedicated to repairs, technical enquiries, CCTV maintenance, and warranty support.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto flex-shrink-0">
          <a
            href={business.service.tel}
            className="flex items-center justify-center gap-2 bg-white text-slate-950 hover:bg-slate-100 font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm transition shadow"
          >
            <Phone className="w-4 h-4 text-[#0084d6]" />
            <span>Call {business.service.phone}</span>
          </a>

          <a
            href={serviceWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold py-3 px-5 rounded-xl text-xs sm:text-sm transition shadow"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Message Service WhatsApp</span>
          </a>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {servicesList.map((srv, idx) => {
          const Icon = srv.icon;
          return (
            <div
              key={idx}
              className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2A3B97] border border-blue-100 flex items-center justify-center group-hover:scale-105 transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 group-hover:text-[#0084d6] transition">
                  {srv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Service Highlights:
                </span>
                <ul className="space-y-1.5 text-[11px] text-slate-700">
                  {srv.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-2">
                <a
                  href={`https://wa.me/${business.service.whatsapp}?text=${encodeURIComponent(
                    `Hello Trust Computer, I need service assistance regarding "${srv.title}".`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-bold py-2 px-3 rounded-xl text-xs transition"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inquire via WhatsApp</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Showroom Location Details Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="p-3.5 rounded-2xl bg-rose-50 text-[#E91D26] border border-rose-100 flex-shrink-0">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Showroom & Service Center Location
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              {business.address}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Friday Closed • Saturday to Thursday: 10:00 AM – 9:00 PM
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Link
            href="/moulvibazar"
            className="flex-1 md:flex-none text-center bg-[#2A3B97] hover:bg-[#212F7A] text-white font-bold py-3 px-5 rounded-xl text-xs transition"
          >
            Moulvibazar Showroom
          </Link>
          <Link
            href="/contact"
            className="flex-1 md:flex-none text-center bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-xs transition"
          >
            Showroom Map & Contact
          </Link>
        </div>
      </div>
    </div>
  );
}

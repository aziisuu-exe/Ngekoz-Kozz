"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { IconMessageQuestion } from "@tabler/icons-react";

export function FaqSection() {
  const faqs = [
    {
      question: "Apakah ada biaya tambahan atau admin tersembunyi?",
      answer: "Jelas ada dong. Developer mempunyai jiwa kapitalis."
    },
    {
      question: "Apakah saya bisa melakukan survey langsung ke lokasi?",
      answer: "Tentu saja! Setelah menemukan kos yang cocok, kamu bisa menggunakan fitur 'Jadwalkan Survey' untuk bertemu langsung dengan pemilik atau pengelola kos sebelum membayar."
    },
    {
      question: "Bagaimana sistem pengembalian dana (refund) jika batal ngekos?",
      answer: "Kebijakan refund bergantung pada aturan masing-masing kos yang tertera di halaman detail. Namun, Ngekoz akan membantu menengahi proses pengembalian dana sesuai syarat dan ketentuan yang berlaku jika terjadi kendala."
    },
    {
      question: "Metode pembayaran apa saja yang didukung?",
      answer: "Kami mendukung berbagai metode pembayaran melalui Payment Gateway aman, termasuk Bank Transfer (Virtual Account), e-Wallet (GoPay, OVO, Dana), dan QRIS."
    },
    {
      question: "Bagaimana jika foto kos tidak sesuai dengan aslinya?",
      answer: "Ngekoz memiliki tim verifikasi internal. Jika kamu menemukan ketidaksesuaian yang parah saat tiba di lokasi, laporkan dalam 1x24 jam dan kami berikan jaminan uang kembali 100%."
    }
  ];

  return (
    <section id="faq" className="w-full py-20 bg-gray-50/50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 rotate-3">
            <IconMessageQuestion size={28} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Pertanyaan yang Sering Diajukan</h2>
          <p className="text-lg text-gray-500">
            Masih ragu? Temukan jawaban untuk pertanyaan-pertanyaan umum seputar layanan Ngekoz di bawah ini.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-semibold text-gray-900 hover:text-purple-700 hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  );
}
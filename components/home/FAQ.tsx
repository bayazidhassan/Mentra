'use client';

import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: 'How does the AI roadmap work?',
    answer:
      "Our AI analyzes your goals, current skill level, and available time to generate a step-by-step personalized learning plan. It adapts as you progress and can be refined with your mentor's input.",
  },
  {
    question: "Can I switch mentors if it's not a good fit?",
    answer:
      'Absolutely. You can switch mentors at any time with no penalty. We want you to have the best learning experience possible and will help you find a better match.',
  },
  {
    question: 'How much does Mentra cost?',
    answer:
      "Mentra is free to join. You only pay for mentor sessions at the mentor's hourly rate. There are no subscription fees or hidden charges.",
  },
  {
    question: 'What skill areas do you cover?',
    answer:
      'We cover 50+ skill categories including software engineering, data science, product management, UX design, machine learning, cloud computing, and more.',
  },
  {
    question: 'How are mentors vetted?',
    answer:
      'All mentors go through a rigorous application and interview process. We verify their work experience, assess their teaching ability, and collect ongoing feedback from learners.',
  },
  {
    question: 'How long does it take to get matched with a mentor?',
    answer:
      'Most learners get matched within 24 hours. Our AI instantly suggests the best mentors for your goals and you can start chatting right away.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="px-6 py-20 bg-[#f8f7ff]">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="inline-block bg-indigo-50 text-indigo-700 text-xs font-medium uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
            FAQ
          </span>
          <h2
            className="text-4xl font-bold text-gray-900 tracking-tight mb-3"
            style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Frequently asked questions
          </h2>
          <p className="text-base text-gray-500 font-light">
            Everything you need to know about Mentra.
          </p>
        </div>

        {/* FAQ list */}
        <div className="flex flex-col gap-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-200 transition-colors"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex items-center justify-between px-6 py-5 text-left cursor-pointer"
              >
                <span
                  className="text-sm font-medium text-gray-900"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  {faq.question}
                </span>
                <span className="ml-4 shrink-0 text-indigo-600">
                  {openIndex === index ? (
                    <Minus size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-5">
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const faqs = [
  {
    question: 'How do I track my payment installments?',
    answer:
      'Navigate to the Payments section from the sidebar. You can view a full breakdown of all installments, their due dates, amounts, and payment status there.',
  },
  {
    question: 'How do I view project updates?',
    answer:
      'Go to Project Updates in the sidebar. Select your enrolled project from the dropdown to see the latest construction progress, journal entries, and timeline milestones.',
  },
  {
    question: 'How do I change my password?',
    answer:
      'Go to Settings from the sidebar, scroll down to the Security section, enter your current password, set a new one, confirm it, and click "Update Password".',
  },
  {
    question: 'How do I submit a support request?',
    answer:
      'Use the "Submit Feedback" option in the Support section of the sidebar, or contact us directly via email or phone listed on this page.',
  },
  {
    question: 'Why is my enrollment still pending?',
    answer:
      'Enrollment requests are reviewed by our admin team typically within 1–2 business days. You will receive an email notification once your request is approved or if additional information is needed.',
  },
  {
    question: 'How do I download my payment receipt?',
    answer:
      'From the Payments page, locate the payment you want and click the download icon next to it to get a PDF receipt.',
  },
];

export const GetHelpPage: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1
          className="text-3xl font-bold mb-2"
          style={{
            fontFamily: 'Playfair Display, serif',
            backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Help & Support
        </h1>
        <p style={{ color: 'rgba(156, 163, 175, 0.9)' }}>
          Find answers to common questions or reach out to our support team
        </p>
      </motion.div>

      {/* Contact Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {[
          {
            icon: PhoneIcon,
            title: 'Call Us',
            detail: '+92 301 000 0000',
            sub: 'Mon – Sat, 9 AM – 6 PM',
          },
          {
            icon: EnvelopeIcon,
            title: 'Email Us',
            detail: 'support@absdevelopers.com',
            sub: 'We reply within 24 hours',
          },
          {
            icon: ChatBubbleLeftRightIcon,
            title: 'Live Chat',
            detail: 'Chat with our AI assistant',
            sub: 'Available 24/7 via the chat bubble',
          },
        ].map((card, i) => (
          <Card key={i} className="abs-card">
            <CardContent className="flex flex-col items-center text-center p-6 space-y-3">
              <div
                className="h-12 w-12 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(0,0,0,0.6))',
                  border: '1px solid rgba(212,175,55,0.3)',
                }}
              >
                <card.icon className="h-6 w-6" style={{ color: '#d4af37' }} />
              </div>
              <p className="font-semibold text-white">{card.title}</p>
              <p className="text-sm font-medium" style={{ color: '#d4af37' }}>
                {card.detail}
              </p>
              <p className="text-xs" style={{ color: 'rgba(156,163,175,0.8)' }}>
                {card.sub}
              </p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* FAQ Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="abs-card">
          <CardHeader>
            <CardTitle
              className="flex items-center"
              style={{ fontFamily: 'Playfair Display, serif', color: '#d4af37' }}
            >
              <QuestionMarkCircleIcon className="h-5 w-5 mr-2" />
              Frequently Asked Questions
            </CardTitle>
            <div className="mt-3">
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: '#000000',
                  border: '1px solid rgba(212,175,55,0.25)',
                  color: '#ffffff',
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filteredFaqs.length === 0 ? (
              <p className="text-sm text-center py-6" style={{ color: 'rgba(156,163,175,0.8)' }}>
                No FAQs match your search.
              </p>
            ) : (
              filteredFaqs.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden"
                  style={{
                    border: '1px solid rgba(212,175,55,0.15)',
                    background:
                      openFaq === i
                        ? 'linear-gradient(135deg, rgba(212,175,55,0.08), rgba(0,0,0,0.6))'
                        : 'transparent',
                  }}
                >
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="text-sm font-medium text-white">{faq.question}</span>
                    {openFaq === i ? (
                      <ChevronUpIcon className="h-4 w-4 flex-shrink-0 ml-2" style={{ color: '#d4af37' }} />
                    ) : (
                      <ChevronDownIcon className="h-4 w-4 flex-shrink-0 ml-2" style={{ color: 'rgba(156,163,175,0.6)' }} />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="px-4 pb-4">
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(156,163,175,0.9)' }}>
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Still need help CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="abs-card">
          <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4 p-6">
            <div>
              <p className="font-semibold text-white text-lg">Still need help?</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(156,163,175,0.8)' }}>
                Send us a message and our team will get back to you shortly.
              </p>
            </div>
            <Button
              className="text-black font-semibold whitespace-nowrap"
              style={{ backgroundImage: 'linear-gradient(135deg, #d4af37, #f4e68c)' }}
              onClick={() => window.location.href = window.location.href.replace('get-help', 'submit-feedback')}
            >
              Submit a Request
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ArrowUpRight, Check, Copy, Mail, MapPin, Phone } from 'lucide-react';
import { SHOP_INFO } from '../data/spices';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';

export function VisitContactSection() {
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Spice Availability & Pricing');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SHOP_INFO.mapsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    const path = 'inquiries';
    try {
      await addDoc(collection(db, path), {
        name: name.trim().slice(0, 120),
        email: email.trim().slice(0, 160),
        topic: topic.trim().slice(0, 120),
        message: message.trim().slice(0, 2000),
        status: 'New',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      setSubmitError('Unable to send inquiry right now. Please try again or email us directly.');
      handleFirestoreError(error, OperationType.CREATE, path);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-[1200px] mx-auto px-6 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#5C5852]">
          <a href="#/" className="hover:text-[#171614] hover:underline underline-offset-4">
            Home
          </a>
          <span aria-hidden="true">/</span>
          <span className="text-[#171614] font-medium">Visit &amp; Contact</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Shop Location, Hours & Direct Contact */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-3">
              <p className="text-xs font-medium tracking-wide uppercase text-[#8C1D2F]">
                Apothecary &amp; Tasting Counter
              </p>
              <h1 className="font-display text-3xl md:text-4xl font-medium text-[#171614] text-balance">
                Visit {SHOP_INFO.brand} in person
              </h1>
              <p className="text-base text-[#5C5852] leading-relaxed max-w-xl">
                Stop by our milling counter to smell whole single-origin harvests before we grind them to order, or follow our daily spice dispatches on TikTok.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-2 border-t border-[#171614]/10">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#171614]">
                  <MapPin className="w-4 h-4 text-[#8C1D2F]" />
                  <span>Shop Location</span>
                </div>
                <address className="not-italic text-sm text-[#5C5852] leading-relaxed">
                  {SHOP_INFO.addressLine1}
                  <br />
                  {SHOP_INFO.addressLine2}
                </address>
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href={SHOP_INFO.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#171614] hover:text-[#8C1D2F] underline underline-offset-4 transition-colors whitespace-nowrap"
                  >
                    <span>Open in Google Maps</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#5C5852] hover:text-[#171614] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#8C1D2F]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Maps Link Copied' : 'Copy Maps Link'}</span>
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="text-sm font-semibold text-[#171614]">Counter Hours</div>
                <dl className="space-y-1.5 text-sm">
                  {SHOP_INFO.hours.map((row) => (
                    <div key={row.days} className="flex justify-between gap-4 text-[#5C5852]">
                      <dt>{row.days}</dt>
                      <dd className="tabular-nums text-[#171614] font-medium whitespace-nowrap">
                        {row.time}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            <div className="pt-6 border-t border-[#171614]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="space-y-2 text-sm">
                <a
                  href={`tel:${SHOP_INFO.phone.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-[#171614] hover:text-[#8C1D2F] transition-colors tabular-nums"
                >
                  <Phone className="w-4 h-4 text-[#8C1D2F]" />
                  <span>{SHOP_INFO.phone}</span>
                </a>
                <a
                  href={`mailto:${SHOP_INFO.email}`}
                  className="flex items-center gap-2 text-[#171614] hover:text-[#8C1D2F] transition-colors"
                >
                  <Mail className="w-4 h-4 text-[#8C1D2F]" />
                  <span>{SHOP_INFO.email}</span>
                </a>
              </div>

              <a
                href={SHOP_INFO.tiktokUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#171614] hover:bg-[#8C1D2F] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <span>Follow {SHOP_INFO.tiktokHandle} on TikTok</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right Column: Direct Shop Message & Custom Grind Inquiry */}
          <div className="lg:col-span-6 bg-[#EFECE6] rounded-xl p-8 border border-[#171614]/8">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-11 h-11 mx-auto rounded-full bg-[#8C1D2F]/10 text-[#8C1D2F] flex items-center justify-center">
                  <Check className="w-5 h-5" />
                </div>
                <h2 className="font-display text-2xl font-medium text-[#171614]">
                  Message Received
                </h2>
                <p className="text-sm text-[#5C5852] max-w-sm mx-auto leading-relaxed">
                  Thank you for reaching out to {SHOP_INFO.brand}. Your note has been logged in our shop inbox and we will reply within one business day.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2 text-xs font-semibold text-[#171614] bg-white border border-[#171614]/15 rounded-lg hover:border-[#171614]/40 transition-colors cursor-pointer"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <h2 className="font-display text-2xl font-medium text-[#171614]">
                    Message {SHOP_INFO.brand}
                  </h2>
                  <p className="text-sm text-[#5C5852] mt-1">
                    Ask about custom spice grinds, tasting flights, or restaurant supply.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-[#171614] mb-1.5">
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      maxLength={120}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Chef or home cook"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-[#171614] mb-1.5">
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      maxLength={160}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-topic" className="block text-xs font-medium text-[#171614] mb-1.5">
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F]"
                  >
                    <option>Spice Availability &amp; Pricing</option>
                    <option>Custom Blend or Grind Request</option>
                    <option>Wholesale &amp; Kitchen Supply</option>
                    <option>TikTok Feature Request (@monero995)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-[#171614] mb-1.5">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={4}
                    required
                    maxLength={2000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Let us know which spices or quantities you are looking for..."
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#171614]/15 rounded-lg focus:outline-none focus:border-[#8C1D2F] resize-none"
                  />
                </div>

                {submitError && (
                  <p className="text-xs text-[#8C1D2F] font-medium">{submitError}</p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 px-5 text-sm font-semibold text-white bg-[#8C1D2F] hover:bg-[#731625] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Sending Inquiry...' : 'Send Inquiry'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

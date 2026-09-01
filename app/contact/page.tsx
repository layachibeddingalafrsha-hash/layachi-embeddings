"use client";

import { useState, useEffect } from "react";
import { trackContact, trackLead } from "@/components/MetaPixel";
import { useI18n } from "@/lib/i18n";

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  display_order: number;
}

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const { locale, t } = useI18n();

  useEffect(() => {
    // Fetch social links
    fetch('/api/social-links')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setSocialLinks(data.data);
        }
      })
      .catch(error => console.error('Error loading social links:', error));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to submit");
      }

      setSuccess(true);
      setForm({ name: "", email: "", phone: "", title: "", message: "" });

      // Track Meta Pixel standard events for contact form submission
      trackContact({ email: form.email, phone: form.phone });
      trackLead({ email: form.email, phone: form.phone });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const getSocialIcon = (platform: string) => {
    const icons: Record<string, JSX.Element> = {
      facebook: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      instagram: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      ),
      tiktok: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
        </svg>
      ),
      whatsapp: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      ),
      email: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    };
    return icons[platform] || null;
  };

  const getPlatformName = (platform: string) => {
    const names: Record<string, { ar: string, fr: string }> = {
      facebook: { ar: 'فيسبوك', fr: 'Facebook' },
      instagram: { ar: 'إنستغرام', fr: 'Instagram' },
      tiktok: { ar: 'تيك توك', fr: 'TikTok' },
      whatsapp: { ar: 'واتساب', fr: 'WhatsApp' },
      email: { ar: 'البريد الإلكتروني', fr: 'E-mail' },
    };
    return names[platform]?.[locale] || platform;
  };

  return (
    <div className="min-h-screen bg-gray-light">
      {/* Header Section */}
      <div className="relative bg-[#0F0F0F] text-white py-16 lg:py-20 overflow-hidden mb-12">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-black via-[#1A1613] to-[#2C2520] opacity-95" />
        
        {/* Decorative soft glow */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-white/3 blur-[100px] pointer-events-none" />

        {/* Gold top rule */}
        <div className="absolute top-0 inset-x-0 h-px bg-[#D4AF37]/40" />

        <div className="container relative z-10 text-center">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            <p className="inline-flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-[#D4AF37]/70" />
              <span className="text-[10px] font-sans font-semibold uppercase tracking-[0.32em] text-[#D4AF37]/90">
                Layachi Bedding
              </span>
              <span className="h-px w-6 bg-[#D4AF37]/70" />
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif mb-4 text-white">
              {t('contact.title')}
            </h1>
            <p className="text-lg font-sans font-light tracking-wide text-white/70 max-w-xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form - Takes 2 columns */}
          <div className="lg:col-span-2">
            {success && (
              <div className="bg-zak-black/10 border border-zak-black text-zak-black-dark 
                            px-4 py-3 rounded mb-6 animate-fade-in">
                {t('contact.success')}
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 animate-fade-in">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-italia-sm p-6 md:p-8 space-y-6">
              {/* Name */}
              <div>
                <label className="label">
                  {t('contact.form.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input"
                  placeholder={t('contact.form.namePlaceholder')}
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  {t('contact.form.email')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input"
                  placeholder={t('contact.form.emailPlaceholder')}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="label">
                  {t('contact.form.phone')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="input"
                  placeholder={t('contact.form.phonePlaceholder')}
                />
              </div>

              {/* Subject */}
              <div>
                <label className="label">
                  {t('contact.form.subject')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input"
                  placeholder={t('contact.form.subjectPlaceholder')}
                />
              </div>

              {/* Message */}
              <div>
                <label className="label">
                  {t('contact.form.message')} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input min-h-[150px] resize-y"
                  placeholder={t('contact.form.messagePlaceholder')}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary w-full md:w-auto px-12"
              >
                {submitting ? t('contact.form.sending') : t('contact.form.submit')}
              </button>
            </form>
          </div>

          {/* Sidebar - Contact Info & Social Links */}
          <div className="space-y-6">
            {/* Social Media Links */}
            <div className="bg-white rounded-lg shadow-italia-sm p-6">
              <h3 className="font-semibold text-lg mb-4 text-primary">
                {t('contact.followUs')}
              </h3>
              <div className="space-y-3">
                {socialLinks.map((link) => (
                  <a
                    key={link.platform}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-4 rtl:space-x-reverse p-3 rounded-lg 
                             hover:bg-zak-black/5 transition-colors touch-target group"
                  >
                    <div className="text-zak-black group-hover:scale-110 transition-transform">
                      {getSocialIcon(link.platform)}
                    </div>
                    <span className="font-medium text-gray-700 group-hover:text-zak-black transition-colors">
                      {getPlatformName(link.platform)}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-zak-black text-white rounded-lg shadow-italia-md p-6">
              <h3 className="font-semibold text-lg mb-4">
                {t('contact.info')}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-sm">{t('contact.address')}</div>
                      <div className="text-sm text-gray-200">{t('contact.addressValue')}</div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <div className="flex items-start space-x-3 rtl:space-x-reverse">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium text-sm">{t('contact.hours')}</div>
                      <div className="text-sm text-gray-200">{t('contact.hoursValue')}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

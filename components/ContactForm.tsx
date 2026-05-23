'use client';

import React, { useState, FormEvent } from 'react';
import { motion } from 'framer-motion';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from './ui/Button';

interface FormState {
  name: string;
  phone: string;
  message: string;
}

interface SubmitState {
  status: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export const ContactForm: React.FC = () => {
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    message: '',
  });

  const [submit, setSubmit] = useState<SubmitState>({
    status: 'idle',
    message: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.name.trim()) {
      setSubmit({
        status: 'error',
        message: 'Please enter your name',
      });
      return false;
    }

    if (!form.phone.trim()) {
      setSubmit({
        status: 'error',
        message: 'Please enter your phone number',
      });
      return false;
    }

    if (!form.message.trim()) {
      setSubmit({
        status: 'error',
        message: 'Please enter a message',
      });
      return false;
    }

    if (form.message.trim().length < 10) {
      setSubmit({
        status: 'error',
        message: 'Message must be at least 10 characters',
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmit({ status: 'loading', message: '' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();

      setSubmit({
        status: 'success',
        message:
          'Thank you! Your message has been sent. We will contact you soon.',
      });

      setForm({ name: '', phone: '', message: '' });

      // Reset message after 5 seconds
      setTimeout(() => {
        setSubmit({ status: 'idle', message: '' });
      }, 5000);
    } catch (error) {
      setSubmit({
        status: 'error',
        message:
          error instanceof Error
            ? error.message
            : 'Failed to send message. Please try again.',
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="bg-dark-card border border-dark-border rounded-2xl p-8 md:p-10"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-semibold text-white mb-2"
          >
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your name"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            disabled={submit.status === 'loading'}
            aria-label="Full name"
          />
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-semibold text-white mb-2"
          >
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+27 61 543 6379"
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all"
            disabled={submit.status === 'loading'}
            aria-label="Phone number"
          />
        </div>

        {/* Message */}
        <div>
          <label
            htmlFor="message"
            className="block text-sm font-semibold text-white mb-2"
          >
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder="Tell us about your project..."
            rows={5}
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all resize-none"
            disabled={submit.status === 'loading'}
            aria-label="Message"
          />
          <p className="text-xs text-gray-400 mt-1">Minimum 10 characters</p>
        </div>

        {/* Status Messages */}
        {submit.status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 p-4 rounded-lg ${
              submit.status === 'success'
                ? 'bg-green-500/10 border border-green-500/30 text-green-300'
                : submit.status === 'error'
                ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                : 'bg-blue-500/10 border border-blue-500/30 text-blue-300'
            }`}
          >
            {submit.status === 'success' ? (
              <CheckCircle size={20} className="flex-shrink-0 mt-0.5" />
            ) : submit.status === 'error' ? (
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
            ) : (
              <Send size={20} className="flex-shrink-0 mt-0.5" />
            )}
            <span className="text-sm">{submit.message}</span>
          </motion.div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          size="lg"
          variant="primary"
          className="w-full"
          disabled={submit.status === 'loading'}
        >
          {submit.status === 'loading' ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-dark-bg border-t-gold rounded-full" />
              Sending...
            </>
          ) : (
            <>
              <Send size={20} />
              Send Message
            </>
          )}
        </Button>

        <p className="text-xs text-gray-400 text-center">
          We typically respond within 2 hours during business hours.
        </p>
      </form>
    </motion.div>
  );
};

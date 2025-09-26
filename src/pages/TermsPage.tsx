import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions</h1>
          <p className="text-gray-600 mb-8">Last updated: May 20, 2024</p>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              Welcome to Adventure Buddha. These terms and conditions outline the rules and regulations for the use of Adventure Buddha's Website, located at https://adventurebuddha.com.
            </p>
            <p>
              By accessing this website we assume you accept these terms and conditions. Do not continue to use Adventure Buddha if you do not agree to take all of the terms and conditions stated on this page.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Intellectual Property</h2>
            <p>
              Unless otherwise stated, Adventure Buddha and/or its licensors own the intellectual property rights for all material on Adventure Buddha. All intellectual property rights are reserved. You may access this from Adventure Buddha for your own personal use subjected to restrictions set in these terms and conditions.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Bookings and Payments</h2>
            <p>
              All bookings made through our website are subject to availability. We reserve the right to refuse any booking at our sole discretion. Prices are subject to change without notice. Payments must be made in full at the time of booking unless otherwise specified.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Cancellations and Refunds</h2>
            <p>
              Cancellation policies vary by trip and are clearly stated at the time of booking. Refunds will be processed according to our refund policy and may be subject to administrative fees.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. User Responsibilities</h2>
            <p>
              You are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer. You agree to accept responsibility for all activities that occur under your account or password.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Limitation of Liability</h2>
            <p>
              In no event shall Adventure Buddha, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the service.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Changes to Terms</h2>
            <p>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">8. Governing Law</h2>
            <p>
              These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Us</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p>
              Email: adventurebuddha@gmail.com<br />
              Phone: +91 80734 65622<br />
              Address: 1359/4 2nd Main, 3rd Cross Rd, Yeswanthpur, Bengaluru
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
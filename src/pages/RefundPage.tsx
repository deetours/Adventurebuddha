import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function RefundPage() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Refund Policy</h1>
          <p className="text-gray-600 mb-8">Last updated: May 20, 2024</p>

          <div className="prose max-w-none">
            <h2 className="text-xl font-semibold mt-8 mb-4">1. Overview</h2>
            <p>
              Adventure Buddha is committed to providing the best travel experiences for our customers. Our refund policy is designed to be fair and transparent while ensuring we can continue to offer high-quality services.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">2. Cancellation and Refund Policy</h2>
            <p>
              Our cancellation and refund policy varies based on the timing of your cancellation relative to your trip departure date:
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">More than 30 days before departure</h3>
            <p>
              Full refund minus a 10% administrative fee.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">15-30 days before departure</h3>
            <p>
              75% refund of the total booking amount.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">7-14 days before departure</h3>
            <p>
              50% refund of the total booking amount.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">Less than 7 days before departure</h3>
            <p>
              No refund will be provided.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">3. Special Circumstances</h2>
            <h3 className="text-lg font-semibold mt-6 mb-2">Medical Emergencies</h3>
            <p>
              In the case of a documented medical emergency, we may offer a partial refund or credit toward a future booking at our discretion. A doctor's note or medical certificate will be required.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">Trip Cancellations by Adventure Buddha</h3>
            <p>
              If Adventure Buddha cancels a trip due to unforeseen circumstances (natural disasters, political unrest, etc.), you will receive a full refund or the option to transfer your booking to another available trip.
            </p>

            <h3 className="text-lg font-semibold mt-6 mb-2">Force Majeure</h3>
            <p>
              In cases of force majeure events (acts of God, war, strikes, etc.), Adventure Buddha reserves the right to modify or cancel trips. In such cases, we will offer a full refund or the option to reschedule.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">4. Non-Refundable Items</h2>
            <p>
              The following items are non-refundable under any circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Travel insurance premiums</li>
              <li>Visa and passport fees</li>
              <li>Airline tickets (if booked separately)</li>
              <li>Personal expenses and optional activities</li>
              <li>Specialty equipment rentals</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">5. How to Request a Refund</h2>
            <p>
              To request a refund, please contact our customer service team with the following information:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Your booking reference number</li>
              <li>Reason for cancellation</li>
              <li>Supporting documentation (if applicable)</li>
            </ul>
            <p className="mt-4">
              Refund requests can be submitted via email at refunds@adventurebuddha.com or by calling our customer service at +91 98765 43210.
            </p>

            <h2 className="text-xl font-semibold mt-8 mb-4">6. Refund Processing Time</h2>
            <p>
              Once your refund request is approved, refunds will be processed within 10-15 business days. The time it takes for the funds to appear in your account may vary depending on your payment method:
            </p>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Credit/Debit cards: 5-10 business days</li>
              <li>Bank transfers: 7-14 business days</li>
              <li>PayPal: 3-5 business days</li>
            </ul>

            <h2 className="text-xl font-semibold mt-8 mb-4">7. Contact Information</h2>
            <p>
              If you have any questions about our refund policy, please contact us:
            </p>
            <p>
              Email: refunds@adventurebuddha.com<br />
              Phone: +91 98765 43210<br />
              Address: 123 Travel Street, Adventure City, AC 12345
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
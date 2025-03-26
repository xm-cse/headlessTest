'use client';

import Image from "next/image";
import { useState } from "react";
import { PaymentElement } from "./components/PaymentElement";
import { SuccessPage } from "./components/SuccessPage";
import { USDCPayment } from "./components/USDCPayment";

type ViewState = 'initial' | 'checkout' | 'crypto-checkout' | 'success';

export default function Home() {
  const [viewState, setViewState] = useState<ViewState>('initial');
  const [orderId, setOrderId] = useState<string | null>(null);

  const handleCheckoutComplete = (completedOrderId: string) => {
    setOrderId(completedOrderId);
    setViewState('success');
  };

  const handleReset = () => {
    setViewState('initial');
    setOrderId(null);
  };

  return (
    <div className="min-h-screen flex flex-col p-8 bg-gradient-to-b from-zinc-900 via-black to-black text-white">
      <main className="max-w-4xl w-full mx-auto text-center">
        {/* Header Section - Always visible */}
        <div className={`transition-all duration-300 ${viewState !== 'initial' ? 'scale-75' : ''}`}>
          <h1 className="text-5xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-400">
            CSE Headless Checkout
          </h1>
          
          <div className="mb-8 relative w-full aspect-square max-w-sm mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 via-blue-500/20 to-cyan-500/20 rounded-2xl -m-2 blur-xl"></div>
            <Image
              src="https://tan-odd-galliform-276.mypinata.cloud/ipfs/bafybeibfu2vf2lrbusmhdb5ft57irqo7kpoj6hzqan3wrtumw6bstnpgvq"
              alt="NFT Image"
              fill
              className="object-contain rounded-2xl"
              priority
            />
          </div>
          
          <div className="flex flex-row gap-6 justify-center items-center max-w-5xl mx-auto mb-8">
            <button
              onClick={() => setViewState('checkout')}
              disabled={viewState !== 'initial'}
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold transition-all duration-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none min-w-[200px]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-white/10 rounded-xl"></span>
              <span className="relative">Pay with Card</span>
            </button>

            <div className="w-px h-8 bg-zinc-700"></div>

            <button
              onClick={() => setViewState('crypto-checkout')}
              disabled={viewState !== 'initial'}
              className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold transition-all duration-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:transform-none min-w-[200px]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 group-hover:bg-white/10 rounded-xl"></span>
              <span className="relative">Pay with Crypto</span>
            </button>
          </div>
        </div>

        {/* Dynamic Content Section */}
        <div className="mt-8">
          {viewState === 'checkout' && (
            <div className="animate-fadeIn">
              <PaymentElement onComplete={handleCheckoutComplete} />
            </div>
          )}
          
          {viewState === 'crypto-checkout' && (
            <div className="animate-fadeIn">
              <USDCPayment onComplete={handleCheckoutComplete} />
            </div>
          )}
          
          {viewState === 'success' && orderId && (
            <div className="animate-fadeIn">
              <SuccessPage orderId={orderId} />
              <button
                onClick={handleReset}
                className="mt-8 inline-flex items-center justify-center px-6 py-3 text-base font-medium transition-all duration-200 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 rounded-xl hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1"
              >
                Purchase Another NFT
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

import React from 'react';

/**
 * Loading indicator component
 */
export function LoadingSpinner({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      <span className="ml-3">{text}</span>
    </div>
  );
}

/**
 * Error message component
 */
export function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl bg-red-500/10 p-6 text-red-500">
      <h3 className="text-xl font-bold mb-2">Error</h3>
      <p>{message}</p>
    </div>
  );
}

/**
 * Success message component
 */
export function SuccessMessage() {
  return (
    <div className="space-y-6">
      <div className="bg-green-500/10 rounded-lg p-6 border border-green-500/20">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="animate-bounce bg-gradient-to-r from-green-400 to-emerald-400 rounded-full p-2">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-green-400">Congratulations!</h3>
          <p className="text-lg text-zinc-300 mb-4">Payment successfully completed</p>
          <p className="text-sm text-zinc-400">Check your inbox to find the minted NFT!</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Code display component
 */
export function CodeDisplay({ label, code }: { label: string; code: string }) {
  return (
    <div>
      <p className="text-sm text-zinc-400 mb-1">{label}</p>
      <p className="font-mono text-sm break-all bg-zinc-900/50 p-2 rounded">{code}</p>
    </div>
  );
}

/**
 * Transaction button component
 */
export function TransactionButton({ 
  onClick, 
  disabled, 
  isPending 
}: { 
  onClick: () => void; 
  disabled: boolean; 
  isPending: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-4 w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 hover:from-indigo-700 hover:via-blue-700 hover:to-cyan-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isPending ? 'Confirming...' : 'Send Transaction'}
    </button>
  );
}

/**
 * Container for payment UI sections
 */
export function PaymentContainer({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-xl bg-zinc-800/50 p-6">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      {children}
    </div>
  );
}

/**
 * Select dropdown component
 */
export function SelectDropdown<T extends string>({ 
  label, 
  options, 
  value, 
  onChange,
  disabled = false
}: { 
  label: string;
  options: Array<{ id: T; name: string }>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-zinc-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        disabled={disabled}
        className="w-full bg-zinc-900/50 border-zinc-700 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map(option => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/**
 * Payment options selector component
 */
export function PaymentOptionsSelector<C extends string, D extends string>({
  chainOptions,
  currencyOptions,
  selectedChain,
  selectedCurrency,
  onChainChange,
  onCurrencyChange,
  disabled = false
}: {
  chainOptions: Array<{ id: C; name: string }>;
  currencyOptions: Array<{ id: D; name: string }>;
  selectedChain: C;
  selectedCurrency: D;
  onChainChange: (chain: C) => void;
  onCurrencyChange: (currency: D) => void;
  disabled?: boolean;
}) {
  return (
    <div className="bg-indigo-500/10 rounded-lg p-6 border border-indigo-500/20 mb-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-400">Payment Options</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectDropdown
          label="Select Blockchain"
          options={chainOptions}
          value={selectedChain}
          onChange={onChainChange}
          disabled={disabled}
        />
        <SelectDropdown
          label="Select Currency"
          options={currencyOptions}
          value={selectedCurrency}
          onChange={onCurrencyChange}
          disabled={disabled}
        />
      </div>
    </div>
  );
} 
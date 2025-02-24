import { useEffect, useState } from 'react';
import axios from 'axios';

interface SuccessPageProps {
    orderId: string;
}

export function SuccessPage({ orderId }: SuccessPageProps) {
    const [status, setStatus] = useState<string>('checking');
    const [error, setError] = useState<string | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [lastPolled, setLastPolled] = useState<string>('');
    const [orderData, setOrderData] = useState<any>(null);
    const POLL_INTERVAL = 5000; // 5 seconds

    const formatStatus = (status: string | undefined) => {
        if (!status) return 'Checking';
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    useEffect(() => {
        const startTime = Date.now();
        const timeInterval = setInterval(() => {
            setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);

        return () => clearInterval(timeInterval);
    }, []);

    useEffect(() => {
        const pollOrderStatus = async () => {
            try {
                console.log(`[${new Date().toISOString()}] Polling order status for ${orderId}...`);
                const response = await axios.get(`https://staging.crossmint.com/api/2022-06-09/orders/${orderId}`, {
                    headers: {
                        'x-api-key': process.env.NEXT_PUBLIC_CROSSMINT_API_KEY
                    }
                });

                const paymentStatus = response.data.payment?.status || 'pending';
                setStatus(paymentStatus);
                setOrderData(response.data);
                setLastPolled(new Date().toLocaleTimeString());

                if (paymentStatus !== 'completed' && paymentStatus !== 'failed') {
                    setTimeout(pollOrderStatus, POLL_INTERVAL);
                }
            } catch (err) {
                console.error('Error polling order status:', err);
                setError('Failed to check order status');
                setTimeout(pollOrderStatus, POLL_INTERVAL);
            }
        };

        pollOrderStatus();
    }, [orderId]);

    return (
        <div className="w-full max-w-4xl mx-auto p-6 bg-zinc-800/50 backdrop-blur rounded-xl border border-zinc-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Payment Status</h2>
                <div className="text-sm text-gray-400">
                    Time elapsed: {elapsedTime}s
                </div>
            </div>

            <div className="bg-zinc-900/50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400">Order ID:</span>
                    <span className="font-mono text-sm">{orderId}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Payment Status:</span>
                    <span className={`font-medium ${
                        status === 'completed' ? 'text-green-400' :
                        status === 'failed' ? 'text-red-400' :
                        'text-yellow-400'
                    }`}>
                        {formatStatus(status)}
                    </span>
                </div>
            </div>

            {status !== 'completed' && status !== 'failed' && (
                <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="text-sm text-gray-400">
                        Last checked: {lastPolled || 'Just now'} (refreshing every 15s)
                    </span>
                </div>
            )}

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center mb-6">
                    {error}
                </div>
            )}

            {status === 'completed' && (
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Payment Successful
                    </div>
                    <p className="text-sm text-gray-400">
                        You will receive a confirmation email shortly.
                    </p>
                </div>
            )}

            {status === 'failed' && (
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg mb-4">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Payment Failed
                    </div>
                    <p className="text-sm text-gray-400">
                        Please try again or contact support if the issue persists.
                    </p>
                </div>
            )}

            {/* API Response Section */}
            <div className="mt-8 border-t border-zinc-700 pt-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">API Response</h3>
                    <span className="text-sm text-gray-400">Last updated: {lastPolled}</span>
                </div>
                <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300 whitespace-pre-wrap">
                        {orderData ? JSON.stringify(orderData, null, 2) : 'Loading...'}
                    </pre>
                </div>
            </div>
        </div>
    );
} 
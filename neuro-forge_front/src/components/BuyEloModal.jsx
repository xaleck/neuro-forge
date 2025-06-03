import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function BuyEloModal({ isOpen, onClose, currentUserCredits }) {
    const { user, updateUserData } = useAuth();

    const [creditsToSpend, setCreditsToSpend] = useState('');
    const [eloToReceive, setEloToReceive] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    const ELO_EXCHANGE_RATE = 0.5;

    useEffect(() => {
        if (!isOpen) {
            setCreditsToSpend('');
            setEloToReceive(0);
            setErrorMessage('');
        }
    }, [isOpen]);

    const handleCreditsChange = (e) => {
        let value = e.target.value;
        setErrorMessage('');

        if (value === '' || value === '-') {
            setCreditsToSpend(value);
            setEloToReceive(0);
            return;
        }

        let numValue = parseInt(value, 10);

        if (isNaN(numValue) || numValue < 0) {
            numValue = 0;
        }

        if (numValue > currentUserCredits) {
            setErrorMessage(`Cannot spend more than ${currentUserCredits} credits.`);
            numValue = currentUserCredits;
        }

        setCreditsToSpend(numValue.toString());
        setEloToReceive(parseFloat((numValue * ELO_EXCHANGE_RATE).toFixed(1)));
    };

    const handlePurchase = () => {
        if (!user || creditsToSpend <= 0 || creditsToSpend > currentUserCredits) {
            setErrorMessage('Invalid amount or insufficient credits.');
            return;
        }

        const creditsSpent = parseInt(creditsToSpend, 10);
        const eloGained = parseFloat((creditsSpent * ELO_EXCHANGE_RATE).toFixed(1));

        const newCloudCredits = currentUserCredits - creditsSpent;
        const newEloRating = (user.eloRating || 0) + eloGained;

        updateUserData({
            cloudCredits: newCloudCredits,
            eloRating: newEloRating,
        });

        console.log(`Purchased ${eloGained} ELO for ${creditsSpent} credits.`);
        onClose();
    };

    if (!isOpen) return null;

    const canPurchase = creditsToSpend > 0 && creditsToSpend <= currentUserCredits && errorMessage === '';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-semibold text-yellow-400">Buy ELO Rating</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                        aria-label="Close modal"
                    >
                        &times;
                    </button>
                </div>

                <p className="text-gray-300 mb-2">Your current Cloud Credits: <span className="font-semibold text-blue-400">{currentUserCredits}</span></p>
                <p className="text-gray-300 mb-6">Exchange rate: <span className="font-semibold">1 Cloud Credit = {ELO_EXCHANGE_RATE} ELO</span></p>

                <div className="mb-4">
                    <label htmlFor="creditsToSpend" className="block text-sm font-medium text-gray-300 mb-1">Cloud Credits to spend:</label>
                    <input
                        type="number"
                        id="creditsToSpend"
                        value={creditsToSpend}
                        onChange={handleCreditsChange}
                        placeholder={`Max ${currentUserCredits}`}
                        min="0"
                        max={currentUserCredits}
                        className="w-full p-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:ring-yellow-500 focus:border-yellow-500"
                    />
                    {errorMessage && <p className="text-red-500 text-xs mt-1">{errorMessage}</p>}
                </div>

                <div className="mb-6">
                    <p className="text-gray-300">ELO you will receive: <span className="font-semibold text-green-400">{eloToReceive}</span></p>
                </div>

                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md transition duration-150"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handlePurchase}
                        className={`bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition duration-150 ${!canPurchase ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!canPurchase}
                    >
                        Purchase ELO
                    </button>
                </div>
            </div>
        </div>
    );
} 
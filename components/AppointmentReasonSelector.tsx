import React from 'react';

interface AppointmentReasonSelectorProps {
  onSelectReason: (reason: string) => void;
  selectedReason?: string;
}

export const AppointmentReasonSelector = ({ 
  onSelectReason,
  selectedReason 
}: AppointmentReasonSelectorProps) => {
  const reasons = ['Checkup', 'Emergency', 'Filling'];
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">What's the reason for your appointment?</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {reasons.map((reason) => (
          <button
            key={reason}
            onClick={() => onSelectReason(reason)}
            className={`py-2 px-4 rounded-md transition-colors ${
              selectedReason === reason
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
            }`}
          >
            {reason}
          </button>
        ))}
      </div>
    </div>
  );
}; 
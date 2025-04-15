import React from 'react';

type AppointmentSlotsProps = {
  availableSlots: string[];
  date: string;
  onSelectSlot?: (time: string) => void;
  selectedSlot?: string;
};

export const AppointmentSlots = ({ 
  availableSlots, 
  date, 
  onSelectSlot,
  selectedSlot 
}: AppointmentSlotsProps) => {
  if (!availableSlots || availableSlots.length === 0) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p className="text-gray-600">No available slots for {date}</p>
      </div>
    );
  }

  // Group slots by hour for better organization
  const slotsByHour: Record<string, string[]> = {};
  availableSlots.forEach(slot => {
    const hour = slot.split(':')[0];
    if (!slotsByHour[hour]) {
      slotsByHour[hour] = [];
    }
    slotsByHour[hour].push(slot);
  });

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">Available times for {date}</h3>
      
      <div className="space-y-4">
        {Object.entries(slotsByHour).map(([hour, slots]) => (
          <div key={hour} className="space-y-1">
            <h4 className="text-sm font-medium text-gray-500">{parseInt(hour) > 11 ? 'PM' : 'AM'}</h4>
            <div className="flex flex-wrap gap-2">
              {slots.map(slot => {
                // Format the slot for display (e.g., "14:30" to "2:30 PM")
                const [h, m] = slot.split(':');
                const displayHour = parseInt(h) > 12 ? parseInt(h) - 12 : parseInt(h);
                const displayTime = `${displayHour}:${m}${parseInt(h) >= 12 ? ' PM' : ' AM'}`;
                
                const isSelected = slot === selectedSlot;
                
                return (
                  <button
                    key={slot}
                    onClick={() => onSelectSlot && onSelectSlot(slot)}
                    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors
                      ${isSelected 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}
                  >
                    {displayTime}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
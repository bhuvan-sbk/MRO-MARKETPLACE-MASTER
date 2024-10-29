// frontend/src/utils/dateUtils.js
import dayjs from 'dayjs';

export const getAvailableDates = async (hangarId, api) => {
    try {
        const response = await api.get(`/bookings/availability/${hangarId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching availability:', error);
        return [];
    }
};

export const isDateAvailable = (date, bookings) => {
    return !bookings.some(booking => 
        date >= new Date(booking.startDate) && 
        date <= new Date(booking.endDate)
    );
};

export const getNextAvailableSlot = (conflictingBooking) => {
    const endDate = dayjs(conflictingBooking.endDate);
    return endDate.add(1, 'hour');
};
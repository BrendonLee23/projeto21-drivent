import { forbidenError, notFoundError } from '@/errors';
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository } from '@/repositories';

async function getBooking(userId: number) {
  const responseBooking = await bookingsRepository.getBooking(userId);
  if (!responseBooking) throw notFoundError();
  return responseBooking;
}
async function postBooking(userId: number, roomId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (ticket.TicketType.isRemote || !ticket.TicketType.includesHotel || ticket.status != 'PAID') {
    throw forbidenError();
  }
  const roomInfo = await hotelRepository.findRoomById(roomId);
  if (!roomInfo) throw notFoundError();
  const roomBooking = await bookingsRepository.getBookingByRoomId(roomId);
  if (roomBooking.length >= roomInfo.capacity) throw forbidenError();
  const { id } = await bookingsRepository.postBooking(userId, roomId);
  return { bookingId: id };
}

async function putBooking(userId: number, roomId: number, bookingId: number) {
  const userBooking = await bookingsRepository.getBooking(userId);
  if (!userBooking) throw forbidenError();
  const roomInfo = await hotelRepository.findRoomById(roomId);
  if (!roomInfo) throw notFoundError();
  const roomBooking = await bookingsRepository.getBookingByRoomId(roomId);
  if (roomBooking.length >= roomInfo.capacity) throw forbidenError();
  const { id } = await bookingsRepository.putBooking(bookingId, roomId);
  return { bookingId: id };
}

export const bookingsService = {
  getBooking,
  postBooking,
  putBooking,
};

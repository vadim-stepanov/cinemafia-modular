// Shared event vocabulary: a support ticket was opened. Support → notifications.
export const SUPPORT_TICKET_CREATED = "support.ticket.created";

export interface SupportTicketCreatedEvent {
  ticketId: string;
  userId: string;
  subject: string;
}

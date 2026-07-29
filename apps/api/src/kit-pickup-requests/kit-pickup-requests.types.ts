export type ParticipantSnapshotDto = {
  fullName: string;
  email: string;
  phone: string;
  externalRegistrationCode: string;
};

export type KitPickupRequestTermDto = {
  version: string;
  accepted: boolean;
  acceptedAt: string | null;
};

export type KitPickupRequestTimelineDto = {
  pickedUpAt: string | null;
  custodyAt: string | null;
  readyAt: string | null;
  deliveredAt: string | null;
};

export type KitPickupRequestHandoverDto = {
  receivedByName: string;
  notes: string | null;
  deliveredAt: string;
};

export type KitPickupRequestDto = {
  id: string;
  status: string;
  statusLabel: string;
  paymentStatus: string;
  paymentStatusLabel: string;
  registrationMode: "internal" | "external";
  feeAmount: string | null;
  feeCurrency: string | null;
  event: {
    id: string;
    name: string;
    slug: string;
  };
  service: {
    id: string;
    title: string;
    pickupLabel: string | null;
  };
  registrationId: string | null;
  participant: ParticipantSnapshotDto | null;
  term: KitPickupRequestTermDto;
  timeline: KitPickupRequestTimelineDto;
  handover: KitPickupRequestHandoverDto | null;
  createdAt: string;
  updatedAt: string;
};

export type KitPickupRequestListResponse = {
  data: KitPickupRequestDto[];
};

export type KitPickupRequestResponse = {
  data: KitPickupRequestDto;
};

export type CreatePaymentResponse = {
  data: {
    checkoutUrl: string;
    paymentId: string;
    provider: string;
  };
};

export type CurrentTermResponse = {
  data: {
    version: string;
    content: string;
    contentHash: string;
  };
};

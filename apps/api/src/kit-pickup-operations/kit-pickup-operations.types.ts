export type OperationalParticipantDto = {
  fullName: string;
  email: string | null;
  phone: string | null;
  externalRegistrationCode: string | null;
};

export type OperationalRequestDto = {
  id: string;
  status: string;
  statusLabel: string;
  registrationMode: "internal" | "external";
  registrationId: string | null;
  feeAmountSnapshot: string | null;
  feeCurrencySnapshot: string | null;
  paymentStatus: string;
  termAcceptedAt: string | null;
  event: {
    id: string;
    name: string;
    slug: string;
    date: string;
    city: string;
  };
  service: {
    id: string;
    title: string;
    pickupLabel: string | null;
  };
  participant: OperationalParticipantDto | null;
  pickedUpAt: string | null;
  pickedUpBy: string | null;
  custodyAt: string | null;
  custodyBy: string | null;
  readyAt: string | null;
  readyBy: string | null;
  deliveredAt: string | null;
  deliveredBy: string | null;
  receivedByName: string | null;
  handoverNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type OperationsListResponse = {
  data: OperationalRequestDto[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
};

export type OperationalRequestResponse = {
  data: OperationalRequestDto;
};

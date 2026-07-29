export const USERS = {
  runner: {
    id: "usr_seed_runner",
    email: "runner@corredora.df",
    password: "corredora123",
  },
  participant2: {
    id: "usr_seed_participant_2",
    email: "participant2@corredora.df",
    password: "corredora123",
  },
} as const;

export const SERVICES = {
  internal: "kps_01_own_event",
  external: "kps_02_third_party",
} as const;

export const EVENTS = {
  internal: "evt_01_meia",
  external: "evt_03_5k_ini",
} as const;

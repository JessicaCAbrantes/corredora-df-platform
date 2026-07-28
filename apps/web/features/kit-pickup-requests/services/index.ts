import {
  createHttpAcceptKitPickupTerm,
  createHttpCancelKitPickupRequest,
  createHttpCreateKitPickupRequest,
  createHttpGetCurrentKitPickupTerm,
  createHttpGetKitPickupRequest,
  createHttpGetMyKitPickupRequests,
  createHttpStartKitPickupPayment,
} from "../infrastructure/http-kit-pickup-requests";
import type {
  CreateKitPickupRequestInput,
  CurrentTermResult,
  KitPickupRequestListResult,
  KitPickupRequestResult,
  StartPaymentResult,
} from "../types/kit-pickup-request";

export async function createKitPickupRequest(
  input: CreateKitPickupRequestInput,
): Promise<KitPickupRequestResult> {
  return createHttpCreateKitPickupRequest()(input);
}

export async function getMyKitPickupRequests(): Promise<KitPickupRequestListResult> {
  return createHttpGetMyKitPickupRequests()();
}

export async function getKitPickupRequest(
  id: string,
): Promise<KitPickupRequestResult> {
  return createHttpGetKitPickupRequest()(id);
}

export async function acceptKitPickupTerm(
  id: string,
): Promise<KitPickupRequestResult> {
  return createHttpAcceptKitPickupTerm()(id);
}

export async function cancelKitPickupRequest(
  id: string,
): Promise<KitPickupRequestResult> {
  return createHttpCancelKitPickupRequest()(id);
}

export async function startKitPickupPayment(
  id: string,
): Promise<StartPaymentResult> {
  return createHttpStartKitPickupPayment()(id);
}

export async function getCurrentKitPickupTerm(): Promise<CurrentTermResult> {
  return createHttpGetCurrentKitPickupTerm()();
}

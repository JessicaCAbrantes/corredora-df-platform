import {
  createHttpGetKitPickupOperations,
  createHttpHandoverKitPickupRequest,
  createHttpMarkKitPickupReady,
  createHttpPickupKitPickupRequest,
  createHttpTakeKitPickupIntoCustody,
} from "../infrastructure/http-kit-pickup-operations";
import type {
  HandoverInput,
  OperationalActionResult,
  OperationsListParams,
  OperationsListResult,
} from "../types/kit-pickup-operations";

export async function getKitPickupOperations(
  params: OperationsListParams = {},
): Promise<OperationsListResult> {
  return createHttpGetKitPickupOperations()(params);
}

export async function pickupKitPickupRequest(
  id: string,
): Promise<OperationalActionResult> {
  return createHttpPickupKitPickupRequest()(id);
}

export async function takeKitPickupRequestIntoCustody(
  id: string,
): Promise<OperationalActionResult> {
  return createHttpTakeKitPickupIntoCustody()(id);
}

export async function markKitPickupRequestReady(
  id: string,
): Promise<OperationalActionResult> {
  return createHttpMarkKitPickupReady()(id);
}

export async function handoverKitPickupRequest(
  id: string,
  input: HandoverInput,
): Promise<OperationalActionResult> {
  return createHttpHandoverKitPickupRequest()(id, input);
}

import { Type } from "class-transformer";
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from "class-validator";

const STATUSES = [
  "TERM_PENDING",
  "TERM_ACCEPTED",
  "PAYMENT_PENDING",
  "PAID",
  "WAIVED",
  "PICKUP_PENDING",
  "PICKED_UP",
  "IN_CUSTODY",
  "READY_FOR_HANDOVER",
  "DELIVERED",
  "CANCELLED",
] as const;

const SORTS = [
  "createdAt",
  "updatedAt",
  "pickedUpAt",
  "custodyAt",
  "readyAt",
  "deliveredAt",
] as const;

export class ListOperationsQueryDto {
  @IsOptional()
  @IsIn([...STATUSES])
  status?: (typeof STATUSES)[number];

  @IsOptional()
  @IsString()
  @MinLength(1)
  eventId?: string;

  @IsOptional()
  @IsIn(["internal", "external"])
  registrationMode?: "internal" | "external";

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage = 20;

  @IsOptional()
  @IsIn([...SORTS])
  sort: (typeof SORTS)[number] = "createdAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "asc";
}

export class HandoverDto {
  @IsString()
  @MinLength(1)
  receivedByName!: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

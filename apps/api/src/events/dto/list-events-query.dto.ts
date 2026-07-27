import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function emptyToUndefined({ value }: { value: unknown }): unknown {
  if (typeof value !== "string") {
    return value;
  }
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function parseOptionalBoolean({ value }: { value: unknown }): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (value === true || value === "true") {
    return true;
  }
  if (value === false || value === "false") {
    return false;
  }
  return value;
}

export class ListEventsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  perPage: number = 20;

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(["active", "cancelled", "completed"])
  status?: "active" | "cancelled" | "completed";

  @IsOptional()
  @IsIn(["marathon", "half-marathon", "5k", "10k", "trail"])
  category?: "marathon" | "half-marathon" | "5k" | "10k" | "trail";

  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  city?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @ValidateIf((_, v) => v !== undefined)
  @Matches(ISO_DATE, { message: "dateFrom must be YYYY-MM-DD" })
  dateFrom?: string;

  @IsOptional()
  @Transform(emptyToUndefined)
  @ValidateIf((_, v) => v !== undefined)
  @Matches(ISO_DATE, { message: "dateTo must be YYYY-MM-DD" })
  dateTo?: string;

  @IsOptional()
  @Transform(({ obj }) =>
    parseOptionalBoolean({ value: obj.registrationOpen }),
  )
  @IsBoolean()
  registrationOpen?: boolean;

  @IsOptional()
  @IsIn(["date", "name", "createdAt"])
  sort: "date" | "name" | "createdAt" = "date";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "asc";
}

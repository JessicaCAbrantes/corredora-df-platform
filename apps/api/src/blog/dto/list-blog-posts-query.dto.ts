import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
} from "class-validator";

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

export class ListBlogPostsQueryDto {
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
  perPage: number = 3;

  @IsOptional()
  @Transform(({ obj }) => parseOptionalBoolean({ value: obj.published }))
  @IsBoolean()
  published: boolean = true;

  @IsOptional()
  @IsIn(["publishedAt", "title", "createdAt"])
  sort: "publishedAt" | "title" | "createdAt" = "publishedAt";

  @IsOptional()
  @IsIn(["asc", "desc"])
  order: "asc" | "desc" = "desc";
}

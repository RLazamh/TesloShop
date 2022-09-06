import { Type } from "class-transformer";
import { IsOptional, IsPositive, Min } from "class-validator";

export class PagintationDto {

    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    limit? : number;

    @IsOptional()
    @IsPositive()
    @Type( () => Number)
    offset? : number;
}
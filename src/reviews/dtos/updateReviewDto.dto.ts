import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
  


export class updateReviewDto{
    
        @IsNumber()
        @IsNotEmpty()
        @IsOptional()
        @Max(5)
        @Min(1)
        rating?:number;
        @IsNotEmpty()
        @IsOptional()
        @IsString()
        review?:string;
    }

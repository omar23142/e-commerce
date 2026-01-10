import { IsNotEmpty, IsNumber, IsString, Max, Min } from "class-validator";



export class createReviewDto {
    @IsNumber()
    @IsNotEmpty()
    @Max(5)
    @Min(1)
    rating:number;
    @IsNotEmpty()
    @IsString()
    review:string;
}
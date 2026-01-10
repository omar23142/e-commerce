

import { ApiPropertyOptional } from '@nestjs/swagger';
import  { IsString, IsNumber, IsNotEmpty, Min, Max, Length, MaxLength, MinLength, IsOptional } from 'class-validator'

export class updateProductdto {
    @IsString( {message: 'the name must be a string value'})
        @IsNotEmpty()
        @Length(2,90)
        @IsOptional()
        @ApiPropertyOptional()
        name?:string;
    
        @IsOptional()
        @IsString()
        @Length(2,150)
        @ApiPropertyOptional()
        discription?:string;


        @IsNotEmpty()
        @IsNumber()
        @Min(0)
        @Max(1000)
        @IsOptional()
        @ApiPropertyOptional()
        price?:number;
}
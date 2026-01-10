import { ApiProperty } from "@nestjs/swagger";
import { Express } from 'express'


export class imagesUploadDto{
@ApiProperty({
    type:'array',
    format:'',
    name:'files',
    items:{type:'string', format:'binary'}
})
    files:Array<Express.Multer.File>

}
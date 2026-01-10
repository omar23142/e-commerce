import { BadRequestException, Controller, Get, Param, Post, Res, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor,FilesInterceptor, MulterModule } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import type  {Express} from 'express';
import type {Response} from 'express'
import { ProtectGard } from "../users/guards/Protect.guard";
import { GetCurrentUser } from "../users/decorators/current-user.decorator";
import { user } from "../users/user.entity";
import { ApiConsumes, ApiBody, ApiSecurity } from "@nestjs/swagger";
import { imagesUploadDto } from "./dto/Image-UploadDto.dto";


@Controller('/api/v1/uploads')
export class UploadsController {
    @UseGuards(ProtectGard)
    @Post() 
    @UseInterceptors(FileInterceptor('file'))
    public uploadFile(@UploadedFile() file: Express.Multer.File,@GetCurrentUser() user:user) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        console.log(file);
        return {message: 'file uploaded successfully', filePath: file.path};

    }
    @UseGuards(ProtectGard)
    @Post('multipleFiles') 
    @ApiBody({type:imagesUploadDto, description:'add multiple images'})
    @ApiConsumes('multipart/form-data')
    @ApiSecurity('bearer')
    @UseInterceptors(FilesInterceptor('files'))
    public uploadFiles(@UploadedFiles() files: Array<Express.Multer.File>, @GetCurrentUser() user:user) {
        if (!files || files.length === 0) {
            throw new BadRequestException('Files is required');
        }
        console.log(files);
        return {message: 'file uploaded successfully', files};

    }
    @Get('/:image')
    public getImage(@Param('image') image_name:string, @Res() res:Response) {
        //console.log(res);
        return res.sendFile(image_name, {root:'./../uploads'})
    }
}
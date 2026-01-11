// import { BadRequestException, Controller ,Module} from "@nestjs/common";
// import { UploadsController } from "./Uploads.controller";
// import { MulterModule } from "@nestjs/platform-express";
// import { JwtModule } from "@nestjs/jwt";
// import { UsersModule } from "../users/users.module";
// import { CURENT_USER_KEY } from "../utils/constants";
// import { diskStorage, memoryStorage } from "multer";
// import * as path from 'path';
// import * as fs from 'fs';
// import * as os from 'os';

// @Module({
//    exports:[],
//    imports: [
//     MulterModule.register({
//         storage:diskStorage({
           
//             destination: './uploads',
//             filename: (req:any, file, cb) => {
                
//                 const ext = file.originalname.split('.').pop();
//                 //console.log('req user', req[CURENT_USER_KEY]);
//                 const filename = `User-${req[CURENT_USER_KEY].id}-${Math.round(Math.random()*100)}.${ext}`;
//                 console.log(filename)
//                 cb(null, filename);
//             }
//             }),
//             fileFilter: (req, file, cb) => {
//                 const type = file.mimetype.split('/')[0];
//                 if (type === 'image')
//                     cb(null,true);
//                 else 
//                     cb( new BadRequestException('only image files are allowed'), false);
//             }
//         })
// // MulterModule.register({
// // storage: memoryStorage(),
// // fileFilter: (req, file, cb) => {
// // const type = file.mimetype.split('/')[0];
// // if (type === 'image') cb(null, true);
// // else cb(new BadRequestException('only image files are allowed'), false);
// // },
// // limits: {
// // fileSize: 5 * 1024 * 1024,
// // },
// // }),
//         ,JwtModule,UsersModule
//     ]
//     ,
//    controllers:[UploadsController],
//    providers:[],
// })
// export class UploadsModule {

// }





import { BadRequestException, Module } from "@nestjs/common";
import { UploadsController } from "./Uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { memoryStorage } from "multer"; 
import { CloudinaryService } from "./cloudinary.service";
@Module({
    exports: [],
    imports: [
       
        MulterModule.register({
            storage: memoryStorage(), 
            limits: {
                fileSize: 5 * 1024 * 1024, 
            },
            fileFilter: (req, file, cb) => {
                const type = file.mimetype.split('/')[0];
                if (type === 'image')
                    cb(null, true);
                else
                    cb(new BadRequestException('only image files are allowed'), false);
            }
        }),
        JwtModule,
        UsersModule
    ],
    controllers: [UploadsController],
    providers: [CloudinaryService],
})
export class UploadsModule {}
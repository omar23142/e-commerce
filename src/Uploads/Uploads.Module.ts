import { BadRequestException, Controller ,Module} from "@nestjs/common";
import { UploadsController } from "./Uploads.controller";
import { MulterModule } from "@nestjs/platform-express";
import { JwtModule } from "@nestjs/jwt";
import { UsersModule } from "../users/users.module";
import { CURENT_USER_KEY } from "../utils/constants";
import { diskStorage } from "multer";
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
const uploadPath = path.join(os.tmpdir(), 'uploads');
fs.mkdirSync(uploadPath, { recursive: true });


@Module({
   exports:[],
   imports:[MulterModule.register({
        storage:diskStorage({
            
            destination: (req, file, cb) => {
            cb(null, uploadPath);}
      ,
            filename: (req:any, file, cb) => {
                
                const ext = file.originalname.split('.').pop();
                //console.log('req user', req[CURENT_USER_KEY]);
                const filename = `User-${req[CURENT_USER_KEY].id}-${Math.round(Math.random()*100)}.${ext}`;
                console.log(filename)
                cb(null, filename);
            }
            }),
            fileFilter: (req, file, cb) => {
                const type = file.mimetype.split('/')[0];
                if (type === 'image')
                    cb(null,true);
                else 
                    cb( new BadRequestException('only image files are allowed'), false);
            }
        })
        ,JwtModule,UsersModule],
   controllers:[UploadsController],
   providers:[],
})
export class UploadsModule {

}
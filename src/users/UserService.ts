import { Injectable } from "@nestjs/common";


@Injectable()
export class UserService {
public getUser() {
    return [{'id':1, 'name':'omar',email:'almdkeiv@gmail.com'}];
}
}
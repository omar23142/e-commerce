import { TestingModule , Test } from "@nestjs/testing";
import { ProductController } from "./products.controller"
import { ProductService } from "./products.service";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { UserService } from "../users/User.Service";
import { user } from "../users/user.entity";
import { creatProductsDto } from "./dtos/create-Productdto.dto";
import { NotFoundException } from "@nestjs/common";

let products = [
    {name:'book', price:10, describe:'java book'},
    {name:'car', price:10000, describe:'pmw'},
    {name:'laptop', price:1000, describe:'mac'},
]
let update_dto = {name:'updated product', price:3, describe:'about'}
describe('productsController', ()=>{ 
    let productController:ProductController ;
    let productService:ProductService;

    const user1:any = {userName:'omar', id:1, } as user
    const creat_dto:creatProductsDto = {name:'book', discription:'java book', price:31}

    beforeEach(async ()=>{
        const module:TestingModule = await Test.createTestingModule({
            controllers:[ProductController],
            providers:[ 
                {provide:UserService,
                    useValue: {}
                },
                {provide:ConfigService, 
                    useValue: {}
                },
                { provide: JwtService ,
                     useValue: {}},
                { provide: ProductService ,
                     useValue: {
                        creatOne: jest.fn((user:user, dto:creatProductsDto)=>{ 
                           return Promise.resolve({...dto, id:1})
                        }),
                        getAll:jest.fn((query?,title?,minPrice?,maxPrice?)=>{
                            if (title)
                                return Promise.resolve(products.find((p)=> p.name === title));
                            if (minPrice && maxPrice) 
                                return Promise.resolve(products.filter((p)=> p.price <= maxPrice && p.price >= minPrice ))
                            else return Promise.resolve(products);
                        })
                     }
                    }, 
                ],

        }).compile();
        productController = module.get<ProductController>(ProductController);
        productService = module.get<ProductService>(ProductService);
    })

    it('should productController and productService to be defined', ()=>{
        expect(productController).toBeDefined();
        expect(ProductService).toBeDefined();


    })
    describe('creatProduct()',()=>{
        it('shold call the creatOne mock function from the productService', async ()=>{
            await productController.creatProduct(user1,creat_dto);
            expect(productService.creatOne).toHaveBeenCalled();
            expect(productService.creatOne).toHaveBeenCalledTimes(1);
        })
        it('shold create and return  new product', async ()=>{
            const New_product = await productController.creatProduct(user1,creat_dto);
            expect(New_product).toMatchObject({name:'book', discription:'java book', price:31, id:1});
           
        })
    })
    describe('getAllProduct() function', ()=>{
        it('should call the getAll() mock functions from the productService',async ()=>{
            await productController.getAllProduct();
            expect(productService.getAll).toBeDefined();
            expect(productService.getAll).toHaveBeenCalledTimes(1);
        })
         it('should return all the products',async ()=>{
            const products = await productController.getAllProduct();
            expect(products).toHaveLength(3)
            expect(products).toMatchObject( [
            {name:'book', price:10, describe:'java book'},
            {name:'car', price:10000, describe:'pmw'},
            {name:'laptop', price:1000, describe:'mac'},
        ])
            
        })
         it('should return the product with title book',async ()=>{
            const  product:any = await productController.getAllProduct(null,'book');
            expect(product).toBeDefined();
            //expect(product[0]).toHaveLength(1);
            expect(product.name).toBe('book');
            expect(product).toMatchObject({name:'book', price:10, describe:'java book'})
        })
         it('should return the elmint based on price ',async ()=>{
            const products = await productController.getAllProduct(null,'',1000,10000);
            expect(productService.getAll).toBeDefined();
            expect(products).toHaveLength(2);
            expect(products).toMatchObject(
                [
                {name:'car', price:10000, describe:'pmw'},
                {name:'laptop', price:1000, describe:'mac'}
                ]);
        })
    });
    describe('getgetOneProduct() function ',() => {
        it('should call the getOne mock function from the productService',async ()=> {
            productService.getOne = jest.fn().mockResolvedValue(products[0]);
            await productController.getOneProduct(1);
            expect(productService.getOne).toBeDefined();
            expect(productService.getOne).toHaveBeenCalled();
            expect(productService.getOne).toHaveBeenCalledTimes(1);

        })
        it('should return one product',async ()=> {
            productService.getOne = jest.fn().mockResolvedValue(products[0]);
            const product = await productController.getOneProduct(1);
            expect(product).toBeDefined();
            expect(product).toMatchObject( {name:'book', price:10, describe:'java book'});
            //expect(product).toHaveLength(1)
            
        })
        it('should throw an excption if no product with the given id ',async ()=> {
            productService.getOne = jest.fn().mockRejectedValue(new NotFoundException('product id is not exist'));
            await expect(productController.getOneProduct(1234)).rejects.toThrow(NotFoundException);

        })
    })
    describe('update()', ()=> {
        it('should the mock functioin in the productServer be defined',async ()=>{
            productService.Update= jest.fn().mockResolvedValue(update_dto);
            await productController.UpdateProduct(1,update_dto);
            expect(productService.Update).toHaveBeenCalled();
            expect(productService.Update).toHaveBeenCalledTimes(1);

        });
    })
    describe('delete()', ()=>{
        it('should call the mock function in the productServer', async()=>{
            productService.Delete = jest.fn().mockResolvedValue(products[0]);
            await productController.DeleteProduct(1);
             expect(productService.Delete).toHaveBeenCalled();
            expect(productService.Delete).toHaveBeenCalledTimes(1);
        })
    })
})
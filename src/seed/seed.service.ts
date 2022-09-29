import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ProductService } from '../product/product.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger('SeedService');
  constructor( 
      private readonly productService: ProductService,
    ){}
  
  runSeed() {
    try {
      return this.productService.deleteAllProducts();
    } catch (error) {
      this.handleDBError( error );
      
    }
  }

  handleDBError( error: any ){
    if(error.code === '23505')
      throw new BadRequestException(error.detail)
    
    this.logger.error(error);
    throw new BadRequestException(`Unexpected error, verify logs`);
  }
}

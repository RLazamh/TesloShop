import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, ProductImage } from './entities';

@Module({
  imports:[
    TypeOrmModule.forFeature([
      Product,
      ProductImage,
    ])
  ],
  controllers: [ProductController],
  providers: [ProductService]
})
export class ProductModule {}

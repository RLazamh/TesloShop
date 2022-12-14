import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseUUIDPipe, 
  Query
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PagintationDto } from '../common/dtos';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @Get()
  findAll(@Query() pagintationDto : PagintationDto ) {
    return this.productService.findAll( pagintationDto );
  }

  @Get(':term')
  findOne(@Param('term') term: string) {
    return this.productService.findOnePlane( term );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update( id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id' , ParseUUIDPipe) id: string) {
    return this.productService.remove( id );
  }
}

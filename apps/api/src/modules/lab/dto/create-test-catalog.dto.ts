import { IsIn, IsString } from "class-validator";
import { TestCategory } from "../entities/test-catalog.entity";

export class CreateTestCatalogDto {
  @IsString()
  name!: string;

  @IsIn(["lab", "radiology"])
  category!: TestCategory;
}

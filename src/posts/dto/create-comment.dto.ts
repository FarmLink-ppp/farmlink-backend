import { IsString , IsNumber} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
export class CreateCommentDto {
    @IsString()
    @ApiProperty({
        title: 'the text of the comment',
        example: "very nice",
        required: true,
      })
    content: string;
    @IsNumber()
    @ApiProperty({
        title: 'the id of the post',
        example: 1,
        required: true,
      })
    postId: number;
  }
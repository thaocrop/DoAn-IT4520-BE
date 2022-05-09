import { FileInterceptor } from '@nestjs/platform-express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Put,
  UseGuards,
  Req,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiHeader, ApiBearerAuth } from '@nestjs/swagger';
import { ClientIdEnum, MerchantPermission } from 'src/enum/base.enum';
import { ParseMongoId } from 'src/common/pipes/parse-mongoId.pipe';
import { AuthGuard } from 'src/common/guards/auth.guard';
import { Auth } from 'src/common/decorators/auth.decorator';

import { UserType } from '../users/enum/users.enum';

import { ContactService } from './contact.service';
import {
  CreatContactDto,
  GetListMergeSuggestionDto,
  MergeContactDto,
  SearchContactReqDto,
  UpdateContactDto,
  UpdateUserMembershipTierDto,
} from './dto/contact.dto';

@ApiHeader({ name: 'client-id', enum: ClientIdEnum })
@ApiTags('Contacts')
@Controller('contacts')
@ApiBearerAuth()
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @ApiOperation({
    operationId: '',
    description: 'get list of contact',
  })
  @Get()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async getListContact(@Req() req, @Query() params: SearchContactReqDto) {
    return this.contactService.getListContact(req.user, params);
  }

  @ApiOperation({
    operationId: 'create',
    description: 'add contact',
  })
  @Post()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async create(@Req() req, @Body() payload: CreatContactDto) {
    return this.contactService.createContact(req.user, payload);
  }

  @ApiOperation({
    operationId: 'duplicate',
    description: 'duplicate contact',
  })
  @Post('/:id/duplicate')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async duplicate(@Req() req, @Param('id', ParseMongoId) id: string) {
    return this.contactService.duplicateContact(req.user, id);
  }

  @ApiOperation({
    operationId: 'update',
    description: 'update contact',
  })
  @Put(':id/update')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async update(@Param('id', ParseMongoId) id: string, @Body() payload: UpdateContactDto, @Req() req) {
    return this.contactService.updateContact(id, payload, req.user);
  }

  @ApiOperation({
    operationId: 'updateMembershipTier',
    description: 'update membership tier',
  })
  @Put('update-membership')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async updateMembershipTier(@Body() payload: UpdateUserMembershipTierDto, @Req() req) {
    return this.contactService.updateMembershipTier(payload, req.user);
  }

  @ApiOperation({
    operationId: 'delete',
    description: 'delete contact',
  })
  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async delete(@Req() req, @Param('id', ParseMongoId) id: string) {
    return this.contactService.deleteContact(req.user, id);
  }

  @ApiOperation({
    operationId: 'listMergeSuggestions',
    description: 'list merge suggestions',
  })
  @Get('/merge-suggestions')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      isActiveMerchant: true,
    },
  ])
  async listMergeSeggestions(@Req() req, @Query() query: GetListMergeSuggestionDto) {
    return this.contactService.listMergeSeggestions(req.user, query);
  }

  @Post('merge-contacts')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      isActiveMerchant: true,
    },
  ])
  async mergeContacts(@Req() req, @Body() payload: MergeContactDto) {
    return this.contactService.mergeContacts(req.user, payload);
  }

  @Post('export-contact')
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async export(@Req() req) {
    return this.contactService.exportContact(req.user);
  }

  @ApiOperation({
    operationId: 'get',
    description: 'get contact',
  })
  @Get(':id')
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async detail(@Param('id', ParseMongoId) id: string) {
    return this.contactService.getById(id);
  }

  @Post('import-contact')
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10485760 } }))
  async import(@Req() req, @UploadedFile() file: Express.Multer.File) {
    return this.contactService.importContact(req.user.merchantId, file);
  }

  @Post('download-contact-template')
  @UseGuards(AuthGuard)
  @Auth([
    {
      userType: UserType.MERCHANT,
      permission: MerchantPermission.MANAGE_CONTACT_AND_EDIT_POINTS,
      isActiveMerchant: true,
    },
  ])
  async downloadContactTemplate() {
    return this.contactService.downloadTemplate();
  }
}

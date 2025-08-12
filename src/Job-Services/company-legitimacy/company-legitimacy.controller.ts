import { Controller, Post, Body, Get, Logger, Query } from '@nestjs/common';
import { CompanyLegitimacyService } from './company-legitimacy.service';

@Controller('company-legitimacy')
export class CompanyLegitimacyController {
  private readonly logger = new Logger(CompanyLegitimacyController.name);

  constructor(
    private readonly companyLegitimacyService: CompanyLegitimacyService,
  ) {}

  @Post('verify')
  async verifyCompany(
    @Body() companyData: { name: string; location?: string; about?: string },
  ) {
    this.logger.log(`Received verification request for: ${companyData.name}`);

    // Validate input
    if (!companyData.name) {
      return {
        success: false,
        message: 'Company name is required',
      };
    }

    try {
      // Call the service to perform verification
      const result =
        await this.companyLegitimacyService.verifyCompany(companyData);
      return result;
    } catch (error) {
      this.logger.error(
        `Error during company verification: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Verification failed: ${error.message}`,
      };
    }
  }

  @Get('check')
  async checkCompany(
    @Query('name') name: string,
    @Query('location') location?: string,
    @Query('about') about?: string,
  ) {
    if (!name) {
      return {
        success: false,
        message: 'Company name is required as a query parameter',
      };
    }

    this.logger.log(`Received check request for: ${name}`);

    try {
      // Call the service to perform verification
      const result = await this.companyLegitimacyService.verifyCompany({
        name,
        location,
        about,
      });
      return result;
    } catch (error) {
      this.logger.error(
        `Error during company check: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        message: `Check failed: ${error.message}`,
      };
    }
  }
}

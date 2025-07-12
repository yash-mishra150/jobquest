import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CompanyLegitimacyService {
  private readonly logger = new Logger(CompanyLegitimacyService.name);

  // Scoring weights for different verification methods
  private readonly WEIGHTS = {
    domainVerification: 25,
    socialMediaPresence: 15,
    reviewsAnalysis: 20,
    companyRegistration: 30,
    websiteAnalysis: 10
  };

  constructor() {
    this.logger.log('Company Legitimacy Service initialized');
  }

  /**
   * Main method to verify company legitimacy
   */
  async verifyCompany(companyData: {
    name: string;
    location?: string;
    about?: string;
  }): Promise<any> {
    this.logger.log(`Verifying company: ${companyData.name}`);
    
    try {
      // Extract potential company website from the 'about' section
      const websiteUrl = this.extractWebsiteUrl(companyData.about || '');
      
      // Run various verification checks in parallel
      const [
        domainScore,
        socialMediaScore,
        reviewsScore,
        registrationScore,
        websiteScore
      ] = await Promise.all([
        this.checkDomainLegitimacy(companyData.name, websiteUrl),
        this.checkSocialMediaPresence(companyData.name),
        this.analyzeCompanyReviews(companyData.name, companyData.location),
        this.checkCompanyRegistration(companyData.name, companyData.location),
        this.analyzeWebsite(websiteUrl)
      ]);
      
      // Calculate overall legitimacy score
      const overallScore = this.calculateOverallScore({
        domainScore,
        socialMediaScore,
        reviewsScore,
        registrationScore,
        websiteScore
      });
      
      // Generate detailed report
      const report = this.generateLegitimacyReport({
        name: companyData.name,
        location: companyData.location,
        websiteUrl,
        scores: {
          domain: domainScore,
          socialMedia: socialMediaScore,
          reviews: reviewsScore,
          registration: registrationScore,
          website: websiteScore,
          overall: overallScore
        }
      });
      
      return report;
    } catch (error) {
      this.logger.error(`Error verifying company: ${error.message}`, error.stack);
      return {
        success: false,
        message: `Error verifying company: ${error.message}`,
        isLegitimate: false,
        confidenceScore: 0,
        error: error.message
      };
    }
  }

  /**
   * Extract website URL from company description
   */
  private extractWebsiteUrl(about: string): string {
    // Look for URLs in the about text
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = about.match(urlRegex);
    
    if (urls && urls.length > 0) {
      return urls[0]; // Return the first URL found
    }
    
    // If no URL with protocol, try to find www. format
    const wwwRegex = /(www\.[^\s]+)/g;
    const wwwUrls = about.match(wwwRegex);
    
    if (wwwUrls && wwwUrls.length > 0) {
      return `https://${wwwUrls[0]}`; // Add https protocol and return
    }
    
    return ''; // No URL found
  }

  /**
   * Check if the company has a legitimate domain
   */
  private async checkDomainLegitimacy(companyName: string, websiteUrl: string): Promise<number> {
    // If we have a direct website URL
    if (websiteUrl) {
      try {
        // Remove protocol and www prefix to get the base domain
        const domain = websiteUrl.replace(/(https?:\/\/)?(www\.)?/i, '').split('/')[0];
        
        // Check domain age (simulated)
        const domainAge = await this.simulateDomainAgeCheck(domain);
        
        // Score based on domain age
        // Domains older than 2 years are more likely to be legitimate
        if (domainAge > 2) return 100; // More than 2 years
        if (domainAge > 1) return 75;  // 1-2 years
        if (domainAge > 0.5) return 50; // 6-12 months
        return 25; // Less than 6 months
      } catch (error) {
        this.logger.warn(`Error checking domain: ${error.message}`);
        return 0;
      }
    }
    
    // If no website provided, try to guess domain based on company name
    const simplifiedName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const potentialDomains = [
      `${simplifiedName}.com`,
      `${simplifiedName}.co`,
      `${simplifiedName}.net`,
      `${simplifiedName}.org`,
      `${simplifiedName}.io`
    ];
    
    // For demonstration, we'll just return a medium score
    // In a real implementation, we would check if these domains exist
    return 50;
  }

  /**
   * Check social media presence
   */
  private async checkSocialMediaPresence(companyName: string): Promise<number> {
    // In a real implementation, we would:
    // 1. Search for the company on major social platforms (LinkedIn, Twitter, Facebook, etc.)
    // 2. Verify profile authenticity
    // 3. Check follower count, post frequency, engagement
    
    // For demonstration, generate a random score
    return this.simulateSocialMediaCheck(companyName);
  }

  /**
   * Analyze company reviews
   */
  private async analyzeCompanyReviews(companyName: string, location?: string): Promise<number> {
    // In a real implementation, we would:
    // 1. Search for company reviews on Glassdoor, Indeed, etc.
    // 2. Analyze sentiment and consistency
    // 3. Check for red flags in reviews
    
    // For demonstration, generate a random score
    return this.simulateReviewAnalysis(companyName);
  }

  /**
   * Check if company is registered
   */
  private async checkCompanyRegistration(companyName: string, location?: string): Promise<number> {
    // In a real implementation, we would:
    // 1. Check business registration databases
    // 2. Verify tax ID or company registration number
    // 3. Check for legal issues or bankruptcy records
    
    // For demonstration, generate a random score
    return this.simulateRegistrationCheck(companyName, location);
  }

  /**
   * Analyze website content and structure
   */
  private async analyzeWebsite(websiteUrl: string): Promise<number> {
    if (!websiteUrl) return 0;
    
    try {
      // In a real implementation, we would:
      // 1. Check if website is live
      // 2. Analyze content for completeness
      // 3. Check for contact info, about page, team page, etc.
      // 4. Analyze site security (HTTPS)
      
      // For demonstration, simulate a website check
      return this.simulateWebsiteAnalysis(websiteUrl);
    } catch (error) {
      this.logger.warn(`Error analyzing website: ${error.message}`);
      return 0;
    }
  }

  /**
   * Calculate overall legitimacy score
   */
  private calculateOverallScore(scores: {
    domainScore: number;
    socialMediaScore: number;
    reviewsScore: number;
    registrationScore: number;
    websiteScore: number;
  }): number {
    const weightedScore = 
      (scores.domainScore * this.WEIGHTS.domainVerification) +
      (scores.socialMediaScore * this.WEIGHTS.socialMediaPresence) +
      (scores.reviewsScore * this.WEIGHTS.reviewsAnalysis) +
      (scores.registrationScore * this.WEIGHTS.companyRegistration) +
      (scores.websiteScore * this.WEIGHTS.websiteAnalysis);
    
    // Normalize to 0-100 scale
    return Math.round(weightedScore / 100);
  }

  /**
   * Generate detailed legitimacy report
   */
  private generateLegitimacyReport(data: {
    name: string;
    location?: string;
    websiteUrl?: string;
    scores: {
      domain: number;
      socialMedia: number;
      reviews: number;
      registration: number;
      website: number;
      overall: number;
    }
  }): any {
    const { name, location, websiteUrl, scores } = data;
    
    // Determine legitimacy based on overall score
    const isLegitimate = scores.overall >= 70;
    const riskLevel = this.determineRiskLevel(scores.overall);
    
    // Generate recommendations
    const recommendations = this.generateRecommendations(scores);
    
    return {
      success: true,
      companyName: name,
      location: location || 'Unknown',
      websiteUrl: websiteUrl || 'Not provided',
      isLegitimate,
      confidenceScore: scores.overall,
      riskLevel,
      verificationDetails: {
        domainVerification: {
          score: scores.domain,
          weight: this.WEIGHTS.domainVerification,
          notes: this.getDomainVerificationNotes(scores.domain)
        },
        socialMediaPresence: {
          score: scores.socialMedia,
          weight: this.WEIGHTS.socialMediaPresence,
          notes: this.getSocialMediaNotes(scores.socialMedia)
        },
        reviewsAnalysis: {
          score: scores.reviews,
          weight: this.WEIGHTS.reviewsAnalysis,
          notes: this.getReviewsNotes(scores.reviews)
        },
        companyRegistration: {
          score: scores.registration,
          weight: this.WEIGHTS.companyRegistration,
          notes: this.getRegistrationNotes(scores.registration)
        },
        websiteAnalysis: {
          score: scores.website,
          weight: this.WEIGHTS.websiteAnalysis,
          notes: this.getWebsiteNotes(scores.website)
        }
      },
      recommendations,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Determine risk level based on overall score
   */
  private determineRiskLevel(score: number): string {
    if (score >= 90) return 'Very Low Risk';
    if (score >= 70) return 'Low Risk';
    if (score >= 50) return 'Moderate Risk';
    if (score >= 30) return 'High Risk';
    return 'Very High Risk';
  }

  /**
   * Generate recommendations based on scores
   */
  private generateRecommendations(scores: {
    domain: number;
    socialMedia: number;
    reviews: number;
    registration: number;
    website: number;
    overall: number;
  }): string[] {
    const recommendations: string[] = [];
    
    if (scores.overall < 70) {
      recommendations.push('Conduct additional research before proceeding with this company.');
    }
    
    if (scores.domain < 50) {
      recommendations.push('Verify the company\'s official website directly.');
    }
    
    if (scores.socialMedia < 50) {
      recommendations.push('Check the company\'s presence on professional platforms like LinkedIn.');
    }
    
    if (scores.reviews < 50) {
      recommendations.push('Look for employee reviews on platforms like Glassdoor or Indeed.');
    }
    
    if (scores.registration < 70) {
      recommendations.push('Verify the company\'s business registration with relevant authorities.');
    }
    
    return recommendations;
  }

  // Helper methods to generate notes for each verification aspect
  private getDomainVerificationNotes(score: number): string {
    if (score >= 80) return 'The company has a well-established online presence with a legitimate domain.';
    if (score >= 50) return 'The company appears to have a legitimate domain, but further verification is recommended.';
    return 'The company\'s online presence could not be verified or appears suspicious.';
  }

  private getSocialMediaNotes(score: number): string {
    if (score >= 80) return 'The company has strong social media presence across multiple platforms.';
    if (score >= 50) return 'The company has some social media presence, but activity is limited.';
    return 'The company has minimal or no verifiable social media presence.';
  }

  private getReviewsNotes(score: number): string {
    if (score >= 80) return 'The company has positive and consistent reviews from employees and customers.';
    if (score >= 50) return 'The company has mixed reviews or limited review history.';
    return 'The company has negative reviews or insufficient review data.';
  }

  private getRegistrationNotes(score: number): string {
    if (score >= 80) return 'The company is properly registered and in good standing.';
    if (score >= 50) return 'The company appears to be registered, but some details could not be verified.';
    return 'The company\'s registration status could not be verified or has discrepancies.';
  }

  private getWebsiteNotes(score: number): string {
    if (score >= 80) return 'The company website is professional, secure, and contains comprehensive information.';
    if (score >= 50) return 'The company website is functional but may lack some important information.';
    return 'The company website has issues or lacks critical information typically found on legitimate business sites.';
  }

  // Simulation methods for demonstration purposes
  // In a real implementation, these would make API calls to various services

  private async simulateDomainAgeCheck(domain: string): Promise<number> {
    // Simulate domain age check
    // Returns domain age in years
    return parseFloat((Math.random() * 5).toFixed(1));
  }

  private simulateSocialMediaCheck(companyName: string): number {
    // Simulate social media presence check
    // Returns a score from 0-100
    return Math.floor(Math.random() * 100);
  }

  private simulateReviewAnalysis(companyName: string): number {
    // Simulate review analysis
    // Returns a score from 0-100
    return Math.floor(Math.random() * 100);
  }

  private simulateRegistrationCheck(companyName: string, location?: string): number {
    // Simulate company registration check
    // Returns a score from 0-100
    return Math.floor(Math.random() * 100);
  }

  private simulateWebsiteAnalysis(websiteUrl: string): number {
    // Simulate website analysis
    // Returns a score from 0-100
    return Math.floor(Math.random() * 100);
  }
}

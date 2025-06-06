import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { PlantDiseaseResponse } from 'src/common/types/plant-health.types';

@Injectable()
export class PlantHealthService {
  private readonly plantDiseaseApi: string | undefined;

  constructor(
    private readonly prisma: PrismaService,
    private configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.plantDiseaseApi = this.configService.get<string>(
      'PLANT_HEALTH_BASE_URL',
    );
    if (!this.plantDiseaseApi) {
      throw new Error('PLANT_HEALTH_BASE_URL is not defined in the config');
    }
  }

  async createScan(userId: number, imageUrl: string) {
    const scan = await this.prisma.plantHealthScan.create({
      data: {
        user_id: userId,
        image_url: imageUrl,
      },
    });
    const response = await firstValueFrom(
      this.httpService
        .post<PlantDiseaseResponse>(
          `${this.plantDiseaseApi!}/predict?image_url=${imageUrl}`,
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw new InternalServerErrorException(
              `Error fetching data from plant disease API: ${error.message}`,
            );
          }),
        ),
    );
    if (response.data.status !== 'success') {
      throw new BadRequestException('Plant disease analysis failed');
    }

    const { diagnostic, disease_info: diseaseInfo } = response.data.data;

    const diagnosticRecord = await this.prisma.plantHealthDiagnostic.create({
      data: {
        issue_detected: !diagnostic.class.toLowerCase().includes('healthy'),
        disease_name: diagnostic.class,
        confidence_score: diagnostic.confidence,
        description: diseaseInfo.description,
        treatment: diseaseInfo.treatment.join('\n'),
        prevention: diseaseInfo.prevention.join('\n'),
        scan_id: scan.id,
      },
    });

    return {
      diagnostic: diagnosticRecord,
    };
  }

  async getScans(userId: number) {
    return this.prisma.plantHealthScan.findMany({
      where: {
        user_id: userId,
      },
    });
  }

  async getScanDiagnosis(userId: number, scanId: number) {
    const scan = await this.prisma.plantHealthScan.findUnique({
      where: {
        id: scanId,
        user_id: userId,
      },
      include: {
        diagnostic: true,
      },
    });

    if (!scan) {
      throw new BadRequestException('Scan not found');
    }

    return scan.diagnostic;
  }

  async getDiagnosis(userId: number) {
    const scans = await this.prisma.plantHealthScan.findMany({
      where: {
        user_id: userId,
      },
      include: {
        diagnostic: true,
      },
    });

    return scans.map((scan) => ({
      imageUrl: scan.image_url,
      diagnostic: scan.diagnostic,
    }));
  }
}

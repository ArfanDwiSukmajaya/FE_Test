import { apiClient } from '../../infrastructure/api/ApiClient';
import { UserRepositoryImpl } from '../../infrastructure/repositories/UserRepositoryImpl';
import { GerbangRepositoryImpl } from '../../infrastructure/repositories/GerbangRepositoryImpl';
import { LalinRepositoryImpl } from '../../infrastructure/repositories/LalinRepositoryImpl';
import { AuthUseCase } from '../../application/use-cases/AuthUseCase';
import { GerbangUseCase } from '../../application/use-cases/GerbangUseCase';
import { ReportUseCase } from '../../application/use-cases/ReportUseCase';
import { DashboardUseCase } from '../../application/use-cases/DashboardUseCase';

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, unknown> = new Map();

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeServices(): void {
    const userRepository = new UserRepositoryImpl(apiClient);
    const gerbangRepository = new GerbangRepositoryImpl(apiClient);
    const lalinRepository = new LalinRepositoryImpl(apiClient);

    const authUseCase = new AuthUseCase(userRepository);
    const gerbangUseCase = new GerbangUseCase(gerbangRepository);
    const reportUseCase = new ReportUseCase(lalinRepository);
    const dashboardUseCase = new DashboardUseCase(lalinRepository, gerbangRepository);

    this.services.set('userRepository', userRepository);
    this.services.set('gerbangRepository', gerbangRepository);
    this.services.set('lalinRepository', lalinRepository);
    this.services.set('authUseCase', authUseCase);
    this.services.set('gerbangUseCase', gerbangUseCase);
    this.services.set('reportUseCase', reportUseCase);
    this.services.set('dashboardUseCase', dashboardUseCase);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service as T;
  }

  getAuthUseCase(): AuthUseCase {
    return this.get<AuthUseCase>('authUseCase');
  }

  getGerbangUseCase(): GerbangUseCase {
    return this.get<GerbangUseCase>('gerbangUseCase');
  }

  getReportUseCase(): ReportUseCase {
    return this.get<ReportUseCase>('reportUseCase');
  }

  getDashboardUseCase(): DashboardUseCase {
    return this.get<DashboardUseCase>('dashboardUseCase');
  }
}

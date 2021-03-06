import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransDsdStabilityStatus } from '../../entities/fact-trans-dsd-stability-status.model';
import { Repository } from 'typeorm';
import { GetDsdStabilityStatusByAgeSexQuery } from '../impl/get-dsd-stability-status-by-age-sex.query';

@QueryHandler(GetDsdStabilityStatusByAgeSexQuery)
export class GetDsdStabilityStatusByAgeSexHandler implements IQueryHandler<GetDsdStabilityStatusByAgeSexQuery> {
    constructor(
        @InjectRepository(FactTransDsdStabilityStatus, 'mssql')
        private readonly repository: Repository<FactTransDsdStabilityStatus>
    ) {

    }

    async execute(query: GetDsdStabilityStatusByAgeSexQuery): Promise<any> {
        const dsdStabilityStatusByAgeSex = this.repository.createQueryBuilder('f')
            .select(['DATIM_AgeGroup ageGroup, Gender gender, SUM(TxCurr) txCurr, SUM(MMD) mmd, SUM(NonMMD) nonMmd, SUM(Stable) stable, SUM(UnStable) unStable'])
            .where('f.MFLCode > 1')
            .andWhere('f.DATIM_AgeGroup IS NOT NULL')
            .andWhere('f.Gender IS NOT NULL');

        if (query.county) {
            dsdStabilityStatusByAgeSex.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            dsdStabilityStatusByAgeSex.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            dsdStabilityStatusByAgeSex.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            dsdStabilityStatusByAgeSex.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await dsdStabilityStatusByAgeSex
            .groupBy('f.DATIM_AgeGroup, f.Gender')
            .orderBy('f.DATIM_AgeGroup, f.Gender')
            .getRawMany();
    }
}

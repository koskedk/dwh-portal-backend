import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FactTransRetention } from '../../entities/fact-trans-retention.model';
import { Repository } from 'typeorm';
import { GetTreatmentOutcomesRetention24mQuery } from '../impl/get-treatment-outcomes-retention-24m.query';

@QueryHandler(GetTreatmentOutcomesRetention24mQuery)
export class GetTreatmentOutcomesRetention24mHandler implements IQueryHandler<GetTreatmentOutcomesRetention24mQuery> {
    constructor(
        @InjectRepository(FactTransRetention, 'mssql')
        private readonly repository: Repository<FactTransRetention>
    ) {

    }

    async execute(query: GetTreatmentOutcomesRetention24mQuery): Promise<any> {
        const retention = this.repository.createQueryBuilder('f')
            .select(['f.StartART_Year year, SUM([18Mstatus]) retention'])
            .where('f.MFLCode IS NOT NULL');

        if (query.county) {
            retention.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            retention.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            retention.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            retention.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await retention
            .groupBy('f.StartART_Year')
            .orderBy('f.StartART_Year')
            .getRawMany();
    }
}

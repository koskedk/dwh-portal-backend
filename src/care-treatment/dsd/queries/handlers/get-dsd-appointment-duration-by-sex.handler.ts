import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetDsdAppointmentDurationBySexQuery } from '../impl/get-dsd-appointment-duration-by-sex.query';
import { FactTransDsdAppointmentByStabilityStatus } from '../../entities/fact-trans-dsd-appointment-by-stability-status.model';

@QueryHandler(GetDsdAppointmentDurationBySexQuery)
export class GetDsdAppointmentDurationBySexHandler implements IQueryHandler<GetDsdAppointmentDurationBySexQuery> {
    constructor(
        @InjectRepository(FactTransDsdAppointmentByStabilityStatus, 'mssql')
        private readonly repository: Repository<FactTransDsdAppointmentByStabilityStatus>
    ) {

    }

    async execute(query: GetDsdAppointmentDurationBySexQuery): Promise<any> {
        const dsdAppointmentDuration = this.repository.createQueryBuilder('f')
            .select(['SUM(NumPatients) patients, AppointmentsCategory, Gender'])
            .where('f.MFLCode > 1')
            .andWhere('f.AppointmentsCategory IS NOT NULL')
            .andWhere('f.Gender IS NOT NULL')
            .andWhere('f.Stability = :stability', { stability: "Stable"});

        if (query.county) {
            dsdAppointmentDuration.andWhere('f.County IN (:...counties)', { counties: query.county });
        }

        if (query.subCounty) {
            dsdAppointmentDuration.andWhere('f.SubCounty IN (:...subCounties)', { subCounties: query.subCounty });
        }

        if (query.facility) {
            dsdAppointmentDuration.andWhere('f.FacilityName IN (:...facilities)', { facilities: query.facility });
        }

        if (query.partner) {
            dsdAppointmentDuration.andWhere('f.CTPartner IN (:...partners)', { partners: query.partner });
        }

        return await dsdAppointmentDuration
            .groupBy('Gender, AppointmentsCategory')
            .orderBy('AppointmentsCategory, Gender')
            .getRawMany();
    }
}

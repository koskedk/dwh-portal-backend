import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetLinkageByStrategyQuery } from '../impl/get-linkage-by-strategy.query';
import { InjectRepository } from '@nestjs/typeorm';
import { FactHtsTeststrategy } from '../../entities/fact-hts-teststrategy.entity';
import { Repository } from 'typeorm';

@QueryHandler(GetLinkageByStrategyQuery)
export class GetLinkageByStrategyHandler implements IQueryHandler<GetLinkageByStrategyQuery> {
    constructor(
        @InjectRepository(FactHtsTeststrategy)
        private readonly repository: Repository<FactHtsTeststrategy>
    ) {}

    async execute(query: GetLinkageByStrategyQuery): Promise<any> {
        const params = [];
        let linkageByStrategySql = 'SELECT \n' +
            '`TestStrategy` AS testStrategy, \n' +
            'SUM(CASE WHEN `Tested` IS NULL THEN 0 ELSE `Tested` END) tested, \n' +
            'SUM(CASE WHEN `positive` IS NULL THEN 0 ELSE `positive` END) positive, \n' +
            '((SUM(CASE WHEN `linked` IS NULL THEN 0 ELSE `linked` END)/SUM(CASE WHEN `positive` IS NULL THEN 0 ELSE `positive` END))*100) AS linkage \n' +
            'FROM `fact_hts_teststrategy` \n' +
            'WHERE `TestStrategy` IS NOT NULL AND TestStrategy <> "NULL" AND positive IS NOT NULL AND positive > 0 ';

        if(query.county) {
            linkageByStrategySql = `${linkageByStrategySql} and County IN (?)`;
            params.push(query.county);
        }

        if(query.subCounty) {
            linkageByStrategySql = `${linkageByStrategySql} and SubCounty IN (?)`;
            params.push(query.subCounty);
        }

        if(query.facility) {
            linkageByStrategySql = `${linkageByStrategySql} and FacilityName IN (?)`;
            params.push(query.facility);
        }

        if(query.partner) {
            linkageByStrategySql = `${linkageByStrategySql} and CTPartner IN (?)`;
            params.push(query.partner);
        }

        if(query.month) {
            linkageByStrategySql = `${linkageByStrategySql} and month=?`;
            params.push(query.month);
        }

        if(query.year) {
            linkageByStrategySql = `${linkageByStrategySql} and year=?`;
            params.push(query.year);
        }

        linkageByStrategySql = `${linkageByStrategySql} GROUP BY TestStrategy ORDER BY SUM(\`positive\`) DESC`;

        return  await this.repository.query(linkageByStrategySql, params);
    }
}

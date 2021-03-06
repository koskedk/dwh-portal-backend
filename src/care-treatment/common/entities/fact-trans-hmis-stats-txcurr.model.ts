import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('Fact_Trans_HMIS_STATS_TXCURR')
export class FactTransHmisStatsTxcurr {
    @PrimaryColumn('text')
    MFLCode: string;

    @Column('text')
    FacilityName: string;

    @Column('text')
    County: string;

    @Column('text')
    Subcounty: string;

    @Column('text')
    CTPartner: string;

    @Column('text')
    Gender: string;

    @Column('text')
    ageGroup: string;

    @Column('int')
    TXCURR_Total: number;

    @Column('int')
    Eligible4VL: number;

    @Column('int')
    Last12MonthVL: number;

    @Column('int')
    Last12MVLSup: number;
}

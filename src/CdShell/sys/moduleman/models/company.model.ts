// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "../../../sys/utils/orm-shim";
@Entity({
  name: 'company',
  synchronize: false,
})
// @CdModel
export class CompanyModel {

  @PrimaryGeneratedColumn({
    name: 'company_id',
  })
  companyId?: number;

  @Column({
    name: 'company_guid',
  })
  companyGuid!: string;

  @Column({
    name: 'company_name',
  })
  companyName!: string;

  @Column({
    name: 'company_type_guid',
  })
  companyTypeGuid?: number;

  @Column({
    name: 'directory_category_guid',
  })
  directoryCategoryGuid!: string;

  @Column('int', {
    name: 'doc_id',
  })
  docId!: number;

  @Column({
    name: 'company_enabled',
  })
  companyEnabled?: boolean;

  @Column({
    name: 'postal_address',
  })
  postalAddress!: string;

  @Column({
    name: 'phone',
  })
  phone!: string;

  @Column({
    name: 'mobile',
  })
  mobile!: string;

  @Column({
    name: 'email',
  })
  email!: string;

  @Column({
    name: 'physical_location',
  })
  physicalLocation!: string;

  @Column({
    name: 'city',
  })
  city!: string;

  @Column({
    name: 'country',
  })
  country!: string;

  @Column({
    name: 'logo',
  })
  logo!: string;

  @Column({
    name: 'city_guid',
  })
  cityGuid!: string;

  @Column({
    name: 'company_description',
  })
  company_description?: string;

  @Column({
    name: 'parent_guid',
  })
  parentGuid?: string;

  @Column({
    name: 'consumer_guid',
  })
  consumerGuid?: string;

  @Column({
    name: 'search_tags',
  })
  searchTags!: string;
}

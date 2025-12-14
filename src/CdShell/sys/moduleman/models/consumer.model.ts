// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from "uuid";
import { validateOrReject } from "class-validator";
import { IShellConfig } from "./config.model";

@Entity({
  name: "consumer",
  synchronize: false,
})
// @CdModel
export class ConsumerModel {
  @PrimaryGeneratedColumn({
    name: "consumer_id",
  })
  consumerId?: number;

  @Column({
    name: "consumer_guid",
    length: 36,
  })
  consumerGuid?: string;

  @Column("varchar", {
    name: "consumer_name",
    length: 50,
    nullable: true,
  })
  consumerName!: string;

  @Column("tinyint", {
    name: "consumer_enabled",
    default: null,
  })
  consumerEnabled!: boolean | number | null;

  @Column({
    name: "doc_id",
    default: null,
  })
  docId?: number;

  @Column({
    name: "company_id",
    default: null,
  })
  companyId?: number;

  @Column({
    name: "company_guid",
    default: null,
  })
  companyGuid?: string;
}

export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Consumer may lock or restrict UI options for all users.
   * These form the base policy.
   */
  lockDown?: {
    /** Prevent users from changing their UI system */
    uiSystem?: boolean;

    /** Prevent users from changing their theme */
    theme?: boolean;

    /** Prevent users from changing form variant */
    formVariant?: boolean;
  };

  /**
   * Consumer-level options for UI system and theme allowances.
   */
  allowedOptions?: {
    uiSystems?: string[]; // which UI-systems users may pick from
    themes?: string[]; // which themes users may pick from
    formVariants?: string[]; // (e.g., standard | outline | filled)
  };
}

export interface IConsumerProfile {
  /** Basic company/tenant information */
  consumerData: ConsumerModel;

  /** Optional business descriptions, tags, extra metadata */
  bio?: string;
  missionStatement?: string;
  tags?: string[];
  industries?: string[];
  preferences?: Record<string, any>;

  /** Consumer-level shell config (base for all users) */
  shellConfig?: IConsumerShellConfig;

  /**
   * Consumer-wide access control
   * Future-proofed for menu permissions, module access, etc.
   */
  permissions?: {
    moduleAccess?: string[]; // e.g., ["hr", "finance", "assets"]
    featureFlags?: string[];
  };
}

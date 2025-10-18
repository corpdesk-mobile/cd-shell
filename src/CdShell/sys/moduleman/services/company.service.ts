
// import { ObjectLiteral } from 'typeorm';
// import { CD_FX_FAIL, CdFxReturn, IQuery } from '../../base/i-base.js';

// import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
// import { CompanyModel } from '../models/company.model.js';
// import { GenericService } from '../../base/generic-service.js';
// import { BaseService } from '../../base/base.service.js';

// import config from '../../../../config.js';
//////////////////////////////////////////////////

// import type { GenericService } from '../../base/generic-service.js';
import type { ObjectLiteral } from '../../utils/orm-shim';
import { GenericService } from '../../base';
import { BaseService } from '../../base/base.service.js';
import type { CdFxReturn, IQuery } from '../../base/i-base';

// Concrete imports
import { CompanyModel } from '../models/company.model';
import { CD_FX_FAIL } from '../../base/i-base';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';


export class CompanyService extends GenericService<ObjectLiteral> {
  b = new BaseService<CompanyModel>();
  serviceModel = CompanyModel;
  // Define validation rules
  cRules: any = {
    required: ['companyName', 'companyTypeGuid', 'companyGuid'],
    noDuplicate: ['companyName', 'companyTypeGuid'],
  };

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ADAPTATION FROM GENERIC SERVICE
  constructor() {
    super();
  }

  /**
   * Validate input before processing create
   */
  async validateCreate(pl: CompanyModel): Promise<CdFxReturn<boolean>> {
    const retState = true;
    // Ensure required fields exist
    for (const field of this.cRules.required) {
      if (!pl[field]) {
        return {
          data: false,
          state: false,
          message: `Missing required field: ${field}`,
        };
      }
    }

    // Check for duplicates
    const query = {
      where: {
        companyName: pl.companyName,
        companyTypeId: pl.companyTypeGuid,
      },
    };
    const serviceInput = {
      serviceModel: CompanyModel,
      docName: 'Validate Duplicate Company',
      dSource: 1,
      cmd: { query },
    };

    const existingRecords = await this.b.read(null, null, serviceInput);
    if ('state' in existingRecords && 'data' in existingRecords) {
      if (!existingRecords.state || !existingRecords.data) {
        return { data: false, state: false, message: 'Validation failed' };
      }

      if (existingRecords.data.length > 0) {
        return { data: true, state: true, message: 'Validation passed' };
      } else {
        return { data: false, state: false, message: 'Validation failed' };
      }
    }

    return { data: false, state: false, message: 'Validation failed' };
  }

  /**
   * Fetch newly created record by guid
   */
  async afterCreate(
    pl: CompanyModel,
  ): Promise<CdFxReturn<CompanyModel | ObjectLiteral | null >> {
    const query = {
      where: { companyGuid: pl.companyGuid },
    };

    const serviceInput = {
      serviceModel: CompanyModel,
      docName: 'Fetch Created Company',
      dSource: 1,
      cmd: { query },
    };

    const retResult = await this.b.read(null, null, serviceInput);
    if ('state' in retResult) {
      return retResult;
    } else {
      return CD_FX_FAIL;
    }
  }

  async getCompany(
    q: IQuery,
  ): Promise<CdFxReturn<CompanyModel[] | ObjectLiteral[] | unknown>> {
    // Validate query input
    if (!q || !q.where || Object.keys(q.where).length === 0) {
      return {
        data: null,
        state: false,
        message: 'Invalid query: "where" condition is required',
      };
    }

    const serviceInput = {
      serviceModel: CompanyModel,
      docName: 'CompanyService::getCompany',
      cmd: {
        action: 'find',
        query: q,
      },
      dSource: 1,
    };

    try {
      const retResult = await this.b.read(null, null, serviceInput);

      if ('state' in retResult) {
        return retResult;
      } else {
        return CD_FX_FAIL;
      }
    } catch (e: any) {
      CdLog.error(`CompanyService.getCompany() - Error: ${e.message}`);
      return {
        data: null,
        state: false,
        message: `Error retrieving Company: ${e.message}`,
      };
    }
  }

  beforeUpdate(q: any) {
    if (q.update.CoopEnabled === '') {
      q.update.CoopEnabled = null;
    }
    return q;
  }

  async getCompanyI(req, res, q?: IQuery): Promise<any> {
    if (q === null) {
      q = this.b.getQuery(req);
    }
    console.log('CompanyService::getCompany/f:', q);
    const serviceInput = this.b.siGet(
      q!,
      'CompanyService::getCompany',
      CompanyModel,
    );
    try {
      return await this.b.read(req, res, serviceInput);
    } catch (e: any) {
      console.log('CompanyService::read$()/e:', e);
      this.b.err.push((e as Error).toString());
      const i = {
        messages: this.b.err,
        code: 'BaseService:update',
        app_msg: '',
      };
      await this.b.serviceErr(req, res, e, i.code);
      return [];
    }
  }
}

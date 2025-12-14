import { BaseService } from './base.service.js';
import { CD_FX_FAIL, } from './i-base.js';
export class GenericService {
    // protected // defaultDs = config.ds.sqlite;
    constructor() {
        // this.b = new BaseService<T>();
    }
    async create(req, res, serviceInput) {
        const b = new BaseService();
        const result = await b.create(req, res, serviceInput);
        if ('state' in result && result.state) {
            return result;
        }
        else {
            return CD_FX_FAIL;
        }
    }
    async createI(req, res, createIParams) {
        const b = new BaseService();
        return await b.createI(req, res, createIParams);
    }
    async read(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Read ${this.model.name}`,
        //   cmd: { action: 'find', query: q },
        //   dSource: 1,
        // };
        const b = new BaseService();
        const result = await b.read(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
    async update(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Update ${this.model.name}`,
        //   cmd: { action: 'update', query: q },
        //   dSource: 1,
        // };
        const b = new BaseService();
        const result = await b.update(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
    // async updateI(req, res, createIParams: CreateIParams<T>): Promise<any> {
    //   const b = new BaseService<T>();
    //   return b.updateI(req, res, createIParams);
    // }
    async updateI(req, res, serviceInput) {
        return await this.b.update(req, res, serviceInput);
    }
    async delete(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Delete ${this.model.name}`,
        //   cmd: { action: 'delete', query: q },
        //   dSource: 1,
        // };
        const b = new BaseService();
        const result = await b.delete(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
}

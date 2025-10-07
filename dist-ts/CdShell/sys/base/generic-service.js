import { BaseService } from './base.service.js';
import { CD_FX_FAIL, } from './i-base.js';
export class GenericService {
    model;
    b;
    // protected // defaultDs = config.ds.sqlite;
    constructor(model) {
        this.model = model;
        this.b = new BaseService();
    }
    async create(req, res, serviceInput) {
        // const modelName =
        //   typeof this.model === 'function' ? this.model.name : String(this.model);
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Create ${modelName}`,
        //   dSource: 1,
        //   data: pl,
        // };
        const result = await this.b.create(req, res, serviceInput);
        if ('state' in result && result.state) {
            return result;
        }
        else {
            return CD_FX_FAIL;
        }
    }
    async createI(req, res, createIParams) {
        return await this.b.createI(req, res, createIParams);
    }
    async read(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Read ${this.model.name}`,
        //   cmd: { action: 'find', query: q },
        //   dSource: 1,
        // };
        const result = await this.b.read(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
    async update(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Update ${this.model.name}`,
        //   cmd: { action: 'update', query: q },
        //   dSource: 1,
        // };
        const result = await this.b.update(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
    async updateI(req, res, createIParams) {
        return this.b.updateI(req, res, createIParams);
    }
    async delete(req, res, serviceInput) {
        // const serviceInput = {
        //   serviceModel: this.model,
        //   docName: `Delete ${this.model.name}`,
        //   cmd: { action: 'delete', query: q },
        //   dSource: 1,
        // };
        const result = await this.b.delete(req, req, serviceInput);
        return 'state' in result ? result : CD_FX_FAIL;
    }
}

// import { SqliteStore } from "../store/SqliteStore";
// import { DocModel } from "../entities/DocModel";
import { CD_FX_FAIL } from '../../base/i-base.js';
import { DocModel } from '../models/doc.model.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
import { GenericService } from '../../base/generic-service.js';
import { DocTypeModel } from '../models/doc-type.model.js';
export class DocService extends GenericService {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // ADAPTATION FROM GENERIC SERVICE
    constructor() {
        super();
        // private b = new BaseService<DocModel>();
        // defaultDs = config.ds.sqlite;
        // Define validation rules
        this.cRules = {
            required: ['docName', 'docFrom', 'docTypeId', 'companyId'],
            noDuplicate: [],
        };
    }
    /**
     * Validate input before processing create
     */
    async validateCreate(pl) {
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
                docName: pl.docName,
                docTypeId: pl.docTypeId,
            },
        };
        const serviceInput = {
            serviceModel: DocModel,
            docName: 'Validate Duplicate Doc',
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
            }
            else {
                return { data: false, state: false, message: 'Validation failed' };
            }
        }
        return { data: false, state: false, message: 'Validation failed' };
    }
    /**
     * Fetch newly created record by guid
     */
    async afterCreate(pl) {
        const query = {
            where: { docGuid: pl.docGuid },
        };
        const serviceInput = {
            serviceModel: DocModel,
            docName: 'Fetch Created Doc',
            dSource: 1,
            cmd: { query },
        };
        const retResult = await this.b.read(null, null, serviceInput);
        if ('state' in retResult) {
            return retResult;
        }
        else {
            return CD_FX_FAIL;
        }
    }
    async getDoc(q) {
        // Validate query input
        if (!q || !q.where || Object.keys(q.where).length === 0) {
            return {
                data: null,
                state: false,
                message: 'Invalid query: "where" condition is required',
            };
        }
        // const serviceInput = {
        //   serviceModel: DocModel,
        //   docName: 'DocService::getDoc',
        //   cmd: {
        //     action: 'find',
        //     query: q,
        //   },
        //   dSource: 1,
        // };
        const serviceInput = {
            serviceModel: DocModel,
            docName: `Read Doc`,
            cmd: { action: 'find', query: q },
            dSource: 1,
        };
        try {
            const retResult = await this.b.read(null, null, serviceInput);
            if ('state' in retResult) {
                return retResult;
            }
            else {
                return CD_FX_FAIL;
            }
        }
        catch (e) {
            CdLog.error(`DocService.getDoc() - Error: ${e.message}`);
            return {
                data: null,
                state: false,
                message: `Error retrieving Doc: ${e.message}`,
            };
        }
    }
    /**
     * This method is mostly used during "Create" process of any controller
     * It is used to save meta data of the Create transaction.
     * @param req
     * @param res
     * @returns
     */
    async getDocTypeId(req, res, pl) {
        let ret = 0;
        const m = req.post.m;
        const c = req.post.c;
        const a = req.post.a;
        const resultDocType = await this.getDocTypeByName(req, res, `${c}_${a}`);
        if (!resultDocType.state || !resultDocType.data) {
            return NaN;
        }
        const result = resultDocType.data;
        if (result.length > 0) {
            ret = result[0].docTypeId;
        }
        else {
            const r = await this.createDocType(pl);
            // ret = r[0].docTypeId;
            ret = r.docTypeId;
        }
        return await ret;
    }
    async createDocType(pl) {
        const { BaseService } = await import("../../../sys/base/base.service.js");
        const b = new BaseService();
        const serviceInput = {
            serviceModel: DocTypeModel,
            docName: `Create DocType`,
            dSource: 1,
            data: pl,
        };
        const result = await b.create(null, null, serviceInput);
        if ('state' in result && result.state) {
            return result;
        }
        else {
            return CD_FX_FAIL;
        }
    }
    beforeUpdate(q) {
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
        }
        return q;
    }
    async getDocTypeByName(req, res, docTypeName) {
        const { BaseService } = await import("../../../sys/base/base.service.js");
        const b = new BaseService();
        const serviceInput = {
            serviceModel: DocTypeModel,
            docName: 'DocService::getDocTypeByName',
            cmd: {
                action: 'find',
                query: { where: { docTypeName: `${docTypeName}` } },
            },
            dSource: 1,
        };
        const resultRead = await b.read(null, null, serviceInput);
        if ('state' in resultRead) {
            return await resultRead;
        }
        else {
            return CD_FX_FAIL;
        }
    }
}

// import { SqliteStore } from "../store/SqliteStore";
// import { JwtModel } from "../entities/JwtModel";
import { CD_FX_FAIL } from '../../base/i-base.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
import { GenericService } from '../../base/generic-service.js';
import { JwtModel } from '../models/jwt.model.js';
export class JwtService extends GenericService {
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // ADAPTATION FROM GENERIC SERVICE
    constructor() {
        super();
        // private b = new BaseService<JwtModel>();
        // defaultDs = config.ds.sqlite;
        // Define validation rules
        this.cRules = {
            required: ['jwtName', 'jwtTypeGuid', 'jwtGuid'],
            noDuplicate: ['jwtName', 'jwtTypeGuid'],
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
                jwtName: pl.jwtName,
                jwtTypeId: pl.jwtTypeId,
            },
        };
        const serviceInput = {
            serviceModel: JwtModel,
            docName: 'Validate Duplicate Jwt',
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
            where: { jwtGuid: pl.jwtGuid },
        };
        const serviceInput = {
            serviceModel: JwtModel,
            docName: 'Fetch Created Jwt',
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
    async getJwt(q) {
        // Validate query input
        if (!q || !q.where || Object.keys(q.where).length === 0) {
            return {
                data: null,
                state: false,
                message: 'Invalid query: "where" condition is required',
            };
        }
        const serviceInput = {
            serviceModel: JwtModel,
            docName: 'JwtService::getJwt',
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
            }
            else {
                return CD_FX_FAIL;
            }
        }
        catch (e) {
            CdLog.error(`JwtService.getJwt() - Error: ${e.message}`);
            return {
                data: null,
                state: false,
                message: `Error retrieving Jwt: ${e.message}`,
            };
        }
    }
    beforeUpdate(q) {
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
        }
        return q;
    }
}

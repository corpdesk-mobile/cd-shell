// import { SqliteStore } from "../store/SqliteStore";
// import { GroupMemberModel } from "../entities/GroupMemberModel";
import { CD_FX_FAIL, } from '../../base/i-base.js';
import { GroupMemberModel } from '../models/group-member.model.js';
import { GenericService } from '../../base/generic-service.js';
export class GroupMemberService extends GenericService {
    // private b = new BaseService<GroupMemberModel>();
    // // defaultDs = config.ds.sqlite;
    serviceModel = GroupMemberModel;
    // Define validation rules
    /*
     * create rules
     */
    cRules = {
        required: ['memberGuid', 'groupGuidParent', 'cdObjTypeId'],
        noDuplicate: ['memberGuid', 'groupGuidParent'],
    };
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // ADAPTATION FROM GENERIC SERVICE
    constructor() {
        super(GroupMemberModel);
    }
    async createI(req, res, createIParams) {
        // const svSess = new SessionService()
        // if (this.validateCreateI(req, res, createIParams)) {
        //     return await this.b.createI(req, res, createIParams)
        // } else {
        //     this.b.setAlertMessage(`could not join group`, svSess, false);
        // }
        return await this.b.createI(req, res, createIParams);
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
                memberGuid: pl.memberGuid,
                groupGuidParent: pl.groupGuidParent,
            },
        };
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'Validate Duplicate GroupMember',
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
            where: { groupMemberGuid: pl.groupMemberGuid },
        };
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'Fetch Created GroupMember',
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
    async getGroupMember(q) {
        // Validate query input
        if (!q || !q.where || Object.keys(q.where).length === 0) {
            return {
                data: null,
                state: false,
                message: 'Invalid query: "where" condition is required',
            };
        }
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'GroupMemberService::getGroupMember',
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
            // CdLog.error(`GroupMemberService.getGroupMember() - Error: ${e.message}`);
            return {
                data: null,
                state: false,
                message: `Error retrieving GroupMember: ${e.message}`,
            };
        }
    }
    async getUserGroupsI(req, res, userGuid) {
        // if (q === null) {
        //     q = this.b.getQuery(req);
        // }
        const q = { where: { memberGuid: userGuid } };
        console.log('GroupMemberService::getUserGroupsI/f:', q);
        const serviceInput = {
            serviceModel: GroupMemberModel,
            docName: 'GroupMemberService::getUserGroupsI',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        try {
            return this.b.read(req, res, serviceInput);
        }
        catch (e) {
            console.log('GroupMemberService::getUserGroupsI()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'GroupMemberService:getUserGroupsI',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    beforeUpdate(q) {
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
        }
        return q;
    }
}

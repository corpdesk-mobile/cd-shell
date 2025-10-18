/* eslint-disable brace-style */
/* eslint-disable style/indent */
/* eslint-disable style/brace-style */
/* eslint-disable antfu/if-newline */
import "../../../CdShell/sys/utils/process-shim"; // sets global process shim for browser
// Conditional imports for Node.js vs Browser
import { getEnvironment } from "../../../environment";
const isNode = getEnvironment() === "node" || getEnvironment() === "cli";
// import { SessionService } from "../cd-user/services/session.service";
import * as Lá from "lodash";
import { AbstractBaseService, CdFxStateLevel, MANAGED_FIELDS, } from "./i-base";
import { EntityAdapter } from "../utils/entity-adapter";
import config from "../../../config";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import { DocModel } from "../moduleman/models/doc.model";
// Query builder (use shim if needed)
// import { QueryDeepPartialEntity } from "../../../CdShell/sys/utils/orm-shim";
// import { createClient } from "redis";
// Redis - conditional import
let createClient = () => {
    throw new Error("Redis not available in browser environment");
};
if (isNode) {
    // Dynamic import for Node.js only
    import("redis")
        .then((redisModule) => {
        createClient = redisModule.createClient;
    })
        .catch(() => {
        console.warn("Redis module not available");
    });
}
import { from } from "rxjs";
import { QueryBuilderHelper } from "../utils/query-builder-helper";
import { toKebabCase, toPascalCase } from "../utils/cd-naming.util";
// import { inspect } from "util";
// Util inspection - conditional
let inspect = (obj) => JSON.stringify(obj, null, 2);
if (isNode) {
    import("util")
        .then((utilModule) => {
        inspect = utilModule.inspect;
    })
        .catch(() => {
        // Fallback to JSON stringify
    });
}
import { HttpService } from "./http.service";
// import chalk from "chalk";
// Chalk - conditional (Node.js only)
let chalk = {
    blue: (text) => text,
    green: (text) => text,
    red: (text) => text,
    yellow: (text) => text,
    // Add other chalk methods you use
};
if (isNode) {
    import("chalk")
        .then((chalkModule) => {
        chalk = chalkModule.default || chalkModule;
    })
        .catch(() => {
        console.warn("Chalk not available, using no-color fallback");
    });
}
import { FxEventEmitter } from "./fx-event-emitter";
const USER_ANON = 1000;
const INVALID_REQUEST = "invalid request";
export class BaseService extends AbstractBaseService {
    constructor() {
        super();
        this.err = []; // error messages
        this.cuid = 1000;
        this.cdToken = "";
        this.i = {
            messages: [],
            code: "",
            app_msg: "",
        };
        this.isRegRequest = false;
        // // logger: Logging;
        this.fx = new FxEventEmitter();
        this.ds = null;
        this.isInvalidFields = [];
        this.http = new HttpService();
        this.intersectionLegacy = (arr1, arr2) => {
            const res = []; // Explicitly define `res` as an array of `any`
            for (const i of arr1) {
                if (!arr2.includes(i)) {
                    continue;
                }
                res.push(i);
            }
            return res;
        };
        this.intersectMany = (...arrs) => {
            let res = arrs[0].slice();
            for (let i = 1; i < arrs.length; i++) {
                res = this.intersectionLegacy(res, arrs[i]);
            }
            return res;
        };
        // // this.logger = new Logging();
        this.entityAdapter = new EntityAdapter();
        this.cdResp = this.initCdResp();
    }
    // async init(req: any, res: any) {
    //   console.info("BaseService::init()/01:");
    //   if (!this.db) {
    //     const db = await new Database();
    //     // client expected to input the required models
    //     this.models.forEach(async (model) => {
    //       console.info("BaseService::init()/forEach/model:", model);
    //       await db.setConnEntity(model);
    //     });
    //     await db.getConnection();
    //     // console.log("BaseService::init()/this.cuid1:", this.cuid)
    //     // if (this.cuid > 1000) {
    //     //     console.log("BaseService::init()/this.cuid2:", this.cuid)
    //     //     const svSess = new SessionService();
    //     //     this.sessDataExt = await svSess.getSessionDataExt(req, res);
    //     // }
    //   }
    //   console.info("BaseService::init()/this.models:", this.models);
    // }
    async init(req, res) {
        console.log("BaseService::init()/01:");
        try {
            // if (!this.db) {
            //   this.db = new TypeOrmDatasource();
            //   this.ds = await this.db.getConnection(); // ✅ Store DataSource
            // }
            // console.log('BaseService::init()/this.models:', this.models);
        }
        catch (e) {
            console.log("BaseService::init()/02:");
            console.log(`BaseService::init() failed:${e.message}`);
            this.err.push(`BaseService::init() failed:${e.message}`);
        }
    }
    async setRepo(serviceInput) {
        // const AppDataSource = await getDataSource();
        // this.repo = AppDataSource.getRepository(serviceInput.serviceModel);
        this.repo = this.ds.getRepository(serviceInput.serviceModel);
    }
    async initSqlite(req, res) {
        const iMax = 5;
        const i = 1;
        try {
            console.log("BaseService::initSqlite()/01");
            if (this.sqliteConn) {
                console.log("BaseService::initSqlite()/02");
            }
            else {
                console.log("BaseService::initSqlite()/03");
                // await this.setSLConn(i)
                this.sqliteConn = await this.db;
            }
        }
        catch (e) {
            console.log("BaseService::initSqlite()/04");
            // console.log('initSqlite()/Error:', e);
            // const p = (e as Error).toString().search('AlreadyHasActiveConnectionError');
            // if (p === -1 && i < iMax) {
            //     i++;
            //     await this.setSLConn(i);
            // }
            this.err.push(e.toString());
        }
    }
    get svSess() {
        // Dynamic import inside a getter ensures the dependency graph is 
        // only loaded when this service is actually used, which helps break cycles.
        // However, a simple synchronous getter is cleaner for *services*.
        // If using synchronous code (recommended for services):
        if (!this._svSess) {
            // Use a local require/import or simple class instantiation
            const { SessionService } = require("../cd-user/services/session.service");
            this._svSess = new SessionService();
            // Ensure you only instantiate the service, not import its file at the top.
            // For now, let's just make it a local variable that is only used inside methods.
        }
        return this._svSess;
    }
    initCdResp() {
        return {
            app_state: {
                success: false,
                info: {
                    messages: [],
                    code: "",
                    app_msg: "",
                },
                sess: {
                    cd_token: this.getGuid(),
                    jwt: null,
                    ttl: 0,
                },
                cache: {},
                sConfig: {
                    usePush: config.usePolling,
                    usePolling: config.usePush,
                    useCacheStore: config.useCacheStore,
                },
            },
            data: null,
        };
    }
    async resolveCls(req, res, clsCtx) {
        try {
            console.log("BaseService::resolveCls()/01:");
            console.log("BaseService::resolveCls/clsCtx.path:", clsCtx.path);
            const eImport = await import(clsCtx.path);
            console.log("BaseService::resolveCls()/02:");
            const eCls = eImport[clsCtx.clsName];
            console.log("BaseService::resolveCls()/03:");
            const cls = new eCls();
            this.ds = clsCtx.dataSource;
            console.log("BaseService::resolveCls()/04:");
            if (this.sess) {
                // set sessData in req so it is available thoughout the bootstrap
                req.post.sessData = this.sess;
            }
            await cls[clsCtx.action](req, res);
        }
        catch (e) {
            this.serviceErr(req, res, e, "BaseService:resolveCls");
        }
    }
    async invokeCdRequest(cdRequest) {
        console.log("BaseService::invokeCdRequest() → Starting dispatch...");
        if (!cdRequest) {
            return { state: false, message: "cdRequest is undefined or null." };
        }
        const { ctx, m, c, a, args, dat } = cdRequest;
        try {
            const contextRoot = ctx.toLowerCase() === "sys" ? "sys" : "app";
            // const moduleName = `${m}`;
            const controllerName = `${c}Controller`;
            const controllerkebab = toKebabCase(c);
            const modulePath = `../../${contextRoot}/${m}/controllers/${controllerkebab}.controller.js`;
            console.log(`BaseService::invokeCdRequest() → Importing: ${modulePath}`);
            const importedModule = await import(modulePath);
            const ControllerClass = importedModule?.[controllerName];
            if (!ControllerClass) {
                return {
                    state: false,
                    message: `Controller not found: ${controllerName} at ${modulePath}`,
                };
            }
            const controllerInstance = new ControllerClass();
            if (typeof controllerInstance[a] !== "function") {
                return { state: false, message: `Action method not found: ${a}` };
            }
            const result = await controllerInstance[a](...(args ? Object.values(args) : []), dat);
            if (!result?.state) {
                console.error(`BaseService::invokeCdRequest() → Task failed: ${result.message}`);
                return result;
            }
            return result;
        }
        catch (err) {
            const message = `Error executing cdRequest: ${err.message}`;
            console.error(`BaseService::invokeCdRequest() → ${message}`);
            return {
                state: false,
                message,
            };
        }
    }
    /**
     * 1. create new doc
     * 2. use docId to complete create
     * 3. for any error, save the error using serviceErr()
     *    process is expected to return the encountered errors back to requesting entity
     * 4. Returning data is encpsulated in corpdesk http request object this.cdResp.
     * @param req
     * @param res
     * @param serviceInput
     * @returns
     */
    async create(req, res, serviceInput) {
        try {
            if (!serviceInput.serviceModel || !serviceInput.data || !this.db) {
                return { data: null, state: false, message: "Invalid input" };
            }
            /**
             * Doc is the component that saves meta data of create tranaction
             * Create a Doc associated with this insertion
             */
            let newDocData;
            try {
                newDocData = await this.saveDoc(req, res, serviceInput);
            }
            catch (e) {
                this.serviceErr(req, res, e, "BaseService:create/savDoc");
            }
            /**
             * set docId from new Doc
             */
            if (req) {
                await this.setPlData(req, {
                    key: "docId",
                    value: newDocData.docId,
                }); // set docId
            }
            else {
                serviceInput.data.docId = newDocData.docId;
            }
            const repository = this.db.getRepository(serviceInput.serviceModel);
            const entityInstance = repository.create(serviceInput.data);
            const savedEntity = await repository.save(entityInstance);
            if (req) {
                return savedEntity;
            }
            else {
                return {
                    data: savedEntity,
                    state: true,
                    message: "Created successfully",
                };
            }
        }
        catch (e) {
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:create/getConnection",
                app_msg: "",
            };
            await this.serviceErr(req, res, e, "BaseService:create");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    /**
     * similar to create() but
     * used where create is called internally
     * Note that both create and createI, are tagged with
     * doc data which has dates, user and other application information
     * used in document tracking
     * @param req
     * @param res
     * @param createIParams
     */
    async createI(req, res, createIParams) {
        if (!createIParams || !createIParams.controllerData) {
            return { data: null, state: false, message: "Invalid input" };
        }
        const serviceInput = createIParams.serviceInput;
        /**
         * Doc is the component that saves meta data of create tranaction
         * Create a Doc associated with this insertion
         */
        let ret;
        let newDocData;
        try {
            newDocData = await this.saveDoc(req, res, serviceInput);
        }
        catch (e) {
            this.serviceErr(req, res, e, "BaseService:createI/savDoc");
        }
        /**
         * set docId
         */
        createIParams.controllerData.docId = newDocData.docId;
        let serviceRepository = null;
        try {
            const repository = this.db.getRepository(createIParams.serviceInput.serviceModel);
            const entityInstance = repository.create(serviceInput.data);
            const savedEntity = await repository.save(entityInstance);
            if (req) {
                return savedEntity;
            }
            else {
                return {
                    data: savedEntity,
                    state: true,
                    message: "Created successfully",
                };
            }
        }
        catch (e) {
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:create/getConnection",
                app_msg: "",
            };
            await this.serviceErr(req, res, e, "BaseService:createI");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    async createSL(req, res, serviceInput) {
        try {
            const repo = await this.sqliteConn.getRepository(serviceInput.serviceModel);
            const pl = this.getPlData(req);
            return await repo.save(pl);
        }
        catch (e) {
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BillService:create",
                app_msg: "",
            };
            await this.serviceErr(req, res, e, "BillService:create");
            return this.cdResp;
        }
    }
    connSLClose() {
        if (this.sqliteConn) {
            this.sqliteConn.close();
        }
    }
    async saveDoc(req, res, serviceInput) {
        const doc = await this.setDoc(req, res, serviceInput);
        const docRepository = this.db.getRepository(DocModel);
        return await docRepository.save(doc);
    }
    async setDoc(req, res, serviceInput) {
        if (!this.cdToken) {
            await this.setSess(req, res);
        }
        const dm = new DocModel();
        const { DocService } = await import("../moduleman/services/doc.service");
        const svDoc = new DocService();
        dm.docFrom = this.cuid; // current corpdesk user
        dm.docName = serviceInput.docName;
        dm.docTypeId = await svDoc.getDocTypeId(req, res, dm);
        dm.docDate = await this.mysqlNow();
        return await dm;
    }
    // async setPlData(req, item: ObjectItem, extData?: string): Promise<void> {
    //   if (extData) {
    //     req.post.dat.f_vals[0][extData][item.key] = item.value;
    //   } else {
    //     req.post.dat.f_vals[0].data[item.key] = item.value;
    //   }
    // }
    async read(req, res, serviceInput) {
        try {
            if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
                return { data: null, state: false, message: "Invalid query" };
            }
            const repository = this.db.getRepository(serviceInput.serviceModel);
            const results = await repository.find(serviceInput.cmd.query);
            if (req) {
                return results;
            }
            else {
                return { data: results, state: true, message: "Read successfully" };
            }
        }
        catch (e) {
            await this.serviceErr(req, res, e, "BaseService:read");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    read$(req, res, serviceInput) {
        return from(this.read(req, res, serviceInput));
    }
    async readCount(req, res, serviceInput) {
        try {
            if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
                return { data: null, state: false, message: "Invalid query" };
            }
            const repo = this.db.getRepository(serviceInput.serviceModel);
            let q;
            if (req) {
                q = this.getQuery(req);
            }
            else {
                q = serviceInput.cmd.query;
            }
            console.log(`BaseService::readCount()/q:`, q);
            const [result, total] = await repo.findAndCount(q);
            return {
                items: result,
                count: total,
            };
        }
        catch (err) {
            return await this.serviceErr(req, res, err, "BaseService:readCount");
        }
    }
    async feildMapSL(req, res, serviceInput) {
        await this.initSqlite(req, res);
        // console.log('BaseService::feildMapSL()/this.sqliteConn:', this.sqliteConn)
        console.log("BaseService::feildMapSL()/serviceInput:", serviceInput.serviceModel);
        const meta = await this.ds.getMetadata(serviceInput.serviceModel).columns;
        return await meta.map(async (c) => {
            return {
                propertyPath: await c.propertyPath,
                givenDatabaseName: await c.givenDatabaseName,
                dType: await c.type,
            };
        });
    }
    async readSL(req, res, serviceInput) {
        try {
            this.initSqlite(req, res);
            // const repo = this.sqliteConn.getRepository(serviceInput.serviceModel);
            await this.setRepo(serviceInput);
            // this.setRepo(serviceInput.serviceModel)
            const repo = this.repo;
            // const { SessionService } = await import("../cd-user/services/session.service");
            // const svSess = new SessionService();
            // const billRepository = this.sqliteConn.getRepository(BillModel)
            // const allBills = await billRepository.find()
            // console.log('allBills:', allBills)
            // this.i.app_msg = '';
            // this.setAppState(true, this.i, svSess.sessResp);
            // this.cdResp.data = allBills;
            // const r = await this.respond(req, res);
            let r = null;
            switch (serviceInput.cmd?.action) {
                case "find":
                    try {
                        r = await repo.find(serviceInput.cmd.query);
                        if (serviceInput.extraInfo) {
                            return {
                                result: r,
                                fieldMap: await this.feildMapSL(req, res, serviceInput),
                            };
                        }
                        else {
                            return await r;
                        }
                    }
                    catch (err) {
                        return await this.serviceErr(req, res, err, "BillService:read");
                    }
                    break;
                case "count":
                    try {
                        r = await repo.count(serviceInput.cmd.query);
                        console.log("BillService::read()/r:", r);
                        return r;
                    }
                    catch (err) {
                        return await this.serviceErr(req, res, err, "BillService:read");
                    }
                    break;
            }
            // this.serviceErr(res, err, 'BaseService:read');
        }
        catch (e) {
            return await this.serviceErr(req, res, e, "BillService:read");
        }
    }
    readCount$(req, res, serviceInput) {
        console.log("BaseService::readCount$()/serviceInput:", serviceInput);
        return from(this.readCount(req, res, serviceInput));
    }
    async readCountSL(req, res, serviceInput) {
        await this.initSqlite(req, res);
        try {
            // const repo = this.sqliteConn.getRepository(serviceInput.serviceModel);
            await this.setRepo(serviceInput);
            // this.setRepo(serviceInput.serviceModel)
            const repo = this.repo;
            const meta = await this.getEntityPropertyMapSL(req, res, serviceInput.serviceModel);
            const [result, total] = await repo.findAndCount(this.getQuery(req));
            return {
                metaData: meta,
                items: result,
                count: total,
            };
        }
        catch (err) {
            return await this.serviceErr(req, res, err, "BaseService:readCount");
        }
    }
    async getEntityPropertyMapSL(req, res, model) {
        await this.initSqlite(req, res);
        const entityMetadata = await this.ds.getMetadata(model);
        const cols = await entityMetadata.columns;
        // console.log('BaseService::getEntityPropertyMapSL()/cols:', cols)
        const colsFiltdArr = [];
        const colsFiltd = await cols.map(async (col) => {
            const ret = {
                propertyAliasName: await col.propertyAliasName,
                databaseNameWithoutPrefixes: await col.databaseNameWithoutPrefixes,
                type: await col.type,
            };
            // console.log('getEntityPropertyMapSL()/ret:', {ret: JSON.stringify(ret)});
            colsFiltdArr.push(ret);
            return ret;
        });
        // console.log('BaseService::getEntityPropertyMapSL()/colsFiltd:', await colsFiltd)
        // console.log('BaseService::getEntityPropertyMapSL()/colsFiltdArr:', await colsFiltdArr)
        return colsFiltdArr;
    }
    readCountSL$(req, res, serviceInput) {
        return from(this.readCountSL(req, res, serviceInput));
    }
    readSL$(req, res, serviceInput) {
        return from(this.readSL(req, res, serviceInput));
    }
    /**
     *
     *
     * This method makes use of QueryBuilderHelper to allow query to still be structured as earlier then this
     * class converts them to typeorm query builder.
     */
    async readQB(req, res, serviceInput) {
        if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
            return { data: null, state: false, message: "Invalid query" };
        }
        const repo = this.db.getRepository(serviceInput.serviceModel);
        // Create the helper instance
        const queryBuilderHelper = new QueryBuilderHelper(repo);
        try {
            // let q: any = this.getQuery(req);
            // const map = this.entityAdapter.registerMappingFromEntity(serviceInput.serviceModel);
            // // clean up the where clause...especially for request from browsers
            // const q = this.transformQueryInput(serviceInput.cmd.query, queryBuilderHelper);
            // serviceInput.cmd.query.where = q.where;
            // console.log(`BaseService::readQB()/q:`, { q: JSON.stringify(q) });
            // console.log('BaseService::readQB()/q:', q);
            const queryBuilder = queryBuilderHelper.createQueryBuilder(serviceInput);
            console.log("BaseService::readQB/sql:", queryBuilder.getSql());
            // Fetching items
            // const items = await queryBuilder.getMany();
            let items = await queryBuilder.getRawMany();
            console.log("BaseService::readQB()/items:", items);
            const entityName = this.entityAdapter.getEntityName(serviceInput.serviceModel);
            items = this.entityAdapter.mapRawToEntity(entityName, items);
            console.log("BaseService::readQB()/Fetched-Items:", items); // Debug logging for items
            // Fetching count
            const count = await queryBuilder.getCount();
            console.log("Fetched Count:", count); // Debug logging for count
            // Combine results
            return {
                items,
                count,
            };
        }
        catch (err) {
            console.error("Error in readQB:", err); // Debug logging for errors
            return await this.serviceErr(req, res, err, "BaseService:readQB");
        }
    }
    readQB$(req, res, serviceInput) {
        console.log("BaseService::readQB$()/serviceInput:", serviceInput);
        return from(this.readQB(req, res, serviceInput));
    }
    async readJSONColumnQB(req, res, serviceInput, jsonField, keys) {
        if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
            return { data: null, state: false, message: "Invalid query" };
        }
        const repo = this.db.getRepository(serviceInput.serviceModel);
        const queryBuilderHelper = new QueryBuilderHelper(repo);
        const queryBuilder = queryBuilderHelper.createQueryBuilder(serviceInput);
        // Use MySQL JSON_EXTRACT to extract specific fields from the JSON column
        keys.forEach((key) => {
            queryBuilder.addSelect(`JSON_UNQUOTE(JSON_EXTRACT(${jsonField}, '$.${key}'))`, key);
        });
        try {
            const items = await queryBuilder.getRawMany();
            const entityName = this.entityAdapter.getEntityName(serviceInput.serviceModel);
            const processedItems = this.entityAdapter.mapRawToEntity(entityName, items);
            return {
                items: processedItems,
                count: await queryBuilder.getCount(),
            };
        }
        catch (err) {
            return await this.serviceErr(req, res, err, "BaseService:readJSONColumnQB");
        }
    }
    transformFilters(filters) {
        const where = {};
        filters.forEach((filter) => {
            const { field, operator, val, dataType } = filter;
            // Convert value to correct data type
            let parsedValue = val;
            if (dataType === "number")
                parsedValue = Number(val);
            else if (dataType === "boolean")
                parsedValue = val === "true";
            // Map custom operators to TypeORM syntax
            switch (operator) {
                case "=":
                    where[field] = parsedValue;
                    break;
                case "LIKE":
                    where[field] = { like: `%${parsedValue}%` };
                    break;
                case ">":
                    where[field] = { gt: parsedValue };
                    break;
                case "<":
                    where[field] = { lt: parsedValue };
                    break;
                case "IN":
                    where[field] = { in: val.split(",") };
                    break;
                default:
                    throw new Error(`Unsupported operator: ${operator}`);
            }
        });
        return where;
    }
    async update(req, res, serviceInput) {
        try {
            if (!serviceInput.serviceModel ||
                !serviceInput.cmd?.query ||
                !this.db ||
                !serviceInput.cmd.query.update // Ensure update is present
            ) {
                return { data: null, state: false, message: "Invalid update request" };
            }
            const repository = this.db.getRepository(serviceInput.serviceModel);
            // Ensure update is cast to the correct TypeORM update type
            const updateData = serviceInput.cmd.query
                .update;
            const updateResult = await repository.update(serviceInput.cmd.query.where, updateData);
            if (req) {
                return updateResult;
            }
            else {
                return {
                    data: updateResult,
                    state: true,
                    message: "Updated successfully",
                };
            }
        }
        catch (e) {
            await this.serviceErr(req, res, e, "BaseService:update");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    update$(req, res, serviceInput) {
        return from(this.update(req, res, serviceInput));
    }
    async updateI(req, res, createIParams) {
        try {
            if (!createIParams || !createIParams.controllerData) {
                return { data: null, state: false, message: "Invalid input" };
            }
            const serviceInput = createIParams.serviceInput;
            const repository = this.db.getRepository(serviceInput.serviceModel);
            // Ensure update is cast to the correct TypeORM update type
            const updateData = serviceInput.cmd.query
                .update;
            const updateResult = await repository.update(serviceInput.cmd.query.where, updateData);
            if (req) {
                return updateResult;
            }
            else {
                return {
                    data: updateResult,
                    state: true,
                    message: "Updated successfully",
                };
            }
        }
        catch (e) {
            await this.serviceErr(req, res, e, "BaseService:updateI");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    async updateSL(req, res, serviceInput) {
        console.log("BillService::updateSL()/01");
        await this.initSqlite(req, res);
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        // const repo: any = await this.sqliteConn.getRepository(serviceInput.serviceModel);
        // this.setRepo(serviceInput.serviceModel)
        await this.setRepo(serviceInput);
        const repo = this.repo;
        const result = await repo.update(serviceInput.cmd?.query.where, await this.fieldsAdaptorSL(req, res, serviceInput.cmd?.query.update, serviceInput));
        console.log("result:", result);
        // this.cdResp.data = ret;
        svSess.sessResp.ttl = svSess.getTtl();
        this.setAppState(true, this.i, svSess.sessResp);
        this.cdResp.data = result;
        this.respond(req, res);
    }
    updateSL$(req, res, serviceInput) {
        return from(this.updateSL(req, res, serviceInput));
    }
    async fieldsAdaptorSL(req, res, fieldsData, serviceInput) {
        // get model properties
        const propMap = await this.feildMapSL(req, res, serviceInput);
        for (const fieldName in fieldsData) {
            if (fieldName) {
                const fieldMapData = propMap.filter((f) => f.propertyPath === fieldName);
                /**
                 * adapt boolean values as desired
                 * in the current case, typeorm rejects 1, "1" as boolean so
                 * we convert them as desired;
                 */
                if (fieldMapData[0]) {
                    if (this.fieldIsBoolean(fieldMapData[0].dType)) {
                        if (this.isTrueish(fieldsData[fieldName])) {
                            fieldsData[fieldName] = true;
                        }
                        else {
                            fieldsData[fieldName] = false;
                        }
                    }
                }
            }
        }
        return fieldsData;
    }
    // fieldIsBoolean(fieldType): boolean {
    //   return (
    //     fieldTyp(e as Error).toString() === 'function Boolean() { [native code] }'
    //   );
    // }
    fieldIsBoolean(fieldType) {
        return fieldType.toString() === "function Boolean() { [native code] }";
    }
    isTrueish(val) {
        let ret = false;
        switch (val) {
            case true:
                ret = true;
                break;
            case "true":
                ret = true;
                break;
            case 1:
                ret = true;
                break;
            case "1":
                ret = true;
                break;
        }
        return ret;
    }
    async delete(req, res, serviceInput) {
        try {
            if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
                return { data: null, state: false, message: "Invalid delete request" };
            }
            const repository = this.db.getRepository(serviceInput.serviceModel);
            const deleteResult = await repository.delete(serviceInput.cmd.query.where);
            if (req) {
                return deleteResult;
            }
            else {
                return {
                    data: deleteResult,
                    state: true,
                    message: "Updated successfully",
                };
            }
        }
        catch (e) {
            await this.serviceErr(req, res, e, "BaseService:delete");
            if (req) {
                return this.cdResp;
            }
            else {
                return { state: false, data: null, message: e.toString() };
            }
        }
    }
    delete$(req, res, serviceInput) {
        return from(this.delete(req, res, serviceInput));
    }
    async deleteSL(req, res, serviceInput) {
        console.log("BillService::updateSL()/01");
        let ret = [];
        // await this.initSqlite(req, res);
        const repo = await this.sqliteConn.getRepository(serviceInput.serviceModel);
        const result = await repo.delete(serviceInput.cmd?.query.where);
        console.log("BaseService::deleteSL()/result:", result);
        if ("affected" in result) {
            this.cdResp.app_state.success = true;
            if (this.cdResp.app_state.info) {
                this.cdResp.app_state.info.app_msg = `${result.affected} record/s deleted`;
            }
            ret = result;
        }
        else {
            this.cdResp.app_state.success = false;
            if (this.cdResp.app_state.info) {
                this.cdResp.app_state.info.app_msg = `some error occorred`;
            }
        }
        return ret;
    }
    deleteSL$(req, res, serviceInput) {
        return from(this.deleteSL(req, res, serviceInput));
    }
    isEmptyObject(obj) {
        return Object.keys(obj).length === 0;
    }
    async bFetch(req, res, serviceInput) {
        try {
            console.log("BaseService::fetch()/01");
            if (!serviceInput.fetchInput) {
                throw new Error("fetchInput is undefined");
            }
            const response = await fetch(serviceInput.fetchInput.url, serviceInput.fetchInput.optins);
            // If using node-fetch or undici, .json() is available; otherwise, parse manually
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            }
            catch (e) {
                data = text;
            }
            // console.log(JSON.stringify(data, null, 2));
            return data;
        }
        catch (e) {
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:update",
                app_msg: "",
            };
            // await this.setAppState(false, i, null);
            await this.serviceErr(req, res, e, i.code);
            return this.cdResp;
        }
    }
    //////////////////////////////////////////////////////////////////////////////////////
    async serviceErr(req, res, e, eCode, lineNumber = null) {
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        try {
            svSess.sessResp.cd_token = req.post.dat.token;
        }
        catch (e) {
            svSess.sessResp.cd_token = "";
            this.err.push(e.toString());
        }
        svSess.sessResp.ttl = svSess.getTtl();
        this.setAppState(true, this.i, svSess.sessResp);
        this.err.push(e.toString());
        const i = {
            messages: await this.err,
            code: eCode,
            app_msg: `Error at ${eCode}: ${e.toString()}`,
        };
        await this.setAppState(false, i, svSess.sessResp);
        this.cdResp.data = [];
        return await this.respond(req, res);
    }
    async returnErr(req, res, i) {
        const sess = this.getSess(req, res);
        await this.setAppState(false, i, sess);
        return await this.respond(req, res);
    }
    entryPath(pl) {
        console.log("BaseService::entryPath/pl:", pl);
        const ret = `../../${pl.ctx.toLowerCase()}/${this.toCdName(pl.m)}/controllers/${this.toCdName(pl.c)}.controller`;
        console.log("BaseService::entryPath()/ret:", ret);
        return ret;
    }
    // from camel to hyphen seperated then to lower case
    toCdName(camel) {
        console.log("BaseService::entryPath/camel:", camel);
        const ret = camel.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
        console.log("BaseService::toCdName()/ret:", ret);
        return ret;
    }
    async valid(req, res) {
        const pl = req.post;
        // // console.info('BaseService::valid()req.post:', {
        //   pl: JSON.stringify(req.post),
        // });
        this.pl = pl;
        if (await this.noToken(req, res)) {
            return true;
        }
        else {
            if (!this.cdToken) {
                await this.setSess(req, res);
            }
            if (!this.instanceOfCdResponse(pl)) {
                return false;
            }
            if (!this.validFields(req, res)) {
                return false;
            }
        }
        return true;
    }
    async noToken(req, res) {
        // // console.info('BaseService::noToken()/01');
        // // console.info('BaseService::noToken()/req.post:', {
        //   pl: JSON.stringify(req.post),
        // });
        const pl = req.post;
        const ctx = pl.ctx;
        const m = pl.m;
        const c = pl.c;
        const a = pl.a;
        let ret = false;
        if (!ctx || !m || !c || !a) {
            this.setInvalidRequest(req, res, "BaseService:noTocken:01");
        }
        if (m === "User" && (a === "Login" || a === "Register")) {
            // // console.info('BaseService::noToken()/02');
            if (m === "User" && a === "Register") {
                // // console.info('BaseService::noToken()/03');
                this.isRegRequest = true;
            }
            ret = true;
        }
        // exempt reading list of consumers. Required during registration when token is not set yet
        if (m === "Moduleman" && c === "Consumer" && a === "GetAll") {
            ret = true;
        }
        // exempt anon menu calls
        if (m === "Moduleman" && c === "Modules" && a === "GetAll") {
            ret = true;
        }
        // exempt websocket initialization calls
        if (m === "CdPush" && c === "Websocket" && a === "Create") {
            ret = true;
        }
        // exampt mpesa call backs
        if ("MSISDN" in pl) {
            ret = true;
        }
        // // console.info('BaseService::noToken()/returning ret:', {
        //   return: ret,
        // });
        return ret;
    }
    isRegisterRequest() {
        return this.isRegRequest;
    }
    /**
     * implement validation of fields
     * @param req
     * @param res
     * @returns
     */
    validFields(req, res) {
        /**
         * 1. deduce model directory from the req.post
         * 2. import model
         * 3. verify if fields exists
         */
        return true;
    }
    // siGet<T>(q: IQuery, dn: string, model: new () => T): IServiceInput<T> {
    //   return {
    //     serviceModel: model,
    //     docName: dn,
    //     cmd: {
    //       action: 'find',
    //       query: q,
    //     },
    //     dSource: 1,
    //   };
    // }
    async validateUnique(req, res, serviceInput) {
        console.log("BaseService::validateUnique()/01");
        console.log("BaseService::validateUnique()/req.post:", {
            reqPost: JSON.stringify(req.post),
        });
        if (!serviceInput.serviceModel || !serviceInput.cmd?.query || !this.db) {
            return { data: null, state: false, message: "Invalid query" };
        }
        const baseRepository = this.db.getRepository(serviceInput.serviceModel);
        // const baseRepository: any = await this.repo(req, res, params.model)
        // const baseRepository: any = await this.repo
        // get model properties
        const propMap = await this.getEntityPropertyMap(req, res, serviceInput).then((result) => {
            // console.log('validateUnique()/result:', result)
            return result;
        });
        // console.log('validateUnique()/propMap:', await propMap)
        // const strQueryItems = await this.getQueryItems(req, propMap, params)
        const strQueryItems = await this.getQueryItems(req, serviceInput);
        console.log("BaseService::validateUnique()/strQueryItems:", strQueryItems);
        // convert the string items into JSON objects
        // const arrQueryItems = await strQueryItems.map(async (item) => {
        //     console.log('validateUnique()/item:', await item)
        //     return await JSON.parse(item);
        // });
        // console.log('validateUnique()/arrQueryItems:', arrQueryItems)
        // const filterItems = await JSON.parse(strQueryItems)
        const filterItems = await strQueryItems;
        console.log("BaseService::validateUnique()/filterItems:", filterItems);
        // execute the query
        const results = await baseRepository.count({
            where: await filterItems,
        });
        console.log("BaseService::validateUnique()/results:", {
            result: results,
        });
        // return boolean result
        let ret = false;
        if (results === 0) {
            ret = true;
        }
        else {
            this.err.push("duplicate not allowed");
            // console.log('BaseService::create()/Error:', (e as Error).toString())
            const i = {
                messages: this.err,
                code: "BaseService:validateUnique",
                app_msg: "",
            };
            await this.setAppState(false, i, null);
        }
        console.log("BaseService::validateUnique()/ret:", { return: ret });
        return ret;
    }
    async validateUniqueI(req, res, params) {
        console.log("BaseService::validateUniqueI()/01");
        console.log("BaseService::validateUniqueI()/req.post:", req.post);
        console.log("BaseService::validateUniqueI()/req.post.dat.f_vals[0]:", req.post.dat.f_vals[0]);
        console.log("BaseService::validateUniqueI()/params:", params);
        await this.init(req, res);
        // assign payload data to this.userModel
        //** */ params.controllerInstance.userModel = this.getPlData(req);
        // set connection
        const baseRepository = this.db.getRepository(params.serviceInput.serviceModel);
        console.log("BaseService::validateUniqueI()/repo/model:", {
            model: params.serviceInput.serviceModel,
        });
        console.log("BaseService::validateUniqueI()/params.serviceInput:", params.serviceInput);
        // const filterItems = await JSON.parse(strQueryItems)
        const filterItems = await this.duplicateFilter(params.controllerData, params.serviceInput.serviceInstance.cRules.noDuplicate);
        console.log("BaseService::validateUniqueI()/filterItems:", filterItems);
        // execute the query
        const results = await baseRepository.count({
            where: await filterItems,
        });
        console.log("BaseService::validateUniqueI()/results:", results);
        // return boolean result
        let ret = false;
        if (results === 0) {
            ret = true;
        }
        else {
            this.err.push("duplicate not allowed");
            // console.log('BaseService::create()/Error:', (e as Error).toString())
            const i = {
                messages: this.err,
                code: "BaseService:validateUniqueI",
                app_msg: "",
            };
            await this.setAppState(false, i, null);
        }
        console.log("BaseService::validateUniqueI()/ret:", {
            return: ret,
        });
        return ret;
    }
    async duplicateFilter(controllerData, noDuplicate) {
        console.log("BaseService::duplicateFilter()/controllerData:", controllerData);
        console.log("BaseService::duplicateFilter()/noDuplicate:", noDuplicate);
        const filteredData = {};
        for (const field of noDuplicate) {
            if (Object.prototype.hasOwnProperty.call(controllerData, field)) {
                filteredData[field] = controllerData[field];
            }
        }
        return filteredData;
    }
    async validateRequired(req, res, cRules) {
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        const rqFieldNames = cRules.required;
        this.isInvalidFields = await rqFieldNames.filter((fieldName) => {
            if (!(fieldName in this.getPlData(req))) {
                // required field is missing
                return fieldName;
            }
        });
        if (this.isInvalidFields.length > 0) {
            this.i.app_msg = `the required fields ${this.isInvalidFields.join(", ")} is missing`;
            this.i.messages.push(this.i.app_msg);
            this.setAppState(false, this.i, svSess.sessResp);
            return false;
        }
        else {
            return true;
        }
    }
    async getEntityPropertyMap(req, res, serviceInput) {
        // await this.init(req, res);
        // console.log('BaseService::getEntityPropertyMap()/model:', model)
        // const entityMetadata: EntityMetadata =
        //   await getConnection().getMetadata(model);
        const entityMetadata = this.db?.getMetadata(serviceInput.serviceModel);
        if (!entityMetadata) {
            return;
        }
        // console.log('BaseService::getEntityPropertyMap()/entityMetadata:', entityMetadata)
        const cols = await entityMetadata.columns;
        const colsFiltd = await cols.map(async (col) => {
            return await {
                propertyAliasName: col.propertyAliasName,
                databaseNameWithoutPrefixes: col.databaseNameWithoutPrefixes,
                type: col.type,
            };
        });
        return colsFiltd;
    }
    async getQueryItems(req, params, fields) {
        ////////////////////////////////////////////////
        console.log("BaseService::getQueryItems()/params:", params);
        console.log("BaseService::getQueryItems()/req.post.dat.f_vals[0].data:", req.post.dat.f_vals[0].data);
        if (fields === null) {
            fields = req.post.dat.f_vals[0].data;
        }
        const entries = Object.entries(fields);
        // console.log('getQueryItems()/entries:', entries)
        const entryObjArr = entries.map((e) => {
            // console.log('getQueryItems()/e:', e)
            const k = e[0];
            const v = e[1];
            const ret = JSON.parse(`[{"key":"${k}","val":"${v}","obj":{"${k}":"${v}"}}]`);
            // console.log('getQueryItems()/ret:', ret)
            return ret;
        });
        // console.log('getQueryItems()/entryObjArr:', entryObjArr)
        const cRules = params.serviceInstance.cRules.noDuplicate;
        const qItems = entryObjArr.filter((f) => this.isNoDuplicate(f, cRules));
        // console.log('getQueryItems()/qItems:', qItems)
        const result = {};
        qItems.forEach(async (f) => {
            result[f[0].key] = f[0].val;
        });
        return await result;
    }
    isNoDuplicate(fData, cRules = []) {
        return cRules.filter((fieldName) => fieldName === fData[0].key).length > 0;
    }
    instanceOfCdResponse(object) {
        return ("ctx" in object &&
            "m" in object &&
            "c" in object &&
            "a" in object &&
            "dat" in object &&
            "args" in object);
    }
    /**
     * for setting up response details
     * @param Success
     * @param Info
     * @param Sess
     */
    async setAppState(succ, i, ss) {
        if (succ === false) {
            this.cdResp.data = [];
        }
        this.cdResp.app_state = {
            success: succ,
            info: i,
            sess: ss,
            cache: {},
            sConfig: {
                usePush: config.usePolling,
                usePolling: config.usePush,
                useCacheStore: config.useCacheStore,
            },
        };
    }
    setInvalidRequest(req, res, eCode) {
        this.err.push(INVALID_REQUEST);
        const i = {
            messages: this.err,
            code: eCode,
            app_msg: "",
        };
        const sess = this.getSess(req, res);
        this.setAppState(false, i, sess);
        res.status(200).json(this.cdResp);
    }
    getSess(req, res) {
        return null; // yet to implement
    }
    sessIsValid(pl) {
        // const sess = new SessionService()
    }
    async respond(req, res) {
        // // console.info('**********starting respond(res)*********');
        // res.status(200).json(this.cdResp);
        let ret;
        try {
            // // console.info('BaseService::respond(res)/this.pl:', {
            //   post: JSON.stringify(req.post),
            // });
            // // console.info('BaseService::respond(res)/this.cdResp:', {
            //   cdResp: JSON.stringify(this.cdResp),
            // });
            ret = res.status(200).json(this.cdResp);
        }
        catch (e) {
            this.err.push(e.toString());
        }
        return ret;
    }
    async setSess(req, res) {
        // console.log('BaseService::setSess()/01');
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        if (await !this.cdToken) {
            // console.log('BaseService::setSess()/02');
            try {
                // console.log('BaseService::setSess()/req.post:', req.post);
                if ("sessData" in req.post) {
                    // console.log('BaseService::setSess()/021');
                    // console.log(
                    //   'BaseService::setSess()/req.post.sessData:',
                    //   req.post.sessData,
                    // );
                    this.sess = [req.post.sessData];
                }
                else {
                    // console.log('BaseService::setSess()/022');
                    const sessResult = await svSess.getSession({
                        where: { cdToken: this.cdToken },
                    });
                    if (!sessResult.state || !sessResult.data) {
                        return;
                    }
                    const sess = sessResult.data;
                    if (sess) {
                        this.sess = sess;
                    }
                }
                // console.log('BaseService::setSess()/03');
                // console.log('BaseService::setSess()/this.sess:', this.sess);
                if (this.sess) {
                    // console.log('BaseService::setSess()/04');
                    if (this.sess.length > 0) {
                        // console.log('BaseService::setSess()/05');
                        // console.log('this.sess:', this.sess);
                        this.setCuid(this.sess[0].currentUserId);
                        this.cdToken = await this.sess[0].cdToken;
                    }
                    else {
                        // console.log('BaseService::setSess()/06');
                        const noToken = await this.noToken(req, res);
                        // console.log('BaseService::setSess()/noToken:', {
                        //   noToken: noToken,
                        // });
                        if (noToken === false) {
                            this.i = {
                                messages: this.err,
                                code: "BaseService:setSess1",
                                app_msg: "invalid session",
                            };
                            // do not report 'invalid session' if the session is 'noToken' required.
                            await this.serviceErr(req, res, this.i.app_msg, this.i.code);
                            // this.respond(req, res);
                        }
                    }
                }
                else {
                    // console.log('BaseService::setSess()/07');
                    this.i = {
                        messages: this.err,
                        code: "BaseService:setSess2",
                        app_msg: "invalid session",
                    };
                    await this.serviceErr(req, res, this.i.app_msg, this.i.code);
                    this.respond(req, res);
                }
            }
            catch (e) {
                // console.log('BaseService::setSess()/08');
                this.i = {
                    messages: this.err,
                    code: "BaseService:setSess3",
                    app_msg: e.toString(),
                };
                // await this.serviceErr(req, res, this.i.app_msg, this.i.code)
                await this.setAlertMessage(e.toString(), svSess, false);
                // this.respond(req, res);
            }
        }
    }
    async setAlertMessage(msg, svSess, success) {
        this.i.app_msg = msg;
        this.err.push(this.i.app_msg);
        await this.setAppState(success, this.i, svSess.sessResp);
    }
    async mysqlNow() {
        console.log("BaseService::mysqlNow()/01");
        const now = new Date();
        const date = await moment(now, "ddd MMM DD YYYY HH:mm:ss");
        console.log("BaseService::mysqlNow()/02");
        const ret = await date.format("YYYY-MM-DD HH:mm:ss"); // convert to mysql date
        console.log("BaseService::mysqlNow()/03");
        return ret;
    }
    getGuid() {
        return uuidv4();
    }
    setCuid(cuid) {
        this.cuid = cuid;
    }
    /**
     * For validating IJsonUpdate array
     * @param jsonUpdate
     * @param rootInterface
     * @returns
     */
    validateJsonUpdate(jsonUpdate, rootInterface) {
        const errors = [];
        function traversePath(currentPath, currentInterface) {
            // If no path left to validate, return true
            if (currentPath.length === 0)
                return true;
            const [currentKey, ...remainingPath] = currentPath;
            if (Array.isArray(currentInterface) && currentKey === "[0]") {
                // Check if the interface is an array and the key indicates an index
                return traversePath(remainingPath, currentInterface[0]);
            }
            else if (currentInterface && typeof currentInterface === "object") {
                // Check if the key exists in the interface
                if (!(currentKey in currentInterface)) {
                    errors.push(`Invalid path key '${currentKey}' at '${currentPath.join(".")}'`);
                    return false;
                }
                // Continue traversing the remaining path
                return traversePath(remainingPath, currentInterface[currentKey]);
            }
            else {
                // If the structure doesn't match, log an error
                errors.push(`Unexpected type at '${currentPath.join(".")}'. Expected object or array.`);
                return false;
            }
        }
        // Validate each update item
        jsonUpdate.forEach((update) => {
            if (!update.modelField || update.modelField !== "cdDevProjectData") {
                errors.push(`Invalid modelField: '${update.modelField}'`);
                return;
            }
            const { path } = update;
            if (!Array.isArray(path) || path.length === 0) {
                errors.push(`Invalid path: '${JSON.stringify(path)}'`);
                return;
            }
            // Start traversal from the root interface
            traversePath(path, rootInterface);
        });
        return { valid: errors.length === 0, errors };
    }
    updateJsonData(jsonUpdate, jsonData) {
        console.log("BaseService::updateJsonData()/jsonUpdate1:", jsonUpdate);
        console.log("BaseService::updateJsonData()/jsonData1:", jsonData);
        try {
            // Validate `jsonUpdate` structure
            if (!jsonUpdate || typeof jsonUpdate !== "object") {
                this.err.push("Invalid jsonUpdate object.");
                return null;
            }
            if (!Array.isArray(jsonUpdate.path) || jsonUpdate.path.length === 0) {
                this.err.push("Invalid jsonUpdate path: Must be a non-empty array.");
                return null;
            }
            // Validate `jsonData`
            if (typeof jsonData !== "object" || jsonData === null) {
                this.err.push("Invalid jsonData: Must be a non-null object.");
                return null;
            }
            // Traverse the path to reach the target node
            let target = jsonData;
            const pathLength = jsonUpdate.path.length;
            for (let i = 0; i < pathLength - 1; i++) {
                const key = jsonUpdate.path[i];
                console.log("BaseService::updateJsonData()/key0:", key);
                if (key.startsWith("[") && key.endsWith("]")) {
                    console.log("BaseService::updateJsonData()/key1:", key);
                    // Handle array index
                    const index = parseInt(key.slice(1, -1), 10);
                    if (isNaN(index) || !Array.isArray(target)) {
                        this.err.push(`Invalid path at '${key}': Expected a valid array index in an array.`);
                        return null;
                    }
                    target = target[index];
                }
                else {
                    // Handle object key
                    console.log("BaseService::updateJsonData()/key2:", key);
                    console.log("BaseService::updateJsonData()/target:", target);
                    if (!Object.prototype.hasOwnProperty.call(target, key)) {
                        this.err.push(`Path error: Key '${key}' does not exist.`);
                        return null;
                    }
                    target = target[key];
                }
            }
            // Set the value at the target node
            const finalKey = jsonUpdate.path[pathLength - 1];
            console.log("BaseService::updateJsonData()/finalKey1:", finalKey);
            if (finalKey.startsWith("[") && finalKey.endsWith("]")) {
                console.log("BaseService::updateJsonData()/finalKey2:", finalKey);
                const index = parseInt(finalKey.slice(1, -1), 10);
                if (isNaN(index) || !Array.isArray(target)) {
                    this.err.push(`Invalid path at final key '${finalKey}': Expected a valid array index in an array.`);
                    return null;
                }
                console.log("BaseService::updateJsonData()/target2:", target);
                target[index] = jsonUpdate.value; // Update the value at the specified index
            }
            else {
                console.log("BaseService::updateJsonData()/jsonUpdate.value:", jsonUpdate.value);
                console.log("BaseService::updateJsonData()/target3:", target);
                console.log("BaseService::updateJsonData()/finalKey3:", finalKey);
                target[finalKey] = jsonUpdate.value; // Update the value at the specified key
            }
            console.log("BaseService::updateJsonData()/jsonData3:", jsonData);
            return jsonData; // Return the updated JSON data
        }
        catch (e) {
            // Catch unexpected errors and log them
            this.err.push(e.toString());
            return null;
        }
    }
    async updateJSONColumnQB(req, res, serviceInput, jsonField, updates) {
        await this.init(req, res);
        console.log("BaseService::updateJSONColumnQB()/repo/model:", serviceInput.serviceModel);
        await this.setRepo(serviceInput);
        // Helper function to generate JSON_SET paths recursively
        // const buildJsonSetPaths = (jsonField: string, obj: any, prefix: string = ''): string[] => {
        //     return Object.keys(obj).map(key => {
        //         const path = `${prefix}${prefix ? '.' : ''}${key}`;
        //         if (typeof obj[key] === 'object' && obj[key] !== null) {
        //             // Recursively handle nested objects
        //             return buildJsonSetPaths(jsonField, obj[key], path).join(', ');
        //         } else {
        //             return `JSON_SET(${jsonField}, '$.${path}', '${obj[key]}')`;
        //         }
        //     }).filter(Boolean);
        // };
        const buildJsonSetPaths = (jsonField, obj, prefix = "") => {
            return Object.keys(obj)
                .map((key) => {
                const path = `${prefix}${prefix ? "." : ""}${key}`;
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    // Recursively handle nested objects
                    return buildJsonSetPaths(jsonField, obj[key], path).join(", ");
                }
                else {
                    // Use COALESCE to ensure JSON is initialized if null
                    return `JSON_SET(COALESCE(${jsonField}, '{}'), '$.${path}', '${obj[key]}')`;
                }
            })
                .filter(Boolean);
        };
        // Generate the JSON_SET update query for the jsonField
        const updateFields = buildJsonSetPaths(jsonField, updates).join(", ");
        // console.log(
        //   "BaseService::updateJSONColumnQB()/updates:",
        //   JSON.stringify(updates)
        // );
        // console.log(
        //   "BaseService::updateJSONColumnQB()/updateFields:",
        //   JSON.stringify(updateFields)
        // );
        // Start building the query using the input provided in serviceInput.cmd.query
        const queryBuilder = this.repo
            .createQueryBuilder()
            .update(serviceInput.serviceModel);
        // Handle dynamic update fields using the update property from QueryInput
        if (serviceInput.cmd?.query.update) {
            queryBuilder.set(serviceInput.cmd.query.update);
        }
        else {
            // Fallback: use the JSON field update if no generic update is provided
            queryBuilder.set({ [jsonField]: () => updateFields });
        }
        // Dynamically handle where conditions from QueryInput or use dynamic primary key
        if (serviceInput.cmd?.query.where) {
            Object.keys(serviceInput.cmd.query.where).forEach((key) => {
                queryBuilder.andWhere(`${key} = :${key}`, {
                    [key]: serviceInput.cmd?.query.where[key],
                });
            });
        }
        else {
            // Fallback: Use the primary key based on the service model's convention <controller>_id
            const primaryKey = serviceInput.primaryKey; // Dynamically get primary key
            if (primaryKey) {
                queryBuilder.where(`${primaryKey} = :${primaryKey}`, {
                    [primaryKey]: serviceInput.cmd?.query[primaryKey],
                });
            }
        }
        try {
            // Execute the query
            return await queryBuilder.execute();
        }
        catch (err) {
            return await this.serviceErr(req, res, err, "BaseService:updateJSONColumnQB");
        }
    }
    /**
     *
     * @param req
     * @param extData // used to target any property of 'f_vals' other than 'data'
     * @param fValsIndex // used if f_val items are multiple
     * @returns
     */
    async getPlData(req, extData = null, fValsIndex = null) {
        console.info("BaseService::getPlData()/01");
        let ret = null;
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        if (await this.validatePlData(req, extData)) {
            try {
                if (extData) {
                    console.info("BaseService::getPlData()/02");
                    if (fValsIndex) {
                        ret = req.post.dat.f_vals[fValsIndex][extData];
                    }
                    else {
                        ret = req.post.dat.f_vals[0][extData];
                    }
                }
                else {
                    console.info("BaseService::getPlData()/03");
                    if (fValsIndex) {
                        ret = req.post.dat.f_vals[fValsIndex].data;
                    }
                    else {
                        ret = req.post.dat.f_vals[0].data;
                    }
                }
                console.info("BaseService::getPlData()/04");
                console.log("BaseService::getData()/ret:", ret);
                return ret;
            }
            catch (e) {
                this.setAlertMessage(e.toString(), svSess, false);
                return {};
            }
        }
        else {
            this.setAlertMessage("invalid validation request", svSess, false);
            return {};
        }
    }
    async getPlQuery(req, extData = null, fValsIndex = null) {
        console.info("BaseService::getPlQuery()/01");
        let ret = null;
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        if (await this.validatePlData(req, extData)) {
            try {
                if (extData) {
                    console.info("BaseService::getPlQuery()/02");
                    if (fValsIndex) {
                        ret = req.post.dat.f_vals[fValsIndex][extData];
                    }
                    else {
                        ret = req.post.dat.f_vals[0][extData];
                    }
                }
                else {
                    console.info("BaseService::getPlQuery()/03");
                    if (fValsIndex) {
                        ret = req.post.dat.f_vals[fValsIndex].query;
                    }
                    else {
                        ret = req.post.dat.f_vals[0].query;
                    }
                }
                console.info("BaseService::getPlQuery()/04");
                console.log("BaseService::getQuery()/ret:", ret);
                return ret;
            }
            catch (e) {
                this.setAlertMessage(e.toString(), svSess, false);
                return {};
            }
        }
        else {
            this.setAlertMessage("invalid validation request", svSess, false);
            return {};
        }
    }
    async setPlData(req, item, extData) {
        console.info("BaseService::setPlData()/item:", item);
        if (extData) {
            console.info("BaseService::setPlData()/extData:", {
                extData: extData,
            });
            console.info("BaseService::setPlData()/req.post.dat.f_vals[0][extData]:", req.post.dat.f_vals[0][extData]);
            req.post.dat.f_vals[0][extData][item.key] = item.value;
        }
        else {
            req.post.dat.f_vals[0].data[item.key] = item.value;
        }
        console.info("BaseService::setPlData()/req.post.dat.f_vals[0]:", req.post.dat.f_vals[0]);
    }
    /**
     *
     * @param req
     * @param item
     * @param extData
     */
    async setPlDataM(req, data, item, extData) {
        console.info("BaseService::setPlDataM()/item:", item);
        if (extData) {
            console.log("BaseService::setPlDataM()/extData:", { context: extData });
            console.log("BaseService::setPlDataM()/data:", data[extData]);
            data[extData][item.key] = item.value;
        }
        console.info("BaseService::setPlDataM()/data:", data);
    }
    /**
     * prevent a situation where either
     * 'data' property is missing or
     * extData property is missing
     * @param req
     * @param res
     * @param extData
     */
    async validatePlData(req, extData) {
        const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = new SessionService();
        let ret = false;
        if (extData) {
            if (extData in req.post.dat.f_vals[0]) {
                ret = true;
            }
            else {
                this.setAlertMessage("BaseService::validatePlData/requested property is missing", svSess, false);
            }
        }
        else {
            if ("data" in req.post.dat.f_vals[0]) {
                ret = true;
            }
            else {
                this.setAlertMessage("BaseService::validatePlData/requested property is missing", svSess, false);
            }
        }
        return ret;
    }
    getReqToken(req) {
        const r = req.post;
        return r.dat.token;
    }
    /////////////////////////
    // Redis stuff
    async redisInit(req, res) {
        this.redisClient = createClient();
        this.redisClient.on("error", async (err) => {
            console.log("BaseService::redisCreate()/02");
            this.err.push(err.toString());
            const i = {
                messages: this.err,
                code: "BaseService:redisCreate",
                app_msg: "",
            };
            await this.serviceErr(req, res, this.err, "BaseService:redisCreate");
            return this.cdResp;
        });
        await this.redisClient.connect();
    }
    async wsRedisInit() {
        console.log("BaseService::wsRedisInit()/01");
        this.redisClient = createClient();
        console.log("BaseService::wsRedisInit()/this.redisClient:", this.redisClient);
        this.redisClient.on("error", async (err) => {
            console.log("BaseService::redisCreate()/err:", err);
            this.err.push(err.toString());
            const i = {
                messages: this.err,
                code: "BaseService:redisCreate",
                app_msg: "",
            };
            await this.wsServiceErr(this.err, "BaseService:redisCreate");
            return this.cdResp;
        });
        await this.redisClient.connect();
    }
    async redisCreate(req, res) {
        await this.redisInit(req, res);
        console.log("BaseService::redisCreate()/01");
        const pl = await this.getPlData(req);
        console.log("BaseService::redisCreate()/pl:", pl);
        try {
            const setRet = await this.redisClient.set(pl.key, pl.value);
            console.log("BaseService::redisCreate()/setRet:", setRet);
            const readBack = await this.redisClient.get(pl.key);
            console.log("BaseService::redisCreate()/readBack:", readBack);
            return {
                status: setRet,
                saved: readBack,
            };
        }
        catch (e) {
            console.log("BaseService::redisCreate()/04");
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:redisCreate",
                app_msg: "",
            };
            await this.serviceErr(req, res, this.err, "BaseService:redisCreate");
            return this.cdResp;
        }
    }
    async wsRedisCreate(k, v) {
        await this.wsRedisInit();
        try {
            const setRet = await this.redisClient.set(k, v);
            console.log(`BaseService::wsRedisCreate()/setRet:${JSON.stringify(setRet)}`);
            const readBack = await this.redisClient.get(k);
            console.log(`BaseService::wsRedisCreate()/readBack:${JSON.stringify(readBack)}`);
            return {
                status: setRet,
                saved: readBack,
            };
        }
        catch (e) {
            console.log("BaseService::wsRedisCreate()/04");
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:wsRedisCreate",
                app_msg: "",
            };
            await this.wsServiceErr(this.err, "BaseService:redisCreate");
            return this.cdResp;
        }
    }
    async redisRead(req, res, serviceInput) {
        console.log("BaseService::redisRead()/01");
        await this.redisInit(req, res);
        console.log("BaseService::redisRead()/02");
        const pl = await this.getPlData(req);
        console.log("BaseService::redisRead()/pl:", pl);
        try {
            const getRet = await this.redisClient.get(pl.key);
            console.log("BaseService::redisRead()/getRet:", getRet);
            return getRet;
        }
        catch (e) {
            console.log("BaseService::redisRead()/04");
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:redisRead",
                app_msg: "",
            };
            await this.serviceErr(req, res, this.err, "BaseService:redisRead");
            return this.cdResp;
        }
    }
    async wsRedisRead(k) {
        console.log("BaseService::wsRedisRead()/k:", k);
        const retData = [];
        const ret = {
            r: JSON.stringify(retData),
            error: "",
        };
        // await this.wsRedisInit();
        try {
            // const getRet = await this.redisClient.get(k);
            // const getRet = await this.svRedis.get(k);
            const getRet = "";
            if (getRet) {
                ret.r = getRet;
            }
            console.log("BaseService::redisRead()/ret:", { result: ret });
            return ret;
        }
        catch (e) {
            console.log("BaseService::redisRead()/04");
            this.err.push(e.toString());
            const i = {
                messages: this.err,
                code: "BaseService:redisRead",
                app_msg: "",
            };
            await this.wsServiceErr(this.err, "BaseService:redisRead");
            // return this.cdResp;
            ret.error = e.toString();
            return ret;
        }
    }
    redisDelete(req, res, serviceInput) {
        this.redisClient.del("foo", (err, reply) => {
            if (err)
                throw err;
            console.log(reply);
        });
    }
    async redisAsyncRead(req, res, serviceInput) {
        return new Promise((resolve, reject) => {
            this.redisClient.get("myhash", (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    async wsServiceErr(e, eCode, cdToken = null) {
        console.log(`Error as BaseService::wsServiceErr, e: ${e.toString()} `);
        const svSess = this.svSess;
        if (cdToken) {
            svSess.sessResp.cd_token = cdToken;
        }
        svSess.sessResp.ttl = svSess.getTtl();
        this.setAppState(true, this.i, svSess.sessResp);
        this.err.push(e.toString());
        const i = {
            messages: await this.err,
            code: eCode,
            app_msg: `Error at ${eCode}: ${e.toString()}`,
        };
        await this.setAppState(false, i, svSess.sessResp);
        this.cdResp.data = [];
    }
    // async bFetch(req, res, serviceInput: IServiceInput<T>) {
    //   try {
    //     console.log('BaseService::fetch()/01');
    //     const response = await fetch(
    //       serviceInput.fetchInput.url,
    //       serviceInput.fetchInput.optins,
    //     );
    //     const data = await response.json();
    //     // console.log(JSON.stringify(data, null, 2));
    //     return data;
    //   } catch (e: any) {
    //     this.err.push((e as Error).toString());
    //     const i = {
    //       messages: this.err,
    //       code: 'BaseService:update',
    //       app_msg: '',
    //     };
    //     // await this.setAppState(false, i, null);
    //     await this.serviceErr(req, res, e, i.code);
    //     return this.cdResp;
    //   }
    // }
    successResponse(req, res, result, appMsg = null) {
        if (appMsg) {
            this.i.app_msg = appMsg;
        }
        // const { SessionService } = await import("../cd-user/services/session.service");
        const svSess = this.svSess;
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        this.setAppState(true, this.i, svSess.sessResp);
        this.cdResp.data = result;
        this.respond(req, res);
    }
    getQuery(req) {
        const q = req.post.dat.f_vals[0].query;
        console.info(`BaseService::getQuery()/q:${q}`);
        this.pl = req.post;
        if (q) {
            return q;
        }
        else {
            return {};
        }
    }
    intersect(arrA, arrB, intersectionField) {
        return Lá.intersectionBy(arrA, arrB, intersectionField);
    }
    isEmpty(value) {
        return value == null || value.length === 0;
    }
    /**
     * @deprecated
     * This method was an early helper to construct IServiceInput for read/find operations.
     * Use `serviceInputGet()` instead, which follows clearer naming conventions.
     *
     * @param q - The IQuery object defining filters, pagination, etc.
     * @param dn - A human-readable docName for logging/debugging (e.g., 'Get Members')
     * @param model - The model constructor to query (e.g., CoopMemberModel)
     * @returns IServiceInput - A well-structured input object for BaseService read methods
     */
    siGet(q, dn, model) {
        return {
            serviceModel: model,
            docName: dn,
            cmd: {
                action: "find",
                query: q,
            },
            dSource: 1,
        };
    }
    /**
     * Constructs a standardized IServiceInput object for read operations.
     *
     * Recommended replacement for the deprecated `siGet()` method.
     * Used when performing actions like find, list, or fetch with filters.
     *
     * @param query - IQuery object (filter, take, skip, select, etc.)
     * @param docName - Descriptive name for tracing/debugging/logging purposes
     * @param model - The model class (constructor function) to be used in the query
     * @returns IServiceInput object for use with read operations
     */
    serviceInputGet(query, docName, model) {
        return {
            serviceModel: model,
            docName,
            cmd: {
                action: "find",
                query,
            },
            dSource: 1,
        };
    }
    /**
     * Constructs a standardized IServiceInput object for Create, Update, or Delete operations.
     *
     * Includes reference to the service instance, its model, and metadata such as docName.
     * This method is intended for general use across all non-read (CRUD) operations.
     *
     * @param serviceInstance - The active service instance (e.g., `this`)
     * @param docName - Optional descriptive name; defaults to "CRUD <ModelName>" if not provided
     * @returns IServiceInput object suitable for create/update/delete operations
     */
    serviceInputCRUD(serviceInstance) {
        const modelName = serviceInstance.modelName ||
            (serviceInstance.serviceModel?.constructor?.name ?? "UnknownModel");
        const methodName = this.getCallerFunctionName();
        const className = serviceInstance.constructor?.name || "UnknownService";
        return {
            serviceInstance,
            serviceModel: serviceInstance.serviceModel.constructor, // ✅ FIXED
            modelName,
            serviceModelInstance: serviceInstance.serviceModel,
            docName: `${methodName} ${className}`,
            dSource: 1,
        };
    }
    /**
     * Returns the method name and line number of the calling function.
     * Useful for contextual logging.
     *
     * @param depth - Stack depth to resolve the actual caller
     * @returns An object with method and line
     */
    getCallerInfo(depth = 3) {
        const stack = new Error().stack?.split("\n") || [];
        const targetLine = stack[depth] || "";
        const methodMatch = targetLine.match(/at (\w+)/);
        const method = methodMatch?.[1] || "unknownMethod";
        const lineMatch = targetLine.match(/:(\d+):\d+\)?$/);
        const line = lineMatch?.[1] || "??";
        return { method, line };
    }
    /**
     * Utility to get the name of the function that called the current method.
     * This uses stack trace introspection — may vary slightly by environment.
     */
    /**
     * Extracts the name of the caller function from the stack trace.
     * @param depth - Optional depth in the call stack. Default is 3.
     *                Increase it if more stack frames are involved.
     */
    getCallerFunctionName(depth = 3) {
        const err = new Error();
        const stack = err.stack?.split("\n") || [];
        // Example:
        // [0] Error
        // [1] at getCallerFunctionName...
        // [2] at logWithContext...
        // [3] at create...  <-- default
        const callerLine = stack[depth] || "";
        const match = callerLine.match(/at (\w+)/);
        return match?.[1] ?? "unknownMethod";
    }
    async beforeCreateGeneric(req, fieldMap) {
        for (const [key, value] of Object.entries(fieldMap)) {
            const finalValue = value === "GUID" ? this.getGuid() : value;
            this.setPlData(req, { key, value: finalValue });
        }
        return true;
    }
    getPlValue(req, key, fValsIndex = null) {
        const data = this.getPlData(req, null, fValsIndex);
        return data?.[key];
    }
    // async exists(req, res, field: string, model: any, value: any): Promise<boolean> {
    //   const svSess = new SessionService();
    //   if (value === undefined || value === null) {
    //     this.i.app_msg = `${field} is required for existence check`;
    //     this.err.push(this.i.app_msg);
    //     await this.setAppState(false, this.i, svSess.sessResp);
    //     return false;
    //   }
    //   const serviceInput = {
    //     serviceModel: model,
    //     docName: `BaseService::exists(${field})`,
    //     cmd: { action: 'find', query: { where: { [field]: value } } },
    //     dSource: 1,
    //   };
    //   try {
    //     const result = await this.read(req, res, serviceInput);
    //     return result.length > 0;
    //   } catch (e) {
    //     console.error(`BaseService::exists() - Error: ${(e as Error).message}`);
    //     this.i.app_msg = `Existence check failed for ${field}`;
    //     this.err.push(this.i.app_msg);
    //     await this.setAppState(false, this.i, svSess.sessResp);
    //     return false;
    //   }
    // }
    async exists(req, res, field, model, value) {
        const svSess = this.svSess;
        if (value === undefined || value === null) {
            this.i.app_msg = `${field} is required for existence check`;
            this.err.push(this.i.app_msg);
            await this.setAppState(false, this.i, svSess.sessResp);
            return false;
        }
        const serviceInput = {
            serviceModel: model,
            docName: `BaseService::exists(${field})`,
            cmd: { action: "find", query: { where: { [field]: value } } },
            dSource: 1,
        };
        try {
            const result = await this.read(req, res, serviceInput);
            // If result is a plain array
            if (Array.isArray(result)) {
                return result.length > 0;
            }
            // If result is a CdFxReturn or ICdResponse with array data
            if ("data" in result && Array.isArray(result.data)) {
                return result.data.length > 0;
            }
            // If none match, treat as no results
            return false;
        }
        catch (error) {
            console.error(`BaseService::exists() - Error: ${error.message}`);
            this.i.app_msg = `Existence check failed for ${field}`;
            this.err.push(this.i.app_msg);
            await this.setAppState(false, this.i, svSess.sessResp);
            return false;
        }
    }
    async validateCreateGeneric(req, res, rules, existenceMap, // field: Model
    validationCreateParams // same as your existing usage
    ) {
        const svSess = this.svSess;
        // Check required fields
        for (let field of rules.required || []) {
            const value = this.getPlValue(req, field);
            if (!value) {
                this.i.app_msg = `${field} is required`;
                this.err.push(this.i.app_msg);
                await this.setAppState(false, this.i, svSess.sessResp);
                return false;
            }
        }
        // Validate existence of references
        for (let field of Object.keys(existenceMap)) {
            const model = existenceMap[field];
            const value = this.getPlValue(req, field);
            const found = await this.exists(req, res, field, model, value);
            if (!found)
                return false;
        }
        // Perform duplication + required field logic
        if (await this.validateUnique(req, res, validationCreateParams)) {
            if (await this.validateRequired(req, res, rules)) {
                return true;
            }
            else {
                this.setAlertMessage(`Missing required fields: ${this.isInvalidFields.join(", ")}`, svSess, true);
                return false;
            }
        }
        else {
            this.setAlertMessage(`Duplicate entry for ${rules.noDuplicate?.join(", ")}`, svSess, false);
            return false;
        }
    }
    logTimeStamp(arg0) {
        throw new Error("Method not implemented.");
    }
    /**
     * Logs structured debug information with timestamp, class/method context, and data.
     * Automatically resolves the calling method name and supports rich data inspection.
     *
     * @param thisArg - The calling class instance (usually `this`)
     * @param message - A message to include in the log
     * @param data - Optional data to be logged alongside
     * @param level - Optional log level (default is "debug")
     */
    async logWithContext(thisArg, message, data, level = "debug") {
        // const chalk = await import("chalk");
        const caller = this.getCallerInfo(4); // customizable stack depth
        const className = thisArg.constructor?.name || "UnknownClass";
        const timestamp = new Date().toLocaleString("en-KE", {
            timeZone: process.env.TZ || "Africa/Nairobi",
        });
        const prefix = `[${timestamp}] [${className}::${caller.method}():${caller.line}]`;
        const logMsg = data
            ? `${prefix}: ${message} — ${inspect(data, { depth: 3, colors: true })}`
            : `${prefix}: ${message}`;
        switch (level) {
            case "info":
                console.log(chalk.green(logMsg));
                break;
            case "warn":
                console.warn(chalk.yellow(logMsg));
                break;
            case "error":
                console.error(chalk.red(logMsg));
                break;
            default:
                console.debug(chalk.blueBright(logMsg));
                break;
        }
    }
    // protected buildBaseRequest(
    //   module: { ctx: string; name: string },
    //   c: CdControllerDescriptor,
    //   action: string,
    //   dat: any,
    //   args: any = {},
    // ): ICdRequest {
    //   const cdRequest: ICdRequest = {
    //     ctx: toPascalCase(module.ctx),
    //     m: module.name,
    //     c: toPascalCase(c.name),
    //     a: action,
    //     dat: { f_vals: [dat], token: this.cdToken },
    //     args,
    //   };
    //   this.logWithContext(this, `BaseService.buildBaseRequest`, { cdRequest }, 'debug');
    //   return cdRequest;
    // }
    // protected stripManagedFields(data: Record<string, any>): Record<string, any> {
    //   const cleaned: Record<string, any> = {};
    //   for (const [key, value] of Object.entries(data)) {
    //     if (MANAGED_FIELDS.some((mf) => key.endsWith(mf) || key === mf)) {
    //       this.logWithContext(this, 'stripManagedFields:removed', { key, value }, 'debug');
    //       continue;
    //     }
    //     cleaned[key] = value;
    //   }
    //   return cleaned;
    // }
    // async handleRequest<T = any>(
    //   request: ICdRequest,
    //   opts: { raw?: boolean } = {},
    // ): Promise<CdFxReturn<T> | ICdResponse> {
    //   try {
    //     this.logWithContext(this, 'handleRequest:start', { request }, 'debug');
    //     const response = await this.http.proc(request, 'cdApiLocal');
    //     if (!response.state || !response.data) {
    //       const msg = `Failed to contact cd-api for module '${request.m}'.`;
    //       return opts.raw
    //         ? { app_state: { success: false, info: { app_msg: msg } } } as ICdResponse
    //         : { state: CdFxStateLevel.NetworkError, data: null, message: msg };
    //     }
    //     const cdResp: ICdResponse = response.data;
    //     if (opts.raw) {
    //       return cdResp;
    //     }
    //     if (!cdResp.app_state.success) {
    //       return {
    //         state: CdFxStateLevel.Error,
    //         data: null,
    //         message: cdResp.app_state.info?.app_msg || 'Unknown app error',
    //       };
    //     }
    //     return {
    //       state: CdFxStateLevel.Success,
    //       data: cdResp.data as T,
    //       message: `Module '${request.m}' ${request.a} succeeded`,
    //     };
    //   } catch (e: any) {
    //     return opts.raw
    //       ? { app_state: { success: false, info: { app_msg: e.message || e } } } as ICdResponse
    //       : {
    //           state: CdFxStateLevel.SystemError,
    //           data: null,
    //           message: `handleRequest exception: ${e.message || e}`,
    //         };
    //   }
    // }
    buildBaseRequest(module, c, action, dat, args = {}) {
        const cdRequest = {
            ctx: toPascalCase(module.ctx),
            m: module.name,
            c: toPascalCase(c.name),
            a: action,
            dat: { f_vals: [dat], token: this.cdToken },
            args,
        };
        this.logWithContext(this, "BaseService.buildBaseRequest", { cdRequest }, "debug");
        return cdRequest;
    }
    stripManagedFields(data) {
        const cleaned = {};
        for (const [key, value] of Object.entries(data)) {
            if (MANAGED_FIELDS.some((mf) => key.endsWith(mf) || key === mf)) {
                this.logWithContext(this, "stripManagedFields:removed", { key, value }, "debug");
                continue;
            }
            cleaned[key] = value;
        }
        return cleaned;
    }
    async handleRequest(request, opts = {}) {
        try {
            this.logWithContext(this, "handleRequest:start", { request }, "debug");
            // no need to specify 'cdApiLocal' — HttpService will determine it from config.env.app
            const response = await this.http.proc(request);
            if (!response.state || !response.data) {
                const msg = `Failed to contact cd-api for module '${request.m}'.`;
                return opts.raw
                    ? {
                        app_state: { success: false, info: { app_msg: msg } },
                    }
                    : { state: CdFxStateLevel.NetworkError, data: null, message: msg };
            }
            const cdResp = response.data;
            if (opts.raw) {
                return cdResp;
            }
            if (!cdResp.app_state.success) {
                const msg = cdResp.app_state.info?.app_msg || "Unknown application error";
                return {
                    state: CdFxStateLevel.Error,
                    data: null,
                    message: msg,
                };
            }
            return {
                state: CdFxStateLevel.Success,
                data: cdResp.data,
                message: `Module '${request.m}' ${request.a} succeeded`,
            };
        }
        catch (e) {
            const msg = e.message || e;
            return opts.raw
                ? {
                    app_state: { success: false, info: { app_msg: msg } },
                }
                : {
                    state: CdFxStateLevel.SystemError,
                    data: null,
                    message: `handleRequest exception: ${msg}`,
                };
        }
    }
    async emitHttpFx(req, opts = {}) {
        try {
            const response = await this.http.proc(req);
            const cdResp = response.data;
            if (!cdResp.app_state.success) {
                if (opts.notify)
                    window.cdShell?.notify?.error(cdResp.app_state.info?.app_msg || "Login failed");
                return {
                    state: CdFxStateLevel.Error,
                    data: null,
                    message: cdResp.app_state.info?.app_msg,
                };
            }
            if (opts.notify)
                window.cdShell?.notify?.success(`Welcome ${cdResp.data?.userName || "User"}`);
            return { state: CdFxStateLevel.Success, data: cdResp.data };
        }
        catch (e) {
            window.cdShell?.notify?.error(e.message || "Network error");
            return {
                state: CdFxStateLevel.SystemError,
                data: null,
                message: e.message,
            };
        }
    }
}

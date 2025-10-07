// import cloneDeep from 'lodash.clonedeep'; // Ensure lodash.clonedeep is installed
import { BaseService } from '../../../sys/base/base.service.js';
// import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/cd-user/services/session.service.js';
import { CoopStatModel } from '../models/coop-stat.model.js';
// import { CoopStatViewModel, siGet } from '../models/coop-view.model';
import { CoopTypeModel } from '../models/coop-type.model.js';
import { CoopStatViewModel } from '../models/coop-stat-view.model.js';
export class CoopStatService {
    // logger: Logging;
    b; // instance of BaseService
    cdToken;
    srvSess;
    srvUser;
    user;
    serviceModel;
    modelName;
    sessModel;
    sessDataExt;
    // moduleModel: ModuleModel;
    /*
     * create rules
     */
    cRules = {
        required: ['coopStatName', 'coopTypeId', 'coopStatDateLabel'],
        noDuplicate: ['coopStatName', 'coopStatDateLabel'],
    };
    uRules;
    dRules;
    constructor() {
        // super();
        this.b = new BaseService();
        // this.logger = new Logging();
        this.serviceModel = new CoopStatModel();
    }
    async initSession(req, res) {
        const svSess = new SessionService();
        const sessData = await svSess.getSessionDataExt(req, res);
        this.sessDataExt = sessData === null ? undefined : sessData;
    }
    /**
      * {
         "ctx": "App",
         "m": "Coops",
         "c": "Coop",
         "a": "Create",
         "dat": {
             "f_vals": [
             {
                 "data": {
                     "coopStatGuid":"",
                     "coopStatName": "Benin",
                     "coopStatDescription":"2005",
                     "cdGeoLocationId":null,
                     "coopWoccu": false,
                     "coopCount": null,
                     "coopMembersCount": 881232,
                     "coopSavesShares":56429394,
                     "coopLoans":45011150,
                     "coopReserves":null,
                     "coopAssets": null,
                     "coopMemberPenetration":20.95,
                     "coopStatDateLabel": "2005-12-31 23:59:59",
                     "coopStatRefId":null
                 }
             }
             ],
             "token": "3ffd785f-e885-4d37-addf-0e24379af338"
         },
         "args": {}
         }
      * @param req
      * @param res
      */
    async create(req, res) {
        console.info('coop/create::validateCreate()/01');
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CoopStatModel,
                modelName: 'CoopStatModel',
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
                dSource: 1,
            };
            console.info('CoopService::create()/serviceInput:', serviceInput);
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new Coop created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        }
        else {
            console.info('coop/create::validateCreate()/02');
            const r = await this.b.respond(req, res);
        }
    }
    async createSL(req, res) {
        const svSess = new SessionService();
        await this.b.initSqlite(req, res);
        if (await this.validateCreateSL(req, res)) {
            await this.beforeCreateSL(req, res);
            const serviceInput = {
                serviceInstance: this,
                serviceModel: CoopStatModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create Coop',
                dSource: 1,
            };
            const result = await this.b.createSL(req, res, serviceInput);
            this.b.connSLClose();
            this.b.i.app_msg = '';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = result;
            const r = await this.b.respond(req, res);
        }
        else {
            const r = await this.b.respond(req, res);
        }
    }
    async createI(req, res, createIParams) {
        return await this.b.createI(req, res, createIParams);
    }
    /**
       * CreateM, Create multiple records
       *  - 1. validate the loop field for multiple data
       *  - 2. loop through the list
       *  - 3. in each cycle:
       *      - get createItem
       *      - createI(createItem)
       *      - save return value
       *  - 4. set return data
       *  - 5. return data
       *
       * {
          "ctx": "App",
          "m": "Coops",
          "c": "Coop",
          "a": "CreateM",
          "dat": {
              "f_vals": [
              {
                  "data": [
                  {
                      "coopStatGuid": "",
                      "coopStatName": "Kenya",
                      "coopStatDescription": "2006",
                      "cdGeoLocationId": null,
                      "coopWoccu": false,
                      "coopCount": 2993,
                      "coopMembersCount": 3265545,
                      "coopSavesShares": 1608009012,
                      "coopLoans": 1604043550,
                      "coopReserves": 102792479,
                      "coopAssets": 2146769999,
                      "coopMemberPenetration": 16.01,
                      "coopStatDateLabel": "2006-12-31 23:59:59",
                      "coopStatRefId": null
                  },
                  {
                      "coopStatGuid": "",
                      "coopStatName": "Malawi",
                      "coopStatDescription": "2006",
                      "cdGeoLocationId": null,
                      "coopWoccu": false,
                      "coopCount": 70,
                      "coopMembersCount": 62736,
                      "coopSavesShares": 6175626,
                      "coopLoans": 4946246,
                      "coopReserves": 601936,
                      "coopAssets": 7407250,
                      "coopMemberPenetration": 0.9,
                      "coopStatDateLabel": "2006-12-31 23:59:59",
                      "coopStatRefId": null
                  }
                  ]
              }
              ],
              "token": "3ffd785f-e885-4d37-addf-0e24379af338"
          },
          "args": {}
          }
       *
       *
       * @param req
       * @param res
       */
    async createM(req, res) {
        console.info('CoopService::createM()/01');
        let data = req.post.dat.f_vals[0].data;
        console.info('CoopService::createM()/data:', data);
        // this.b.models.push(CoopStatModel)
        // this.b.init(req, res)
        for (var coopData of data) {
            console.info('coopData', coopData);
            const coopQuery = coopData;
            const svCoop = new CoopStatService();
            const si = {
                serviceInstance: svCoop,
                serviceModel: CoopStatModel,
                serviceModelInstance: svCoop.serviceModel,
                docName: 'CoopService::CreateM',
                dSource: 1,
            };
            const createIParams = {
                serviceInput: si,
                controllerData: coopQuery,
            };
            let ret = await this.createI(req, res, createIParams);
            console.info('CoopService::createM()/forLoop/ret:', { ret: ret });
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "coopStatName",
            //     "coopStatDescription"
            // ],
            where: {},
            take: 5,
            skip: 0,
        };
        this.getCoop(req, res, q);
    }
    async CoopExists(req, res, params) {
        const serviceInput = {
            serviceInstance: this,
            serviceModel: CoopStatModel,
            docName: 'CoopService::CoopExists',
            cmd: {
                action: 'find',
                query: { where: params.filter },
            },
            dSource: 1,
        };
        return this.b.read(req, res, serviceInput);
    }
    async beforeCreate(req, res) {
        this.b.setPlData(req, { key: 'coopStatGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopStatEnabled', value: true });
        return true;
    }
    async beforeCreateSL(req, res) {
        this.b.setPlData(req, { key: 'coopStatGuid', value: this.b.getGuid() });
        this.b.setPlData(req, { key: 'coopStatEnabled', value: true });
        return true;
    }
    async read(req, res, serviceInput) {
        // const serviceInput: IServiceInput<CoopStatModel> = {
        //     serviceInstance: this,
        //     serviceModel: CoopStatModel,
        //     docName: 'CoopService::CoopExists',
        //     cmd: {
        //         action: 'find',
        //         query: { where: params.filter }
        //     },
        //     dSource: 1,
        // }
        return this.b.read(req, res, serviceInput);
    }
    async readSL(req, res, serviceInput) {
        await this.b.initSqlite(req, res);
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoop/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopService::read$()/r:', r)
                this.b.i.code = 'CoopService::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose();
                this.b.respond(req, res);
            });
        }
        catch (e) {
            // console.info('CoopService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:update',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    update(req, res) {
        // console.info('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        // console.info('CoopService::update()/02')
        this.b.update$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    updateSL(req, res) {
        console.info('CoopService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        console.info('CoopService::update()/02');
        this.b.updateSL$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.connSLClose();
            this.b.respond(req, res);
        });
    }
    /**
     * harmonise any data that can
     * result in type error;
     * @param q
     * @returns
     */
    beforeUpdate(q) {
        if (q.update.CoopEnabled === '') {
            q.update.CoopEnabled = null;
        }
        return q;
    }
    beforeUpdateSL(q) {
        if (q.update.billEnabled === '') {
            q.update.billEnabled = null;
        }
        return q;
    }
    async remove(req, res) {
        //
    }
    /**
     * methods for transaction rollback
     */
    rbCreate() {
        return 1;
    }
    rbUpdate() {
        return 1;
    }
    rbDelete() {
        return 1;
    }
    async validateCreate(req, res) {
        console.info('coop/CoopService::validateCreate()/01');
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            serviceInstance: this,
            model: CoopStatModel,
        };
        this.b.i.code = 'CoopService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.info('coop/CoopService::validateCreate()/02');
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.info('coop/CoopService::validateCreate()/03');
                ret = true;
            }
            else {
                console.info('coop/CoopService::validateCreate()/04');
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        else {
            console.info('coop/CoopService::validateCreate()/05');
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.info('coop/CoopService::validateCreate()/06');
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the coopTypeId referenced exists
        const pl = this.b.getPlData(req);
        if ('coopTypeId' in pl) {
            console.info('coop/CoopService::validateCreate()/07');
            console.info('coop/CoopService::validateCreate()/pl:', pl);
            const serviceInput = {
                serviceModel: CoopTypeModel,
                docName: 'CoopService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { coopTypeId: pl.coopTypeId } },
                },
                dSource: 1,
            };
            console.info('coop/CoopService::validateCreate()/serviceInput:', {
                serviceInput: JSON.stringify(serviceInput),
            });
            const r = await this.b.read(req, res, serviceInput);
            console.info('coop/CoopService::validateCreate()/r:', r);
            if (r.length > 0) {
                console.info('coop/CoopService::validateCreate()/08');
                ret = true;
            }
            else {
                console.info('coop/CoopService::validateCreate()/10');
                ret = false;
                this.b.i.app_msg = `Coop type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        else {
            console.info('coop/CoopService::validateCreate()/11');
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `coopTypeId is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.info('CoopService::getCoop/12');
        if (this.b.err.length > 0) {
            console.info('coop/CoopService::validateCreate()/13');
            ret = false;
        }
        return ret;
    }
    async validateCreateSL(req, res) {
        return true;
    }
    /**
     *
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"coopStatName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     * @param q
     */
    async getCoop(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopService::getCoop/f:', q);
        // const serviceInput = siGet(q,this)
        this.serviceModel = new CoopStatModel();
        const serviceInput = this.b.siGet(q);
        serviceInput.serviceModelInstance = this.serviceModel;
        serviceInput.serviceModel = CoopStatModel;
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CoopService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    /**
     * Queey params:
     * - selected data level eg all-available, world, continent, country, continental-region, national-region
     * - list of selected items
     * - eg:
     * - on selection of all-available, show list of countries availaable with summary data
     * - on selection of world show continents with available data
     * - on selection of continent show list of countries availaable with summary data
     * - on selection of countrie list of national-resions availaable with summary data
     * - on selection of national-region given national-resion with summary data
     * @param q
     */
    async getCoopStats(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopService::getCoopStats/q:', q);
        if (!q) {
            return;
        }
        const serviceInput = this.b.siGet(q, 'CoopService::getCoopStats', CoopStatModel);
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CoopService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    async getCoopSL(req, res) {
        await this.b.initSqlite(req, res);
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoopSL/q:', q);
        const serviceInput = this.b.siGet(q, 'CoopService::getCoopSL', CoopStatModel);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopService::read$()/r:', r)
                this.b.i.code = 'CoopService::getCoopSL';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.connSLClose();
                this.b.respond(req, res);
            });
        }
        catch (e) {
            // console.info('CoopService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CoopService:getCoopSL',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    /**
     *
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetType","dat":{"f_vals": [{"query":{"where": {"coopTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    getCoopType(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoop/f:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopType$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        try {
            this.b.read$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopService::read$()/r:', r)
                this.b.i.code = 'CoopController::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res);
            });
        }
        catch (e) {
            // console.info('CoopService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: '',
            };
            this.b.serviceErr(req, res, e, i.code);
            this.b.respond(req, res);
        }
    }
    /**
     *
     * @param req
     * @param res
     */
    getCoopPaged(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopStatViewModel,
            docName: 'CoopService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCount$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopController::Get';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = r;
            this.b.respond(req, res);
        });
    }
    getPagedSL(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoopPaged()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::getCoopPaged',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCountSL$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopService::Get';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = r;
            this.b.connSLClose();
            this.b.respond(req, res);
        });
    }
    getCoopTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCount$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopController::Get';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = r;
            this.b.respond(req, res);
        });
    }
    delete(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::delete()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::delete',
            cmd: {
                action: 'delete',
                query: q,
            },
            dSource: 1,
        };
        this.b.delete$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    deleteSL(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopService::deleteSL()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatModel,
            docName: 'CoopService::deleteSL',
            cmd: {
                action: 'delete',
                query: q,
            },
            dSource: 1,
        };
        this.b.deleteSL$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    /**
     * This method is used internally by other methods in data agregation
     * @param req
     * @param res
     * @param q
     * @returns
     */
    async getCoopI(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopService::getCoopI/q:', q);
        let serviceModel = new CoopStatViewModel();
        const serviceInput = this.b.siGet(q);
        serviceInput.serviceModelInstance = serviceModel;
        serviceInput.serviceModel = CoopStatViewModel;
        try {
            let respData = await this.b.read(req, res, serviceInput);
            return { data: respData, error: null };
        }
        catch (e) {
            // console.info('CoopService::read()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BaseService:update',
                app_msg: '',
            };
            return { data: null, error: e };
        }
    }
}

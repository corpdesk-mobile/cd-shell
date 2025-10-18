import { BaseService } from '../../../sys/base/base.service.js';
import { SessionService } from '../../../sys/cd-user/services/session.service.js';
import { CoopStatPublicFilterModel, } from '../models/coop-stat-public-filter.model.js';
import { CoopTypeModel } from '../models/coop-type.model.js';
import { Between, FindOperator, LessThan, MoreThan, Not } from 'typeorm';
import { GroupMemberService } from '../../../sys/cd-user/services/group-member.service.js';
export class CoopStatPublicFilterService {
    constructor() {
        // moduleModel: ModuleModel;
        /*
         * create rules
         */
        this.cRules = {
            required: ['coopStatPublicFilterName', 'coopStatPublicFilterDescription'],
            noDuplicate: ['coopStatPublicFilterName'],
        };
        // super();
        this.b = new BaseService();
        // this.logger = new Logging();
        this.serviceModel = new CoopStatPublicFilterModel();
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
                     "CoopStatPublicFilterGuid":"",
                     "CoopStatPublicFilterName": "Benin",
                     "CoopStatPublicFilterDescription":"2005",
                     "cdGeoLocationId":null,
                     "coopWoccu": false,
                     "coopCount": null,
                     "coopMembersCount": 881232,
                     "coopSavesShares":56429394,
                     "coopLoans":45011150,
                     "coopReserves":null,
                     "coopAssets": null,
                     "coopMemberPenetration":20.95,
                     "CoopStatPublicFilterDateLabel": "2005-12-31 23:59:59",
                     "CoopStatPublicFilterRefId":null
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
                serviceModel: CoopStatPublicFilterModel,
                modelName: 'CoopStatPublicFilterModel',
                serviceModelInstance: this.serviceModel,
                docName: 'Create CoopStatPublicFilter',
                dSource: 1,
            };
            console.info('CoopStatPublicFilterService::create()/serviceInput:', serviceInput);
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
                serviceModel: CoopStatPublicFilterModel,
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
                      "CoopStatPublicFilterGuid": "",
                      "CoopStatPublicFilterName": "Kenya",
                      "CoopStatPublicFilterDescription": "2006",
                      "cdGeoLocationId": null,
                      "coopWoccu": false,
                      "coopCount": 2993,
                      "coopMembersCount": 3265545,
                      "coopSavesShares": 1608009012,
                      "coopLoans": 1604043550,
                      "coopReserves": 102792479,
                      "coopAssets": 2146769999,
                      "coopMemberPenetration": 16.01,
                      "CoopStatPublicFilterDateLabel": "2006-12-31 23:59:59",
                      "CoopStatPublicFilterRefId": null
                  },
                  {
                      "CoopStatPublicFilterGuid": "",
                      "CoopStatPublicFilterName": "Malawi",
                      "CoopStatPublicFilterDescription": "2006",
                      "cdGeoLocationId": null,
                      "coopWoccu": false,
                      "coopCount": 70,
                      "coopMembersCount": 62736,
                      "coopSavesShares": 6175626,
                      "coopLoans": 4946246,
                      "coopReserves": 601936,
                      "coopAssets": 7407250,
                      "coopMemberPenetration": 0.9,
                      "CoopStatPublicFilterDateLabel": "2006-12-31 23:59:59",
                      "CoopStatPublicFilterRefId": null
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
        console.info('CoopStatPublicFilterService::createM()/01');
        let data = req.post.dat.f_vals[0].data;
        console.info('CoopStatPublicFilterService::createM()/data:', data);
        // this.b.models.push(CoopStatPublicFilterModel)
        // this.b.init(req, res)
        for (var coopData of data) {
            console.info('coopData', coopData);
            const coopQuery = coopData;
            const svCoop = new CoopStatPublicFilterService();
            const si = {
                serviceInstance: svCoop,
                serviceModel: CoopStatPublicFilterModel,
                serviceModelInstance: svCoop.serviceModel,
                docName: 'CoopStatPublicFilterService::CreateM',
                dSource: 1,
            };
            const createIParams = {
                serviceInput: si,
                controllerData: coopQuery,
            };
            let ret = await this.createI(req, res, createIParams);
            console.info('CoopStatPublicFilterService::createM()/forLoop/ret:', { ret: ret });
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "CoopStatPublicFilterName",
            //     "CoopStatPublicFilterDescription"
            // ],
            where: {},
            take: 5,
            skip: 0,
        };
        this.getCoopStatPublicFilter(req, res, q);
    }
    async CoopStatPublicFilterExists(req, res, params) {
        const serviceInput = {
            serviceInstance: this,
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::CoopExists',
            cmd: {
                action: 'find',
                query: { where: params.filter },
            },
            dSource: 1,
        };
        return this.b.read(req, res, serviceInput);
    }
    async beforeCreate(req, res) {
        await this.b.setPlData(req, {
            key: 'coopStatPublicFilterGuid',
            value: this.b.getGuid(),
        });
        await this.b.setPlData(req, {
            key: 'coopStatPublicFilterEnabled',
            value: true,
        });
        return true;
    }
    async beforeCreateSL(req, res) {
        await this.b.setPlData(req, {
            key: 'coopStatPublicFilterGuid',
            value: this.b.getGuid(),
        });
        await this.b.setPlData(req, {
            key: 'coopStatPublicFilterEnabled',
            value: true,
        });
        return true;
    }
    async read(req, res, serviceInput) {
        // const serviceInput: IServiceInput = {
        //     serviceInstance: this,
        //     serviceModel: CoopStatPublicFilterModel,
        //     docName: 'CoopStatPublicFilterService::CoopExists',
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
        console.info('CoopStatPublicFilterService::getCoop/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopStatPublicFilterService::read$()/r:', r)
                this.b.i.code = 'CoopStatPublicFilterService::Get';
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
            // console.info('CoopStatPublicFilterService::read$()/e:', e);
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
        // console.info('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        // console.info('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    disableFilter(req, res) {
        // console.info('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        // q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::disableFilter',
            cmd: {
                action: 'update',
                query: {
                    update: {
                        coopStatPublicFilterEnabled: 0,
                    },
                    where: q.where,
                },
            },
            dSource: 1,
        };
        // console.info('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    enableFilter(req, res) {
        // console.info('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        // q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::enableFilter',
            cmd: {
                action: 'update',
                query: {
                    update: {
                        coopStatPublicFilterEnabled: 1,
                    },
                    where: q.where,
                },
            },
            dSource: 1,
        };
        // console.info('CoopStatPublicFilterService::update()/02')
        this.b.update$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    updateSL(req, res) {
        console.info('CoopStatPublicFilterService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        console.info('CoopStatPublicFilterService::update()/02');
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
        if ('coopEnabled' in q.update) {
            if (q.update.coopEnabled === '') {
                q.update.coopEnabled = null;
            }
            return q;
        }
        else if ('coopStatPublicFilterEnabled' in q.update) {
            return q;
        }
        else {
            return q;
        }
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
        console.info('coop/CoopStatPublicFilterService::validateCreate()/01');
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // const plData: CoopStatPublicFilterModel = await this.b.getPlData(req)
        // if ('coopStatPublicFilterSpecs' in plData) {
        //     console.log("CoopStatPublicFilterService::beforeCreate()/plData:", plData)
        //     if (typeof plData.coopStatPublicFilterSpecs == 'object') {
        //         console.log("CoopStatPublicFilterService::beforeCreate()/plData.coopStatPublicFilterSpecs:", plData.coopStatPublicFilterSpecs)
        //         req.post.dat.f_vals[0].data.coopStatPublicFilterSpecs = JSON.stringify(plData.coopStatPublicFilterSpecs)
        //     }
        // }
        // const plData2: CoopStatPublicFilterModel = await this.b.getPlData(req)
        // console.log("CoopStatPublicFilterService::beforeCreate()/plData2:", plData2)
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            serviceInstance: this,
            model: CoopStatPublicFilterModel,
        };
        this.b.i.code = 'CoopStatPublicFilterService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.info('coop/CoopStatPublicFilterService::validateCreate()/02');
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.info('coop/CoopStatPublicFilterService::validateCreate()/03');
                ret = true;
            }
            else {
                console.info('coop/CoopStatPublicFilterService::validateCreate()/04');
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        else {
            console.info('coop/CoopStatPublicFilterService::validateCreate()/05');
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.info('coop/CoopStatPublicFilterService::validateCreate()/06');
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the coopTypeId referenced exists
        const pl = this.b.getPlData(req);
        if ('coopTypeId' in pl) {
            console.info('coop/CoopStatPublicFilterService::validateCreate()/07');
            console.info('coop/CoopStatPublicFilterService::validateCreate()/pl:', pl);
            const serviceInput = {
                serviceModel: CoopTypeModel,
                docName: 'CoopStatPublicFilterService::validateCreate',
                cmd: {
                    action: 'find',
                    query: { where: { coopTypeId: pl.coopTypeId } },
                },
                dSource: 1,
            };
            console.info('coop/CoopStatPublicFilterService::validateCreate()/serviceInput:', { serviceInput: JSON.stringify(serviceInput) });
            const r = await this.b.read(req, res, serviceInput);
            console.info('coop/CoopStatPublicFilterService::validateCreate()/r:', r);
            if (r.length > 0) {
                console.info('coop/CoopStatPublicFilterService::validateCreate()/08');
                ret = true;
            }
            else {
                console.info('coop/CoopStatPublicFilterService::validateCreate()/10');
                ret = false;
                this.b.i.app_msg = `Coop type reference is invalid`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        // error should only be invoked if 'coopTypeId' was also a requred field.
        else if (this.cRules.required.includes('coopTypeId')) {
            console.info('coop/CoopStatPublicFilterService::validateCreate()/11');
            // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
            // this.b.err.push(this.b.i.app_msg);
            //////////////////
            this.b.i.app_msg = `coopTypeId is missing in payload`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.info('CoopStatPublicFilterService::getCoop/12');
        if (this.b.err.length > 0) {
            console.info('coop/CoopStatPublicFilterService::validateCreate()/13');
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "Coops","c": "Coop","a": "Get","dat": {"f_vals": [{"query": {"where": {"CoopStatPublicFilterName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     * @param q
     */
    async getCoopStatPublicFilter(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopStatPublicFilterService::getCoop/f:', q);
        // const serviceInput = siGet(q,this)
        this.serviceModel = new CoopStatPublicFilterModel();
        const serviceInput = this.b.siGet(q, this);
        serviceInput.serviceModelInstance = this.serviceModel;
        serviceInput.serviceModel = CoopStatPublicFilterModel;
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CoopStatPublicFilterService::read$()/e:', e);
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
    async getCoopStatPublicFilters(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopStatPublicFilterService::getCoopStatPublicFilters/q:', q);
        if (!q) {
            return;
        }
        const serviceInput = this.b.siGet(q, 'CoopStatPublicFilterService::getCoopStatPublicFilters', CoopStatPublicFilterModel);
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CoopStatPublicFilterService::read$()/e:', e);
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
    async getCoopStatPublicFilterSL(req, res) {
        await this.b.initSqlite(req, res);
        const q = this.b.getQuery(req);
        console.info('CoopStatPublicFilterService::getCoop/q:', q);
        const serviceInput = this.b.siGet(q, 'CoopStatPublicFilterService::getCoopStatPublicFilterSL', CoopStatPublicFilterModel);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopStatPublicFilterService::read$()/r:', r)
                this.b.i.code = 'CoopStatPublicFilterService::Get';
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
            // console.info('CoopStatPublicFilterService::read$()/e:', e);
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
    /**
     *
     * curl test:
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "Coops","c": "Coop","a": "GetType","dat":{"f_vals": [{"query":{"where": {"coopTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     */
    getCoopStatPublicFilterType(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopStatPublicFilterService::getCoopStatPublicFilterType/f:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopStatPublicFilterService::getCoopStatPublicFilterType$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        try {
            this.b.read$(req, res, serviceInput).subscribe((r) => {
                // console.info('CoopStatPublicFilterService::read$()/r:', r)
                this.b.i.code = 'getCoopStatPublicFilterType::Get';
                const svSess = new SessionService();
                svSess.sessResp.cd_token = req.post.dat.token;
                svSess.sessResp.ttl = svSess.getTtl();
                this.b.setAppState(true, this.b.i, svSess.sessResp);
                this.b.cdResp.data = r;
                this.b.respond(req, res);
            });
        }
        catch (e) {
            // console.info('CoopStatPublicFilterService::read$()/e:', e);
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
    getCoopStatPublicFilterPaged(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopStatPublicFilterService::getCoopPaged/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::getCoopPaged$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCount$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopStatPublicFilterService::Get';
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
        console.info('CoopStatPublicFilterService::getPagedSL()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::getPagedSL',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCountSL$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopStatPublicFilterService::Get';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = r;
            this.b.connSLClose();
            this.b.respond(req, res);
        });
    }
    getCoopStatPublicFilterTypeCount(req, res) {
        const q = this.b.getQuery(req);
        console.info('CoopStatPublicFilterService::getCoopStatPublicFilterTypeCount/q:', q);
        const serviceInput = {
            serviceModel: CoopTypeModel,
            docName: 'CoopStatPublicFilterService::getCoopStatPublicFilterTypeCount$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCount$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CoopStatPublicFilterService::readCount$';
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
        console.info('CoopStatPublicFilterService::delete()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::delete',
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
        console.info('CoopStatPublicFilterService::deleteSL()/q:', q);
        const serviceInput = {
            serviceModel: CoopStatPublicFilterModel,
            docName: 'CoopStatPublicFilterService::deleteSL',
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
    async getCoopStatPublicFilterI(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopStatPublicFilterService::getCoopStatPublicFilterI/q:', q);
        let serviceModel = new CoopStatPublicFilterModel();
        const serviceInput = this.b.siGet(q, this);
        serviceInput.serviceModelInstance = serviceModel;
        serviceInput.serviceModel = CoopStatPublicFilterModel;
        try {
            let respData = await this.b.read(req, res, serviceInput);
            return { data: respData, error: null };
        }
        catch (e) {
            // console.info(
            //   'CoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
            //   e,
            // );
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BCoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
                app_msg: '',
            };
            return { data: null, error: e };
        }
    }
    /**
     *
     * This filter is meant to be applied against an in coming query for
     * coopStat.
     * Additional filters will be applied as per array settings hosted in
     * coopStatPublicFilter in the coopStatPublicFilterSpecs JSON field
     * The setting also optionally include exemptions for selected users and groups
     *
     * @param req
     * @param res
     * @param q
     * @returns
     */
    async applyCoopStatFilter(req, res, q) {
        console.log('CoopStatPublicFilterService::applyCoopStatFilter()/BeforeFilter/q:', q);
        const svSess = new SessionService();
        const sessionDataExt = await svSess.getSessionDataExt(req, res, true);
        console.log('CoopMemberService::applyCoopStatFilter()/sessionDataExt:', sessionDataExt);
        if (!sessionDataExt) {
            return null;
        }
        const currentUser = sessionDataExt.currentUser;
        console.log('CoopMemberService::applyCoopStatFilter()/currentUser:', currentUser);
        if (!currentUser.userGuid) {
            return null;
        }
        const svGroupMember = new GroupMemberService();
        const userGroups = (await svGroupMember.getUserGroupsI(req, res, currentUser.userGuid));
        // console.log(
        //   'CoopMemberService::applyCoopStatFilter()/userGroups:',
        //   userGroups,
        // );
        const qCoopStatPublicFilterSpecs = {
            where: { coopStatPublicFilterEnabled: true },
        };
        const existingFilters = await this.getCoopStatPublicFilterSpecsI(req, res, qCoopStatPublicFilterSpecs);
        console.log('CoopMemberService::applyCoopStatFilter()/existingFilters:', existingFilters);
        if (!existingFilters || existingFilters.data.length === 0) {
            console.log('No filters applied as no existing filters found.');
            return q;
        }
        q.where = q.where || {};
        for (const f of existingFilters.data) {
            const filter = f.coopStatPublicFilterSpecs;
            const isExempted = await this.userIsExempted(req, res, filter, currentUser, userGroups);
            console.log('CoopMemberService::applyCoopStatFilter()/isExempted:', isExempted);
            if (isExempted) {
                console.log('User or group exempted from filter:', filter);
                continue;
            }
            if ('coopTypeId' in filter.where) {
                q.where.coopTypeId = Not(filter.where.coopTypeId);
            }
            if ('coopStatRefId' in filter.where) {
                q.where.coopStatRefId = Not(filter.where.coopStatRefId);
            }
            if ('cdGeoLocationId' in filter.where) {
                q.where.cdGeoLocationId = Not(filter.where.cdGeoLocationId);
            }
            if ('cdGeoPoliticalTypeId' in filter.where) {
                q.where.cdGeoPoliticalTypeId = Not(filter.where.cdGeoPoliticalTypeId);
            }
            if ('coopStatDateLabel' in filter.where) {
                const dateLabel = filter.where.coopStatDateLabel;
                if (typeof dateLabel === 'string' && dateLabel.includes('%<')) {
                    const dateValue = dateLabel.split('%<')[1];
                    q.where.coopStatDateLabel = LessThan(new Date(dateValue));
                }
                else if (typeof dateLabel === 'string' && dateLabel.includes('%>')) {
                    const dateValue = dateLabel.split('%>')[1];
                    q.where.coopStatDateLabel = MoreThan(new Date(dateValue));
                }
                else if (typeof dateLabel === 'string' &&
                    dateLabel.includes('%BETWEEN')) {
                    const [start, end] = dateLabel.split('%BETWEEN')[1].split(',');
                    q.where.coopStatDateLabel = Between(new Date(start), new Date(end));
                }
            }
        }
        // Remove fields with _value: null from q.where
        q.where = this.cleanWhereClause(q.where);
        console.log('Filters applied to the where clause:', q.where);
        console.log('CoopStatPublicFilterService::applyCoopStatFilter()/AfterFilter/q:', q);
        return q;
    }
    /**
     * Recursively removes properties in the `where` object where `_value: null`.
     */
    cleanWhereClause(where) {
        if (typeof where !== 'object' || where === null) {
            return where;
        }
        // Handle arrays
        if (Array.isArray(where)) {
            return where
                .map(this.cleanWhereClause)
                .filter((item) => item !== undefined);
        }
        // Handle objects
        const cleanedWhere = {};
        for (const [key, value] of Object.entries(where)) {
            if (value instanceof FindOperator) {
                // Access the value using the public `value` getter
                if (value.value !== null) {
                    cleanedWhere[key] = value;
                }
            }
            else if (typeof value === 'object') {
                // Recursively clean nested objects
                const nested = this.cleanWhereClause(value);
                if (nested !== undefined) {
                    cleanedWhere[key] = nested;
                }
            }
            else if (value !== null) {
                // Directly add non-null values
                cleanedWhere[key] = value;
            }
        }
        // Return the cleaned object or undefined if all properties are removed
        return Object.keys(cleanedWhere).length > 0 ? cleanedWhere : undefined;
    }
    async getCoopStatPublicFilterSpecsI(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        console.info('CoopStatPublicFilterService::getCoopStatPublicFilterI/q:', q);
        let serviceModel = new CoopStatPublicFilterModel();
        const serviceInput = this.b.siGet(q, this);
        serviceInput.serviceModelInstance = serviceModel;
        serviceInput.serviceModel = CoopStatPublicFilterModel;
        try {
            let respData = await this.b.read(req, res, serviceInput);
            return { data: respData, error: null };
        }
        catch (e) {
            // console.info(
            //   'CoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
            //   e,
            // );
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'BCoopStatPublicFilterService::getCoopStatPublicFilterI()/e:',
                app_msg: '',
            };
            return { data: null, error: e };
        }
    }
    async userIsExempted(req, res, existingFilter, currentUser, userGroups) {
        console.log('CoopStatPublicFilterService::userIsExempted()/currentUser:', currentUser);
        console.log('CoopStatPublicFilterService::userIsExempted()/userGroups:', userGroups);
        console.log('CoopStatPublicFilterService::userIsExempted()/existingFilter:', existingFilter);
        // Check if user is directly exempted
        const isUserExempted = existingFilter.exempted.some((item) => item.cdObjTypeId === 9 && item.cdObjId === currentUser.userId);
        console.log('CoopStatPublicFilterService::userIsExempted()/isUserExempted:', isUserExempted);
        // Check if any of the user's groups are exempted
        const isGroupExempted = userGroups.some((group) => existingFilter.exempted.some((item) => item.cdObjTypeId === 10 && item.guid === group.groupGuidParent));
        console.log('CoopStatPublicFilterService::userIsExempted()/isGroupExempted:', isGroupExempted);
        return isUserExempted || isGroupExempted;
    }
}

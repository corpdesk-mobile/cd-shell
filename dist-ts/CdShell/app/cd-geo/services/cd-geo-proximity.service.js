import { BaseService } from '../../../sys/base/base.service.js';
// import { CdService } from '../../../sys/base/cd.service';
import { SessionService } from '../../../sys/cd-user/services/session.service.js';
import { CdGeoProximityModel } from '../models/cd-geo-proximity.model.js';
// import { CdGeoProximityViewModel, siGet } from '../models/cd-geo-proximity-view.model';
// import { CdGeoProximityViewModel } from '../models/cd-geo-proximity-view.model';
// import { siGet } from '../../../sys/base/base.model';
// import { Logging } from '../../../sys/base/winston.log.js';
export class CdGeoProximityService {
    // logger: Logging;
    b; // instance of BaseService
    cdToken;
    srvSess;
    srvUser;
    user;
    serviceModel;
    modelName = 'CdGeoProximityModel';
    sessModel;
    // moduleModel: ModuleModel;
    /*
     * create rules
     */
    cRules = {
        required: ['cd_geo_proximity_name'],
        noDuplicate: ['cd_geo_proximity_name'],
    };
    uRules;
    dRules;
    constructor() {
        // super();
        this.b = new BaseService();
        // this.logger = new Logging();
        this.serviceModel = new CdGeoProximityModel();
    }
    /**
       * {
          "ctx": "App",
          "m": "CdGeoProximitys",
          "c": "CdGeoProximity",
          "a": "Create",
          "dat": {
              "f_vals": [
              {
                  "data": {
                      "cd-geo-proximityGuid":"",
                      "cd-geo-proximityName": "Benin",
                      "cd-geo-proximityDescription":"2005",
                      "cdGeoLocationId":null,
                      "cd-geo-proximityWoccu": false,
                      "cd-geo-proximityCount": null,
                      "cd-geo-proximityMembersCount": 881232,
                      "cd-geo-proximitySavesShares":56429394,
                      "cd-geo-proximityLoans":45011150,
                      "cd-geo-proximityReserves":null,
                      "cd-geo-proximityAssets": null,
                      "cd-geo-proximityMemberPenetration":20.95,
                      "cd-geo-proximityDateLabel": "2005-12-31 23:59:59",
                      "cd-geo-proximityRefId":null
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
        console.info('cd-geo-proximity/create::validateCreate()/01');
        const svSess = new SessionService();
        if (await this.validateCreate(req, res)) {
            await this.beforeCreate(req, res);
            const serviceInput = {
                serviceModel: CdGeoProximityModel,
                modelName: 'CdGeoProximityModel',
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoProximity',
                dSource: 1,
            };
            console.info('CdGeoProximityService::create()/serviceInput:', serviceInput);
            const respData = await this.b.create(req, res, serviceInput);
            this.b.i.app_msg = 'new CdGeoProximity created';
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = await respData;
            const r = await this.b.respond(req, res);
        }
        else {
            console.info('cd-geo-proximity/create::validateCreate()/02');
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
                serviceModel: CdGeoProximityModel,
                serviceModelInstance: this.serviceModel,
                docName: 'Create CdGeoProximity',
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
          "m": "CdGeoProximitys",
          "c": "CdGeoProximity",
          "a": "CreateM",
          "dat": {
              "f_vals": [
              {
                  "data": [
                  {
                      "cd-geo-proximityGuid": "",
                      "cd-geo-proximityName": "Kenya",
                      "cd-geo-proximityDescription": "2006",
                      "cdGeoLocationId": null,
                      "cd-geo-proximityWoccu": false,
                      "cd-geo-proximityCount": 2993,
                      "cd-geo-proximityMembersCount": 3265545,
                      "cd-geo-proximitySavesShares": 1608009012,
                      "cd-geo-proximityLoans": 1604043550,
                      "cd-geo-proximityReserves": 102792479,
                      "cd-geo-proximityAssets": 2146769999,
                      "cd-geo-proximityMemberPenetration": 16.01,
                      "cd-geo-proximityDateLabel": "2006-12-31 23:59:59",
                      "cd-geo-proximityRefId": null
                  },
                  {
                      "cd-geo-proximityGuid": "",
                      "cd-geo-proximityName": "Malawi",
                      "cd-geo-proximityDescription": "2006",
                      "cdGeoLocationId": null,
                      "cd-geo-proximityWoccu": false,
                      "cd-geo-proximityCount": 70,
                      "cd-geo-proximityMembersCount": 62736,
                      "cd-geo-proximitySavesShares": 6175626,
                      "cd-geo-proximityLoans": 4946246,
                      "cd-geo-proximityReserves": 601936,
                      "cd-geo-proximityAssets": 7407250,
                      "cd-geo-proximityMemberPenetration": 0.9,
                      "cd-geo-proximityDateLabel": "2006-12-31 23:59:59",
                      "cd-geo-proximityRefId": null
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
        console.info('CdGeoProximityService::createM()/01');
        let data = req.post.dat.f_vals[0].data;
        console.info('CdGeoProximityService::createM()/data:', data);
        // this.b.models.push(CdGeoProximityModel)
        // this.b.init(req, res)
        for (var CdGeoProximityData of data) {
            console.info('CdGeoProximityData', CdGeoProximityData);
            const CdGeoProximityQuery = CdGeoProximityData;
            const svCdGeoProximity = new CdGeoProximityService();
            const si = {
                serviceInstance: svCdGeoProximity,
                serviceModel: CdGeoProximityModel,
                serviceModelInstance: svCdGeoProximity.serviceModel,
                docName: 'CdGeoProximityService::CreateM',
                dSource: 1,
            };
            const createIParams = {
                serviceInput: si,
                controllerData: CdGeoProximityQuery,
            };
            let ret = await this.createI(req, res, createIParams);
            console.info('CdGeoProximityService::createM()/forLoop/ret:', {
                ret: ret,
            });
        }
        // return current sample data
        // eg first 5
        // this is just a sample for development
        // producation can be tailored to requrement
        // and the query can be set from the client side.
        let q = {
            // "select": [
            //     "cd-geo-proximityName",
            //     "cd-geo-proximityDescription"
            // ],
            where: {},
            take: 5,
            skip: 0,
        };
        this.getCdGeoProximity(req, res, q);
    }
    async CdGeoProximityExists(req, res, params) {
        const serviceInput = {
            serviceInstance: this,
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::CdGeoProximityExists',
            cmd: {
                action: 'find',
                query: { where: params.filter },
            },
            dSource: 1,
        };
        return (await this.b.read(req, res, serviceInput));
    }
    async beforeCreate(req, res) {
        this.b.setPlData(req, {
            key: 'cdGeoProximityGuid',
            value: this.b.getGuid(),
        });
        this.b.setPlData(req, { key: 'cdGeoProximityEnabled', value: true });
        return true;
    }
    async beforeCreateSL(req, res) {
        this.b.setPlData(req, {
            key: 'cdGeoProximityGuid',
            value: this.b.getGuid(),
        });
        this.b.setPlData(req, { key: 'cdGeoProximityEnabled', value: true });
        return true;
    }
    async read(req, res, serviceInput) {
        // const serviceInput: IServiceInput<CdGeoProximityModel> = {
        //     serviceInstance: this,
        //     serviceModel: CdGeoProximityModel,
        //     docName: 'CdGeoProximityService::CdGeoProximityExists',
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
        console.info('CdGeoProximityService::getCdGeoProximity/q:', q);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CdGeoProximityService::read$()/r:', r)
                this.b.i.code = 'CdGeoProximityService::Get';
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
            //   console.info('CdGeoProximityService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoProximityService:update',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    update(req, res) {
        // console.info('CdGeoProximityService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdate(q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        // console.info('CdGeoProximityService::update()/02')
        this.b.update$(req, res, serviceInput).subscribe((ret) => {
            this.b.cdResp.data = ret;
            this.b.respond(req, res);
        });
    }
    updateSL(req, res) {
        console.info('CdGeoProximityService::update()/01');
        let q = this.b.getQuery(req);
        q = this.beforeUpdateSL(q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::update',
            cmd: {
                action: 'update',
                query: q,
            },
            dSource: 1,
        };
        console.info('CdGeoProximityService::update()/02');
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
        if (q.update.CdGeoProximityEnabled === '') {
            q.update.CdGeoProximityEnabled = null;
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
        console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/01');
        const svSess = new SessionService();
        ///////////////////////////////////////////////////////////////////
        // 1. Validate against duplication
        const params = {
            controllerInstance: this,
            model: CdGeoProximityModel,
        };
        this.b.i.code = 'CdGeoProximityService::validateCreate';
        let ret = false;
        if (await this.b.validateUnique(req, res, params)) {
            console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/02');
            if (await this.b.validateRequired(req, res, this.cRules)) {
                console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/03');
                ret = true;
            }
            else {
                console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/04');
                ret = false;
                this.b.i.app_msg = `the required fields ${this.b.isInvalidFields.join(', ')} is missing`;
                this.b.err.push(this.b.i.app_msg);
                this.b.setAppState(false, this.b.i, svSess.sessResp);
            }
        }
        else {
            console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/05');
            ret = false;
            this.b.i.app_msg = `duplicate for ${this.cRules.noDuplicate.join(', ')} is not allowed`;
            this.b.err.push(this.b.i.app_msg);
            this.b.setAppState(false, this.b.i, svSess.sessResp);
        }
        console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/06');
        ///////////////////////////////////////////////////////////////////
        // 2. confirm the CdGeoProximityTypeId referenced exists
        // const pl: CdGeoProximityModel = this.b.getPlData(req);
        // if ('CdGeoProximityTypeId' in pl) {
        //     console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/07')
        //     console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/pl:', pl)
        //     const serviceInput = {
        //         serviceModel: CdGeoProximityTypeModel,
        //         docName: 'CdGeoProximityService::validateCreate',
        //         cmd: {
        //             action: 'find',
        //             query: { where: { CdGeoProximityTypeId: pl.CdGeoProximityTypeId } }
        //         },
        //         dSource: 1
        //     }
        //     console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/serviceInput:', JSON.stringify(serviceInput))
        //     const r: any = await this.b.read(req, res, serviceInput)
        //     console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/r:', r)
        //     if (r.length > 0) {
        //         console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/08')
        //         ret = true;
        //     } else {
        //         console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/10')
        //         ret = false;
        //         this.b.i.app_msg = `CdGeoProximity type reference is invalid`;
        //         this.b.err.push(this.b.i.app_msg);
        //         this.b.setAppState(false, this.b.i, svSess.sessResp);
        //     }
        // } else {
        //     console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/11')
        //     // this.b.i.app_msg = `parentModuleGuid is missing in payload`;
        //     // this.b.err.push(this.b.i.app_msg);
        //     //////////////////
        //     this.b.i.app_msg = `CdGeoProximityTypeId is missing in payload`;
        //     this.b.err.push(this.b.i.app_msg);
        //     this.b.setAppState(false, this.b.i, svSess.sessResp);
        // }
        console.info('CdGeoProximityService::getCdGeoProximity/12');
        if (this.b.err.length > 0) {
            console.info('cd-geo-proximity/CdGeoProximityService::validateCreate()/13');
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
     * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App", "m": "CdGeoProximitys","c": "CdGeoProximity","a": "Get","dat": {"f_vals": [{"query": {"where": {"cd-geo-proximityName": "Kenya"}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
     * @param req
     * @param res
     * @param q
     */
    async getCdGeoProximity(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        if (!q) {
            return;
        }
        console.info('CdGeoProximityService::getCdGeoProximity/f:', q);
        const serviceInput = this.b.siGet(q, 'CdGeoProximityService::getCdGeoProximity/', CdGeoProximityModel);
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CdGeoProximityService::read$()/e:', e);
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
    async getCdGeoProximityStats(req, res, q) {
        if (q === null) {
            q = this.b.getQuery(req);
        }
        if (!q) {
            return;
        }
        console.info('CdGeoProximityService::getCdGeoProximityStats/f:', q);
        const serviceInput = this.b.siGet(q, 'CdGeoProximityService::getCdGeoProximityStats/', CdGeoProximityModel);
        try {
            const r = await this.b.read(req, res, serviceInput);
            this.b.successResponse(req, res, r);
        }
        catch (e) {
            // console.info('CdGeoProximityService::read$()/e:', e);
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
    async getCdGeoProximitySL(req, res) {
        await this.b.initSqlite(req, res);
        const q = this.b.getQuery(req);
        console.info('CdGeoProximityService::getCdGeoProximitySL/q:', q);
        const serviceInput = this.b.siGet(q, 'CdGeoProximityService::getCdGeoProximitySL/', CdGeoProximityModel);
        try {
            this.b.readSL$(req, res, serviceInput).subscribe((r) => {
                // console.info('CdGeoProximityService::read$()/r:', r)
                this.b.i.code = 'CdGeoProximityService::Get';
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
            // console.info('CdGeoProximityService::read$()/e:', e);
            this.b.err.push(e.toString());
            const i = {
                messages: this.b.err,
                code: 'CdGeoProximityService:update',
                app_msg: '',
            };
            await this.b.serviceErr(req, res, e, i.code);
            await this.b.respond(req, res);
        }
    }
    // /**
    //  *
    //  * curl test:
    //  * curl -k -X POST -H 'Content-Type: application/json' -d '{"ctx": "App","m": "CdGeoProximitys","c": "CdGeoProximity","a": "GetType","dat":{"f_vals": [{"query":{"where": {"CdGeoProximityTypeId":100}}}],"token":"08f45393-c10e-4edd-af2c-bae1746247a1"},"args": null}' http://localhost:3001 -v  | jq '.'
    //  * @param req
    //  * @param res
    //  */
    // getCdGeoProximityType(req: any, res: any) {
    //     const q = this.b.getQuery(req);
    //     console.info('CdGeoProximityService::getCdGeoProximity/f:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoProximityTypeModel,
    //         docName: 'CdGeoProximityService::getCdGeoProximityType$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     try {
    //         this.b.read$(req, res, serviceInput)
    //             .subscribe((r) => {
    //                 // console.info('CdGeoProximityService::read$()/r:', r)
    //                 this.b.i.code = 'CdGeoProximityController::Get';
    //                 const svSess = new SessionService();
    //                 svSess.sessResp.cd_token = req.post.dat.token;
    //                 svSess.sessResp.ttl = svSess.getTtl();
    //                 this.b.setAppState(true, this.b.i, svSess.sessResp);
    //                 this.b.cdResp.data = r;
    //                 this.b.respond(req, res)
    //             })
    //     } catch (e) {
    //         console.info('CdGeoProximityService::read$()/e:', e)
    //         this.b.err.push((e as Error).toString());
    //         const i = {
    //             messages: this.b.err,
    //             code: 'BaseService:update',
    //             app_msg: ''
    //         };
    //         this.b.serviceErr(req, res, e, i.code)
    //         this.b.respond(req, res)
    //     }
    // }
    /**
     *
     * @param req
     * @param res
     */
    getCdGeoProximityPaged(req, res) {
        const q = this.b.getQuery(req);
        console.info('CdGeoProximityService::getCdGeoProximity/q:', q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::getCdGeoProximity$',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCount$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CdGeoProximityController::Get';
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
        console.info('CdGeoProximityService::getCdGeoProximityCount()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::getCdGeoProximityCount',
            cmd: {
                action: 'find',
                query: q,
            },
            dSource: 1,
        };
        this.b.readCountSL$(req, res, serviceInput).subscribe((r) => {
            this.b.i.code = 'CdGeoProximityService::Get';
            const svSess = new SessionService();
            svSess.sessResp.cd_token = req.post.dat.token;
            svSess.sessResp.ttl = svSess.getTtl();
            this.b.setAppState(true, this.b.i, svSess.sessResp);
            this.b.cdResp.data = r;
            this.b.connSLClose();
            this.b.respond(req, res);
        });
    }
    // getCdGeoProximityTypeCount(req: any, res: any) {
    //     const q = this.b.getQuery(req);
    //     console.info('CdGeoProximityService::getCdGeoProximityCount/q:', q);
    //     const serviceInput = {
    //         serviceModel: CdGeoProximityTypeModel,
    //         docName: 'CdGeoProximityService::getCdGeoProximityCount$',
    //         cmd: {
    //             action: 'find',
    //             query: q
    //         },
    //         dSource: 1
    //     }
    //     this.b.readCount$(req, res, serviceInput)
    //         .subscribe((r) => {
    //             this.b.i.code = 'CdGeoProximityController::Get';
    //             const svSess = new SessionService();
    //             svSess.sessResp.cd_token = req.post.dat.token;
    //             svSess.sessResp.ttl = svSess.getTtl();
    //             this.b.setAppState(true, this.b.i, svSess.sessResp);
    //             this.b.cdResp.data = r;
    //             this.b.respond(req, res)
    //         })
    // }
    delete(req, res) {
        const q = this.b.getQuery(req);
        console.info('CdGeoProximityService::delete()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::delete',
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
        console.info('CdGeoProximityService::deleteSL()/q:', q);
        const serviceInput = {
            serviceModel: CdGeoProximityModel,
            docName: 'CdGeoProximityService::deleteSL',
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
}

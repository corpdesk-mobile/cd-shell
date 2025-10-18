export class AbstractBaseService {
}
export var CdFxStateLevel;
(function (CdFxStateLevel) {
    CdFxStateLevel[CdFxStateLevel["Error"] = 0] = "Error";
    CdFxStateLevel[CdFxStateLevel["Success"] = 1] = "Success";
    CdFxStateLevel[CdFxStateLevel["PartialSuccess"] = 2] = "PartialSuccess";
    CdFxStateLevel[CdFxStateLevel["LogicalFailure"] = 3] = "LogicalFailure";
    CdFxStateLevel[CdFxStateLevel["Warning"] = 4] = "Warning";
    CdFxStateLevel[CdFxStateLevel["Recoverable"] = 5] = "Recoverable";
    CdFxStateLevel[CdFxStateLevel["Info"] = 6] = "Info";
    CdFxStateLevel[CdFxStateLevel["Pending"] = 7] = "Pending";
    CdFxStateLevel[CdFxStateLevel["Cancelled"] = 8] = "Cancelled";
    CdFxStateLevel[CdFxStateLevel["NotFound"] = 9] = "NotFound";
    CdFxStateLevel[CdFxStateLevel["NotImplemented"] = 10] = "NotImplemented";
    CdFxStateLevel[CdFxStateLevel["SystemError"] = 11] = "SystemError";
    CdFxStateLevel[CdFxStateLevel["Fatal"] = 12] = "Fatal";
    CdFxStateLevel[CdFxStateLevel["Unknown"] = 13] = "Unknown";
    CdFxStateLevel[CdFxStateLevel["NetworkError"] = 17] = "NetworkError";
    CdFxStateLevel[CdFxStateLevel["PermissionDenied"] = 18] = "PermissionDenied";
})(CdFxStateLevel || (CdFxStateLevel = {}));
export var HttpFxEventType;
(function (HttpFxEventType) {
    HttpFxEventType["Start"] = "Start";
    HttpFxEventType["UploadProgress"] = "UploadProgress";
    HttpFxEventType["DownloadProgress"] = "DownloadProgress";
    HttpFxEventType["Success"] = "Success";
    HttpFxEventType["Error"] = "Error";
    HttpFxEventType["Complete"] = "Complete";
})(HttpFxEventType || (HttpFxEventType = {}));
// ✅ Default returns for each CdFxStateLevel
export const CD_FX_SUCCESS = {
    data: null,
    state: CdFxStateLevel.Success,
    message: 'Success!',
};
export const CD_FX_FAIL = {
    data: null,
    state: CdFxStateLevel.Error,
    message: 'Failed!',
};
export const CD_FX_PARTIAL_SUCCESS = {
    data: null,
    state: CdFxStateLevel.PartialSuccess,
    message: 'Partial success.',
};
export const CD_FX_LOGICAL_FAILURE = {
    data: null,
    state: CdFxStateLevel.LogicalFailure,
    message: 'Logical failure.',
};
export const CD_FX_WARNING = {
    data: null,
    state: CdFxStateLevel.Warning,
    message: 'Warning issued.',
};
export const CD_FX_RECOVERABLE = {
    data: null,
    state: CdFxStateLevel.Recoverable,
    message: 'Recoverable state.',
};
export const CD_FX_INFO = {
    data: null,
    state: CdFxStateLevel.Info,
    message: 'Informational message.',
};
export const CD_FX_PENDING = {
    data: null,
    state: CdFxStateLevel.Pending,
    message: 'Pending operation.',
};
export const CD_FX_CANCELLED = {
    data: null,
    state: CdFxStateLevel.Cancelled,
    message: 'Operation cancelled.',
};
export const CD_FX_NOT_FOUND = {
    data: null,
    state: CdFxStateLevel.NotFound,
    message: 'Not found.',
};
export const CD_FX_NOT_IMPLEMENTED = {
    data: null,
    state: CdFxStateLevel.NotImplemented,
    message: 'Not implemented yet.',
};
export const CD_FX_SYSTEM_ERROR = {
    data: null,
    state: CdFxStateLevel.SystemError,
    message: 'System-level error occurred.',
};
export const CD_FX_FATAL = {
    data: null,
    state: CdFxStateLevel.Fatal,
    message: 'Fatal error.',
};
export const CD_FX_UNKNOWN = {
    data: null,
    state: CdFxStateLevel.Unknown,
    message: 'Unknown state or error.',
};
export const SYS_CTX = 'Sys';
export const DEFAULT_DAT = {
    f_vals: [
        {
            query: null,
            data: null,
        },
    ],
    token: null,
};
export const DEFAULT_ARGS = {};
export const DEFAULT_ENVELOPE_CREATE = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'Create',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export const DEFAULT_ENVELOPE_GET = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'Get',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export const DEFAULT_ENVELOPE_GET_PAGED = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'GetCount',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export const DEFAULT_ENVELOPE_GET_TYPE = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'GetCount',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export const DEFAULT_ENVELOPE_UPDATE = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'Update',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export const DEFAULT_ENVELOPE_DELETE = {
    ctx: SYS_CTX,
    m: '',
    c: '',
    a: 'Delete',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
////////////////////
export const DEFAULT_CD_RESPONSE = {
    app_state: {
        success: false,
        info: {
            messages: [],
            code: '',
            app_msg: '',
        },
        sess: {
            cd_token: '',
            jwt: null,
            ttl: 600,
        },
        cache: {},
    },
    data: [],
};
export const DEFAULT_CD_REQUEST = {
    ctx: 'Sys',
    m: '',
    c: '',
    a: '',
    dat: DEFAULT_DAT,
    args: DEFAULT_ARGS,
};
export var ModuleScope;
(function (ModuleScope) {
    ModuleScope[ModuleScope["Sys"] = 0] = "Sys";
    ModuleScope[ModuleScope["App"] = 1] = "App";
})(ModuleScope || (ModuleScope = {}));
/** Fields managed by backend that must not be supplied by client */
export const MANAGED_FIELDS = ['Guid', 'docId', 'Enabled'];
export const DEFAULT_COMM_TRACK = {
    initTime: null,
    relayTime: null,
    relayed: false,
    deliveryTime: null,
    deliverd: false,
    pushed: false,
    pushTime: null,
    delivered: false,
};
// export const controlFormatt = {
//   text: ['', [Validators.required]],
//   textDisabled: ['', [Validators.required]],
//   email: [
//     '',
//     [
//       Validators.required,
//       Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+.[a-z]{2,3}$'),
//     ],
//   ],
//   url: ['', [Validators.required, Validators.pattern('https?://.+')]],
//   digits: ['', [Validators.required, Validators.pattern('[0-9]+')]],
//   number: ['', [Validators.required, Validators.pattern('[0-9]+')]],
//   alphanum: ['', [Validators.required, Validators.pattern('[a-zA-Z0-9]+')]],
//   textarea: ['', [Validators.required]],
//   password: ['', [Validators.required, Validators.minLength(6)]],
//   confirmpwd: ['', Validators.required],
// };
export var FieldType;
(function (FieldType) {
    FieldType[FieldType["number"] = 0] = "number";
    FieldType[FieldType["string"] = 1] = "string";
    FieldType[FieldType["boolean"] = 2] = "boolean";
    FieldType[FieldType["date"] = 3] = "date";
    FieldType[FieldType["json"] = 4] = "json";
    FieldType[FieldType["enum"] = 5] = "enum";
    FieldType[FieldType["action"] = 6] = "action";
    FieldType[FieldType["geoLocation"] = 7] = "geoLocation";
    FieldType[FieldType["decimal"] = 8] = "decimal";
    FieldType[FieldType["any"] = 9] = "any";
})(FieldType || (FieldType = {}));
export const INIT_CD_RESP = {
    app_state: {
        success: false,
        info: {
            messages: [],
            code: '',
            app_msg: '',
        },
        sess: {
            cd_token: null,
            jwt: null,
            ttl: 0,
        },
        cache: {},
    },
    data: null,
};
/// ColumnNumericTransformer
export class ColumnNumericTransformer {
    to(data) {
        return data;
    }
    from(data) {
        return parseFloat(data);
    }
}
/**
 * File extension to Prettier parser map
 */
export const formatterConfig = {
    '.ts': { parser: 'typescript' },
    '.cts': { parser: 'typescript' },
    '.mts': { parser: 'typescript' },
    '.js': { parser: 'babel' },
    '.cjs': { parser: 'babel' },
    '.mjs': { parser: 'babel' },
    '.json': { parser: 'json' },
    '.html': { parser: 'html' },
    '.md': { parser: 'markdown' },
    '.css': { parser: 'css' },
    '.scss': { parser: 'scss' },
    '.yml': { parser: 'yaml' },
    '.yaml': { parser: 'yaml' },
};

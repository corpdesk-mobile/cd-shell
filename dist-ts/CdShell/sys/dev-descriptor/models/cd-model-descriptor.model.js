// field-types.ts
export class FieldType {
    constructor(family, // logical type family, e.g. "int", "string"
    dialect, // dialect/vendor, e.g. "mysql"
    native, // actual type, e.g. "INT", "VARCHAR(255)"
    options = {}) {
        this.family = family;
        this.dialect = dialect;
        this.native = native;
        this.options = options;
    }
}
// Namespace-like convenience
export const f = {
    mysql: {
        int: new FieldType('int', 'mysql', 'INT'),
        bigint: new FieldType('bigint', 'mysql', 'BIGINT'),
        varchar: (len = 255) => new FieldType('string', 'mysql', `VARCHAR(${len})`, { len }),
        text: new FieldType('text', 'mysql', 'TEXT'),
        boolean: new FieldType('boolean', 'mysql', 'TINYINT(1)'),
        uuid: new FieldType('uuid', 'mysql', 'CHAR(36)'),
        datetime: new FieldType('date', 'mysql', 'DATETIME'),
    },
    pg: {
        int: new FieldType('int', 'pg', 'INTEGER'),
        varchar: (len = 255) => new FieldType('string', 'pg', `VARCHAR(${len})`, { len }),
        uuid: new FieldType('uuid', 'pg', 'UUID'),
        boolean: new FieldType('boolean', 'pg', 'BOOLEAN'),
        text: new FieldType('text', 'pg', 'TEXT'),
        timestamp: new FieldType('date', 'pg', 'TIMESTAMP'),
    },
    js: {
        number: new FieldType('number', 'js', 'number'),
        string: new FieldType('string', 'js', 'string'),
        boolean: new FieldType('boolean', 'js', 'boolean'),
        date: new FieldType('date', 'js', 'Date'),
    },
};

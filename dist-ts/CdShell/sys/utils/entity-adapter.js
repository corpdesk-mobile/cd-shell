import { getConnection } from 'typeorm';
export class EntityAdapter {
    constructor() {
        this.mappings = {};
    }
    registerMapping(entityName, mapping) {
        this.mappings[entityName] = mapping;
    }
    mapRawToEntity(entityName, rawData) {
        if (!this.mappings[entityName]) {
            throw new Error(`No mappings registered for entity: ${entityName}`);
        }
        const mapping = this.mappings[entityName];
        return rawData.map(item => {
            const mappedItem = {};
            for (const key in mapping) {
                if (mapping.hasOwnProperty(key) && item.hasOwnProperty(mapping[key])) {
                    mappedItem[key] = item[mapping[key]];
                }
            }
            return mappedItem;
        });
    }
    registerMappingFromEntity(entity) {
        const connection = getConnection();
        const metadata = connection.getMetadata(entity);
        const mapping = {};
        console.log('EntityAdapter::registerMappingFromEntity()/metadata.name:', metadata.name);
        // console.log('EntityAdapter::registerMappingFromEntity()/metadata.columns:', metadata.columns)
        metadata.columns.forEach(column => {
            // console.log('EntityAdapter::registerMappingFromEntity()/column:', column)
            console.log('EntityAdapter::registerMappingFromEntity()/column.databaseName:', column.databaseName);
            mapping[column.propertyName] = column.databaseName;
        });
        console.log('EntityAdapter::registerMappingFromEntity()/mapping:', mapping);
        this.registerMapping(metadata.name, mapping);
    }
    getEntityName(entity) {
        const connection = getConnection();
        const metadata = connection.getMetadata(entity);
        return metadata.name;
    }
    getDbSelect(entityName, selectFields) {
        // Check if the entity has a registered mapping
        if (!this.mappings[entityName]) {
            throw new Error(`No mappings registered for entity: ${entityName}`);
        }
        const mapping = this.mappings[entityName];
        // Transform the select fields into their corresponding database column names
        const dbSelect = selectFields.map(field => {
            if (!mapping[field]) {
                throw new Error(`Field "${field}" does not exist in the registered mapping for entity: ${entityName}`);
            }
            return mapping[field];
        });
        return dbSelect;
    }
}

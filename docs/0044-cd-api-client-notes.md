# Corpdesk API Developer Notes: CdWire & JSDP Integration

These notes provide a technical overview of the **Corpdesk Wire Protocol (CdWire)** and the **JSON Semantic Delta Protocol (JSDP)** for developers building on the Corpdesk ecosystem.

## 1. The Foundation: CdWire (RFC-0003)

**CdWire** is the official transport-agnostic communication protocol for Corpdesk. It is **descriptor-driven**, meaning execution is guided by metadata rather than fixed endpoints.

### 1.1 The Request Envelope (`ICdRequest`)

Every API call must be wrapped in a standardized request envelope:

* **`ctx`**: The context, typically the module scope (e.g., "Sys" or "App").
* **`m`**: The target Method/Module name.
* **`c`**: The target Controller name.
* **`a`**: The target Action name.
* **`dat`**: The `EnvelopDat` containing `f_vals` (an array of command settings) and a session `token`.
* **`args`**: Direct argument payloads for foreseeable extensions.

---

## 2. The Query Engine (`IQuery`)

The `IQuery` interface provides a JSON-based syntax that mirrors SQL operations for database interactions.

### 2.1 Standard Query Properties

* **`select`**: An array of strings defining which columns to retrieve (mirrors `SELECT col1, col2`).
* **`where`**: An `IQueryWhere` object supporting flat conditions and recursive `andWhere`/`orWhere` arrays.
* **`take` / `skip**`: Used for pagination (mirrors `LIMIT` and `OFFSET`).
* **`order`**: Defines the sort order of the results.

### 2.2 Data Operations

* **Creation**: Use the `data` property within `EnvelopFValItem` to pass the entity model. If multiple entities are involved (e.g., adding a User and an Employee simultaneously), the property should be named after the associated controller (e.g., `User: { ... }`).
* **Retrieval Example**: To perform a `SELECT * FROM consumer WHERE consumer_guid = ?`, the `where` clause is populated within the `query` object.

---

## 3. JSON Semantic Delta Protocol (JSDP)

Corpdesk utilizes JSON columns (e.g., `userProfile`, `consumerProfile`) for multi-tenant configurations. To update these without overwriting the entire blob, the `jsonUpdate` property is used.

### 3.1 `jsonUpdate` and Pathing

The `jsonUpdate` property supports both legacy `IJsonUpdate` and the advanced `JSDPInstruction`.

* **Pathing**: Paths represent nodes in the JSON hierarchy (e.g., `["shellConfig", "uiConfig", "defaultThemeId"]`).
* **Semantic Identity**: When targeting an array midway through a path, JSDP uses identity-based searching (e.g., searching by `field` or `userId`) rather than brittle index-based pathing.

### 3.2 Action CRUD Options

The `action` property within a `jsonUpdate` instruction defines the operation:

* **`create`**: Appends new data to an object or array.
* **`update`**: Modifies an existing node found at the path.
* **`delete`**: Removes the node at the specified path.

---

## 4. Implementation Patterns

### 4.1 Multi-Tenant Configuration Updates

In multi-tenant systems, tenant-specific settings are stored in `consumer.consumerProfile`. Developers can modify specific configuration flags (like UI themes) by passing a `jsonUpdate` instruction targeting the exact path within the profile.

### 4.2 Handling Complex Profiles

The `ProfileServiceHelper` acts as a fulcrum for these updates.

* **Legacy Mode**: `modifyProfile` uses the standard `JMorph` behavior.
* **Extended Mode**: `modifyProfileExt` (suggested for POC) allows for improved input standards like JSDP while maintaining backward compatibility.

### 4.3 Sanitization and Security

The API ensures security by removing sensitive fields (e.g., `password`, `hash`, `salt`) before exposing profile data to the client. This is handled via `ProfileServiceHelper.sanitizeProfile`.

```ts
export interface IQuery {
  select?: string[];
  update?: object;
  where: IQueryWhere;
  jsonUpdate?: IJsonUpdate[] | JSDPInstruction[]; // This was developed for JSON columns. Its use can be found in the implementation of UserProfile and how CoopMemberProfile has extended UserProfile
  distinct?: boolean;
  take?: number;
  skip?: number;
  jFilters?: IJFilter[];
  order?: any;
  class?: string;
  extData?: any; // any extra data
}

// Recursive support for nested 'andWhere' and 'orWhere'
export interface IQueryWhere {
  andWhere?: Array<IQueryWhere | { [field: string]: any }>;
  orWhere?: Array<IQueryWhere | { [field: string]: any }>;

  // legacy-compatible flat conditions
  [field: string]: any;
}

// custom json update
export interface IJsonUpdate {
  modelField?; // name of the json column. Capacity to update multiple json columns in a given row
  path: any; // path to a target item in JSON data
  value: any; // value to apply to a tarteg item
  action: string; // CRUD option
}

// json field filter
export interface IJFilter {
  jField: string;
  jPath: string;
  pathValue: any;
}
```

Example 1:
Corpdesk being a multi-tenant system, each tenant/consumer, has its configurations in the consumer.consumerProfile property.
Below is an example of Request.post payload for modifying the configurations.
You can see use of IQuery where the jsonUpdate: JSDPInstructions[] is applied.
```json
{
  "ctx": "Sys",
  "m": "Moduleman",
  "c": "Consumer",
  "a": "UpdateConsumerProfile",
  "dat": {
    "f_vals": [
      {
        "query": {
          "update": null,
          "where": {
            "consumerId": 33
          }
        },
        "jsonUpdate": [
          {
            "path": ["shellConfig", "uiConfig", "defaultThemeId"],
            "value": "dark",
            "action": "update"
          },
          {
            "path": ["shellConfig", "uiConfig", "defaultUiSystemId"],
            "value": "material-design",
            "action": "update"
          }
        ]
      }
    ],
    "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
  },
  "args": {}
}
```
Example 2:
The property 'data': <interface-for-controller> is used to host data for the controller.
In the case below it is used to 'create'.
There can be scenarios where the ICdReques would have 'data' and and extra data belonging to another controller.
In this case, the property would be named by the associated controller, eg. 'User' or 'Employee'.

```json
{
  "ctx": "Sys",
  "m": "Moduleman",
  "c": "Consumer",
  "a": "Create",
  "dat": {
    "f_vals": [
      {
        "data": {
          "companyGuid": "8a7a5b56-6c76-11ec-a1b0-4184d18c49ca"
        }
      }
    ],
    "token": "3ffd785f-e885-4d37-addf-0e24379af338"
  },
  "args": {}
}
```

Example 3:
To retrieve data, the syntax mirrors sql.
The example belore represent "select * from consumer where consumer_id = ?"
```json
{
  "ctx": "Sys",
  "m": "Moduleman",
  "c": "Consumer",
  "a": "Get",
  "dat": {
    "f_vals": [
      {
        "query": {
          "where": {
            "consumerGuid": "45E28C72-3C6D-940E-B738-DF3415589906"
          }
        }
      }
    ],
    "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
  },
  "args": null
}
```

Example 4:
Just like example 3, but now this would represent:
"select consumerName, consumerGuid from consumer limit 5"
```json
{
  "ctx": "Sys",
  "m": "Moduleman",
  "c": "Consumer",
  "a": "GetCount",
  "dat": {
    "f_vals": [
      {
        "query": {
          "select": ["consumerName", "consumerGuid"],
          "where": {},
          "take": 5,
          "skip": 0
        }
      }
    ],
    "token": "08f45393-c10e-4edd-af2c-bae1746247a1"
  },
  "args": null
}
```
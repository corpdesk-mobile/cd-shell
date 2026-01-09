User login request
```json
{
    "ctx": "Sys",
    "m": "User",
    "c": "User",
    "a": "Login",
    "dat": {
        "f_vals": [
            {
                "data": {
                    "userName": "karl",
                    "password": "********",
                    "consumerGuid": "B0B3DA99-1839-A499-90F6-1E3F69575DCD"
                }
            }
        ],
        "token": null
    },
    "args": null
}
```

```json
{
    "app_state": {
        "success": true,
        "info": {
            "messages": [],
            "code": "",
            "app_msg": "Welcome karl!",
            "respState": {
                "cdLevel": null,
                "cdDescription": null,
                "httpCode": null,
                "httpDescription": null
            }
        },
        "sess": {
            "cd_token": "7611a886-44d5-4b29-8188-41f54f19e43c",
            "userId": 1010,
            "jwt": null,
            "ttl": 600,
            "clientId": {
                "client": {
                    "type": "browser",
                    "name": "Chrome",
                    "version": "69.0",
                    "engine": "Blink",
                    "engineVersion": ""
                },
                "os": {
                    "name": "Mac",
                    "version": "10.13",
                    "platform": ""
                },
                "device": {
                    "type": "desktop",
                    "brand": "Apple",
                    "model": ""
                },
                "bot": null,
                "net": {
                    "ip": "::1"
                }
            }
        },
        "cache": {},
        "sConfig": {
            "usePush": true,
            "usePolling": true,
            "useCacheStore": true
        }
    },
    "data": {
        "consumer": {
            "consumerId": 33,
            "consumerGuid": "B0B3DA99-1859-A439-90F6-1E3F69575DCD",
            "consumerName": "emp_services",
            "consumerEnabled": 1,
            "docId": 9276,
            "companyId": 85,
            "companyGuid": "8a7ee96e-6c76-11wc-a1b0-4184d18c49ca",
            "consumerProfile": {
                "shellConfig": {
                    "splash": {
                        "path": "/splashscreens/corpdesk-default.html",
                        "enabled": true,
                        "minDuration": 3400
                    },
                    "appName": "Corpdesk PWA",
                    "logLevel": "debug",
                    "uiConfig": {
                        "defaultThemeId": "dark",
                        "uiSystemBasePath": "/assets/ui-systems/",
                        "defaultUiSystemId": "material-design",
                        "defaultFormVariant": "standard"
                    },
                    "envConfig": {
                        "appId": "",
                        "wsMode": "sio",
                        "apiHost": "https://localhost",
                        "sioHost": "https://localhost",
                        "consumer": "ACME_CORP",
                        "logLevel": "debug",
                        "shellHost": "https://localhost",
                        "apiOptions": {
                            "headers": {
                                "Content-Type": "application/json"
                            }
                        },
                        "production": true,
                        "pushConfig": {
                            "sio": {
                                "enabled": true
                            },
                            "wss": {
                                "enabled": false
                            },
                            "pusher": {
                                "apiKey": "",
                                "enabled": false,
                                "options": {
                                    "cluster": "",
                                    "forceTLS": true
                                }
                            }
                        },
                        "sioOptions": {
                            "path": "/socket.io",
                            "secure": true,
                            "transports": [
                                "websocket",
                                "polling"
                            ]
                        },
                        "wsEndpoint": "wss://localhost:3000",
                        "apiEndpoint": "https://localhost:3001/api",
                        "clientAppId": 2,
                        "defaultauth": "cd-auth",
                        "initialPage": "dashboard",
                        "sioEndpoint": "https://localhost:3002",
                        "clientAppGuid": "ca0fe39f-92b2-484d-91ef-487d4fc462a2",
                        "clientContext": {
                            "entity": "ASDAP",
                            "clientAppId": 2,
                            "consumerToken": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
                        },
                        "SOCKET_IO_PORT": 3002,
                        "USER_RESOURCES": "https://assets.corpdesk.com/user-resources",
                        "mfManifestPath": "/assets/mf.manifest.json"
                    },
                    "appVersion": "1.0.0",
                    "themeConfig": {
                        "accessibleThemes": [
                            "default",
                            "dark",
                            "contrast"
                        ],
                        "currentThemePath": "/themes/default/theme.json"
                    },
                    "fallbackTitle": "Corpdesk PWA",
                    "appDescription": "Corpdesk PWA",
                    "defaultModulePath": "sys/cd-user"
                },
                "fieldPermissions": {
                    "userPermissions": [
                        {
                            "read": true,
                            "field": "consumerName",
                            "write": true,
                            "hidden": false,
                            "userId": 1010,
                            "execute": false
                        }
                    ],
                    "groupPermissions": [
                        {
                            "read": true,
                            "field": "consumerName",
                            "write": false,
                            "hidden": false,
                            "execute": false,
                            "groupId": 6
                        }
                    ]
                }
            }
        },
        "menuData": [
            {
                "menuId": 995,
                "menuName": "Modman",
                "menuLabel": "Modman",
                "menuGuid": "6A601316-7CB8-A06D-7CFC-20CC846A693B",
                "closetFile": null,
                "cdObjId": 92291,
                "menuEnabled": 1,
                "menuDescription": "modman",
                "menuIcon": "fa-user-shield",
                "iconType": "remixicon",
                "docId": 9275,
                "menuParentId": -1,
                "path": "./admin",
                "isTitle": null,
                "badge": null,
                "isLayout": null,
                "moduleId": 99,
                "moduleGuid": "00e7c6a8-8ue4-40e2-bd27-51fcff9ce63b",
                "moduleName": "moduleman",
                "moduleIsPublic": null,
                "isSysModule": 1,
                "children": [
                    {
                        "menuId": 996,
                        "menuName": "dashboard",
                        "menuLabel": "dashboard",
                        "menuGuid": "F5C7A5C2-0E52-00B1-0B13-5B9BE450172D",
                        "closetFile": null,
                        "cdObjId": 92292,
                        "menuEnabled": 1,
                        "menuDescription": "dashboard",
                        "menuIcon": "message-circle-outline",
                        "iconType": "eva",
                        "docId": 9283,
                        "menuParentId": 995,
                        "path": "admin/admin-dashboard",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "dashboard-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "0A94308A-E7F8-79EE-444F-9E29F69C8C4C",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "99",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 997,
                        "menuName": "cdobj",
                        "menuLabel": "cdobj",
                        "menuGuid": "6DE79D9E-5A02-2CC1-4A9C-4CF06089EE25",
                        "closetFile": null,
                        "cdObjId": 92293,
                        "menuEnabled": 1,
                        "menuDescription": "cdobj",
                        "menuIcon": "message-circle-outline",
                        "iconType": "eva",
                        "docId": 9285,
                        "menuParentId": 995,
                        "path": "/moduleman/cd-obj/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "cdobj-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "097A3AA0-2B2D-333C-9421-06673B11F55C",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 998,
                        "menuName": "company",
                        "menuLabel": "company",
                        "menuGuid": "0C226A51-1681-254B-13D0-B8449722BE65",
                        "closetFile": null,
                        "cdObjId": 92294,
                        "menuEnabled": 1,
                        "menuDescription": "company",
                        "menuIcon": "message-circle-outline",
                        "iconType": "eva",
                        "docId": 9287,
                        "menuParentId": 995,
                        "path": "/moduleman/company/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "company-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "9E655DAF-01B3-FE12-D3CC-0D9984DBA0D4",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1000,
                        "menuName": "menu",
                        "menuLabel": "menu",
                        "menuGuid": "6B8D7ED1-6328-43FC-7AA5-A66F38A445CD",
                        "closetFile": null,
                        "cdObjId": 92296,
                        "menuEnabled": 1,
                        "menuDescription": "menu",
                        "menuIcon": "message-circle-outline",
                        "iconType": "eva",
                        "docId": 9291,
                        "menuParentId": 995,
                        "path": "/moduleman/menu/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "menu-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "7EB3CDFA-A230-9CE0-41BD-12D82DF0AE8F",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1001,
                        "menuName": "module",
                        "menuLabel": "module",
                        "menuGuid": "B3C501DF-4E44-0D29-8494-98172A8F9990",
                        "closetFile": null,
                        "cdObjId": 92297,
                        "menuEnabled": 1,
                        "menuDescription": "modman",
                        "menuIcon": "message-circle-outline",
                        "iconType": "eva",
                        "docId": 9293,
                        "menuParentId": 995,
                        "path": "/moduleman/module/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "modman-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "055A4A36-E427-E49E-7AB4-36D8E4FEE7C1",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1269,
                        "menuName": "consumer",
                        "menuLabel": "consumer",
                        "menuGuid": "93503e1e-eff2-4acb-93ba-5daa924f33e5",
                        "closetFile": null,
                        "cdObjId": 92539,
                        "menuEnabled": 1,
                        "menuDescription": "companies register as consumers to access corpdesk consumer-resources",
                        "menuIcon": "fas fa-hospital-user",
                        "iconType": null,
                        "docId": 15086,
                        "menuParentId": 995,
                        "path": "/moduleman/consumer/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "consumer",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1271,
                        "menuName": "consumer-resource",
                        "menuLabel": "consumer-resource",
                        "menuGuid": "ed452e49-90e5-449f-b329-6d58a7a3da39",
                        "closetFile": null,
                        "cdObjId": 92541,
                        "menuEnabled": 1,
                        "menuDescription": "manage consumer resources",
                        "menuIcon": "fas fa-share-alt-square",
                        "iconType": null,
                        "docId": 15117,
                        "menuParentId": 995,
                        "path": "/moduleman/consumer-resource/list",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 99,
                        "moduleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "moduleName": "moduleman",
                        "moduleIsPublic": null,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "consumer-resource",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    }
                ],
                "menuAction": null,
                "cdObjName": "admin-module-menu-link",
                "lastSyncDate": null,
                "cdObjDispName": null,
                "cdObjGuid": "B4A0AFFE-FF84-27FF-9997-96C82E70A0CA",
                "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                "lastModificationDate": null,
                "parentModuleGuid": "00e7c6a8-83e4-40e2-bd27-51fcff9ce63b",
                "parentClassGuid": null,
                "parentObj": null,
                "showName": null,
                "icon": "ri-user-settings-line",
                "showIcon": null,
                "currVal": null,
                "cdObjEnabled": null,
                "menuIsPublic": null
            },
            {
                "menuId": 1393,
                "menuName": "asdap2",
                "menuLabel": "asdap2",
                "menuGuid": "ffafddd9-bd04-417b-8838-16f82c5c6ce9",
                "closetFile": null,
                "cdObjId": 92748,
                "menuEnabled": 1,
                "menuDescription": null,
                "menuIcon": null,
                "iconType": null,
                "docId": 20933,
                "menuParentId": -1,
                "path": "/asdap2/dashboard",
                "isTitle": null,
                "badge": null,
                "isLayout": null,
                "moduleId": 464,
                "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                "moduleName": "asdap2",
                "moduleIsPublic": 1,
                "isSysModule": 0,
                "children": [
                    {
                        "menuId": 1394,
                        "menuName": "dashboard",
                        "menuLabel": "dashboard",
                        "menuGuid": "2bfcb0c0-a20d-41aa-a9a8-3c965f1c7460",
                        "closetFile": null,
                        "cdObjId": 92749,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20935,
                        "menuParentId": 1393,
                        "path": "/asdap2/dashboard",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 464,
                        "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                        "moduleName": "asdap2",
                        "moduleIsPublic": 1,
                        "isSysModule": 0,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "asdap2",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "app/asdap2/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": 1
                    },
                    {
                        "menuId": 1395,
                        "menuName": "admin",
                        "menuLabel": "admin",
                        "menuGuid": "ca4a5f2b-25ec-48ac-b439-ca14740325fa",
                        "closetFile": null,
                        "cdObjId": 92750,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20937,
                        "menuParentId": 1393,
                        "path": "/asdap2/admin",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 464,
                        "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                        "moduleName": "asdap2",
                        "moduleIsPublic": 1,
                        "isSysModule": 0,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "asdap2",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "app/asdap2/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": 0
                    },
                    {
                        "menuId": 1396,
                        "menuName": "sacco-profile",
                        "menuLabel": "sacco-profile",
                        "menuGuid": "dc562ea1-2965-400c-b6eb-cfde17f4bdef",
                        "closetFile": null,
                        "cdObjId": 92751,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20939,
                        "menuParentId": 1393,
                        "path": "/asdap2/sacco-profile",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 464,
                        "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                        "moduleName": "asdap2",
                        "moduleIsPublic": 1,
                        "isSysModule": 0,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "asdap2",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "app/asdap2/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": 0
                    },
                    {
                        "menuId": 1397,
                        "menuName": "sacco-directory",
                        "menuLabel": "sacco-directory",
                        "menuGuid": "43edc5c0-ff55-4062-b7bf-2a0450c43a29",
                        "closetFile": null,
                        "cdObjId": 92752,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20941,
                        "menuParentId": 1393,
                        "path": "/asdap2/sacco-directory",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 464,
                        "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                        "moduleName": "asdap2",
                        "moduleIsPublic": 1,
                        "isSysModule": 0,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "asdap2",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "app/asdap2/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": 1
                    },
                    {
                        "menuId": 1398,
                        "menuName": "sacco-settings",
                        "menuLabel": "sacco-settings",
                        "menuGuid": "ba065235-51d0-4872-8fce-c1ba89e11721",
                        "closetFile": null,
                        "cdObjId": 92753,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20943,
                        "menuParentId": 1393,
                        "path": "/asdap2/sacco-settings",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 464,
                        "moduleGuid": "b46f13a3-3af0-48d9-bf72-3cfc78eeee7e",
                        "moduleName": "asdap2",
                        "moduleIsPublic": 1,
                        "isSysModule": 0,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "asdap2",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "app/asdap2/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": 0
                    }
                ],
                "menuAction": null,
                "cdObjName": "asdap2",
                "lastSyncDate": null,
                "cdObjDispName": null,
                "cdObjGuid": null,
                "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                "lastModificationDate": null,
                "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                "parentClassGuid": null,
                "parentObj": "app/asdap2/",
                "showName": null,
                "icon": "ri-gears-lines",
                "showIcon": null,
                "currVal": null,
                "cdObjEnabled": 1,
                "menuIsPublic": 1
            },
            {
                "menuId": 1403,
                "menuName": "personal",
                "menuLabel": "personal",
                "menuGuid": "2d9b1aed-2e9d-484b-8369-e3f50d646397",
                "closetFile": null,
                "cdObjId": 92763,
                "menuEnabled": 1,
                "menuDescription": null,
                "menuIcon": null,
                "iconType": null,
                "docId": 20991,
                "menuParentId": -1,
                "path": "/user/profile",
                "isTitle": null,
                "badge": null,
                "isLayout": null,
                "moduleId": 467,
                "moduleGuid": "d5270988-cb1a-427b-977f-4a78e709fda9",
                "moduleName": "personal",
                "moduleIsPublic": 0,
                "isSysModule": 1,
                "children": [
                    {
                        "menuId": 1404,
                        "menuName": "user-profile",
                        "menuLabel": "user-profile",
                        "menuGuid": "6b2c3175-6a46-4ddc-90ee-d30fd8bc500b",
                        "closetFile": null,
                        "cdObjId": 92764,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20993,
                        "menuParentId": 1403,
                        "path": "/user/profile",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 467,
                        "moduleGuid": "d5270988-cb1a-427b-977f-4a78e709fda9",
                        "moduleName": "personal",
                        "moduleIsPublic": 0,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "personal",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "sys/user/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1405,
                        "menuName": "user-settings",
                        "menuLabel": "user-settings",
                        "menuGuid": "b017f61b-1fc5-4fff-8efb-fac2e416a4d5",
                        "closetFile": null,
                        "cdObjId": 92765,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20995,
                        "menuParentId": 1403,
                        "path": "/user/user-settings",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 467,
                        "moduleGuid": "d5270988-cb1a-427b-977f-4a78e709fda9",
                        "moduleName": "personal",
                        "moduleIsPublic": 0,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "personal",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "sys/user/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1406,
                        "menuName": "user-dirctory",
                        "menuLabel": "user-dirctory",
                        "menuGuid": "3c4a936d-bc6f-4e0a-b37f-46a38272b2c1",
                        "closetFile": null,
                        "cdObjId": 92766,
                        "menuEnabled": 1,
                        "menuDescription": null,
                        "menuIcon": null,
                        "iconType": null,
                        "docId": 20997,
                        "menuParentId": 1403,
                        "path": "/user/user-directory",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 467,
                        "moduleGuid": "d5270988-cb1a-427b-977f-4a78e709fda9",
                        "moduleName": "personal",
                        "moduleIsPublic": 0,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "personal",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                        "lastModificationDate": null,
                        "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                        "parentClassGuid": null,
                        "parentObj": "sys/user/",
                        "showName": null,
                        "icon": "ri-gears-lines",
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": 1,
                        "menuIsPublic": null
                    }
                ],
                "menuAction": null,
                "cdObjName": "personal",
                "lastSyncDate": null,
                "cdObjDispName": null,
                "cdObjGuid": null,
                "cdObjTypeGuid": "8b4cf8de-1ffc-4575-9e73-4ccf45a7756b",
                "lastModificationDate": null,
                "parentModuleGuid": "48753f8a-b262-471f-b175-1f0ec9e5206d",
                "parentClassGuid": null,
                "parentObj": "sys/user/",
                "showName": null,
                "icon": "ri-gears-lines",
                "showIcon": null,
                "currVal": null,
                "cdObjEnabled": 1,
                "menuIsPublic": null
            },
            {
                "menuId": 999,
                "menuName": "grus",
                "menuLabel": "grus",
                "menuGuid": "0E41514A-A230-91B9-CC6E-6BDF53184DA4",
                "closetFile": null,
                "cdObjId": 92295,
                "menuEnabled": 1,
                "menuDescription": "grus",
                "menuIcon": "message-circle-outline",
                "iconType": "eva",
                "docId": 9289,
                "menuParentId": -1,
                "path": "admin/grus",
                "isTitle": null,
                "badge": null,
                "isLayout": null,
                "moduleId": 45,
                "moduleGuid": "-dkkm6",
                "moduleName": "user",
                "moduleIsPublic": 0,
                "isSysModule": 1,
                "children": [
                    {
                        "menuId": 1140,
                        "menuName": "group",
                        "menuLabel": "group",
                        "menuGuid": "51DF536B-F9DA-D611-87EC-A0CD55CC3970",
                        "closetFile": null,
                        "cdObjId": 92397,
                        "menuEnabled": 1,
                        "menuDescription": "group",
                        "menuIcon": "users",
                        "iconType": "fa",
                        "docId": 9900,
                        "menuParentId": 999,
                        "path": "/pages/acl/group",
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 45,
                        "moduleGuid": "-dkkm6",
                        "moduleName": "user",
                        "moduleIsPublic": 0,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "group-component-menu-link",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": "11D929A1-7301-B073-C0E1-EAE319679586",
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "D961BC10-8CC1-FE62-6B97-72BBFF55E086",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    },
                    {
                        "menuId": 1272,
                        "menuName": "user",
                        "menuLabel": "user",
                        "menuGuid": "88b8e5fc-a77e-4070-a69e-372712c7826a",
                        "closetFile": null,
                        "cdObjId": 92542,
                        "menuEnabled": 1,
                        "menuDescription": "user manager",
                        "menuIcon": "fas fa-user-alt",
                        "iconType": null,
                        "docId": 15149,
                        "menuParentId": 999,
                        "path": null,
                        "isTitle": null,
                        "badge": null,
                        "isLayout": null,
                        "moduleId": 45,
                        "moduleGuid": "-dkkm6",
                        "moduleName": "user",
                        "moduleIsPublic": 0,
                        "isSysModule": 1,
                        "children": [],
                        "menuAction": null,
                        "cdObjName": "user",
                        "lastSyncDate": null,
                        "cdObjDispName": null,
                        "cdObjGuid": null,
                        "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                        "lastModificationDate": null,
                        "parentModuleGuid": "-dkkm6",
                        "parentClassGuid": null,
                        "parentObj": null,
                        "showName": null,
                        "icon": null,
                        "showIcon": null,
                        "currVal": null,
                        "cdObjEnabled": null,
                        "menuIsPublic": null
                    }
                ],
                "menuAction": null,
                "cdObjName": "grus-component-menu-link",
                "lastSyncDate": null,
                "cdObjDispName": null,
                "cdObjGuid": "DE910F11-3F01-25CC-6DCE-8272EE37B9B8",
                "cdObjTypeGuid": "f5df4494-5cc9-4463-8e8e-c5861703280e",
                "lastModificationDate": null,
                "parentModuleGuid": "-dkkm6",
                "parentClassGuid": null,
                "parentObj": null,
                "showName": null,
                "icon": null,
                "showIcon": null,
                "currVal": null,
                "cdObjEnabled": null,
                "menuIsPublic": null
            }
        ],
        "userData": {
            "userId": 1010,
            "userGuid": "fe5b1a9d-df45-4fce-a181-65289c48ea00",
            "userName": "karl",
            "password": "$2b$10$aD1oL0clbdvMO7iUx/4RT.MAPwcSk6PKKPalY./BL1UyUAnHGTH0m",
            "email": "karl.lulu@anon.com",
            "companyId": 85,
            "docId": 34,
            "mobile": "895909",
            "gender": 1,
            "birthDate": "1976-03-10T06:53:37.000Z",
            "postalAddr": "85849",
            "fName": "Karl",
            "mName": "D",
            "lName": "Lulu",
            "nationalId": 85909,
            "passportId": 89599,
            "userEnabled": true,
            "zipCode": null,
            "activationKey": "8968959",
            "userTypeId": 1,
            "userProfile": {
                "avatar": {
                    "url": "https://localhost/assets/images/users/avatar-anon.jpg"
                },
                "fieldPermissions": {
                    "userPermissions": [
                        {
                            "read": true,
                            "field": "userName",
                            "write": false,
                            "hidden": false,
                            "userId": 1000,
                            "execute": false
                        },
                        {
                            "read": true,
                            "field": "userName",
                            "write": false,
                            "hidden": false,
                            "userId": 1010,
                            "execute": false
                        }
                    ],
                    "groupPermissions": [
                        {
                            "read": true,
                            "field": "userName",
                            "write": false,
                            "hidden": false,
                            "execute": false,
                            "groupId": 0
                        },
                        {
                            "read": true,
                            "field": "userName",
                            "write": false,
                            "hidden": false,
                            "execute": false,
                            "groupId": 0
                        }
                    ]
                }
            }
        },
        "userProfile": [
            {
                "userProfile": {
                    "avatar": {
                        "url": "https://localhost/assets/images/users/avatar-anon.jpg"
                    },
                    "fieldPermissions": {
                        "userPermissions": [
                            {
                                "read": true,
                                "field": "userName",
                                "write": false,
                                "hidden": false,
                                "userId": 1000,
                                "execute": false
                            },
                            {
                                "read": true,
                                "field": "userName",
                                "write": false,
                                "hidden": false,
                                "userId": 1010,
                                "execute": false
                            }
                        ],
                        "groupPermissions": [
                            {
                                "read": true,
                                "field": "userName",
                                "write": false,
                                "hidden": false,
                                "execute": false,
                                "groupId": 0
                            },
                            {
                                "read": true,
                                "field": "userName",
                                "write": false,
                                "hidden": false,
                                "execute": false,
                                "groupId": 0
                            }
                        ]
                    }
                }
            }
        ]
    }
}
```

Note that this is a model in the api side.
```ts
// src/CdApi/sys/moduleman/models/consumer.model.ts
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { v4 as uuidv4 } from "uuid";
import { validateOrReject } from "class-validator";
import { IShellConfig } from "../../base/i-base";

@Entity({
  name: "consumer",
  synchronize: false,
})
// @CdModel
export class ConsumerModel {
  @PrimaryGeneratedColumn({
    name: "consumer_id",
  })
  consumerId?: number;

  @Column({
    name: "consumer_guid",
    length: 36,
    default: uuidv4(),
  })
  consumerGuid?: string;

  @Column("varchar", {
    name: "consumer_name",
    length: 50,
    nullable: true,
  })
  consumerName: string;

  @Column("tinyint", {
    name: "consumer_enabled",
    default: null,
  })
  consumerEnabled: boolean | number | null;

  @Column({
    name: "doc_id",
    default: null,
  })
  docId?: number;

  @Column({
    name: "company_id",
    default: null,
  })
  companyId?: number;

  @Column({
    name: "company_guid",
    default: null,
  })
  companyGuid?: string;

  /**
   * Consumer/tenant profile is stored as JSON in DB
   * Same pattern as UserModel.userProfile
   */
  @Column({
    name: "consumer_profile",
    default: null,
  })
  consumerProfile?: string; // JSON-encoded IConsumerProfile
}

/**
 * CONSUMER SHELL CONFIG
 * ----------------------
 * This mirrors IUserShellConfig but expresses consumer-wide policies.
 */

export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Whether users under this consumer are allowed
   * to personalize their UI system, theme, formVariant.
   */
  userPersonalizationAllowed?: boolean;

  /**
   * Default UI settings for this consumer (tenant).
   * These override system defaults, but user settings
   * may override these IF personalization is allowed.
   */
  defaultUiSystemId?: string;
  defaultThemeId?: string;
  defaultFormVariant?: string;

  /**
   * Consumer-level enforced UI policies
   * (e.g., lock UI system or theme).
   */
  enforcedPolicies?: {
    lockUiSystem?: boolean;
    lockTheme?: boolean;
    lockFormVariant?: boolean;
  };
}

/**
 * ACCESS STRUCTURES
 * ------------------
 * Mirrors IUserProfileAccess but now consumer-level access.
 * This governs which USERS and which GROUPS can access consumer fields/settings.
 */

export interface IConsumerProfileAccess {
  userPermissions: IProfileConsumerUserAccess[];
  groupPermissions: IProfileConsumerGroupAccess[];
}

/**
 * Same structure as IProfileUserAccess but adapted
 * for consumer profile domain.
 */
export interface IProfileConsumerUserAccess {
  userId: number; // which user is being granted access
  field: string; // field/setting being controlled
  hidden: boolean;
  read: boolean;
  write: boolean;
  execute: boolean;
}

/**
 * Same structure as IProfileGroupAccess but adapted
 * for consumer profile domain.
 */
export interface IProfileConsumerGroupAccess {
  groupId: number; // group controlling access
  field: string;
  hidden: boolean;
  read: boolean;
  write: boolean;
  execute: boolean;
}

/**
 * MAIN CONSUMER PROFILE
 * ----------------------
 * Mirrors IUserProfile closely.
 *
 * IUserProfile.userData      → IConsumerProfile.consumerData
 * IUserProfile.avatar        → IConsumerProfile.logo
 * IUserProfile.fieldPermissions → IConsumerProfile.fieldPermissions
 * IUserProfile.shellConfig   → IConsumerProfile.shellConfig
 */

export interface IConsumerProfile {
  fieldPermissions: IConsumerProfileAccess; // consumer ACL
  logo?: object; // consumer/company logo metadata
  // consumerData: ConsumerModel;                // base object like userData in IUserProfile

  /**
   * OPTIONAL consumer-level metadata
   */
  description?: string;
  tags?: string[];
  branches?: string[];
  socialLinks?: string[];
  partners?: string[];

  /**
   * Shell configuration (UI systems, themes, policies)
   */
  shellConfig?: IConsumerShellConfig;
}

export const consumerProfileDefault: IConsumerProfile = {
  logo: {
    url: `/assets/images/company/default-logo.png`,
  },

  fieldPermissions: {
    userPermissions: [
      {
        userId: 0, // consumer admin
        field: "consumerName",
        hidden: false,
        read: true,
        write: true,
        execute: false,
      },
    ],
    groupPermissions: [
      {
        groupId: 0, // public group
        field: "consumerName",
        hidden: false,
        read: true,
        write: false,
        execute: false,
      },
    ],
  },

  shellConfig: {
    appName: "default-consumer-config",
    userPersonalizationAllowed: true,
    defaultUiSystemId: "bootstrap-538",
    defaultThemeId: "default-light",
    defaultFormVariant: "outlined",
    enforcedPolicies: {
      lockTheme: true,
      lockUiSystem: true,
      lockFormVariant: true,
    },
  },
};

```

```ts

import {
  Entity,
  PrimaryGeneratedColumn,
  // Column,
  Generated,
  BeforeInsert,
  BeforeUpdate,
  IsNull,
  Not,
  UpdateDateColumn,
  OneToMany,
  ObjectLiteral,
} from "typeorm";
import * as bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import {
  validate,
  validateOrReject,
  Contains,
  IsInt,
  Length,
  IsEmail,
  IsFQDN,
  IsDate,
  Min,
  Max,
  IsJSON,
} from "class-validator";
import { BaseService } from "../../base/base.service";
import { DocModel } from "../../moduleman/models/doc.model";
import { env } from "process";
import config from "../../../../config";
import { ICdRequest, IShellConfig } from "../../base/i-base";

// @Entity({
//   name: "user",
//   synchronize: false,
// })
// @CdModel
export class UserModel {
  b?: BaseService<UserModel>;

  // @PrimaryGeneratedColumn({
  //   name: "user_id",
  // })
  userId?: number;

  // @Column({
  //   name: "user_guid",
  //   length: 36,
  //   default: uuidv4(),
  // })
  userGuid?: string;

  // @Column("varchar", {
  //   name: "user_name",
  //   length: 50,
  //   nullable: true,
  // })
  userName: string;

  // @Column("char", {
  //   name: "password",
  //   length: 60,
  //   default: null,
  // })
  password?: string;

  // @Column("varchar", {
  //   length: 60,
  //   unique: true,
  //   nullable: true,
  // })
  // @IsEmail()
  email?: string;

  // @Column({
  //   name: "company_id",
  //   default: null,
  // })
  // @IsInt()
  companyId?: number;

  // @Column({
  //   name: "doc_id",
  //   default: null,
  // })
  // @IsInt()
  docId?: number;

  // @Column({
  //   name: "mobile",
  //   default: null,
  // })
  mobile?: string;

  // @Column({
  //   name: "gender",
  //   default: null,
  // })
  gender?: number;

  // @Column({
  //   name: "birth_date",
  //   default: null,
  // })
  // @IsDate()
  birthDate?: Date;

  // @Column({
  //   name: "postal_addr",
  //   default: null,
  // })
  postalAddr?: string;

  // @Column({
  //   name: "f_name",
  //   default: null,
  // })
  fName?: string;

  // @Column({
  //   name: "m_name",
  //   default: null,
  // })
  mName?: string;

  // @Column({
  //   name: "l_name",
  //   default: null,
  // })
  lName?: string;

  // @Column({
  //   name: "national_id",
  //   default: null,
  // })
  // @IsInt()
  nationalId?: number;

  // @Column({
  //   name: "passport_id",
  //   default: null,
  // })
  // @IsInt()
  passportId?: number;

  // @Column({
  //   name: "user_enabled",
  //   default: null,
  // })
  userEnabled?: boolean;

  // @Column("char", {
  //   name: "zip_code",
  //   length: 5,
  //   default: null,
  // })
  zipCode?: string;

  // @Column({
  //   name: "activation_key",
  //   length: 36,
  //   default: uuidv4(),
  // })
  activationKey?: string;

  // @Column({
  //   name: "user_type_id",
  //   default: null,
  // })
  userTypeId?: number;

  // @Column({
  //   name: "user_profile",
  //   default: null,
  // })
  // userProfile?: string | ObjectLiteral;
  userProfile?: string;

  // @OneToMany((type) => DocModel, (doc) => doc.user) // note: we will create user property in the Docs class
  docs?: DocModel[];

  // HOOKS
  // @BeforeInsert()
  // @BeforeUpdate()
  async validate?() {
    await validateOrReject(this);
  }
}

export interface IUserProfileAccess {
  userPermissions: IProfileUserAccess[];
  groupPermissions: IProfileGroupAccess[];
}

/**
 * Improved versin should have just one interface and
 * instead of userId or groupId, cdObjId is applied.
 * This would then allow any object permissions to be set
 * Automation and 'role' concept can then be used to manage permission process
 */
export interface IProfileUserAccess {
  userId: number;
  hidden: boolean;
  field: string;
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface IProfileGroupAccess {
  groupId: number;
  field: string;
  hidden: boolean;
  read: boolean;
  write: boolean;
  execute: boolean;
}

export interface IUserProfile {
  userGuid: string;
  fieldPermissions: IUserProfileAccess;
  avatar?: object; //
  userData: UserModel;
  areasOfInterest?: string[];
  bio?: string;
  affiliatedInstitutions?: string[];
  following?: string[]; // Limit to X entries (e.g., 1000) to avoid abuse
  followers?: string[]; // Limit to X entries (e.g., 1000)
  friends?: string[]; // Limit to X entries (e.g., 500)
  groups?: string[]; // Limit to X entries (e.g., 100)
  shellConfig?: IUserShellConfig;
}

export interface IUserShellConfig extends IShellConfig {
  /** Flags that user can personalize or not */
  personalizationEnabled?: boolean;

  /**
   * A user may optionally override UI system/theme if allowed by consumer.
   */
  userPreferences?: {
    uiSystemId?: string;
    themeId?: string;
    formVariant?: string;
  };
}

export const profileDefaultConfig = [
  {
    path: ["fieldPermissions", "userPermissions", ["userName"]],
    value: {
      userId: 1000,
      field: "userName",
      hidden: false,
      read: true,
      write: false,
      execute: false,
    },
  },
  {
    path: ["fieldPermissions", "groupPermissions", ["userName"]],
    value: {
      groupId: 0,
      field: "userName",
      hidden: false,
      read: true,
      write: false,
      execute: false,
    },
  },
];

/**
 * the data below can be managed under with 'roles'
 * there needs to be a function that set the default 'role' for a user
 */
export const userProfileDefault: IUserProfile = {
  userGuid: '',
  avatar: {
    url: `https://${config.profiles.cdApiLocal.hostName}/assets/images/users/avatar-anon.jpg`,
  },
  fieldPermissions: {
    /**
     * specified permission setting for given users to specified fields
     */
    userPermissions: [
      {
        userId: 1000,
        field: "userName",
        hidden: false,
        read: true,
        write: false,
        execute: false,
      },
    ],
    groupPermissions: [
      {
        groupId: 0, // "_public"
        field: "userName",
        hidden: false,
        read: true,
        write: false,
        execute: false,
      },
    ],
  },
  userData: {
    userName: "",
    fName: "",
    lName: "",
  },
};

export const EnvUserLogin: ICdRequest = {
  ctx: 'Sys',
  m: 'User',
  c: 'User',
  a: 'Login',
  dat: {
    token: null,
    f_vals: [
      {
        data: {
          userName: '',
          password: '',
          consumerGuid: '',
        },
      },
    ],
  },
  args: null,
};

export const EnvUserProfile: ICdRequest = {
  ctx: 'Sys',
  m: 'User',
  c: 'User',
  a: 'GetUserProfile',
  dat: {
    token: null,
    f_vals: [
      {
        data: {
          userId: -1,
          consumerGuid: '',
        },
      },
    ],
  },
  args: null,
};

```

```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  // CacheKey,
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";
import { LoggerService } from "../../../utils/logger.service";

export class SysCacheService {
  private logger = new LoggerService();
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map<string, Set<CacheListener<any>>>();

  private versionCounter = 0;

  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

  // ------------------------------------------------------------------
  // SINGLETON
  // ------------------------------------------------------------------
  public static getInstance(configService?: ConfigService): SysCacheService {
    if (!SysCacheService.instance) {
      if (!configService) {
        throw new Error(
          "SysCacheService must be initialized with ConfigService on first instantiation."
        );
      }
      SysCacheService.instance = new SysCacheService(configService);
    }
    return SysCacheService.instance;
  }

  public setLoaders(
    systemLoader: UiSystemLoaderService,
    themeLoader: UiThemeLoaderService
  ): void {
    this._uiSystemLoader = systemLoader;
    this._uiThemeLoader = themeLoader;
  }

  // ------------------------------------------------------------------
  // CORE CACHE API (NEW)
  // ------------------------------------------------------------------
  // Legacy + typed set
  public set<T>(key: string, value: T, source?: CacheMeta["source"]): void;

  public set<K extends keyof SysCacheMap>(
    key: K,
    value: SysCacheMap[K],
    source?: CacheMeta["source"]
  ): void;

  // Implementation
  public set(
    key: string,
    value: any,
    source: CacheMeta["source"] = "runtime"
  ): void {
    const meta: CacheMeta = {
      source,
      version: ++this.versionCounter,
      timestamp: Date.now(),
    };

    this.cache.set(key, { value, meta });
    this.notify(key, value, meta);
  }

  public get(key: string): any | undefined;
  public get<K extends keyof SysCacheMap>(key: K): SysCacheMap[K] | undefined;

  public get(key: string): any | undefined {
    const entry = this.cache.get(key);
    return entry?.value;
  }

  public getMeta(key: string): CacheMeta | undefined {
    const entry = this.cache.get(key);
    return entry?.meta;
  }

  public subscribe<T>(
    key: string,
    listener: CacheListener<T>,
    emitImmediately = true
  ): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(listener);

    // Late subscriber → immediate sync
    if (emitImmediately && this.cache.has(key)) {
      const entry = this.cache.get(key)!;
      listener(entry.value, entry.meta);
    }

    // Unsubscribe
    return () => {
      this.listeners.get(key)?.delete(listener);
    };
  }

  private notify<T>(key, value: T, meta: CacheMeta): void {
    this.listeners.get(key)?.forEach((listener) => listener(value, meta));
  }

  // ------------------------------------------------------------------
  // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
  // ------------------------------------------------------------------
  public async loadAndCacheAll(): Promise<void> {
    this.logger.debug("[SysCacheService.loadAndCacheAll()] start");
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    // 🔑 PHASE-2 AWARE CONFIG RESOLUTION
    const shellConfig =
      this.get("shellConfig") ?? (await this.configService.loadConfig());

    const uiConfig = shellConfig.uiConfig || {};

    // Ensure canonical cache presence
    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", uiConfig, "static");

    // -------------------------------------------------
    // UI SYSTEMS (authoritative descriptors)
    // -------------------------------------------------
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    this.cacheUiSystems(uiSystemsData, "static");

    // -------------------------------------------------
    // UI THEMES
    // -------------------------------------------------
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig, "static");

    console.log("[SysCacheService] Load complete");
  }

  // ------------------------------------------------------------------
  // BACKWARD-COMPAT GETTERS (NO BREAKING CHANGES)
  // ------------------------------------------------------------------
  public getUiSystems(): any[] {
    return this.get("uiSystems") || [];
  }

  public getThemes(): any[] {
    return this.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.get("uiConfigNormalized") || {};
  }

  public getEnvConfig(): any {
    return this.get("envConfig") || {};
  }

  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken;
  }

  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) {
      await this.loadAndCacheAll();
    }
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
    this.logger.debug("[SysCacheService.normalizeUiSystemDescriptors()] start");
    const fullDescriptors = rawSystems.map((sys: any) => ({
      id: sys.id,
      name: sys.name,
      version: sys.version,
      description: sys.description,

      cssUrl: sys.cssUrl,
      jsUrl: sys.jsUrl,
      assetPath: sys.assetPath,

      stylesheets: sys.stylesheets || [],
      scripts: sys.scripts || [],

      themesAvailable: sys.themesAvailable || [],
      themeActive: sys.themeActive || null,

      conceptMappings: sys.conceptMappings || {},
      directiveMap: sys.directiveMap || {},
      tokenMap: sys.tokenMap || {},

      containers: sys.containers || [],
      components: sys.components || [],
      renderRules: sys.renderRules || {},

      metadata: sys.metadata || {},
      extensions: sys.extensions || {},

      author: sys.author,
      license: sys.license,
      repository: sys.repository,

      displayName: sys.displayName || sys.name,
    }));

    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    return {
      simple: simpleSystems,
      full: fullDescriptors,
    };
  }

  private cacheUiSystems(
    rawSystems: any[],
    source: CacheMeta["source"] = "static"
  ): void {
    this.logger.debug("[SysCacheService.cacheUiSystems()] start");
    const { simple, full } = this.normalizeUiSystemDescriptors(rawSystems);

    // 🔁 Legacy compatibility
    this.set("uiSystems", simple, source);
    this.set("uiSystemDescriptors", full, source);

    // 🔮 Optional future-facing unified key
    this.set("uiSystemsNormalized", { simple, full }, source);

    console.log("[SysCacheService] UI systems cached", {
      simpleCount: simple.length,
      fullCount: full.length,
      source,
    });
  }

  public hasConsumerContext(): boolean {
    return !!this.get("shellConfig:meta")?.hasConsumerProfile;
  }

  // ------------------------------------------------------------------
  // PHASE-2 RESOLUTION (CONSUMER / USER OVERRIDES)
  // ------------------------------------------------------------------
  public applyResolvedShellConfig(
    resolvedShellConfig: any,
    source: CacheMeta["source"] = "resolved"
  ): void {
    this.logger.debug("[SysCacheService.applyResolvedShellConfig()] start");
    this.logger.debug(
      "[SysCacheService.applyResolvedShellConfig()] resolvedShellConfig:",
      resolvedShellConfig
    );

    if (!resolvedShellConfig) return;

    const uiConfig = resolvedShellConfig.uiConfig || {};
    const envConfig = resolvedShellConfig.envConfig || {};

    // Override canonical keys
    this.set("shellConfig", resolvedShellConfig, source);
    this.set("uiConfig", uiConfig, source);
    this.set("envConfig", envConfig, source);

    // Optional normalized alias (used by loaders)
    this.set("uiConfigNormalized", uiConfig, source);

    // Metadata flag (used by hasConsumerContext)
    this.set(
      "shellConfig:meta",
      {
        hasConsumerProfile: true,
        appliedAt: Date.now(),
      },
      source
    );

    console.log("[SysCacheService] Resolved shell config applied", {
      defaultUiSystemId: uiConfig.defaultUiSystemId,
      defaultThemeId: uiConfig.defaultThemeId,
      source,
    });
  }

  public getUiSystemById(systemId: string): any | undefined {
    const systems = this.get("uiSystemDescriptors") || [];
    return systems.find((s: any) => s.id === systemId);
  }

  public getThemeById(themeId: string): any | undefined {
    const themes = this.get("themeDescriptors") || [];
    return themes.find((t: any) => t.id === themeId);
  }

  public resolveTheme(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getThemeById(input);
    return input;
  }

  public resolveUiSystem(input: string | any): any | undefined {
    if (!input) return undefined;
    if (typeof input === "string") return this.getUiSystemById(input);
    return input;
  }
}

```
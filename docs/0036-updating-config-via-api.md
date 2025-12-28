
I have tested what we have so far and it is working. I am visualizing a developer for client to this api. There need to be a documentation on how to communicate with the backend.
Note that the query: IQuery and jsonUpdate: JSDPInstruction[] are not limited to specific to given module but are generic.
The general solution is:
Modifying json fields of any model.
Both IQuery and JSDP are protocols that can be implemented in any system and any language.

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
            "path": [
              "shellConfig",
              "uiConfig",
              "defaultThemeId"
            ],
            "value": "dark",
            "action": "update"
          },
           {
            "path": [
              "shellConfig",
              "uiConfig",
              "defaultUiSystemId"
            ],
            "value": "bootstrap-538",
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
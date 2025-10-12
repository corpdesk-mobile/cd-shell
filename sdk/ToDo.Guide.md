

I am reviewing how scafolding in cd-cli works for corpdesk components.
This is being done in view of reusing some of the codes for converting corpdesk controller to cd-shell runtime controller code.
I would like you to do a developer code for the process listed below.
You will first focus on this methods. We will then later go into the helper classes to see how they work and do documentation accordingly.

```ts
async generateComponent(
    artifactTypeDescriptor: CdControllerDescriptor | CdServiceDescriptor,
    config: ComponentGenerationConfig,
    moduleDescriptor: CdModuleDescriptor,
    action: DevModeAction,
  ): Promise<CdFxReturn<void>> {
    try {
      if (
        !artifactTypeDescriptor.name ||
        !artifactTypeDescriptor.dependencies ||
        !artifactTypeDescriptor.fileName
      ) {
        return {
          state: false,
          data: undefined,
          message: 'Componet data is not valid.',
        };
      }
      config.componentName = artifactTypeDescriptor.name;
      // --- 1. Validation ---
      if (!artifactTypeDescriptor?.name) {
        const msg = 'Descriptor missing name';
        this.b.logWithContext(this, 'generateComponent:validation-fail', { msg }, 'error');
        return { state: false, data: undefined, message: msg };
      }

      if (!Array.isArray(config.dependencyList)) {
        const msg = 'Invalid dependencyList in config';
        return { state: false, data: undefined, message: msg };
      }

      this.b.logWithContext(
        this,
        `gnerateComponent:artifactTypeDescriptor.dependencies:`,
        artifactTypeDescriptor.dependencies,
        'debug',
      );

      // --- 2. Process Dependencies ---
      const depsResult = await this.processDependencies(
        artifactTypeDescriptor.dependencies,
        moduleDescriptor,
      );
      if (!depsResult.state) {
        return {
          state: false,
          data: null,
          message: depsResult.message || 'Failed to process dependencies',
        };
      }
      const dependencies = depsResult.data;
      this.b.logWithContext(this, `generateComponent:dependencies:`, dependencies, 'debug');

      // --- 3. Build Import Block ---
      const importBlock = this.groupImports(dependencies ?? []);
      this.b.logWithContext(this, `generateComponent:importBlock:`, importBlock, 'debug');

      const nameMap = this.prepareNameMap(artifactTypeDescriptor.name);
      this.b.logWithContext(this, `generateComponent:nameMap:`, nameMap, 'debug');

      /**
       * --- 3. Build methods ---
       */
      const methodStubsResult = await this.svTemplateSnippet.buildMethodStubSnippets(
        config.artifactType.slice(0, -1) as 'controller' | 'service' | 'model',
        artifactTypeDescriptor.methods ?? [],
        artifactTypeDescriptor.name,
        this, // 👈 pass current instance
        artifactTypeDescriptor,
      );
      this.b.logWithContext(
        this,
        `generateComponent:methodStubsResult:`,
        methodStubsResult,
        'debug',
      );

      if (methodStubsResult.state === CdFxStateLevel.Error) {
        return {
          state: false,
          data: undefined,
          message: methodStubsResult.message || 'Failed to build method stubs',
        };
      }

      // --- 4. Assemble class using buildClass() ---
      const primaryType = this.derivePrimaryComponentType(artifactTypeDescriptor.fileName);
      if (!primaryType) {
        return {
          state: CdFxStateLevel.LogicalFailure,
          message: 'Could not get the file name',
        };
      }

      const classResult = await this.svTemplateSnippet.buildClass(
        `${nameMap.Abcd}${toPascalCase(primaryType)}`,
        artifactTypeDescriptor.attributes, // attributes (if any in future)
        // constructorSnippetResult.data ?? '',
        methodStubsResult.data ?? [],
      );

      if (classResult.state === CdFxStateLevel.Error) {
        return {
          state: false,
          data: undefined,
          message: classResult.message || 'Failed to build class',
        };
      }

      const classCode = `${importBlock}\n\n${classResult.data}`;
      // this.b.logWithContext(this, `generateComponent:classCode:`, classCode, 'debug');

      // --- 5. PreWrite Validation ---
      const structureErrorsResult = await this.svPreWriteValidator.validateStructure(classCode);
      this.b.logWithContext(
        this,
        `generateComponent:structureErrorsResult:`,
        structureErrorsResult,
        'debug',
      );

      if (!structureErrorsResult?.state) {
        return {
          state: false,
          data: undefined,
          message: structureErrorsResult.message || 'Structure validation failed',
        };
      }

      const casingErrorsResult = await this.svPreWriteValidator.validateCasing(classCode);
      this.b.logWithContext(
        this,
        `generateComponent:casingErrorsResult:`,
        casingErrorsResult,
        'debug',
      );

      if (!casingErrorsResult?.state) {
        return {
          state: false,
          data: undefined,
          message: casingErrorsResult.message || 'Casing validation failed',
        };
      }

      let finalCode = classCode;
      const structureErrors = structureErrorsResult.data ?? [];
      const casingErrors = casingErrorsResult.data ?? [];
      if (structureErrors.length || casingErrors.length) {
        if (this.svPreWriteValidator.autoCorrect) {
          const autoCorrectResult = this.svPreWriteValidator.autoCorrect(classCode, [
            ...structureErrors,
            ...casingErrors,
          ]);
          finalCode =
            autoCorrectResult instanceof Promise
              ? ((await autoCorrectResult).data ?? classCode)
              : (autoCorrectResult ?? classCode);
        }
      }

      /**
       * --- 6. Apply the method implementations to the finalCode scaffold. ---
       * - substitute default methods with template reference
       */
      const finalImplementedCode = await this.applyComponentImplementations(
        finalCode,
        artifactTypeDescriptor,
        moduleDescriptor,
      );

      this.b.logWithContext(
        this,
        `generateComponent:finalImplementedCode:`,
        finalImplementedCode,
        'debug',
      );

      this.b.logWithContext(
        this,
        `generateComponent:artifactTypeDescriptor.fileName:`,
        artifactTypeDescriptor.fileName,
        'debug',
      );

      config.componentDescriptor = artifactTypeDescriptor;

      /**
       * stop for observation before writing controllers
       */
      // if(artifactTypeDescriptor) {
      //   throw new Error(`Process stoped for observation!`);
      // }

      /**
       * stop for observation before writing controller types
       */
      // if (artifactTypeDescriptor && artifactTypeDescriptor.type === ComponentType.ControllerType) {
      //   throw new Error(`Process stoped for observation!`);
      // }

      /**
       * stop for observation before writing services
       */
      // if (artifactTypeDescriptor && artifactTypeDescriptor.type === ComponentType.Service) {
      //   throw new Error(`Process stoped for observation!`);
      // }

      /**
       * stop for observation before writing service type
       */
      // if (artifactTypeDescriptor && artifactTypeDescriptor.type === ComponentType.ServiceType) {
      //   throw new Error(`Process stoped for observation!`);
      // }

      // --- 9. File Write ---
      const writeResult = await this.writeFile(
        config,
        moduleDescriptor,
        finalImplementedCode,
        action,
        artifactTypeDescriptor,
      );
      if (!writeResult.state) return writeResult;

      return { state: true, data: undefined };
    } catch (e) {
      const actualMessage = (e as Error).message || 'Unknown error during generateComponent';
      this.b.logWithContext(this, 'generateComponent:error', { e, actualMessage }, 'error');
      return { state: false, data: undefined, message: actualMessage };
    }
  }
```

/////////////////////////////////////////////

Based on the class below, do a specific developer documentation as a detail part of how buildMethodStubSnippets() works within the workflow you had just done.

```ts
export class TemplateSnippetService {
  b = new BaseService();

  async init(): Promise<void> {
    this.b.logWithContext(this, 'init-start', {}, 'debug');
    // reserved for async setup
    this.b.logWithContext(this, 'init-complete', {}, 'debug');
  }

  async buildImportBlock(imports: string[] | null | undefined): Promise<CdFxReturn<string>> {
    this.b.logWithContext(this, 'buildImportBlock:start', { imports }, 'debug');

    if (!Array.isArray(imports)) {
      const msg = 'Invalid imports array provided';
      this.b.logWithContext(this, 'buildImportBlock:error', msg, 'error');
      return { state: CdFxStateLevel.Error, data: '', message: msg };
    }

    const block = imports.join('\n');
    this.b.logWithContext(this, 'buildImportBlock:complete', { block }, 'debug');
    return { state: CdFxStateLevel.Success, data: block };
  }

  async buildConstructorSnippet(
    type: 'controller' | 'service' | 'model',
  ): Promise<CdFxReturn<string>> {
    this.b.logWithContext(this, 'buildConstructorSnippet:start', { type }, 'debug');

    let constructorCode: string;
    let state: CdFxStateLevel = CdFxStateLevel.Success;

    switch (type) {
      case 'controller':
        constructorCode = `  constructor() {\n    // TODO: initialize controller\n  }`;
        break;
      case 'service':
        constructorCode = `  constructor() {\n    // TODO: initialize service\n  }`;
        break;
      case 'model':
        constructorCode = `  constructor(initData?: Partial<this>) {\n    Object.assign(this, initData);\n  }`;
        break;
      default:
        constructorCode = `  constructor() {}`;
        state = CdFxStateLevel.Warning;
        this.b.logWithContext(this, 'buildConstructorSnippet:warn', { type }, 'warn');
    }

    this.b.logWithContext(
      this,
      'buildConstructorSnippet:complete',
      { type, constructorCode },
      'debug',
    );
    return {
      state,
      data: constructorCode,
      message: state === CdFxStateLevel.Warning ? 'Unknown type fallback' : null,
    };
  }

  async buildMethodStubSnippets(
    type: 'controller' | 'service' | 'model',
    methods: FunctionDescriptor[],
    baseName: string,
    svGenComponentService: GenComponentService,
    artifactDescriptor: CdControllerDescriptor | CdServiceDescriptor,
  ): Promise<CdFxReturn<string[]>> {
    this.b.logWithContext(this, 'buildMethodStubSnippets:start', { type, methods }, 'debug');

    if (!Array.isArray(methods) || methods.length === 0) {
      const msg = 'No valid FunctionDescriptor array provided';
      this.b.logWithContext(this, 'buildMethodStubSnippets:error', msg, 'error');
      return { state: CdFxStateLevel.Error, data: [], message: msg };
    }

    const nameMap = svGenComponentService.prepareNameMap(baseName);

    const stubs = methods.map((method) => {
      this.b.logWithContext(this, 'buildMethodStubSnippets:method', { method }, 'debug');
      if (!method?.name) {
        this.b.logWithContext(this, 'buildMethodStubSnippets:skip-invalid', { method }, 'warn');
        return '';
      }

      // --- Fallback: generate generic stub ---
      const visibility = method.scope?.visibility || 'public';
      const isAsync = method.behavior?.isAsync || false;
      const returnsPromise = method.behavior?.returnsPromise || false;

      let visibilityPrefix = '';
      if (visibility === 'private' || visibility === 'protected') {
        visibilityPrefix = `${visibility} `;
      }

      // ✅ Fix Promise<Promise<...>> issue
      let returnType: string;
      if (returnsPromise) {
        if (method.output?.returnType?.startsWith('Promise')) {
          returnType = method.output.returnType;
        } else {
          returnType = `Promise<${method.output?.returnType || 'void'}>`;
        }
      } else {
        returnType = method.output?.returnType || 'void';
      }

      const asyncPrefix = isAsync ? 'async ' : '';

      // Handle parameters
      const params = method.parameters
        ? method.parameters.map((p) => `${p.name}: ${p.type}`).join(', ')
        : '';

      // ✅ Normalize method names to camelCase
      // const methodName = this.toCamelCase(method.name);

      let methodName = '';

      if (method.name !== 'constructor') {
        if (type === 'controller') {
          methodName = this.toPascalCase(method.name);
        }

        if (type === 'service') {
          methodName = this.toCamelCase(method.name);
        }
      }

      if (method.name === 'constructor') {
        methodName = method.name;
      }

      if (methodName === 'constructor') {
        // Constructor special case
        return (
          `  // <<cd:method:constructor:start>>\n` +
          `  constructor(${params}) {\n    // TODO: implement\n  }\n` +
          `  // <<cd:method:constructor:end>>`
        );
      } else {
        return (
          `  // <<cd:method:${methodName}:start>>\n` +
          `  ${visibilityPrefix}${asyncPrefix}${methodName}(${params}): ${returnType} {\n    // TODO: implement\n  }\n` +
          `  // <<cd:method:${methodName}:end>>`
        );
      }
    });

    this.b.logWithContext(this, 'buildMethodStubSnippets:stubs', { stubs }, 'debug');
    return { state: CdFxStateLevel.Success, data: stubs };
  }

  // --- helpers ---

  private toPascalCase(str: string): string {
    this.b.logWithContext(this, 'toPascalCase:start', { input: str }, 'debug');
    if (typeof str !== 'string' || str.length === 0) {
      this.b.logWithContext(this, 'toPascalCase:error', { input: str }, 'error');
      return '';
    }
    const result = str.charAt(0).toUpperCase() + str.slice(1);
    this.b.logWithContext(this, 'toPascalCase', { input: str, output: result }, 'debug');
    return result;
  }

  async buildClass(
    className: string | null | undefined,
    attributes: ComponentAttributes[] | null | undefined,
    // constructorCode: string,
    methods: string[] | null | undefined,
  ): Promise<CdFxReturn<string>> {
    this.b.logWithContext(this, 'buildClass:start', { className, attributes, methods }, 'debug');

    if (!className || typeof className !== 'string') {
      const msg = 'Invalid className provided';
      this.b.logWithContext(this, 'buildClass:error', msg, 'error');
      return { state: CdFxStateLevel.Error, data: '', message: msg };
    }
    const safeAttributes = Array.isArray(attributes) ? this.formatAttributes(attributes) : [];

    this.b.logWithContext(this, `TemplateSnippetService::buildClass()/safeAttributes:`, {safeAttributes}, 'debug')

    // Filter out any constructor entries from the methods array
    const safeMethods = Array.isArray(methods)
      ? methods.filter((method) => !method.trim().startsWith('constructor('))
      : [];
    this.b.logWithContext(this, 'buildClass:safeMethods', { safeMethods }, 'debug');
    const lines: string[] = [];
    lines.push(`export class ${className} {`);

    if (safeAttributes.length > 0) {
      lines.push(safeAttributes.join('\n'));
      lines.push('');
    }

    // if (constructorCode) {
    //   lines.push(constructorCode);
    //   lines.push('');
    // }

    if (safeMethods.length > 0) {
      lines.push(safeMethods.join('\n\n'));
    }

    lines.push('}');
    const code = lines.join('\n');
    this.b.logWithContext(this, 'buildClass:complete', { className, code }, 'debug');
    return { state: CdFxStateLevel.Success, data: code };
  }

  
  private formatAttributes(attributes: ComponentAttributes[]): string[] {
    return attributes.map((attr) => {
      this.b.logWithContext(this, 'formatAttributes:attr', { attr }, 'debug');

      let attrString = '';

      if (attr.visibility) {
        attrString += `${attr.visibility} `;
      }

      attrString += `${attr.name}`;

      // rules special-case (cRules, uRules, dRules …)
      const isRule =
        typeof attr.name === 'string' &&
        (attr.name.endsWith('Rules') || ['cRules', 'uRules', 'dRules'].includes(attr.name));

      if (attr.type) {
        attrString += `: ${isRule ? 'any' : attr.type}`;
      }

      // assign values
      if (attr.value !== undefined) {
        attrString += ` = ${JSON.stringify(attr.value)}`;
      } else if (attr.defaultValue !== undefined) {
        if (isRule && typeof attr.defaultValue === 'object') {
          // pretty-print the rules object
          const formattedObj = JSON.stringify(attr.defaultValue, null, 2)
            .replace(/"([^"]+)":/g, '$1:') // remove quotes from keys
            .replace(/"/g, `'`); // convert " → '
          attrString += ` = ${formattedObj}`;
        } else {
          attrString += ` = ${JSON.stringify(attr.defaultValue)}`;
        }
      }

      attrString += ';';

      if (attr.isDependency) {
        attrString = `\n  ${attrString}`;
      }

      return `  ${attrString}`;
    });
  }

  private buildClassHeader(nameMap: any, type: string) {
    return `export class ${nameMap.Abcd}${toPascalCase(type)} {`;
  }

}
```

/////////////////////////////////////////////////
Having looked at how cd-cli scafolding works, we can brain storm around the following topics for cd-shell dev-to-runtime codes managent.
I have below 3 serialized and labled illustrations.
Based on experience of the process that we have just documented, we need to do something similar where
1. The scafolding process always make reference to abstruct class for validation 
2. There would be a method for syncing 2 and 3. The can be trigered by developer manually saving or cd-cli controlling cd-shell and trigers the sync method or similarly by ai agent.
3. We can have a specific module in CdShell/sys that is dedicated to this management

Visional objective:
1. We need to think futuristic and beyond the traditional development proceses and expectation and take advantage of the emerging tools.
2. Automation in the interest of DX should take front seat.
Goal:
  - raising the bar for live interactions with dev browser
  - borrow from cd-cli code in terms of saving dev-code as objects during code tranpilation
  - is it possible to make use of git state in a given file to manage auto updates
  - how can we implement watcher that can update browser during development (this is a long term developer dream but is never talked about...and assumed to be imposible. I believe it just that few care to dare)
  - taking advantage of cd-descriptors to manage dev-to-runtime process
  - goal: live response in browser when developer code changes
    - capacity to make changes vie (manaual, cd-cli or ai)
    - capacity to run visual tests of functions for a given module which displays browser or device.



// 1. Base constrain
```ts
// src/CdShell/sys/core/base-controller.ts
export abstract class CdShellController {
  abstract template(): string;
  abstract setup(): void;
  abstract processFormData(): Record<string, any>;

  // optional: override for auth or other actions
  auth?(data: any): void;

  // lifecycle hooks
  onInit?(): void;
  onDestroy?(): void;
}

```

// 2. Developer source
```ts
import { BaseService, ICdResponse } from "../../base";
import { CdShellController } from "../../base/cd-shell.controller";
import { ConsumerModel } from "../../moduleman/models/consumer.model";
import { UserModel } from "../models/user.model";

export class SignInController extends CdShellController {
  private b = new BaseService();

  template(): string {
    return `
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  }

  setup(): void {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password } as UserModel,
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        } as ConsumerModel,
      };
      this.auth(data);
    });
  }

  processFormData(): { username: string; password: string } {
    const username =
      (document.querySelector('[cd-model="username"]') as HTMLInputElement)
        ?.value || "";
    const password =
      (document.querySelector('[cd-model="password"]') as HTMLInputElement)
        ?.value || "";
    return { username, password };
  }

  async auth(data: {
    user: UserModel;
    consumer: ConsumerModel;
  }): Promise<void> {
    console.log('starting SignInController:auth()')
    console.log('SignInController:auth()/data:', data)
    window.cdShell?.progress?.start("Signing in...");
    try {
      const request = this.b.buildBaseRequest(
        { ctx: "Sys", name: "User" },
        { name: "User" },
        "Login",
        { data: data.user, consumer: data.consumer },
        null
      );

      const result = (await this.b.handleRequest(request)) as ICdResponse;
      if (result.app_state.success) {
        window.cdShell?.notify?.success("Login successful");
        window.cdShell?.progress?.done();
        // Proceed to dashboard or main shell load
      } else {
        window.cdShell?.notify?.error(
          result.app_state.info.app_msg || "Login failed"
        );
      }
    } catch (e: any) {
      window.cdShell?.notify?.error(e.message || "Unexpected error");
    } finally {
      window.cdShell?.progress?.done();
    }
  }
}

```
// 3. Runtime managed code
```ts
export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
```

////////////////////////////////////////////////////
I would like you to develop a technical documentation on how corpdesk cd-push module works.
Below are illustrations showing how the push mechanism is used in between module federation modules to syc states.
In particular the cd-user module has a login which returns state including user menu data when successful.
The menu is rendered at the angual cd-shell module. So cd-user sync data with cd-shell via socket.io.client via cd-sio (backend socket.io server)
Antually cd-sio is just cd-api running in the context of socket.io. Normally cd-api would running in port 3001 and cd-sio in port 3002

Due to the limitations in amount of data I can sent at one go, I will be sending the illustrations one by one.
Illustration 1: 
socket.io.client residing in angular library
// projects/core/src/lib/cd-push/sio-client.service.ts
```ts

@Injectable({
  providedIn: 'root',
})
export class SioClientService {
  env: any = null;
  jwtToken = '';
  socket: Socket;
  public message$: BehaviorSubject<string> = new BehaviorSubject('');
  pushDataList: ICdPushEnvelop[] = [];
  constructor(
    private logger: NGXLogger,
  ) {
  }

  setEnv(env: any) {
    this.env = env
  }
  /**
   * - save resource in localStorag so it is sharable
   * with other resources between different client entities
   * - make call to the server to
   *    - save resource in redis for reference by other remote clients
   *    - the same records in redis will be reverenced for persistent socket connection
   */
  registerResource(rGuid: string) {
    // this.resourceGuid = uuidv4();
    const key = rGuid;
    const value: CdObjId = {
      appId: this.env.appId,
      ngModule: 'UserModule',
      resourceName: 'SessionService',
      resourceGuid: rGuid,
      jwtToken: '',
      socket: null,
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null
      }
    }

    const env = {
      ctx: 'Sys',
      m: 'CdPush',
      c: 'Websocket',
      a: 'Create',
      dat: {
        f_vals: [
          {
            data: value
          }
        ],
        token: ''
      },
      args: {}
    }
    localStorage.setItem(key, JSON.stringify(value));
  }


  /**
   * initiate listeners to various events involved
   * in pushing message via push server
   */
  initSio(cls: any, action: any) {
    console.log('cdUiLib::SioClientService::initSio()/01')
    this.socket = io(this.env.sioEndpoint, this.env.sioOptions);
    console.log("cdUiLib::SioClientService::initSio()/this.socket:", this.socket)

    // this.registerResource(rGuid)

    /**
     * injecting extra listeners from 
     * implementing class
     */
    // extListiners(this);

    if (action) {
      this.listenSecure('push-registered-client', cls, action)
        .subscribe((payLoadStr: any) => {
          console.log('initSio::listenSecure/action=push-registered-client')
          console.log('initSio::listenSecure/action=push-registered-client/payLoadStr:', payLoadStr)
          action(cls, 'push-registered-client', payLoadStr)
        })

      this.listenSecure('push-msg-pushed', cls, action)
        .subscribe((payLoadStr: any) => {
          console.log('initSio::listenSecure/action=push-msg-pushed')
          console.log('initSio::listenSecure/action=push-msg-pushed/payLoadStr:', payLoadStr)
          action(cls, 'push-msg-pushed', payLoadStr)
        })
    }

    /**
     * Send receives 'push-msg-relayed' event when
     * message has been received by server and pushed 
     * to client. No action is expected from the sender
     * listen for notification that a given message has reached the server
     * and ready for pushing
     */
    this.listenSecure('push-msg-relayed')
      .subscribe((payLoadStr: string) => {
        console.log('cdUiLib::SioClientService::initSio()/listenSecure()/push-msg-relayed/:payLoadStr:', payLoadStr)
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          console.log('cdUiLib::SioClientService::initSio()/listenSecure(msg-relayed)payLoad:', payLoad)
          this.updateRelayed(payLoad)
        }
      })

    /**
   * Recepient waits for notification of messaged pushed
   */
    this.listenSecure('push-msg-pushed')
      .subscribe((payLoadStr: string) => {
        console.log('cdUiLib::SioClientService::initSio()/listenSecure()/push-delivered/:payLoadStr:', payLoadStr)
        // this confirms a given message was received
        // mark local send message as delivered
        // this.messageList.push(message);
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          // sender to flag that sent message is received
          this.notificationAcceptDelivery(payLoad)
        }
      })



    /**
     * Sender waits for notification to message delivered
     * It responds by sending completion message to server.
     * Server is to save records but no further action
     * Server would mark the commTrack as completed
     * listening by r for notification that a given message
     * has been seccussfully delivered
     */
    this.listenSecure('push-delivered')
      .subscribe((payLoadStr: string) => {
        console.log('cdUiLib::SioClientService::initSio()/listenSecure()/push-delivered/:payLoadStr:', payLoadStr)
        // this confirms a given message was received
        // mark local send message as delivered
        // this.messageList.push(message);
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
          // sender to flag that sent message is received
          this.notificationMsgComplete(payLoad)
        }
      })

  }

  public sendMessage(msg: string) {
    console.log('cdUiLib::SioClientService::sendMessage()/msg', msg)
    if (this.socket) {
      this.socket.emit('message', msg);
    } else {
      console.log('cdUiLib::SioClientService::sendMessage() error: socket is invalid')
    }

  }

  public sendPayLoad(pushEnvelope: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::sendPayLoad/01/pushEnvelope:', pushEnvelope)
    if ('pushData' in pushEnvelope) {
      if ('pushGuid' in pushEnvelope.pushData) {
        console.log('cdUiLib::SioClientService::sendPayLoad/02/this.socket:', this.socket)
        // every message has a unique id
        // pushEnvelope.pushData.pushGuid = uuidv4();
        if (this.socket) {
          this.logger.log("cdUiLib::SioClientService::sendPayLoad/:socket is available")
          const msg = JSON.stringify(pushEnvelope);
          this.socket.emit(pushEnvelope.pushData.triggerEvent, msg);
        } else {
          this.logger.error("cdUiLib::SioClientService::sendPayLoad/:unable to push message. socket is null")
        }
      } else {
        this.logger.error('cdUiLib::SioClientService::sendPayLoad/01/triggerEvent missing in payLoad.pushData')
      }
    } else {
      this.logger.error('cdUiLib::SioClientService::sendPayLoad/01/pushData missing in pushEnvelope')
    }

  }

  public listenSecure = (emittEvent: string, cls = null, action: any = null) => {
    console.log('cdUiLib::SioClientService::listenSecure()/01/emittEvent:', emittEvent)
    console.log('cdUiLib::SioClientService::listenSecure()/this.socket:', this.socket)
    if (this.socket) {
      this.socket.on(emittEvent, (payLoadStr: any) => {

        /**
         * - check if confirmation process is enabled
         * - prepare confirmation message back to sender
         *    - flag message as recieved
         *    - set triggerEvent event to 'msg-delivered' for server processing
         *    - set emittEvent event to 'msg-delivered' for server processing
         *    - trim (remove unessary load) payload for confirmation message
         * - send confirmation message to sender
         */
        let triggerEvent = null;
        if (payLoadStr) {
          console.log('cdUiLib::SioClientService::listenSecure()/emittEvent/01/emittEvent:', emittEvent)
          console.log('cdUiLib::SioClientService::listenSecure()/payLoadStr:', payLoadStr)
          const payLoad: ICdPushEnvelop = payLoadStr;
          // if (emittEvent === 'push-registered-client') {
          //   action(cls, payLoadStr)
          // }
          // if (emittEvent == 'push-registered-client') {
          //   action(cls,emittEvent, payLoad)
          // }

          if (action) {
            action(cls, emittEvent, payLoad);
          }

          if ('pushData' in payLoad && action) {
            console.log('cdUiLib::SioClientService::listenSecure/2')
            if ('triggerEvent' in payLoad.pushData) {
              console.log('cdUiLib::SioClientService::listenSecure/3')
              triggerEvent = payLoad.pushData.triggerEvent;
            } else {
              console.log('cdUiLib::SioClientService::listenSecure()/triggerEvent missing in payLoad.pushData')
            }

          } else {
            console.log('cdUiLib::SioClientService::listenSecure()/pushData missing in payLoad')
          }


          /**
           * 
           * if emittEvent === 'msg-delivered-push', 
           * it means end of cycle of messaging, no need to 
           * send another confirmation message, so...
           *    - do not send confirmation message
           *    - 
           */
          console.log('cdUiLib::SioClientService::listenSecure/4')
          console.log('listenSecure()/emittEvent/04/emittEvent:', emittEvent)
          if (emittEvent === 'push-msg-relayed') {
            /**
             * proceed with normal message reception,
             * do not send another emittEvent = 'msg-delivered-push'
             */
            console.log('cdUiLib::SioClientService::listenSecure/5')
            // this.message$.next(payLoadStr);
          } else {
            /**
             * send confirmation massage
             *  - set triggerEvent = 'msg-delivered'
             *  - set emittEvent = 'msg-delivered-push'
             */
            console.log('cdUiLib::SioClientService::listenSecure/6')
            if (emittEvent === 'push-msg-relayed') {

            }
            // else {
            //   this.sendPayLoad(payLoad)
            // }
            if (emittEvent === 'push-msg-pushed') {
              this.notificationAcceptDelivery(payLoadStr)
            }

            if (emittEvent === 'push-delivered') {
              this.notificationMsgComplete(payLoadStr)
            }

          }
        }

      });
    } else {
      console.log('cdUiLib::SioClientService::listenSecure()/error: socket is invalid')
    }

    return this.message$.asObservable();
  }

  /**
   * No action is expected from sender.
   * No message to send to server
   * Optionally, the sender can do its own house
   * data updates and records.
   * @param payLoad 
   */
  updateRelayed(payLoad: ICdPushEnvelop) {
    console.log('updateRelayed()/01')
    console.log('updateRelayed()/payLoad:', payLoad)
    /**
     * update record of send messages
     */
  }

  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/01')
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/senderAcceptDelivery:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.deliveryTime = Number(new Date());
    payLoad.pushData.commTrack.delivered = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-received';
    /**
     * reverse sender and receiver subTypeId
     */
    this.sendPayLoad(payLoad);
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/01')
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/1:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.completedTime = Number(new Date());
    payLoad.pushData.commTrack.completed = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-completed'
    console.log('cdUiLib::SioClientService::notificationMsgComplete/2:', payLoad)
    /**
     * reverse sender and receiver subTypeId
     */
    this.sendPayLoad(payLoad);
  }
}

```

Illustration 2:
Login component residing in cd-user module federation remote module.
It has no conventional way of letting the shell know that login has succeeded or failed. So it uses socket.io.client from the angular library to push message the the shell via the cd-api server.
```ts

interface IInitData {
  key: string;
  value: CdObjId;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // providers:[UserService],
})

export class LoginComponent implements OnInit {
  debug = true;
  baseModel: BaseModel;
  resourceGuid = uuidv4();
  jwtWsToken: null;
  loginInvalid = false;
  rememberMe = true;
  submitted = false;
  fg: FormGroup;
  postData: any;
  errMsg: any;
  error = '';
  sidebarInitData: IInitData;
  socketData: ISocketItem[] | null = [];
  routParams = {
    queryParams: { token: '' },
    skipLocationChange: true,
    replaceUrl: false
  };

  constructor(
    private logger: NGXLogger,
    private svSio: SioClientService,
    private svSioTest: SioClientTestService,
    private svWss: WebsocketService,
    private svUser: UserService,
    private svSess: SessService,
    private svMenu: MenuService,
    private svNav: NavService,
    private route: Router,
    private svBase: BaseService,
  ) {
    // this.svSio.env = environment;
    // this.svSio.initSio(null, null);
    this.fg = new FormGroup({
      userName: new FormControl(),
      password: new FormControl(),
      rememberMe: new FormControl()
    });
  }

  ngOnInit() {
    this.logger.info('cd-user/LoginComponent::ngOnInit()/StorageType.CdObjId:', StorageType.CdObjId);
    // this.logger.debug('AppComponent initialized');
    this.initialize()
  }

  login(fg: any) {
    this.logger.info('starting cd-user/LoginComponent::login');
    let authData: AuthData = fg.value;
    const valid = fg.valid;
    this.logger.info('cd-user/LoginComponent::login/01');
    this.logger.info('cd-user/LoginComponent::login/fg:', fg);
    this.logger.info('cd-user/LoginComponent::login/valid:', valid);
    this.submitted = true;
    const consumerGuid = { consumerGuid: environment.consumerToken };
    authData = Object.assign({}, authData, consumerGuid); // merge data with consumer object
    try {
      this.logger.info('cd-user/LoginComponent::login/02');
      if (valid) {
        this.logger.info('cd-user/LoginComponent::login/03');
        this.initSession(authData);
      }
    } catch (err) {
      this.logger.info('cd-user/LoginComponent::login/04');
      this.errMsg = "Something went wrong!!"
      this.loginInvalid = true;
    }
  }

  /**
   * Initialize
   */
  initialize(): void {
    this.logger.info('cd-user/LoginComponent::initialize()/01');
    const filter: LsFilter = {
      storageType: StorageType.CdObjId,
      cdObjId: {
        appId: localStorage.getItem('appId'),
        resourceGuid: null,
        resourceName: 'SidebarComponent',
        ngModule: 'SharedModule',
        jwtToken: localStorage.getItem('accessToken'),
        socket: null,
        commTrack: null
      }
    }
    this.logger.info('cd-user/LoginComponent::initialize()/filter:', filter);
    // this.sidebarInitData = this.svBase.searchLocalStorage(filter);
    this.sidebarInitData = this.searchLocalStorage(filter);
    this.logger.info('cd-user/LoginComponent::initialize()/this.sidebarInitData:', this.sidebarInitData);
    const socketDataStr = localStorage.getItem('socketData')
    if (socketDataStr) {
      this.socketData = JSON.parse(socketDataStr).filter(appInit)
      function appInit(s: ISocketItem): ISocketItem | null {
        if (s.name === 'appInit') {
          return s;
        } else {
          return null;
        }
      }
      this.logger.info('cd-user/LoginComponent::initialize()/this.socketData:', this.socketData);
    } else {
      this.logger.info('Err: socket data is not valid')
    }
    this.setAppId();
  }

  setAppId() {
    console.log('cd-user/LoginComponent::setAppId()/01')
    console.log('cd-user/LoginComponent::setAppId()/this.svSio.socket:', this.svSio.socket)
    localStorage.removeItem('appId');
    // localStorage.setItem('appId', this.svBase.getGuid());
    const appId = localStorage.getItem('appId');
    console.log('cd-user/LoginComponent::setAppId()/appId:', appId)
    const envl: ICdPushEnvelop = this.configPushPayload('register-client', 'push-registered-client', 1000)
    console.log('cd-user/LoginComponent::setAppId()/envl:', envl)
    // this.svSio.sendPayLoad(envl)

    // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu
    this.listen('push-registered-client')
    this.listen('push-msg-relayed')
    this.listen('push-msg-pushed')
    this.listen('push-delivered')
    this.listen('msg-relayed')
    this.listen('msg-menu')
    this.listen('push-menu')
    this.sendSioMessage(envl)
  }

  initSession(authData: AuthData) {
    this.logger.info('cd-user/LoginComponent::initSession/01');
    this.svUser.auth$(authData).subscribe((res: any) => {
      if (res.app_state.success === true) {
        this.logger.info('cd-user/LoginComponent::initSession/res:', JSON.stringify(res));
        this.svSess.appState = res.app_state;
        /*
        create a session on successfull authentication.
        For subsequeng successull request to the server,
        use renewSess(res);
        */
        if (res.app_state.sess.cd_token !== null && res.app_state.success) {
          this.logger.info('cd-user/LoginComponent::initSession/02');
          const envl: ICdPushEnvelop = this.configPushPayload('login', 'push-menu', res.data.userData.userId)
          envl.pushData.m = res.data.menuData;
          envl.pushData.token= res.app_state.sess.cd_token
          this.logger.info('cd-user/LoginComponent::initSession/envl:', envl);

          if (environment.wsMode === 'sio') {
            this.logger.info('cd-user/LoginComponent::initSession/envl:...using sio');
            this.sendSioMessage(envl)

          }

          if (environment.wsMode === 'wss') {
            this.logger.info('cd-user/LoginComponent::initSession/envl:...using wss');
            this.svWss.sendMsg(envl)
          }

          ///////////////////////////////////////
          this.svSess.createSess(res, this.svMenu);
          this.svUser.currentUser = { name: `${res.data.userData.userName}`, picture: `${environment.shellHost}/user-resources/${res.data.userData.userGuid}/avatar-01/a.jpg` };
          this.svNav.userMenu = [
            { title: 'Profile', link: '/pages/cd-auth/register' },
            { title: 'Log out', link: '/pages/cd-auth/logout' }
          ];
          // this.baseModel.sess = res.app_state.sess;
          const params = {
            queryParams: { token: res.app_state.sess.cd_token },
            skipLocationChange: true,
            replaceUrl: false
          };
          // below: old method
          // this.route.navigate(['/comm'], params);
          // this.route.navigate(['/dashboard'], params);
          this.route.navigate([environment.initialPage], params);


          // below new method based on this.baseModel;
          // this.svNav.nsNavigate(this,'/comm','message from cd-user')
        }
      } else {
        this.errMsg = "The userName and password were not valid"
        this.loginInvalid = true;
        this.svSess.logout();
      }
    });

  }

  // push-registered-client, push-srv-received, push-msg-relayed, push-msg-pushed, push-delivered, push-msg-completed, push-srv-received, registered, push-menu, push-memo
  listen(event) {
    this.logger.info('cd-shell/cd-user/LoginComponent::listen/event:', event);
    // Listen for incoming messages
    this.svSioTest.sioListen(event).subscribe({
      next: (payLoad: ICdPushEnvelop) => {
        // console.log('cd-shell/cd-user/LoginComponent::listen/Received payLoad:', payLoadStr);
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        console.log('cd-user/LoginComponent::pushSubscribe()/payLoad:', payLoad);
        // Handle the message payload
        // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu 
        switch (payLoad.pushData.emittEvent) {
          case 'push-msg-relayed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-relayed event")
            this.updateRelayed(payLoad)
            break;
          case 'push-msg-pushed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-pushed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-pushed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-pushed event")
            this.notificationAcceptDelivery(payLoad)
            break;
          case 'push-delivered':
            console.log('cd-user/LoginComponent::listenSecure()/push-delivered/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-delivered/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-delivered-client event")
            this.notificationMsgComplete(payLoad)
            break;

          case 'push-registered-client':
            console.log('cd-user/LoginComponent::listenSecure()/push-registered-client/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-registered-client/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-registered-client event")
            this.saveSocket(payLoad);
            break;

          case 'msg-relayed':
            console.log('cd-user/LoginComponent::listenSecure()/msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle msg-relayed event")
            break;
          case 'push-msg-completed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-completed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-completed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-completed event")
            break;
          case 'push-srv-received':
            console.log('cd-user/LoginComponent::listenSecure()/push-srv-received/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-srv-received/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-srv-received event")
            break;
          case 'push-menu':
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad:', payLoad)
            console.log("handle push-menu event")
            this.routParams.queryParams.token = payLoad.pushData.token;
            // this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
            // load appropriate menu
            // this.htmlMenu(payLoad.resp.data,payLoad.pushData.token);
            break;
        }

      },
      error: (error) => {
        console.error('cd-shell/cd-user/LoginComponent::listen/Error receiving message:', error);
      },
      complete: () => {
        console.log('cd-shell/cd-user/LoginComponent::listen/Message subscription complete');
      }
    })
  }


  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/01')
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/senderAcceptDelivery:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.deliveryTime = Number(new Date());
    payLoad.pushData.commTrack.delivered = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-received';
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/01')
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/1:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.completedTime = Number(new Date());
    payLoad.pushData.commTrack.completed = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-completed'
    console.log('cdUiLib::SioClientService::notificationMsgComplete/2:', payLoad)
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  sendSioMessage(envl: ICdPushEnvelop): void {
    this.logger.info('cd-user/LoginComponent::sendSioMessage/envl:', envl);
    this.svSioTest.sendMessage(envl.pushData.triggerEvent, envl).subscribe({
      next: (response: boolean) => {
        console.log('Message sent successfully:', response);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
      complete: () => {
        console.log('Message sending complete');
      }
    });
  }

  configPushPayload(triggerEvent: string, emittEvent: string, cuid: number | string): ICdPushEnvelop {
    console.log('starting cd-user::LoginComponent::configPushPayload()');
    this.resourceGuid = this.svBase.getGuid();


    const pushEnvelope: ICdPushEnvelop = {
      pushData: {
        pushGuid: '',
        m: '',
        pushRecepients: [],
        triggerEvent: '',
        emittEvent: '',
        token: '',
        isNotification: null,
        appSockets: this.socketData,
        isAppInit: true,
        commTrack: {
          initTime: Number(new Date()),
          relayTime: null,
          relayed: false,
          pushed: false,
          pushTime: null,
          deliveryTime: null,
          delivered: false,
          completed: false,
          completedTime: null
        },
      },
      req: null,
      resp: null
    }

    console.log('cd-user::LoginComponent::configPushPayload()/this.resourceGuid:', this.resourceGuid);
    const key = this.resourceGuid;
    const cdObj: CdObjId = {
      appId: localStorage.getItem('appId')!,
      ngModule: 'UserFrontModule',
      resourceName: 'LoginComponent',
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
      socket: null,
      socketId: '',
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null
      },
    }

    localStorage.setItem(key, JSON.stringify(cdObj));

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: cdObj,
      },
    ]

    const envl: ICdPushEnvelop = { ...pushEnvelope };
    envl.pushData.triggerEvent = triggerEvent;
    envl.pushData.emittEvent = emittEvent;

    // set sender
    const uSender: any = { ...users[0] }
    uSender.subTypeId = 1;
    envl.pushData.pushRecepients.push(uSender)


    if (triggerEvent === 'login') {
      this.logger.info('cd-user/LoginComponent::configPushPayload()/triggerEvent==login:');
      // set recepient
      this.logger.info('cd-user/LoginComponent::configPushPayload()/this.sidebarInitData:', JSON.stringify(this.sidebarInitData));
      this.logger.info('cd-user/LoginComponent::configPushPayload()/this.sidebarInitData.value:', JSON.stringify(this.sidebarInitData.value));
      const uRecepient: any = { ...users[0] }
      uRecepient.subTypeId = 7;
      this.logger.info('cd-user/LoginComponent::configPushPayload()/uRecepient:', JSON.stringify(uRecepient));
      uRecepient.cdObjId = this.sidebarInitData.value
      envl.pushData.pushRecepients.push(uRecepient)

    }

    this.logger.info('cd-user/LoginComponent::configPushPayload()/envl:', JSON.stringify(envl));
    return envl;

  }

  saveSocket(payLoad: ICdPushEnvelop) {
    console.log('cd-user/LoginComponent::saveSocket()/payLoad:', payLoad);
    /**
     * - get socketStore
     * - search socketStore for item with name='appInit'
     * - remove existing item with the same key
     * - save socketData to LocalStorage with resourceGuide as reference
     */
    const socketData: ISocketItem[] | null = payLoad.pushData.appSockets.filter(appInit)
    function appInit(s: ISocketItem): ISocketItem | null {
      if (s.name === 'appInit') {
        return s;
      } else {
        return null;
      }
    }

    if (socketData.length > 0) {
      const socketStr = JSON.stringify(socketData)
      localStorage.removeItem('socketData');
      localStorage.setItem('socketData', socketStr);
    }
  }

  /**
   * No action is expected from sender.
   * No message to send to server
   * Optionally, the sender can do its own house
   * data updates and records.
   * @param payLoad 
   */
  updateRelayed(payLoad: ICdPushEnvelop) {
    console.log('updateRelayed()/01')
    console.log('updateRelayed()/payLoad:', payLoad)
    /**
     * update record of send messages
     */
  }

  searchLocalStorage(f: LsFilter) {
    this.logger.info('starting cd-user/LoginComponent::searchLocalStorage()/lcLength:');
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/f:', f);
    // const lc = { ...localStorage };
    const lcArr = [];

    const lcLength = localStorage.length;
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/lcLength:', lcLength);
    let i = 0;
    for (let i = 0; i < localStorage.length; i++) {
      // try {
      // set iteration key name
      const k = localStorage.key(i);
      // use key name to retrieve the corresponding value
      var v = localStorage.getItem(k!);
      // this.logger.info the iteration key and value
      this.logger.info('Key: ' + k + ', Value: ' + v);
      try {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/1')
        if (typeof (v) === 'object') {
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/2')
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/v:', v)
          const lcItem = JSON.parse(v!);
          if ('success' in lcItem) {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/3')
            const appState: IAppState = lcItem;
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/appState:', appState)
          }
          if ('resourceGuid' in lcItem) {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/4')
            const cdObjId = lcItem;
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/cdObjId:', cdObjId)
          }
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/5')
          lcArr.push({ key: k, value: JSON.parse(v!) })
        } else {
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/typeof (v):', typeof (v))
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/6')
          lcArr.push({ key: k, value: JSON.parse(v) })
        }

      } catch (e) {
        this.logger.info('offending item:', v);
        this.logger.info('the item is not an object');
        this.logger.info('Error:', e);
      }

    }
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/lcArr:', lcArr);
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
    // isAppState
    // const resourceName = 'UserModule';
    const AppStateItems = (d: any) => 'success' in d.value;
    const isObject = (d: any) => typeof (d.value) === 'object';
    const CdObjIdItems = (d: any) => 'resourceName' in d.value;
    const filtObjName = (d: any) => d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule;
    const latestItem = (prev: any, current: any) => (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
    let ret: any = null;
    try {
      if (this.debug) {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/debug=true:');
        ret = lcArr
          .filter((d: any) => {
            if (typeof (d.value) === 'object') {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByObject: d:', d);
              return d
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            if ('resourceName' in d.value) {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByResourceNameField: d:', d);
              return d;
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d:', d);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d.value.resourceName:', d.value.resourceName);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d.value.ngModule:', d.value.ngModule);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: f.cdObjId!.ngModule:', f.cdObjId!.ngModule);
            if (d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule) {
              return d;
            } else {
              return null;
            }
          })
          .reduce(
            (prev = {}, current = {}) => {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/prev:', prev);
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/current:', current);
              return (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
            }
          );
      } else {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/debug=false:');
        ret = lcArr
          .filter(isObject)
          .filter(CdObjIdItems!)
          .filter(filtObjName!)
          .reduce(latestItem!)
      }
      this.logger.info('cd-user/LoginComponent::searchLocalStorage()/ret:', ret);
    } catch (e) {
      this.logger.info('Error:', e);
    }
    return ret;
  }

  onFocus() {
    this.errMsg = "";
  }

}
```

Illustration 3:
Module federation shell, listens for messages from various remote modules including login status from cd-user.
```ts
/**
 * note: sender.cdObjId.resourceGuid is used to id the sender and the origin app.
 */

let $ = new HtmlElemService();
interface IdleTimerOptions {
  inactivityTime: number;
  actionCallback: () => void;
}
const idleTimerOptions: IdleTimerOptions = {
  inactivityTime: 900,
  actionCallback: () => {
    console.log("starting actionCallback()");
  },
};

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
  styleUrls: ["./sidebar.component.scss"],
})
export class SidebarComponent implements OnInit, AfterViewInit {
  resourceName = "SidebarComponent";

  resourceGuid = "";
  cdToken = "";
  recepientData: ICommConversationSub;
  jwtWsToken = "";
  menu: any;
  menuItems = [] as any;
  @ViewChild("sideMenu") sideMenu: ElementRef;
  toggleEvents: number[] = [];
  routParams = {
    queryParams: { token: "" },
    skipLocationChange: true,
    replaceUrl: false,
  };

  // for pusher
  messages: string[] = [];
  newMessage = "";

  sioSocket: any;

  constructor(
    private logger: NGXLogger,
    private elementRef: ElementRef,
    private eventService: EventService,
    private router: Router,
    private svMenu: MenuService,
    private svWs: WebsocketService,
    private svHtml: HtmlElemService,
    private svUser: UserService,
    private svIdleTimeout: IdleTimeoutService,
    public cd: ChangeDetectorRef,
    private svBase: BaseService,
    private svSio: SioClientService,
    private svSioTest: SioClientTestService,
    private svPusher: PusherService,
    private communicationService: CommunicationService,
    private svUserProfile: UserProfileService,
    private svInteRact: InteRactPubService
  ) {
    // this.svSio.env = environment;
    // this.svSio.initSio(this, this.socketAction);
    $ = this.svHtml;
    router.events.forEach((event) => {
      if (event instanceof NavigationEnd) {
        this._activateMenuDropdown();
      }
    });
  }

  ngOnInit(): void {
    console.log("starting SidebarComponent::ngOnInit()");
    this.initialize();
  }

  ngAfterViewInit() {
    console.log("starting ngAfterViewInit()");
    this._activateMenuDropdown();
    this.initSession();
  }

  saveSocket(payLoad: ICdPushEnvelop) {
    console.log("SidebarComponent::saveSocket()/payLoad:", payLoad);
    /**
     * - get socketStore
     * - search socketStore for item with name='appInit'
     * - remove existing item with the same key
     * - save socketData to LocalStorage with resourceGuide as reference
     */
    const socketData: ISocketItem[] | null =
      payLoad.pushData.appSockets.filter(appInit);
    function appInit(s: ISocketItem): ISocketItem | null {
      if (s.name === "appInit") {
        return s;
      } else {
        return null;
      }
    }

    if (socketData.length > 0) {
      const socketStr = JSON.stringify(socketData);
      localStorage.removeItem("socketData");
      localStorage.setItem("socketData", socketStr);
    }
  }

  setAppId() {
    console.log("SidebarComponent::setAppId()/01");
    console.log(
      "SidebarComponent::setAppId()/this.svSio.socket:",
      this.svSio.socket
    );
    localStorage.removeItem("appId");
    localStorage.setItem("appId", this.svBase.getGuid());
    const appId = localStorage.getItem("appId");
    console.log("SidebarComponent::setAppId()/appId:", appId);
    const envl: ICdPushEnvelop = this.configPushPayload(
      "register-client",
      "push-registered-client",
      1000
    );
    console.log("SidebarComponent::setAppId()/envl:", envl);
    // this.svSio.sendPayLoad(envl)

    this.listen("push-registered-client");
    this.listen("push-msg-relayed");
    this.listen("push-msg-pushed");
    this.listen("push-delivered");
    this.listen("msg-relayed");
    this.listen("msg-menu");
    this.listen("push-menu");
    this.sendSioMessage(envl);
  }

  configPushPayload(
    triggerEvent: string,
    emittEvent: string,
    cuid: number | string
  ): ICdPushEnvelop {
    console.log("starting cd-shell-v2::SidebarComponent::configPushPayload()");
    this.resourceGuid = this.svBase.getGuid();

    const pushEnvelope: ICdPushEnvelop = {
      pushData: {
        pushGuid: "",
        m: "",
        pushRecepients: [],
        triggerEvent: "",
        emittEvent: "",
        token: "",
        isNotification: null,
        appSockets: [],
        isAppInit: true,
        commTrack: {
          initTime: Number(new Date()),
          relayTime: null,
          relayed: false,
          pushed: false,
          pushTime: null,
          deliveryTime: null,
          delivered: false,
          completed: false,
          completedTime: null,
        },
      },
      req: null,
      resp: null,
    };

    console.log(
      "cd-shell-v2::SidebarComponent::configPushPayload()/this.resourceGuid:",
      this.resourceGuid
    );
    const key = this.resourceGuid;
    const cdObj: CdObjId = {
      appId: localStorage.getItem("appId")!,
      ngModule: "SharedModule",
      resourceName: "SidebarComponent",
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
      socket: null,
      socketId: "",
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null,
      },
    };

    localStorage.setItem(key, JSON.stringify(cdObj));

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: cdObj,
      },
    ];

    const envl: ICdPushEnvelop = { ...pushEnvelope };
    envl.pushData.triggerEvent = triggerEvent;
    envl.pushData.emittEvent = emittEvent;

    // set sender
    const uSender: any = { ...users[0] };
    uSender.subTypeId = 1;
    envl.pushData.pushRecepients.push(uSender);

    /**
     * recepient is only used when sending message to
     * remote user or component.
     * In this case we are just connecting and
     * collecting connection info.
     */
    // set recepient
    // const uRecepient: any = { ...users[0] }
    // uRecepient.subTypeId = 7;
    // envl.pushData.pushRecepients.push(uRecepient)

    console.log(
      "starting cd-shell-v2::SidebarComponent::configPushPayload()/envl:",
      envl
    );

    return envl;
  }

  registerWsService() {
    console.log("SidebarComponent::registerWsService()/01");
    this.resourceGuid = this.svBase.getGuid();
    console.log(
      "SidebarComponent::registerWsService()/this.resourceGuid:",
      this.resourceGuid
    );
    const key = this.resourceGuid;
    const value: CdObjId = {
      appId: localStorage.getItem("appId")!,
      ngModule: "SharedModule",
      resourceName: "SidebarComponent",
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
      socket: null,
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null,
      },
    };

    const env = {
      ctx: "Sys",
      m: "CdPush",
      c: "Websocket",
      a: "Create",
      dat: {
        f_vals: [
          {
            data: value,
          },
        ],
        token: "",
      },
      args: {},
    };
    localStorage.setItem(key, JSON.stringify(value));
  }

  idleTimerCallback() {
    // console.log('starting idleTimerCallback()');
    this.router.navigate(["/user/login"]);
    return true;
  }

  /**
   * Initialize
   */
  initialize(): void {
    console.log("starting initialize()");

    // register itself with the CommunicationService when it initializes
    this.communicationService.registerSidebar(this);

    //initialize socket.io service
    // this.svSio.env = environment;
    // this.svSio.initSio(this, this.socketAction);
    this.setAppId();

   
  listen(event) {
    this.logger.info("cd-shell/SidebarComponent::listen/event:", event);
    // Listen for incoming messages
    this.svSioTest.sioListen(event).subscribe({
      next: (payLoad: ICdPushEnvelop) => {
        // console.log('cd-shell/SidebarComponent::listen/Received payLoad:', payLoadStr);
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        console.log("SidebarComponent::pushSubscribe()/payLoad:", payLoad);
        // Handle the message payload
        switch (payLoad.pushData.emittEvent) {
          case "push-msg-relayed":
            console.log(
              "cd-shell/SidebarComponent::listen()/push-msg-relayed/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-msg-relayed/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log("handle push-msg-relayed event");
            this.updateRelayed(payLoad);
            break;
          case "push-msg-pushed":
            console.log(
              "cd-shell/SidebarComponent::listen()/push-msg-pushed/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-msg-pushed/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log("handle push-msg-pushed event");
            this.notificationAcceptDelivery(payLoad);
            break;
          case "push-delivered":
            console.log(
              "cd-shell/SidebarComponent::listen()/push-delivered/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-delivered/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log("handle push-delivered-client event");
            this.notificationMsgComplete(payLoad);
            break;

          case "push-registered-client":
            console.log(
              "cd-shell/SidebarComponent::listen()/push-registered-client/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-registered-client/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log("handle push-registered-client event");
            this.saveSocket(payLoad);
            break;

          case "msg-relayed":
            console.log(
              "cd-shell/SidebarComponent::listen()/msg-relayed/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/msg-relayed/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log("handle msg-relayed event");
            break;
          case "push-menu":
            console.log(
              "cd-shell/SidebarComponent::listen()/push-menu/:payLoad.pushData.emittEvent:",
              payLoad.pushData.emittEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-menu/:payLoad.pushData.triggerEvent:",
              payLoad.pushData.triggerEvent
            );
            console.log(
              "cd-shell/SidebarComponent::listen()/push-menu/:payLoad:",
              payLoad
            );
            console.log("handle push-menu event");
            break;
        }
      },
      error: (error) => {
        console.error(
          "cd-shell/SidebarComponent::listen/Error receiving message:",
          error
        );
      },
      complete: () => {
        console.log(
          "cd-shell/SidebarComponent::listen/Message subscription complete"
        );
      },
    });
  }

  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log("cd-shell::SidebarComponent::notificationAcceptDelivery()/01");
    console.log(
      "cd-shell::SidebarComponent::notificationAcceptDelivery()/senderAcceptDelivery1:",
      payLoad
    );
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.deliveryTime = Number(new Date());
    payLoad.pushData.commTrack.delivered = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = "msg-received";
    payLoad.pushData.emittEvent = "push-delivered";

    /**
     * extract meta data for the current user
     */
    this.recepientData = payLoad.pushData.pushRecepients.find((recepient) => {
      if (recepient.subTypeId === 7) {
        return recepient.userId;
      }
    });
    let anonSession = false;
    

    /****************************************************************************
     * Setup the notification dropdown
     ****************************************************************************/
    /**
     * At the moment, this is a demo, so we simulate the data via a copy of payLoad
     */
    const payLoadSimulated:ICdPushEnvelop = cloneDeep(payLoad);
    console.log('SidebarComponent::notificationAcceptDelivery()/payLoadSimulated1:', payLoadSimulated)
    if (!payLoadSimulated.resp || !payLoadSimulated.resp.data) {
      payLoadSimulated.resp = {
        app_state: {
          success: false,
          info: {
            messages: [],
            code: "",
            app_msg: "",
          },
          sess: {
            cd_token: '',
            jwt: null,
            ttl: 0,
          },
          cache: {},
          sConfig: {
            usePush: false,
            usePolling: false,
            useCacheStore: false,
          },
        },
        data: notificationDataDefault,
      }
    }
    console.log('SidebarComponent::notificationAcceptDelivery()/payLoadSimulated2:', payLoadSimulated)
    if(this.recepientData.userId === 1000){
      anonSession = true;
      payLoadSimulated.resp.data = notificationDataDefault;
    } else{
      anonSession = false;
      payLoadSimulated.resp.data = notificationDemoData;
    }
    console.log('SidebarComponent::notificationAcceptDelivery()/payLoadSimulated3:', payLoadSimulated)
    this.svInteRact.notificationDropDownData =
      this.svInteRact.mapInteRactToDropdownData(
        payLoadSimulated, 
        {
        anonSession: anonSession,
        userAclType: { aclTypeId: -1 },
      });

    /****************************************************************************
     * Setup the account menu dropdown
     ****************************************************************************/
    /**
     * Fetch user profile and pass it to user profile service: this.svUserProfile.cuUserProfile
     * in the future we will only need the cdToken
     */
    this.svUser
      .getUserProfile$(payLoad.pushData.token, this.recepientData.userId)
      .subscribe((r: any) => {
        const resp: ICdResponse = r;
        if (resp.app_state.success) {
          this.svUserProfile.cuUserProfile = resp.data;
          console.log(
            "cd-shell::SidebarComponent::notificationAcceptDelivery()/resp.data:",
            resp.data
          );
          console.log(
            "cd-shell::SidebarComponent::notificationAcceptDelivery()/this.svUserProfile.cuUserProfile:",
            this.svUserProfile.cuUserProfile
          );

          const ddlMode = {
            anonSession: true,
            userAclType: { aclTypeId: -1 },
          };

          /**
           * If the user is any other than anon, set anonSession to off.
           */
          if (!(this.svUserProfile.cuUserProfile.userData.userId === 1000)) {
            ddlMode.anonSession = false;
          }
          /**
           * Based on the login successfull response, set up the the account menu
           */
          this.svUserProfile.accountDropDownData =
            this.svUserProfile.mapProfileToDropdownData(
              this.svUserProfile.cuUserProfile,
              ddlMode
            );
        } else {
          console.error(
            "cd-shell::SidebarComponent::notificationAcceptDelivery()/Error getting user profile:"
          );
        }
      });

    /**
     * make use of delivered data to populate the menu
     */
    this.htmlMenu(payLoad.pushData.m, payLoad.pushData.token);
    /**
     * reverse sender and receiver subTypeId
     */
    console.log(
      "cd-shell::SidebarComponent::notificationAcceptDelivery()/senderAcceptDelivery2:",
      payLoad
    );
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad);
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log("cd-shell::SidebarComponent::notificationMsgComplete()/01");
    console.log(
      "cd-shell::SidebarComponent::notificationMsgComplete()/1:",
      payLoad
    );
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.completedTime = Number(new Date());
    payLoad.pushData.commTrack.completed = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = "msg-completed";
    console.log(
      "cd-shell::SidebarComponent::notificationMsgComplete/2:",
      payLoad
    );
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad);
  }

  sendSioMessage(envl: ICdPushEnvelop): void {
    this.logger.info(
      "cd-shell/SidebarComponent::sendSioMessage/envl.pushData.triggerEvent:",
      envl.pushData.triggerEvent
    );
    this.logger.info("cd-shell/SidebarComponent::sendSioMessage/envl:", envl);
    this.svSioTest.sendMessage(envl.pushData.triggerEvent, envl).subscribe({
      next: (response: boolean) => {
        console.log("Message sent successfully:", response);
      },
      error: (error) => {
        console.error("Error sending message:", error);
      },
      complete: () => {
        console.log("Message sending complete");
      },
    });
  }

  initSession() {
    const authData = {
      userName: "anon",
      password: "-",
      consumerGuid: environment.consumerToken,
    };
    this.svUser.setEnv(environment);
    this.svUser
      .auth$(authData)
      .pipe(
        map((res: any) => res.data.menuData),
        mergeMap((m) => {
          return this.svMenu.getMenu$(`cdMenu` as MenuCollection, m);
        })
      )
      .subscribe((menuData) => {
        this.htmlMenu(menuData, "");
      });
  }

  /**
   * No action is expected from sender.
   * No message to send to server
   * Optionally, the sender can do its own house
   * data updates and records.
   * @param payLoad
   */
  updateRelayed(payLoad: ICdPushEnvelop) {
    console.log("updateRelayed()/01");
    console.log("updateRelayed()/payLoad:", payLoad);
    /**
     * update record of send messages
     */
  }

  // set all the events that compose-doc should listen to
  pushSubscribe(cls: any) {
    console.log("SidebarComponent::pushSubscribe()/01");

    cls
      .listenSecure("push-registered-client")
      .subscribe((payLoadStr: string) => {
        console.log(
          "SidebarComponent::listen()/push-registered-client/:payLoadStr:",
          payLoadStr
        );
        if (payLoadStr) {
          const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr);
          console.log("SidebarComponent::pushSubscribe()/payLoad:", payLoad);
          this.saveSocket(payLoad);
        }
      });

    cls.listenSecure("push-menu").subscribe((payLoadStr: string) => {
      console.log(
        "SidebarComponent::listen()/push-menu/:payLoadStr:",
        payLoadStr
      );
      if (payLoadStr) {
        const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr);
        console.log("SidebarComponent::pushSubscribe()/payLoad:", payLoad);
        // start idletimeout
        this.routParams.queryParams.token = payLoad.pushData.token;
        this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
        // load menu
        const menuData = JSON.parse(payLoad.pushData.m);
        if (menuData) {
          this.htmlMenu(JSON.parse(payLoad.pushData.m), payLoad.pushData.token);
        }
      }
    });
    //get launch time
    const launchTime = (new Date().getTime() / 1000).toString();

  }

  socketAction(cls, emittEvent, payLoad) {
    console.log("SidebarComponent::socketAction()/01");
    console.log("SidebarComponent::socketAction()/payLoad:", payLoad);
    console.log("SidebarComponent::socketAction()/emittEvent:", emittEvent);
    if (emittEvent == "push-registered-client") {
      cls.onPushRegisteredClient(cls, payLoad);
    }
    if (emittEvent === "push-msg-pushed") {
      cls.onPushMsgPushed(cls, payLoad);
    }
  }

  onPushRegisteredClient(cls: any, payLoadStr) {
    console.log(
      "SidebarComponent::onPushRegisteredClient():payLoadStr:",
      payLoadStr
    );
    if (payLoadStr) {
      cls.saveSocket(payLoadStr);
    }
  }

  onPushMsgPushed(cls: any, payLoad) {
    console.log("SidebarComponent::onPushMsgPushed():payLoad:", payLoad);
    if (payLoad) {
      console.log(
        "SidebarComponent::onPushMsgPushed()/push-menu/:payLoad:",
        payLoad
      );
      if (payLoad) {
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        // const payLoad: ICdPushEnvelop = payLoadStr
        console.log("SidebarComponent::onPushMsgPushed()/payLoad:", payLoad);
        // start idletimeout
        cls.routParams.queryParams.token = payLoad.pushData.token;
        cls.svIdleTimeout.startTimer(cls.cd, idleTimerOptions);
        // load menu
        const menuData = payLoad.pushData.m;
        if (menuData) {
          cls.htmlMenu(payLoad.pushData.m);
        }
      }
    }
  }

  /**
   * remove active and mm-active class
   */
  _removeAllClass(className: any) {
    const els = document.getElementsByClassName(className);
    while (els[0]) {
      els[0].classList.remove(className);
    }
  }

  /**
   * Activate the parent dropdown
   */
  _activateMenuDropdown() {
    this._removeAllClass("mm-active");
    this._removeAllClass("mm-show");
    const links = document.getElementsByClassName("side-nav-link-ref");
    let menuItemEl: any = null;

    const paths: any = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i = 0; i < links.length; i++) {
      // tslint:disable-next-line: no-string-literal
      paths.push(links[i]["pathname"]);
    }
    const itemIndex = paths.indexOf(window.location.pathname);
    if (itemIndex === -1) {
      const strIndex = window.location.pathname.lastIndexOf("/");
      const item = window.location.pathname.substr(0, strIndex).toString();
      menuItemEl = links[paths.indexOf(item)];
    } else {
      menuItemEl = links[itemIndex];
    }

    if (menuItemEl) {
      menuItemEl.classList.add("active");
      const parentEl = menuItemEl.parentElement;

      if (parentEl) {
        parentEl.classList.add("mm-active");

        const parent2El = parentEl.parentElement.closest("ul");
        if (parent2El && parent2El.id !== "side-menu") {
          parent2El.classList.add("mm-show");
          const parent3El = parent2El.parentElement;

          if (parent3El && parent3El.id !== "side-menu") {
            parent3El.classList.add("mm-active");
            const childAnchor = parent3El.querySelector(".has-arrow");
            const childDropdown = parent3El.querySelector(".has-dropdown");

            if (childAnchor) {
              childAnchor.classList.add("mm-active");
            }
            if (childDropdown) {
              childDropdown.classList.add("mm-active");
            }

            const parent4El = parent3El.parentElement;
            if (parent4El && parent4El.id !== "side-menu") {
              parent4El.classList.add("mm-show");
              const parent5El = parent4El.parentElement;
              if (parent5El && parent5El.id !== "side-menu") {
                parent5El.classList.add("mm-active");
                const childanchor = parent5El.querySelector(".is-parent");
                if (childanchor && parent5El.id !== "side-menu") {
                  childanchor.classList.add("mm-active");
                }
              }
            }
          }
        }
      }
    }
  }
  /**
   * Returns true or false if given menu item has child or not
   * @param item menuItem
   */
  hasItems(item: MenuItem) {
    return item.subItems !== undefined ? item.subItems.length > 0 : false;
  }

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.eventService.broadcast("changeLayout", layout);
  }

  /**
   * Light sidebar
   */
  lightSidebar() {
    document.body.setAttribute("data-sidebar", "light");
    document.body.setAttribute("data-topbar", "dark");
    document.body.removeAttribute("data-sidebar-size");
    document.body.removeAttribute("data-layout-size");
    document.body.removeAttribute("data-keep-enlarged");
    document.body.classList.remove("vertical-collpsed");
  }

  /**
   * Compact sidebar
   */
  compactSidebar() {
    document.body.setAttribute("data-sidebar-size", "small");
    document.body.setAttribute("data-sidebar", "dark");
    document.body.removeAttribute("data-topbar");
    document.body.removeAttribute("data-layout-size");
    document.body.removeAttribute("data-keep-enlarged");
    document.body.classList.remove("sidebar-enable");
    document.body.classList.remove("vertical-collpsed");
  }

  /**
   * Icon sidebar
   */
  iconSidebar() {
    document.body.classList.add("sidebar-enable");
    document.body.classList.add("vertical-collpsed");
    document.body.setAttribute("data-sidebar", "dark");
    document.body.removeAttribute("data-layout-size");
    document.body.removeAttribute("data-keep-enlarged");
    document.body.removeAttribute("data-topbar");
  }

  /**
   * Boxed layout
   */
  boxedLayout() {
    document.body.setAttribute("data-keep-enlarged", "true");
    document.body.setAttribute("data-layout-size", "boxed");
    document.body.setAttribute("data-sidebar", "dark");
    document.body.classList.add("vertical-collpsed");
    document.body.classList.remove("sidebar-enable");
    document.body.removeAttribute("data-topbar");
  }

  /**
   * Colored sidebar
   */
  coloredSidebar() {
    document.body.setAttribute("data-sidebar", "colored");
    document.body.removeAttribute("data-sidebar-size");
    document.body.removeAttribute("data-layout-size");
    document.body.classList.remove("vertical-collpsed");
    document.body.removeAttribute("data-topbar");
  }

  async htmlMenu(menuData: MenuItem[], cdToken: string) {
    this.routParams.queryParams.token = cdToken;
    menuData = await this.svMenu.mapMenu(menuData);
    console.log("starting cdShellV2::SidebarComponent/htmlMenu()");
    this.toggleEvents = [];
    console.log("cdShellV2::SidebarComponent/htmlMenu()/01");
    console.log("cdShellV2::SidebarComponent/htmlMenu()/menuData:", menuData);
    if (menuData) {
      this.htmlRootMenu(menuData).then(() => {
        this.activateDropdown(menuData);
      });
    }
  }

  async htmlRootMenu(menuData: MenuItem[]) {
    // clear container
    (document.getElementById("sidebar-menu") as HTMLElement).innerHTML = "";
    let h: HtmlCtx = {
      elementRef: this.elementRef,
      selector: "#sidebar-menu",
      srtHtml: await this.htmlMenuContainer("root", null),
      position: "afterbegin",
    };
    console.log("cdShellV2::SidebarComponent/htmlRootMenu()/01");
    // append root container
    $.append(h).then(async (success) => {
      // build root menus
      let rootMenus = "";
      // if(menuData){
      //   menuData = [];
      // }
      menuData.forEach((mi: MenuItem) => {
        console.log("cdShellV2::SidebarComponent/htmlRootMenu()/02");
        console.log("cdShellV2::SidebarComponent/htmlRootMenu()/mi:", mi);
        rootMenus += this.htmlMenuItem(mi);
      });

      h = {
        elementRef: this.elementRef,
        selector: "#side-menu",
        srtHtml: await rootMenus,
        position: "afterbegin",
      };
      //insert menus to root container
      $.append(h).then(() => {
        console.log("cdShellV2::SidebarComponent/htmlRootMenu()/03");
        console.log(
          "cdShellV2::SidebarComponent/htmlRootMenu()/menuData:",
          menuData
        );
        // for each menu item, set children
        menuData.forEach(async (mi: MenuItem) => {
          console.log("cdShellV2::SidebarComponent/htmlRootMenu()/04");
          console.log(
            "cdShellV2::SidebarComponent/htmlRootMenu()/menuData:",
            menuData
          );
          console.log("cdShellV2::SidebarComponent/htmlRootMenu()/mi:", mi);
          this.htmlChildren(mi, menuData);
        });
      });
    });
  }

  async htmlChildren(mi: MenuItem, parentData: MenuItem[]) {
    console.log("cdShellV2::SidebarComponent/htmlChildren()/01");
    console.log("cdShellV2::SidebarComponent/htmlChildren()/01/mi:", mi);
    let h: HtmlCtx = {
      elementRef: this.elementRef,
      selector: `#li_${mi.id}`,
      srtHtml: await this.htmlMenuContainer("subMenu", mi),
      position: "beforeend",
    };
    // set subMenu container
    await $.append(h).then(async (success) => {
      console.log("cdShellV2::SidebarComponent/htmlChildren()/02");
      console.log("cdShellV2::SidebarComponent/htmlChildren()/02/mi:", mi);
      // set children html
      let htmlSubMenu = "";
      mi.subItems.forEach((sm) => {
        console.log("cdShellV2::SidebarComponent/htmlChildren()/03");
        console.log("cdShellV2::SidebarComponent/htmlChildren()/03/sm:", sm);
        htmlSubMenu += this.htmlMenuItem(sm);
      });
      //insert menus to sub-menu container
      h = {
        elementRef: this.elementRef,
        selector: `#ul_${mi.id}`,
        srtHtml: await htmlSubMenu,
        position: "afterbegin",
      };
      $.append(h).then(() => {
        console.log("cdShellV2::SidebarComponent/htmlChildren()/04");
        console.log(
          "cdShellV2::SidebarComponent/htmlChildren()/parentData:",
          parentData
        );
        this.activateDropdown(parentData);
        mi.subItems.forEach((sm) => {
          console.log("cdShellV2::SidebarComponent/htmlChildren()/05");
          console.log("cdShellV2::SidebarComponent/htmlChildren()/sm:", sm);
          this.setRoutTarget(sm);
        });
      });
    });
  }

  activateDropdown(parentData: MenuItem[]) {
    console.log("SidebarComponent::activateDropdown()/01");
    console.log("SidebarComponent::activateDropdown()/parentData:", parentData);
    parentData.forEach((mi: MenuItem) => {
      console.log("SidebarComponent::activateDropdown()/02");
      const parentElem = document.getElementById(
        `a_${mi.id?.toString()}`
      ) as HTMLElement;
      if (parentElem) {
        console.log("SidebarComponent::activateDropdown()/03");
        console.log("SidebarComponent::activateDropdown()/mi.id:", mi.id);
        if (!this.isRepeatedEvent(mi.id!)) {
          console.log("SidebarComponent::activateDropdown()/04");
          console.log("SidebarComponent::activateDropdown()/mi.id:", mi.id);
          this.saveEvent(mi.id!);
          // add event to menu ul
          parentElem.addEventListener("click", (e: Event) =>
            this.toggleSetting(mi.id)
          );
        }
      }
    });

  }

  saveEvent(id: number) {
    if (id) {
      this.toggleEvents.push(id);
    }
  }

  isRepeatedEvent(id: number) {
    const repeatedEvents = this.toggleEvents.filter((e) => e === id);
    if (repeatedEvents.length > 0) {
      return true;
    } else {
      return false;
    }
  }

  elemExists(selector) {
    const elem = this.elementRef.nativeElement.querySelector(
      selector
    ) as HTMLElement;
    if (elem) {
      return true;
    } else {
      return false;
    }
  }

  async htmlMenuContainer(type, menuItem: MenuItem | null) {
    if (type === "root") {
      return `<ul id="side-menu" class="metismenu list-unstyled"></ul>`;
    } else if (type === "subMenu" && menuItem) {
      return `<ul id="ul_${menuItem.id}" aria-expanded="false" class="sub-menu mm-collapse">`;
    } else {
      return "";
    }
  }

  htmlMenuItem(menuItem: MenuItem): string {
    let hasArrow = "";
    let link = "";
    if ("subItems" in menuItem) {
      if (menuItem.subItems.length > 0) {
        hasArrow = "has-arrow";
      }
    }
    if (menuItem.link) {
      link = 'href="javascript:void(0);"';
    } else {
      link = "";
    }
    return `
        <li id="li_${menuItem.id}" class="mm-active">
          <a id="a_${menuItem.id}" ${link} aria-expanded="false" class="is-parent ${hasArrow} mm-active">
            <i id="i_${menuItem.id}" class="bx ${menuItem.icon}"></i>
            <span id="span_${menuItem.id}">${menuItem.label}</span>
          </a>
        </li>
    `;
  }

  toggleSetting(menuId) {
    const strId = `ul_${menuId.toString()}`;
    const menuItemEl = document.getElementById(strId) as HTMLElement;
    if (menuItemEl) {
      menuItemEl.classList.toggle("active");
      menuItemEl.classList.toggle("mm-show");
    }
  }

  setRoutTarget(menuItem: MenuItem) {
    const strId = `a_${menuItem.id!.toString()}`;
    const menuItemEl = document.getElementById(strId) as HTMLElement;
    if (menuItemEl && menuItem.link) {
      console.log(
        "SidebarComponent::setRoutTarget/this.routParams:",
        this.routParams
      );
      console.log(
        "SidebarComponent::setRoutTarget/this.routParams.queryParams.token:",
        this.routParams.queryParams.token
      );
      if (this.routParams.queryParams.token.length > 30) {
        console.log(
          "SidebarComponent::setRoutTarget/menuItem.link2:",
          menuItem.link
        );
        console.log(
          "SidebarComponent::setRoutTarget/menuItem.moduleIsPublic2:",
          menuItem.moduleIsPublic
        );
        menuItemEl.addEventListener("click", (e: Event) =>
          this.router.navigate([menuItem.link], this.routParams)
        );
      } else {
        console.log("SidebarComponent::setRoutTarget/menuItem:", menuItem);
        console.log(
          "SidebarComponent::setRoutTarget/menuItem.link1:",
          menuItem.link
        );
        console.log(
          "SidebarComponent::setRoutTarget/menuItem.moduleIsPublic1:",
          menuItem.moduleIsPublic
        );
        menuItemEl.addEventListener("click", (e: Event) =>
          this.router.navigate([menuItem.link])
        );
      }
    }
  }

  ngOnDestroy() {
    this.svPusher.unsubscribe("my-channel");
  }
}

```

///////////////////////////////////////////////////////////////////
Below are codes from server side, cd-api.
Notice that the same project, when config.pushService.sio.enabled is true, it runs in the context of cd-sio (corpdesk push server).
It was also developed with capacity to run on websock when config.pushService.wss.enabled is true.
Both sockent.io and websocketan share operational logics.

// src/main.ts
```ts
export class Main {
    logger: Logging;
    allowedOrigins = [config.Cors.options.origin[5]];
    constructor() {
        this.logger = new Logging();
    }
    async run() {
        this.logger.logInfo('Main::run()/01')
        // basic settings
        const app: Application = express();

        // Serve .well-known directory for Let's Encrypt validation
        // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');


        let certAuth = '';
        // just in case certificate authority is not provided
        if (config.caPath.length > 0) {
            certAuth = fs.readFileSync(config.caPath, 'utf8');
        } else {
            certAuth = null
        }

        const credentials = {
            key: privateKey,
            cert: certificate,
            // ca: certAuth
        };


        const options = config.Cors.options;

        ////////////////////////////////////////////////////////////////////////////////
        const corsOptions = {
            origin: config.Cors.options.origin[5], // Replace with your client URL
            // origin: 'http://localhost', // for localhost teting
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        ////////////////////////////////////////////////////////////////////////////////

        let httpsServer = null;
        let corsOpts = null;

        //////////////////////////////////////////////////////////////////////////////
        app.use(cors(corsOptions));
        app.use(express.json()); // For parsing application/json
        app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board
        //////////////////////////////////////////////////////////////////////////////

        // Serve .well-known directory for Let's Encrypt validation
        // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
        app.use(config.http.webroot, express.static(path.join(__dirname, config.http.webroot)));

        // Create HTTP server
        const httpServer = createHttpServer(app);

        // Create HTTPS server
        httpsServer = https.createServer(credentials, app);
        corsOpts = {
            cors: {
                options: config.Cors.options.allowedHeaders,
                origin: config.Cors.options.origin
            }
        }


        /**
         * When run on sio mode in production,
         * use SSL
         * use cors
         */
        if (config.pushService.sio.enabled) {
            this.logger.logInfo('Main::run()/02')

            // const io = new Server(httpsServer, corsOpts);
            /////////////////////////////////////////////////////
            const io = new Server(httpsServer, {
                cors: {
                    origin: config.Cors.options.origin[5],
                    methods: ['GET', 'POST'],
                    credentials: true
                }
            });
            /////////////////////////////////////////////////////

            this.logger.logInfo('Main::run()/03')
            this.logger.logInfo('Main::run()/config.push.mode:', { mode: config.push.mode })
            // let pubClient = getRedisClient();
            let pubClient;
            let subClient;
            switch (config.push.mode) {
                case "PUSH_BASIC":
                    this.logger.logInfo('Main::run()/031')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_CLUSTER":
                    this.logger.logInfo('Main::run()/032')
                    pubClient = new Redis.Cluster(config.push.startupNodes);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_SENTINEL":
                    this.logger.logInfo('Main::run()/033')
                    pubClient = new Redis(config.push.sentinalOptions);
                    subClient = pubClient.duplicate();
                    break;
                default:
                    this.logger.logInfo('Main::run()/034')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
            }

            Promise.all([pubClient, subClient])
                .then(() => {
                    this.logger.logInfo('Main::run()/035')
                    const svSio = new SioService();
                    svSio.run(io, pubClient, subClient)
                });
        }

        /**
         * When run on app mode in production,
         * use without SSL...but behind nginx proxy server fitted with SSL
         * do not use cors...but set it at nginx
         */
        if (config.apiRoute === "/api" && config.secure === "false") {
            console.log("main/04")
            httpsServer = createServer(app);
            corsOpts = {
                cors: {
                    options: config.Cors.options.allowedHeaders,
                    origin: null
                }
            }
        }


        
        app.post('/sio/p-reg/', async (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res);
        });

        


        // set api entry point
        app.post(config.apiRoute, async (req: any, res: any) => {
            console.log("app.post/01")
            res.setHeader('Content-Type', 'application/json');
            ////////////////////
            // res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res, ds);
        });

        if (config.pushService.pusher.enabled) {
            app.post('/notify', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, channel, event } = req.body;
                // this.logger.logInfo("message:", message)
                pusher.trigger(channel, event, { message: "hello from server on '/notify'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/notify-user', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, userId } = req.body;
                const channel = `private-user-${userId}`;

                pusher.trigger(channel, 'user-event', { message: "hello from server on '/notify-user'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/pusher/auth', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const socketId = req.body.socket_id;
                const channel = req.body.channel_name;
                const auth = pusher.authenticate(socketId, channel);
                res.send(auth);
            });
        }

        if (config.pushService.wss.enabled) {

            console.log("main/05")
            const expressServer = app.listen(config.wssPort, () => {
                console.log(`server is listening on ${config.wssPort}`);
            })
                .on('error', (e) => {
                    console.log(`Error:${e}`);
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            // Define the WebSocket server. Here, the server mounts to the `/ws`
            // route of the Express JS server.
            const wss = new WebSocket.Server({
                server: expressServer,
                path: '/ws'
            });
            /**
             * run the websocket
             */
            const cdWs = new WebsocketService();
            cdWs.run(wss);


            // ///////////////////////////////////////////////////
            // const server = createHttpsServer(credentials, app);
            // const wsServer = new WebSocketServer({
            //     httpsServer: server,
            //     autoAcceptConnections: false
            // });


        } else {

            if (config.http.enabled) {
                // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
                httpServer.listen(config.http.port, () => {
                    this.logger.logInfo(`HTTP server listening on port ${config.http.port}`);
                }).on('error', (e) => {
                    this.logger.logError(`HTTP server: listen()/Error: ${e}`);
                });
            }

            // start server
            httpsServer.listen(config.apiPort, () => {
                // console.log(`cd-api server is listening on ${config.apiPort}`);
                this.logger.logInfo(`cd-api server is listening on:`, { port: `${config.apiPort}` })
            })
                .on('error', (e) => {
                    this.logger.logError(`cd-api server: listen()/Error:${e}`)
                });
        }

    }

    originIsAllowed(origin: string) {
        return this.allowedOrigins.includes(origin);
    }

}
```

// src/CdApi/sys/cd-push/services/sio.service.ts
```ts
export class SioService {
    logger: Logging;
    b = new BaseService();

    constructor() {
        this.logger = new Logging();
    }

    run(io, pubClient, subClient) {
        // this.logger.logInfo("SioService::run()/io:", io)
        // this.logger.logInfo("SioService::run()/pubClient:", pubClient)
        // this.logger.logInfo("SioService::run()/subClient:", subClient)
        const port = config.push.serverPort;
        pubClient.on("error", (err) => {
            this.logger.logInfo(`pubClient error: ${JSON.stringify(err)}`);
        });
        io.adapter(createAdapter(pubClient, subClient));
        io.on('connection', (socket) => {
            this.logger.logInfo('a user connected');
            this.runRegisteredEvents(socket, io, pubClient)
            socket.on('disconnect', () => {
                this.logger.logInfo('a user disconnected!');
            });
        });
    }

    /**
     * This array can be a configuration available in the database.
     * There would then be different sets depending on the calling application.
     * This would then mean one server can handle several applications..eg:
     * - memo
     * - tracking financial transaction
     * - authentication process
     * - system transaction tracking
     * triggerEvent: the listening event at the server to handle a given message
     *              or event emitted by the client
     * emittEvent: the listening event at the client to handles a given message
     *              or event emitted by the server
     * sFx: server function that handles a given message
     * 
     * cFx: client function that handles a given message
     */
    getRegisteredEvents(): PushEvent[] {
        this.logger.logInfo('starting getRegisteredEvents()');
        this.testColouredLogs();
        return [
            {
                triggerEvent: 'register-client',
                emittEvent: 'push-registered-client',
                sFx: 'push'
            },
            {
                triggerEvent: 'srv-received',
                emittEvent: 'push-srv-received',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-relayed',
                emittEvent: 'push-msg-relayed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-pushed',
                emittEvent: 'push-msg-pushed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-received',
                emittEvent: 'push-delivered',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-completed',
                emittEvent: 'push-msg-completed',
                sFx: 'push'
            },
            {
                triggerEvent: 'register',
                emittEvent: 'registered',
                sFx: 'push'
            },
            {
                triggerEvent: 'login',
                emittEvent: 'push-menu',
                sFx: 'pushEnvelop'
            },
            {
                triggerEvent: 'send-memo',
                emittEvent: 'push-memo',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-pub',
                emittEvent: 'push-pub',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-react',
                emittEvent: 'push-react',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-menu',
                emittEvent: 'push-menu',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-notif',
                emittEvent: 'push-notif',
                sFx: 'push'
            }
        ]
    }

    runRegisteredEvents(socket, io, pubClient) {
        this.logger.logInfo('SioService::runRegisteredEvents(socket)/01');
        // this.logger.logInfo('SioService::runRegisteredEvents(socket)/socket:', socket);
        // listen to registered events
        this.getRegisteredEvents().forEach((e) => {

            this.logger.logInfo(`SioService::runRegisteredEvents(socket)/e:${JSON.stringify(e)}`);
            socket.on(e.triggerEvent, async (payLoad: string) => {
                console.log('---------------------------------------')
                console.log(`socket.on${e.triggerEvent}`)
                console.log('---------------------------------------')
                this.logger.logInfo(`SioService::runRegisteredEvents()/e.triggerEvent:${e.triggerEvent}`);
                this.logger.logInfo(`SioService::runRegisteredEvents()/payLoad:${JSON.stringify(payLoad)}`);
                const pushEnvelop: ICdPushEnvelop = JSON.parse(payLoad)
                const sender = this.getSender(pushEnvelop.pushData.pushRecepients);
                this.logger.logInfo(`SioService::runRegisteredEvents()/sender:${JSON.stringify(sender)}`);
                await this.persistSenderData(sender, socket, pubClient)
                if (pushEnvelop.pushData.commTrack.completed) {
                    /**
                     * process message completion
                     */
                    this.logger.logInfo('SioService::getRegisteredEvents()/message processing completed')
                    this.logger.logInfo(`SioService::getRegisteredEvents()/pushEnvelop:${pushEnvelop}`);
                    console.log('--------------------------------------------------------------------------')
                    console.log('PROCESS COMPLETED')
                    console.log('--------------------------------------------------------------------------')
                } else {
                    this.relayMessages(pushEnvelop, io, pubClient)
                }

            });
        })
    }

    getSender(pushRecepients: ICommConversationSub[]): ICommConversationSub {
        return pushRecepients.filter((r) => r.subTypeId === 1)[0]
    }

    resourceHasSocket() {
        // confirm if resource has socket already
    }

    async persistSenderData(sender: ICommConversationSub, socket, pubClient) {
        this.logger.logInfo(`SioService::persistSenderData/01/socket.id: ${socket.id}`);
        sender.cdObjId.socketId = socket.id;
        const k = sender.cdObjId.resourceGuid;
        const v = JSON.stringify(sender);
        this.logger.logInfo(`SioService::persistSenderData()/k:${k}`);
        this.logger.logInfo(`SioService::persistSenderData()/v:${v}`);
        return await this.b.wsRedisCreate(k, v);
    }

    relayMessages(pushEnvelop: ICdPushEnvelop, io, pubClient) {
        if (pushEnvelop.pushData.commTrack.completed === true) {
            this.logger.logInfo(`SioService::relayMessages()/pushEnvelop:${pushEnvelop}`);
            console.log('--------------------------------------------------------------------------')
            console.log('PROCESS COMPLETED')
            console.log('--------------------------------------------------------------------------')

        } else {
            pushEnvelop.pushData.pushRecepients.forEach(async (recepient: ICommConversationSub) => {
                let payLoad = '';
                this.logger.logInfo(`SioService::relayMessages()/recepient:${JSON.stringify(recepient)}`);
                this.logger.logInfo("SioService::relayMessages()/pushEnvelop.pushData.pushRecepients:", pushEnvelop.pushData.pushRecepients);
                console.log("SioService::relayMessages()/pushEnvelop:", pushEnvelop);
                // const recepientSocket = this.recepientSocket(recepient, pubClient);
                const recepientDataStr = await this.destinationSocket(recepient);
                this.logger.logInfo("SioService::relayMessages()/pushEnvelop.pushData.recepientDataStr:", recepientDataStr);
                const recepientData = JSON.parse(recepientDataStr.r);
                this.logger.logInfo(`SioService::relayMessages()/recepientData:${JSON.stringify(recepientData)}`);

                if (recepientDataStr.r) {
                    const recepientSocketId = recepientData.cdObjId.socketId;
                    // const msg = JSON.stringify(pushEnvelop);
                    switch (recepient.subTypeId) {
                        case 1:
                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO SENDER')
                            console.log('--------------------------------------------------------------------------')
                            // handle message to sender:
                            // mark message as relayed plus relayedTime
                            // const pushEnvelop1 = this.shallow(pushEnvelop)
                            const pushEnvelop1: ICdPushEnvelop = JSON.parse(JSON.stringify(pushEnvelop));
                            pushEnvelop1.pushData.commTrack.relayTime = Number(new Date());

                            // pushEnvelop1.pushData.emittEvent = 'push-msg-relayed';
                            if (pushEnvelop1.pushData.commTrack.relayed !== true) {
                                pushEnvelop1.pushData.isNotification = true;
                            }

                            this.logger.logInfo(`SioService::relayMessages()/[switch 1] pushEnvelop:${JSON.stringify(pushEnvelop1)}`);
                            this.logger.logInfo('SioService::relayMessages()/[switch 1] sending confirmation message to sender');
                            this.logger.logInfo(`SioService::relayMessages()/[switch 1] pushEnvelop.pushData.triggerEvent:${pushEnvelop1.pushData.triggerEvent}`);
                            this.logger.logInfo('case-1: 01')
                            if (pushEnvelop1.pushData.isAppInit) {
                                /**
                                 * if the incoming message is for applitialization:
                                 * - nb: the resourceGuid is already saved in redis for reference
                                 * - save socket in envelop
                                 * - push message back to sender with socketid info
                                 * - the client app will rely on these data for subsequest communication by federated components of the app
                                 */
                                console.log('--------------------------------------------------------------------------')
                                console.log('SENDING APP-INIT-DATA')
                                console.log(`case-1: 011...isAppInit->triggerEvent === push-registered-client`)
                                console.log('--------------------------------------------------------------------------')
                                const socketStore: ISocketItem = {
                                    socketId: recepientSocketId,
                                    name: 'appInit',
                                    socketGuid: this.b.getGuid()
                                }
                                // save socket
                                pushEnvelop1.pushData.appSockets.push(socketStore)
                                // send back to sender
                                io.to(recepientSocketId).emit('push-registered-client', pushEnvelop1);
                            }
                            if (pushEnvelop1.pushData.isNotification) {
                                this.logger.logInfo('case-1: 02...isNotification')
                                if (pushEnvelop1.pushData.commTrack.relayed !== true && pushEnvelop1.pushData.commTrack.pushed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 04...isNotification->triggerEvent === msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    pushEnvelop1.pushData.emittEvent = 'push-msg-relayed';
                                    pushEnvelop1.pushData.commTrack.relayed = true;
                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                }

                                if (pushEnvelop1.pushData.commTrack.delivered === true && pushEnvelop1.pushData.commTrack.completed !== true ) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 03...isNotification->event to emit === push-delivered`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                }

                                // was closed and open for testing on 8 jul 2024
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-received' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    this.logger.logInfo('SENDING NOTIFICATION')
                                    this.logger.logInfo(`case-1: 041...isNotification->triggerEvent === msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                }
                                // was closed and open for testing on 8 jul 2024
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-completed' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    this.logger.logInfo('SENDING NOTIFICATION')
                                    this.logger.logInfo(`case-1: 042...isNotification->triggerEvent === msg-completed`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * record completion of messaging
                                     */
                                    this.logger.logInfo('message completed')

                                }
                            } else {
                                this.logger.logInfo('case-1: 05')
                                // send notification to client for relay
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-received') {
                                    this.logger.logInfo('case-1: 06')
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1/[msg-received]] sending 'msg-received' message to sender`);
                                    // payLoad = JSON.stringify(pushEnvelop);
                                    // io.to(recepientSocketId).emit('push-delivered', payLoad);
                                } else {
                                    this.logger.logInfo('case-1: 07')
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]] sending 'push-msg-relayed' message to sender`);
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/recepientSocketId:${JSON.stringify(recepientSocketId)}`)

                                    payLoad = JSON.stringify(pushEnvelop1);
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/pushEnvelop1:${pushEnvelop1}`)
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING PAYLOAD')
                                    console.log(`case-1: 08...seding payload ->emit event === 'push-msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                    // io.to(recepientSocketId).emit('push-msg-relayed', '{"msg": "testing messege"}');
                                    // io.emit('push-msg-relayed', `{"msg": "testing messege"}`);
                                }
                            }

                            break;
                        case 7:

                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO RECEPIENTS')
                            console.log('No of app sockets:', { noOfSockets: pushEnvelop.pushData.appSockets.length })
                            console.log('--------------------------------------------------------------------------')
                            // const pushEnvelop7 = this.shallow(pushEnvelop)
                            const pushEnvelop7 = JSON.parse(JSON.stringify(pushEnvelop));
                            this.logger.logInfo(`SioService::relayMessages()/[switch 7] pushEnvelop copy:${JSON.stringify(pushEnvelop7)}`);
                            // handle message to destined recepient
                            // if(pushEnvelop.pushData.emittEvent === 'msg-received'){
                            //     // if it is message confirmation to sender
                            //     pushEnvelop.pushData.commTrack.deliveryTime = Number(new Date());
                            //     pushEnvelop.pushData.commTrack.deliverd = true;
                            // }
                            this.logger.logInfo('case-7: 01')
                            if (pushEnvelop7.pushData.isNotification) {
                                this.logger.logInfo('case-7: 02')
                            } else {
                                this.logger.logInfo('case-7: 03')
                                if (pushEnvelop7.pushData.commTrack.pushed) {
                                    this.logger.logInfo('case-7: 04')
                                } else {
                                    this.logger.logInfo('case-7: 05')
                                    pushEnvelop7.pushData.commTrack.relayTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.relayed = true;
                                    pushEnvelop7.pushData.commTrack.pushTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.pushed = true;
                                    pushEnvelop7.pushData.triggerEvent = 'msg-pushed';
                                    pushEnvelop7.pushData.emittEvent = 'push-msg-pushed';
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 7] pushEnvelop7:${JSON.stringify(pushEnvelop7)}`);
                                    if (pushEnvelop7.pushData.triggerEvent === 'msg-received') {
                                        this.logger.logInfo('case-7: 06')
                                        // while relaying 'msg-received', do not send to group 7 (recepients)
                                        this.logger.logInfo('SioService::relayMessages()/[switch 7] not sending message to recepient, this is just confirmation');
                                    } else {
                                        this.logger.logInfo('case-7: 07')
                                        this.logger.logInfo(`SioService::relayMessages()/[switch 7] sending to recepient:${JSON.stringify(pushEnvelop7)}`);
                                        console.log('--------------------------------------------------------------------------')
                                        console.log('SENDING PAYLOAD')
                                        console.log(`case-7: 08...seding payload ->emit event === ${pushEnvelop7.pushData.emittEvent}`)
                                        console.log(`case-7: 09...seding payload ->recepientSocketId = ${recepientSocketId}`)
                                        console.log('--------------------------------------------------------------------------')
                                        payLoad = JSON.stringify(pushEnvelop7);
                                        io.to(recepientSocketId).emit(pushEnvelop7.pushData.emittEvent, pushEnvelop7);
                                    }
                                }

                            }

                            break;
                    }
                } else {
                    this.logger.logInfo("@@@@@@@@@@@@@@@ No valid response for recepientData from the redis storage @@@@@@@@@@@@@@@@@")
                    this.logger.logInfo(`@@@@@@@@@@@@@@@ The client ${recepient.cdObjId.resourceName} may not be connected to the push server @@@@@@@@@@@@@@@@@`)
                }

            })
        }

    }

    async destinationSocket(recepient: ICommConversationSub) {
        this.logger.logInfo("SioService::destinationSocket()/recepient):", recepient)
        this.logger.logInfo("@@@@@@@@@@@@@@@@@@@@@@@@@@@ check recepeint @@@@@@@@@@@@@@@@@@@@@@@@@@@")
        const k = recepient.cdObjId.resourceGuid
        
        return await this.b.wsRedisRead(k);
    }

    async getRooms(io) {
        const rooms = await io.of('/').adapter.allRooms();
        this.logger.logInfo(rooms); // a Set containing all rooms (across every node)
        return rooms;
    }

    shallow<T extends object>(source: T): T {
        // return {
        //     ...source,
        // }
        ///////////////////////////////////////
        const copy = {} as T
        Object.keys(source).forEach((key) => {
            copy[key as keyof T] = source[key as keyof T]
        })
        return copy
        ////////////////////////////////////////////
    }


}
```
I would like you to review the section: Token and Authentication Flow.
The section suggests introduction of a structure with jwt-signature among other meta data.
Note that cd-push mechanism already have ICdPushEnvelop which has property of resp: ICdResponse.
ICdResponse has as nested interface ISessResp that takes care of the proposed data.
A cd-push message is always in the context of an underlying http req/resp. The associated transaction data forms part of ICdPushEnvelop.
For example when push message is send in the context of auth http transaction, the req/res is saved as part of the push data.

// Proposed by already taken care of
```json
{
  "iss": "corpdesk-devtools",
  "sub": "runtime-sync",
  "aud": "cd-shell",
  "iat": 1732301231,
  "exp": 1732304831,
  "scope": ["dev.sync.push"],
  "signature": "<JWT_SIGNATURE>"
}

```

Structure of ICdPushEnvelop:
```ts
export interface ICdPushEnvelop {
  pushData: {
    appId?: string;
    appSockets?: ISocketItem[];
    pushGuid: string;
    m?: string;
    pushRecepients: ICommConversationSub[];
    triggerEvent: string;
    emittEvent: string;
    token: string;
    commTrack: CommTrack;
    isNotification: boolean | null;
    isAppInit?: boolean | null;
  };
  req: ICdRequest | null;
  resp: ICdResponse | null;
}
```

```ts
export interface ICdResponse {
  app_state: {
    success: boolean; // tels whether the process was successfull or not
    info: IRespInfo; // status messages including error details if any or standard message of success
    sess: ISessResp; // session status data
    cache: object;
    sConfig?: IServerConfig;
  };
  data: object;
}

// export interface IRespInfo {
//   messages: string[]; // array of errors encountered
//   code: string; // error code. Corpdesk use this to code the exact spot of error by controller and action
//   app_msg: any; // general response message (can be set with string, or null)
// }
export interface IRespInfo {
  messages: string[]; // array of errors encountered
  code: string; // error code. Corpdesk uses this to code the exact spot of error by controller and action
  app_msg: any; // general response message (can be set with string, or null)

  // Merged state into a single property `respState`
  respState?: {
    cdLevel: CdResponseState; // -1 for error, 0 for success, 1 for warning, etc.
    cdDescription?: string; // Custom description for Corpdesk-specific state

    httpCode: HttpState; // HTTP status code (e.g., 200, 400, etc.)
    httpDescription?: string; // HTTP status description (e.g., "OK", "Bad Request")
  };
}
export interface ISessResp {
  cd_token?: string; // corpdesk token
  userId?: number | null; // current user id
  jwt: {
    jwtToken: string;
    checked: boolean;
    checkTime: number;
    authorized: boolean;
  } | null; // jwt data
  ttl: number; // server settings for session lifetime
  initUuid?: string; // initialization guid of session
  initTime?: string; // when the session started
  clientId?: any; // OPtonal. for diagnosis for server view of the client.
}
```

//////////////////////////////////////////////
From what you have explained, I have realised much as we have done the documentation, we still have to come to the same page on how cd-push works and get implemented in corpdesk system. To achieve this, I think, we first need a narration on the flow of the process.
The process being how a 'hello save' works and its implementation.

The reason I shared the login process in a module federatin environment is to demonstrate how cd-push works.
Some principles to note:
- when we have a feature to implement for cd-push, we assume cd-push facility is either available as a module in sys/cd-push or available in a library.
In other words when implementing for dev-sync, we assume the cd-push is available and we do not implement for example, DevSyncPushService.
- What we focus on is how to fill up the ICdPushEnvelop data.
As a reference, we can go to LoginComponent that was shared earlier.
I have also shared it below.
- It is the one initiating a cd-push
Below are step by stpe processes
1. Druring ngOnInit(), it calls this.initialize()
2. In this implementation, we assume the whole of the module federation has one appId that is shared in the LocalStorage.
A new unique one is created everytime the application is launched. This is controlled by SidebarController then save to LocalStorage.
All remote modules are then expected to pick it up.
3. Following 2, appId of LoginComponent is set via this.setAppId();
4. Another important thing also happens. It starts listening to specific events
5. So when login() is called, it already has appId set and it already in the listening mode.
6. So the login does a http request/response to cd-api,
7. Whether the login is successfull or not, the sidebar and other modules are not aware about the status of the login.
So cd-user/LoginComponent needs to send a cd-push to module federation cd-shell/sidebar for it to know the status of the login and update the UI.
8. Now the login process goes to initSession().
When successful, it goes to if (res.app_state.sess.cd_token !== null && res.app_state.success) {}
In this block it calls:
const envl: ICdPushEnvelop = this.configPushPayload('login', 'push-menu', res.data.userData.userId)
You can see that this is all about setting up the ICdPushEnvelop data.
9. Message is eventually sent to Sidbare to take over the next processing which is setting up the UI based on login response.
10. Note that from here apart from sending the actual message, we can be listening to some events and even be aware when the messages are delivered or be able to send further notifications based on associated states.
For login: note the following methods:
sendSioMessage(envl: ICdPushEnvelop) // for sending the main message
notificationAcceptDelivery(payLoad: ICdPushEnvelop) // notification
  notificationMsgComplete(payLoad: ICdPushEnvelop) // notification

It is important to note that these methods do not rely on cd-user facilities by cd-push facilities. In this case: 
private svSio: SioClientService,
    private svSioTest: SioClientTestService,
    private svWss: WebsocketService,

We just need to align with this type of process for dev-sync.

```ts
interface IInitData {
  key: string;
  value: CdObjId;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  // providers:[UserService],
})

export class LoginComponent implements OnInit {
  debug = true;
  baseModel: BaseModel;
  resourceGuid = uuidv4();
  jwtWsToken: null;
  loginInvalid = false;
  rememberMe = true;
  submitted = false;
  fg: FormGroup;
  postData: any;
  errMsg: any;
  error = '';
  sidebarInitData: IInitData;
  socketData: ISocketItem[] | null = [];
  routParams = {
    queryParams: { token: '' },
    skipLocationChange: true,
    replaceUrl: false
  };

  constructor(
    private logger: NGXLogger,
    private svSio: SioClientService,
    private svSioTest: SioClientTestService,
    private svWss: WebsocketService,
    private svUser: UserService,
    private svSess: SessService,
    private svMenu: MenuService,
    private svNav: NavService,
    private route: Router,
    private svBase: BaseService,
  ) {
    // this.svSio.env = environment;
    // this.svSio.initSio(null, null);
    this.fg = new FormGroup({
      userName: new FormControl(),
      password: new FormControl(),
      rememberMe: new FormControl()
    });
  }

  ngOnInit() {
    this.logger.info('cd-user/LoginComponent::ngOnInit()/StorageType.CdObjId:', StorageType.CdObjId);
    // this.logger.debug('AppComponent initialized');
    this.initialize()
  }

  login(fg: any) {
    this.logger.info('starting cd-user/LoginComponent::login');
    let authData: AuthData = fg.value;
    const valid = fg.valid;
    this.logger.info('cd-user/LoginComponent::login/01');
    this.logger.info('cd-user/LoginComponent::login/fg:', fg);
    this.logger.info('cd-user/LoginComponent::login/valid:', valid);
    this.submitted = true;
    const consumerGuid = { consumerGuid: environment.consumerToken };
    authData = Object.assign({}, authData, consumerGuid); // merge data with consumer object
    try {
      this.logger.info('cd-user/LoginComponent::login/02');
      if (valid) {
        this.logger.info('cd-user/LoginComponent::login/03');
        this.initSession(authData);
      }
    } catch (err) {
      this.logger.info('cd-user/LoginComponent::login/04');
      this.errMsg = "Something went wrong!!"
      this.loginInvalid = true;
    }
  }

  /**
   * Initialize
   */
  initialize(): void {
    this.logger.info('cd-user/LoginComponent::initialize()/01');
    const filter: LsFilter = {
      storageType: StorageType.CdObjId,
      cdObjId: {
        appId: localStorage.getItem('appId'),
        resourceGuid: null,
        resourceName: 'SidebarComponent',
        ngModule: 'SharedModule',
        jwtToken: localStorage.getItem('accessToken'),
        socket: null,
        commTrack: null
      }
    }
    this.logger.info('cd-user/LoginComponent::initialize()/filter:', filter);
    // this.sidebarInitData = this.svBase.searchLocalStorage(filter);
    this.sidebarInitData = this.searchLocalStorage(filter);
    this.logger.info('cd-user/LoginComponent::initialize()/this.sidebarInitData:', this.sidebarInitData);
    const socketDataStr = localStorage.getItem('socketData')
    if (socketDataStr) {
      this.socketData = JSON.parse(socketDataStr).filter(appInit)
      function appInit(s: ISocketItem): ISocketItem | null {
        if (s.name === 'appInit') {
          return s;
        } else {
          return null;
        }
      }
      this.logger.info('cd-user/LoginComponent::initialize()/this.socketData:', this.socketData);
    } else {
      this.logger.info('Err: socket data is not valid')
    }
    this.setAppId();
  }

  setAppId() {
    console.log('cd-user/LoginComponent::setAppId()/01')
    console.log('cd-user/LoginComponent::setAppId()/this.svSio.socket:', this.svSio.socket)
    localStorage.removeItem('appId');
    // localStorage.setItem('appId', this.svBase.getGuid());
    const appId = localStorage.getItem('appId');
    console.log('cd-user/LoginComponent::setAppId()/appId:', appId)
    const envl: ICdPushEnvelop = this.configPushPayload('register-client', 'push-registered-client', 1000)
    console.log('cd-user/LoginComponent::setAppId()/envl:', envl)
    // this.svSio.sendPayLoad(envl)

    // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu
    this.listen('push-registered-client')
    this.listen('push-msg-relayed')
    this.listen('push-msg-pushed')
    this.listen('push-delivered')
    this.listen('msg-relayed')
    this.listen('msg-menu')
    this.listen('push-menu')
    this.sendSioMessage(envl)
  }

  initSession(authData: AuthData) {
    this.logger.info('cd-user/LoginComponent::initSession/01');
    this.svUser.auth$(authData).subscribe((res: any) => {
      if (res.app_state.success === true) {
        this.logger.info('cd-user/LoginComponent::initSession/res:', JSON.stringify(res));
        this.svSess.appState = res.app_state;
        /*
        create a session on successfull authentication.
        For subsequeng successull request to the server,
        use renewSess(res);
        */
        if (res.app_state.sess.cd_token !== null && res.app_state.success) {
          this.logger.info('cd-user/LoginComponent::initSession/02');
          const envl: ICdPushEnvelop = this.configPushPayload('login', 'push-menu', res.data.userData.userId)
          envl.pushData.m = res.data.menuData;
          envl.pushData.token= res.app_state.sess.cd_token
          this.logger.info('cd-user/LoginComponent::initSession/envl:', envl);

          if (environment.wsMode === 'sio') {
            this.logger.info('cd-user/LoginComponent::initSession/envl:...using sio');
            this.sendSioMessage(envl)

          }

          if (environment.wsMode === 'wss') {
            this.logger.info('cd-user/LoginComponent::initSession/envl:...using wss');
            this.svWss.sendMsg(envl)
          }

          ///////////////////////////////////////
          this.svSess.createSess(res, this.svMenu);
          this.svUser.currentUser = { name: `${res.data.userData.userName}`, picture: `${environment.shellHost}/user-resources/${res.data.userData.userGuid}/avatar-01/a.jpg` };
          this.svNav.userMenu = [
            { title: 'Profile', link: '/pages/cd-auth/register' },
            { title: 'Log out', link: '/pages/cd-auth/logout' }
          ];
          // this.baseModel.sess = res.app_state.sess;
          const params = {
            queryParams: { token: res.app_state.sess.cd_token },
            skipLocationChange: true,
            replaceUrl: false
          };
          // below: old method
          // this.route.navigate(['/comm'], params);
          // this.route.navigate(['/dashboard'], params);
          this.route.navigate([environment.initialPage], params);


          // below new method based on this.baseModel;
          // this.svNav.nsNavigate(this,'/comm','message from cd-user')
        }
      } else {
        this.errMsg = "The userName and password were not valid"
        this.loginInvalid = true;
        this.svSess.logout();
      }
    });

  }

  // push-registered-client, push-srv-received, push-msg-relayed, push-msg-pushed, push-delivered, push-msg-completed, push-srv-received, registered, push-menu, push-memo
  listen(event) {
    this.logger.info('cd-shell/cd-user/LoginComponent::listen/event:', event);
    // Listen for incoming messages
    this.svSioTest.sioListen(event).subscribe({
      next: (payLoad: ICdPushEnvelop) => {
        // console.log('cd-shell/cd-user/LoginComponent::listen/Received payLoad:', payLoadStr);
        // const payLoad: ICdPushEnvelop = JSON.parse(payLoadStr)
        console.log('cd-user/LoginComponent::pushSubscribe()/payLoad:', payLoad);
        // Handle the message payload
        // push-msg-relayed, push-msg-pushed, push-delivered, push-registered-client, msg-relayed, push-menu 
        switch (payLoad.pushData.emittEvent) {
          case 'push-msg-relayed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-relayed event")
            this.updateRelayed(payLoad)
            break;
          case 'push-msg-pushed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-pushed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-pushed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-pushed event")
            this.notificationAcceptDelivery(payLoad)
            break;
          case 'push-delivered':
            console.log('cd-user/LoginComponent::listenSecure()/push-delivered/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-delivered/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-delivered-client event")
            this.notificationMsgComplete(payLoad)
            break;

          case 'push-registered-client':
            console.log('cd-user/LoginComponent::listenSecure()/push-registered-client/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-registered-client/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-registered-client event")
            this.saveSocket(payLoad);
            break;

          case 'msg-relayed':
            console.log('cd-user/LoginComponent::listenSecure()/msg-relayed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/msg-relayed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle msg-relayed event")
            break;
          case 'push-msg-completed':
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-completed/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-msg-completed/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-msg-completed event")
            break;
          case 'push-srv-received':
            console.log('cd-user/LoginComponent::listenSecure()/push-srv-received/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-srv-received/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log("handle push-srv-received event")
            break;
          case 'push-menu':
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad.pushData.emittEvent:', payLoad.pushData.emittEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad.pushData.triggerEvent:', payLoad.pushData.triggerEvent)
            console.log('cd-user/LoginComponent::listenSecure()/push-menu/:payLoad:', payLoad)
            console.log("handle push-menu event")
            this.routParams.queryParams.token = payLoad.pushData.token;
            // this.svIdleTimeout.startTimer(this.cd, idleTimerOptions);
            // load appropriate menu
            // this.htmlMenu(payLoad.resp.data,payLoad.pushData.token);
            break;
        }

      },
      error: (error) => {
        console.error('cd-shell/cd-user/LoginComponent::listen/Error receiving message:', error);
      },
      complete: () => {
        console.log('cd-shell/cd-user/LoginComponent::listen/Message subscription complete');
      }
    })
  }


  notificationAcceptDelivery(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/01')
    console.log('cdUiLib::SioClientService::notificationAcceptDelivery()/senderAcceptDelivery:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.deliveryTime = Number(new Date());
    payLoad.pushData.commTrack.delivered = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-received';
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  notificationMsgComplete(payLoad: ICdPushEnvelop) {
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/01')
    console.log('cdUiLib::SioClientService::notificationMsgComplete()/1:', payLoad)
    /**
     * update record of payload
     * - delivered time
     * - delivered = true
     * - isNotification = true
     */
    payLoad.pushData.commTrack.completedTime = Number(new Date());
    payLoad.pushData.commTrack.completed = true;
    payLoad.pushData.isNotification = true;
    payLoad.pushData.triggerEvent = 'msg-completed'
    console.log('cdUiLib::SioClientService::notificationMsgComplete/2:', payLoad)
    /**
     * reverse sender and receiver subTypeId
     */
    // this.sendPayLoad(payLoad);
    this.sendSioMessage(payLoad)
  }

  sendSioMessage(envl: ICdPushEnvelop): void {
    this.logger.info('cd-user/LoginComponent::sendSioMessage/envl:', envl);
    this.svSioTest.sendMessage(envl.pushData.triggerEvent, envl).subscribe({
      next: (response: boolean) => {
        console.log('Message sent successfully:', response);
      },
      error: (error) => {
        console.error('Error sending message:', error);
      },
      complete: () => {
        console.log('Message sending complete');
      }
    });
  }

  configPushPayload(triggerEvent: string, emittEvent: string, cuid: number | string): ICdPushEnvelop {
    console.log('starting cd-user::LoginComponent::configPushPayload()');
    this.resourceGuid = this.svBase.getGuid();


    const pushEnvelope: ICdPushEnvelop = {
      pushData: {
        pushGuid: '',
        m: '',
        pushRecepients: [],
        triggerEvent: '',
        emittEvent: '',
        token: '',
        isNotification: null,
        appSockets: this.socketData,
        isAppInit: true,
        commTrack: {
          initTime: Number(new Date()),
          relayTime: null,
          relayed: false,
          pushed: false,
          pushTime: null,
          deliveryTime: null,
          delivered: false,
          completed: false,
          completedTime: null
        },
      },
      req: null,
      resp: null
    }

    console.log('cd-user::LoginComponent::configPushPayload()/this.resourceGuid:', this.resourceGuid);
    const key = this.resourceGuid;
    const cdObj: CdObjId = {
      appId: localStorage.getItem('appId')!,
      ngModule: 'UserFrontModule',
      resourceName: 'LoginComponent',
      resourceGuid: this.resourceGuid,
      jwtToken: this.jwtWsToken,
      socket: null,
      socketId: '',
      commTrack: {
        initTime: Number(new Date()),
        relayTime: null,
        relayed: false,
        pushed: false,
        pushTime: null,
        deliveryTime: null,
        delivered: false,
        completed: false,
        completedTime: null
      },
    }

    localStorage.setItem(key, JSON.stringify(cdObj));

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: cdObj,
      },
    ]

    const envl: ICdPushEnvelop = { ...pushEnvelope };
    envl.pushData.triggerEvent = triggerEvent;
    envl.pushData.emittEvent = emittEvent;

    // set sender
    const uSender: any = { ...users[0] }
    uSender.subTypeId = 1;
    envl.pushData.pushRecepients.push(uSender)


    if (triggerEvent === 'login') {
      this.logger.info('cd-user/LoginComponent::configPushPayload()/triggerEvent==login:');
      // set recepient
      this.logger.info('cd-user/LoginComponent::configPushPayload()/this.sidebarInitData:', JSON.stringify(this.sidebarInitData));
      this.logger.info('cd-user/LoginComponent::configPushPayload()/this.sidebarInitData.value:', JSON.stringify(this.sidebarInitData.value));
      const uRecepient: any = { ...users[0] }
      uRecepient.subTypeId = 7;
      this.logger.info('cd-user/LoginComponent::configPushPayload()/uRecepient:', JSON.stringify(uRecepient));
      uRecepient.cdObjId = this.sidebarInitData.value
      envl.pushData.pushRecepients.push(uRecepient)

    }

    this.logger.info('cd-user/LoginComponent::configPushPayload()/envl:', JSON.stringify(envl));
    return envl;

  }

  saveSocket(payLoad: ICdPushEnvelop) {
    console.log('cd-user/LoginComponent::saveSocket()/payLoad:', payLoad);
    /**
     * - get socketStore
     * - search socketStore for item with name='appInit'
     * - remove existing item with the same key
     * - save socketData to LocalStorage with resourceGuide as reference
     */
    const socketData: ISocketItem[] | null = payLoad.pushData.appSockets.filter(appInit)
    function appInit(s: ISocketItem): ISocketItem | null {
      if (s.name === 'appInit') {
        return s;
      } else {
        return null;
      }
    }

    if (socketData.length > 0) {
      const socketStr = JSON.stringify(socketData)
      localStorage.removeItem('socketData');
      localStorage.setItem('socketData', socketStr);
    }
  }

  /**
   * No action is expected from sender.
   * No message to send to server
   * Optionally, the sender can do its own house
   * data updates and records.
   * @param payLoad 
   */
  updateRelayed(payLoad: ICdPushEnvelop) {
    console.log('updateRelayed()/01')
    console.log('updateRelayed()/payLoad:', payLoad)
    /**
     * update record of send messages
     */
  }

  searchLocalStorage(f: LsFilter) {
    this.logger.info('starting cd-user/LoginComponent::searchLocalStorage()/lcLength:');
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/f:', f);
    // const lc = { ...localStorage };
    const lcArr = [];

    const lcLength = localStorage.length;
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/lcLength:', lcLength);
    let i = 0;
    for (let i = 0; i < localStorage.length; i++) {
      // try {
      // set iteration key name
      const k = localStorage.key(i);
      // use key name to retrieve the corresponding value
      var v = localStorage.getItem(k!);
      // this.logger.info the iteration key and value
      this.logger.info('Key: ' + k + ', Value: ' + v);
      try {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/1')
        if (typeof (v) === 'object') {
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/2')
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/v:', v)
          const lcItem = JSON.parse(v!);
          if ('success' in lcItem) {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/3')
            const appState: IAppState = lcItem;
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/appState:', appState)
          }
          if ('resourceGuid' in lcItem) {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/4')
            const cdObjId = lcItem;
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/cdObjId:', cdObjId)
          }
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/5')
          lcArr.push({ key: k, value: JSON.parse(v!) })
        } else {
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/typeof (v):', typeof (v))
          this.logger.info('cd-user/LoginComponent::searchLocalStorage()/6')
          lcArr.push({ key: k, value: JSON.parse(v) })
        }

      } catch (e) {
        this.logger.info('offending item:', v);
        this.logger.info('the item is not an object');
        this.logger.info('Error:', e);
      }

    }
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/lcArr:', lcArr);
    this.logger.info('cd-user/LoginComponent::searchLocalStorage()/f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
    // isAppState
    // const resourceName = 'UserModule';
    const AppStateItems = (d: any) => 'success' in d.value;
    const isObject = (d: any) => typeof (d.value) === 'object';
    const CdObjIdItems = (d: any) => 'resourceName' in d.value;
    const filtObjName = (d: any) => d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule;
    const latestItem = (prev: any, current: any) => (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
    let ret: any = null;
    try {
      if (this.debug) {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/debug=true:');
        ret = lcArr
          .filter((d: any) => {
            if (typeof (d.value) === 'object') {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByObject: d:', d);
              return d
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            if ('resourceName' in d.value) {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByResourceNameField: d:', d);
              return d;
            } else {
              return null;
            }
          })
          .filter((d: any) => {
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d:', d);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d.value.resourceName:', d.value.resourceName);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: f.cdObjId!.resourceName:', f.cdObjId!.resourceName);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: d.value.ngModule:', d.value.ngModule);
            this.logger.info('cd-user/LoginComponent::searchLocalStorage()/filteredByName: f.cdObjId!.ngModule:', f.cdObjId!.ngModule);
            if (d.value.resourceName === f.cdObjId!.resourceName && d.value.ngModule === f.cdObjId!.ngModule) {
              return d;
            } else {
              return null;
            }
          })
          .reduce(
            (prev = {}, current = {}) => {
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/prev:', prev);
              this.logger.info('cd-user/LoginComponent::searchLocalStorage()/current:', current);
              return (prev.value.commTrack.initTime > current.value.commTrack.initTime) ? prev : current;
            }
          );
      } else {
        this.logger.info('cd-user/LoginComponent::searchLocalStorage()/debug=false:');
        ret = lcArr
          .filter(isObject)
          .filter(CdObjIdItems!)
          .filter(filtObjName!)
          .reduce(latestItem!)
      }
      this.logger.info('cd-user/LoginComponent::searchLocalStorage()/ret:', ret);
    } catch (e) {
      this.logger.info('Error:', e);
    }
    return ret;
  }

  onFocus() {
    this.errMsg = "";
  }

}
```














//////////////////////////////////////////////////////////
From your explanations, in order to see the expected output, we need to initiate the IdePushClientService in the page where we need the interaction.
Below is the runtime page of SignInController.
If I understand you correctly, we need to have a way of initiating IdePushClientService at this stage. Of course this is just for testing but eventually the code will be built up.
Given that this the eventual code, how can we do a POC for this?

```ts
import { BaseService, ICdResponse } from "../../base";
import { CdShellController } from "../../base/cd-shell.controller";
import { ConsumerModel } from "../../moduleman/models/consumer.model";
import { UserModel } from "../models/user.model";

export class SignInController extends CdShellController {
  private b = new BaseService();

  template(): string {
    return `
      <form id="signInForm" class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>
        <label for="username">Username</label>
        <input id="username" type="text" cd-model="username" required />

        <label for="password">Password</label>
        <input id="password" type="password" cd-model="password" required />

        <button type="submit" class="cd-button">Sign In x</button>
      </form>
    `;
  }

  setup(): void {
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password } as UserModel,
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        } as ConsumerModel,
      };
      this.auth(data);
    });
  }

  processFormData(): { username: string; password: string } {
    const username =
      (document.querySelector('[cd-model="username"]') as HTMLInputElement)
        ?.value || "";
    const password =
      (document.querySelector('[cd-model="password"]') as HTMLInputElement)
        ?.value || "";
    return { username, password };
  }

  async auth(data: {
    user: UserModel;
    consumer: ConsumerModel;
  }): Promise<void> {
    console.log('starting SignInController:auth()')
    console.log('SignInController:auth()/data:', data)
    window.cdShell?.progress?.start("Signing in...");
    try {
      const request = this.b.buildBaseRequest(
        { ctx: "Sys", name: "User" },
        { name: "User" },
        "Login",
        { data: data.user, consumer: data.consumer },
        null
      );

      const result = (await this.b.handleRequest(request)) as ICdResponse;
      if (result.app_state.success) {
        window.cdShell?.notify?.success("Login successful");
        window.cdShell?.progress?.done();
        // Proceed to dashboard or main shell load
      } else {
        window.cdShell?.notify?.error(
          result.app_state.info.app_msg || "Login failed"
        );
      }
    } catch (e: any) {
      window.cdShell?.notify?.error(e.message || "Unexpected error");
    } finally {
      window.cdShell?.progress?.done();
    }
  }
}

```


///////////////////////////////////////////

I placed the sample you suggested in the file src/CdShell/sys/cd-user/view/sign-in.controller.js.
Note the format is that of compiled  file in the view directory.
We assume it has been generated as shared below.
So while loading it, there seem to be some issues.

// Error during build
```log
x Build failed in 699ms
error during build:
node_modules/readdirp/esm/index.js (2:9): "Readable" is not exported by "__vite-browser-external", imported by "node_modules/readdirp/esm/index.js".
file: /home/emp-12/cd-shell/node_modules/readdirp/esm/index.js:2:9

1: import { stat, lstat, readdir, realpath } from 'node:fs/promises';
2: import { Readable } from 'node:stream';
            ^
3: import { resolve as presolve, relative as prelative, join as pjoin, sep as psep } from 'node:path';
4: export const EntryTypes = {

    at getRollupError (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/parseAst.js:401:41)
    at error (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/parseAst.js:397:42)
    at Module.error (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:16939:16)
    at Module.traceVariable (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:17391:29)
    at ModuleScope.findVariable (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:15061:39)
    at ChildScope.findVariable (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:5642:38)
    at Identifier.bind (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:5413:40)
    at ClassDeclaration.bind (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:2804:23)
    at ExportNamedDeclaration.bind (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:12632:27)
    at Program.bind (file:///home/emp-12/cd-shell/node_modules/rollup/dist/es/shared/node-entry.js:2800:28)
```

// mocking compiled file
```js
import { IdePushClientService } from "../../cd-push/services/ide-push-client.service";

export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    // -----------------------------------
    // 1️⃣ Initialize POC socket client
    // -----------------------------------
    console.info("Initializing IDE push client (POC)...");
    try {
      const apiUrl = "http://localhost:3000"; // cd-api test endpoint
      const workspacePath = "/path/to/workspace/src"; // replace with real path
      this.idePushClient = new IdePushClientService(apiUrl, workspacePath);
      console.log("IdePushClientService initialized");
    } catch (e) {
      console.error("Failed to initialize IdePushClientService:", e.message);
    }

    // -----------------------------------
    // 2️⃣ Attach form listener
    // -----------------------------------
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password },
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        },
      };
      this.auth(data);
    });
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
```

//////////////////////////////////////////////////////////////////
At the browser, I am getting 404 response.
Take a look and let me know if you can tell where the problem is.
js client connection code
```ts
connect() {
    try {
      console.info(`[IdePushClientService] Connecting to ${this.apiUrl}...`);
      const sioOptions = {
        path: "/",
        transports: ["polling"],
        secure: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      };
      this.socket = io(this.apiUrl, sioOptions);

      this.socket.on("connect", () => {
        console.info("[IdePushClientService] ✅ Connected to cd-api");
      });

      this.socket.on("disconnect", () => {
        console.warn("[IdePushClientService] ⚠️ Disconnected from cd-api");
      });
    } catch (err) {
      console.error("[IdePushClientService] Connection error:", err.message);
    }
  }
```

Browser console logs
```log
[ModuleService][ensureInitialized]: starting index-DDt7rqfv.js:18:6725
starting initializeNodeModules()-01 index-DDt7rqfv.js:18:4435
[SHELL] [DEBUG] ModuleService::loadModule()/01: index-DDt7rqfv.js:18:506
[SHELL] [DEBUG] [ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-DDt7rqfv.js:18:506
Initializing IDE push client (POC)... index-BltsKVy6.js:13:26
[IdePushClientService] Initializing... index-BltsKVy6.js:1:41349
[IdePushClientService] Connecting to http://localhost:3002... index-BltsKVy6.js:1:41454
[IdePushClientService] Mock watcher active on: /home/emp-12/cd-shell/src index-BltsKVy6.js:1:41956
IdePushClientService initialized index-BltsKVy6.js:13:177
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 09:43:47 index-DDt7rqfv.js:18:7665
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-DDt7rqfv.js:18:506
XHRGET
http://localhost:3002/?EIO=4&transport=polling&t=wt7gn3n3
[HTTP/1.1 404 Not Found 4ms]

[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-DDt7rqfv.js:18:506
[SHELL] [DEBUG] bootstrapShell()/11: index-DDt7rqfv.js:18:506
loadTheme(): loading theme ID: default index-DDt7rqfv.js:18:1647
Theme loaded successfully: default index-DDt7rqfv.js:18:2167
XHRGET
http://localhost:3002/?EIO=4&transport=polling&t=wt9bcgyk
[HTTP/1.1 404 Not Found 2ms]

XHRGET
http://localhost:3002/?EIO=4&transport=polling&t=wtbijcim
[HTTP/1.1 404 Not Found 5ms]

XHRGET
http://localhost:3002/?EIO=4&transport=polling&t=wtfh34iw
[HTTP/1.1 404 Not Found 7ms]

	
GET
	http://localhost:3002/?EIO=4&transport=polling&t=wtfh34iw
Status
404
Not Found
VersionHTTP/1.1
Transferred517 B (139 B size)
Referrer Policystrict-origin-when-cross-origin
DNS ResolutionSystem

	
Access-Control-Allow-Credentials
	true
Access-Control-Allow-Origin
	http://localhost:4173
Connection
	keep-alive
Content-Length
	139
Content-Security-Policy
	default-src 'none'
Content-Type
	text/html; charset=utf-8
Date
	Sat, 11 Oct 2025 06:43:58 GMT
Keep-Alive
	timeout=5
Vary
	Origin
X-Content-Type-Options
	nosniff
X-Powered-By
	Express
	
Accept
	*/*
Accept-Encoding
	gzip, deflate, br, zstd
Accept-Language
	en-US,en;q=0.5
Cache-Control
	no-cache
Connection
	keep-alive
Host
	localhost:3002
Origin
	http://localhost:4173
Pragma
	no-cache
Referer
	http://localhost:4173/
Sec-Fetch-Dest
	empty
Sec-Fetch-Mode
	cors
Sec-Fetch-Site
	same-site
User-Agent
	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0


```
Server end: config.ts
```ts
export default{
  pushService: {
    sio: {
      enabled: true,
    },
    wss: {
      enabled: false,
    },
    pusher: {
      enabled: true,
    },
  },
  Cors: {
    options: {
      // key:fs.readFileSync(path.join(process.env.CERT_PATH)),
      // cert:fs.readFileSync(path.join(process.env.KEY_PATH)),
      // ca:fs.readFileSync(path.join(process.env.CSR_PATH)),
      // requestCert: false,
      // rejectUnauthorized: false,
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Authorization",
        "Accept",
        "X-Access-Token",
      ],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      origin: [
        `https://${API_HOST_IP}`,
        `https://localhost:443`,
        `https://127.0.0.1:443`,
        `http://localhost:80`,
        `http://127.0.0.1:80`,
        `http://localhost:4173`,
        `https://www.${API_HOST_NAME}`,
        `https://cd-user.${API_HOST_NAME}`,
        `https://cd-comm.${API_HOST_NAME}`,
        `https://cd-moduleman.${API_HOST_NAME}`,
      ],
      preflightContinue: false,
    },
  },
}
```

Server end: main.ts
```ts
export class Main {
    logger: Logging;
    allowedOrigins = [config.Cors.options.origin[5]];
    constructor() {
        this.logger = new Logging();
    }
    async run() {
        this.logger.logInfo('Main::run()/01')
        // basic settings
        const app: Application = express();

        // Serve .well-known directory for Let's Encrypt validation
        // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');


        let certAuth = '';
        // just in case certificate authority is not provided
        if (config.caPath.length > 0) {
            certAuth = fs.readFileSync(config.caPath, 'utf8');
        } else {
            certAuth = null
        }

        const credentials = {
            key: privateKey,
            cert: certificate,
            // ca: certAuth
        };


        const options = config.Cors.options;

        ////////////////////////////////////////////////////////////////////////////////
        const corsOptions = {
            origin: config.Cors.options.origin[5], // Replace with your client URL
            // origin: 'http://localhost', // for localhost teting
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        ////////////////////////////////////////////////////////////////////////////////

        let httpsServer = null;
        let corsOpts = null;

        //////////////////////////////////////////////////////////////////////////////
        app.use(cors(corsOptions));
        app.use(express.json()); // For parsing application/json
        app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board
        //////////////////////////////////////////////////////////////////////////////

        // Serve .well-known directory for Let's Encrypt validation
        // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
        app.use(config.http.webroot, express.static(path.join(__dirname, config.http.webroot)));

        // Create HTTP server
        const httpServer = createHttpServer(app);

        // Create HTTPS server
        httpsServer = https.createServer(credentials, app);
        corsOpts = {
            cors: {
                options: config.Cors.options.allowedHeaders,
                origin: config.Cors.options.origin
            }
        }


        /**
         * When run on sio mode in production,
         * use SSL
         * use cors
         */
        if (config.pushService.sio.enabled) {
            this.logger.logInfo('Main::run()/02')

            // const io = new Server(httpsServer, corsOpts);
            /////////////////////////////////////////////////////
            const io = new Server(httpsServer, {
                cors: {
                    origin: config.Cors.options.origin[5],
                    methods: ['GET', 'POST'],
                    credentials: true
                }
            });
            /////////////////////////////////////////////////////

            this.logger.logInfo('Main::run()/03')
            this.logger.logInfo('Main::run()/config.push.mode:', { mode: config.push.mode })
            // let pubClient = getRedisClient();
            let pubClient;
            let subClient;
            switch (config.push.mode) {
                case "PUSH_BASIC":
                    this.logger.logInfo('Main::run()/031')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_CLUSTER":
                    this.logger.logInfo('Main::run()/032')
                    pubClient = new Redis.Cluster(config.push.startupNodes);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_SENTINEL":
                    this.logger.logInfo('Main::run()/033')
                    pubClient = new Redis(config.push.sentinalOptions);
                    subClient = pubClient.duplicate();
                    break;
                default:
                    this.logger.logInfo('Main::run()/034')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
            }

            Promise.all([pubClient, subClient])
                .then(() => {
                    this.logger.logInfo('Main::run()/035')
                    const svSio = new SioService();
                    svSio.run(io, pubClient, subClient)
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }

        /**
         * When run on app mode in production,
         * use without SSL...but behind nginx proxy server fitted with SSL
         * do not use cors...but set it at nginx
         */
        if (config.apiRoute === "/api" && config.secure === "false") {
            console.log("main/04")
            httpsServer = createServer(app);
            corsOpts = {
                cors: {
                    options: config.Cors.options.allowedHeaders,
                    origin: null
                }
            }
        }

        app.post('/sio/p-reg/', async (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res);
        });

        


        // set api entry point
        app.post(config.apiRoute, async (req: any, res: any) => {
            console.log("app.post/01")
            res.setHeader('Content-Type', 'application/json');
            ////////////////////
            // res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res, ds);
        });

        if (config.pushService.pusher.enabled) {
            app.post('/notify', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, channel, event } = req.body;
                // this.logger.logInfo("message:", message)
                pusher.trigger(channel, event, { message: "hello from server on '/notify'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/notify-user', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, userId } = req.body;
                const channel = `private-user-${userId}`;

                pusher.trigger(channel, 'user-event', { message: "hello from server on '/notify-user'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/pusher/auth', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const socketId = req.body.socket_id;
                const channel = req.body.channel_name;
                const auth = pusher.authenticate(socketId, channel);
                res.send(auth);
            });
        }

        if (config.pushService.wss.enabled) {

            console.log("main/05")
            const expressServer = app.listen(config.wssPort, () => {
                console.log(`server is listening on ${config.wssPort}`);
            })
                .on('error', (e) => {
                    console.log(`Error:${e}`);
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            // Define the WebSocket server. Here, the server mounts to the `/ws`
            // route of the Express JS server.
            const wss = new WebSocket.Server({
                server: expressServer,
                path: '/ws'
            });
            /**
             * run the websocket
             */
            const cdWs = new WebsocketService();
            cdWs.run(wss);


        } else {

            if (config.http.enabled) {
                // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
                httpServer.listen(config.http.port, () => {
                    this.logger.logInfo(`HTTP server listening on port ${config.http.port}`);
                }).on('error', (e) => {
                    this.logger.logError(`HTTP server: listen()/Error: ${e}`);
                });
            }

            // start server
            httpsServer.listen(config.apiPort, () => {
                // console.log(`cd-api server is listening on ${config.apiPort}`);
                this.logger.logInfo(`cd-api server is listening on:`, { port: `${config.apiPort}` })
            })
                .on('error', (e) => {
                    this.logger.logError(`cd-api server: listen()/Error:${e}`)
                });
        }

    }

    originIsAllowed(origin: string) {
        return this.allowedOrigins.includes(origin);
    }

}

```

//////////////////////////////////////////

```log
[ModuleService][ensureInitialized]: starting index-DkM_0jsT.js:18:6725
starting initializeNodeModules()-01 index-DkM_0jsT.js:18:4435
[SHELL] [DEBUG] ModuleService::loadModule()/01: index-DkM_0jsT.js:18:506
[SHELL] [DEBUG] [ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-DkM_0jsT.js:18:506
Initializing IDE push client (POC)... index-C6T3TMWg.js:13:26
[IdePushClientService] Initializing... index-C6T3TMWg.js:1:41349
[IdePushClientService] Connecting to http://localhost:3002... index-C6T3TMWg.js:1:41454
[IdePushClientService] Mock watcher active on: /home/emp-12/cd-shell/src index-C6T3TMWg.js:1:41965
IdePushClientService initialized index-C6T3TMWg.js:13:177
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 10:06:02 index-DkM_0jsT.js:18:7665
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-DkM_0jsT.js:18:506
XHRGET
http://localhost:3002/socket.io/?EIO=4&transport=polling&t=xltpudlw
[HTTP/1.1 404 Not Found 4ms]

[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-DkM_0jsT.js:18:506
[SHELL] [DEBUG] bootstrapShell()/11: index-DkM_0jsT.js:18:506
loadTheme(): loading theme ID: default index-DkM_0jsT.js:18:1647
Theme loaded successfully: default index-DkM_0jsT.js:18:2167
XHRGET
http://localhost:3002/socket.io/?EIO=4&transport=polling&t=xlvgtdw3
[HTTP/1.1 404 Not Found 5ms]

XHRGET
http://localhost:3002/socket.io/?EIO=4&transport=polling&t=xlxuswrn
[HTTP/1.1 404 Not Found 4ms]

XHRGET
http://localhost:3002/socket.io/?EIO=4&transport=polling&t=xm1qjl1d
[HTTP/1.1 404 Not Found 7ms]

​
```

//////////////////////////////////////////////////////

Before I changed the vite configs, the server property was set as blow.
I am wondering the use of the property 'open'?
```ts
server: {
    open: true,
    port: 4173,
  },
```
Proposed changes:
```ts
server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "/home/emp-12/.ssl/key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "/home/emp-12/.ssl/cert.pem")),
    },
    port: 5173,
    host: "localhost",
  },
```

/////////////////////////////////////
Below is the vite configuration.
When I do npm run preview, it still runs on 4173 in http mode. Note https.
// src/vite.config.ts
```ts
export default defineConfig({
  // server: config.viteHttpsServer, // Use HTTPS server configuration
  // // server: config.viteHttpServer, // Use HTTP server configuration
  server: {
    https: {
      key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
      cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
    },
    port: 5173,
    host: "localhost",
    open: true,
  },

  root: ".", // Root is the project base

  publicDir: "public",

  build: {
    outDir: "dist", // Final PWA bundle
    emptyOutDir: true,
    target: "esnext", // ✅ Use "esnext" instead of "es2022"
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es", // ✅ Ensure ESM output supports top-level await
      },
    },
  },

  esbuild: {
    target: "esnext", // ✅ Same here to bypass old browser targets
    supported: {
      "top-level-await": true, // ✅ Explicitly enable top-level await
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
    },
    extensions: [".js", ".ts"],
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext", // ✅ Extend same fix to optimizeDeps
      supported: {
        "top-level-await": true,
      },
    },
  },

  preview: {
    port: 5173,
    open: true,
  },
});
```
// build and preview logs
```log
emp-12@emp-12 ~/cd-shell (main)> npm run build

> cd-shell@1.0.0 prebuild
> node scripts/prebuild-stubs.js

[prebuild] View placeholders ready.


> cd-shell@1.0.0 build
> npm run clean && npm run prebuild && npm run compile-ts && vite build && npm run post-build


> cd-shell@1.0.0 clean
> rm -rf dist dist-ts


> cd-shell@1.0.0 prebuild
> node scripts/prebuild-stubs.js

[prebuild] View placeholders ready.


> cd-shell@1.0.0 compile-ts
> tsc --project tsconfig.json

vite v5.4.20 building for production...
[plugin:vite:resolve] [plugin vite:resolve] Module "fs" has been externalized for browser compatibility, imported by "/home/emp-12/cd-shell/src/CdShell/sys/moduleman/services/module.service.ts". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
[plugin:vite:resolve] [plugin vite:resolve] Module "path" has been externalized for browser compatibility, imported by "/home/emp-12/cd-shell/src/CdShell/sys/moduleman/services/module.service.ts". See https://vite.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility for more details.
✓ 161 modules transformed.
dist/index.html                                   1.07 kB │ gzip:  0.51 kB
dist/assets/index-C_EefWij.css                    1.20 kB │ gzip:  0.49 kB
dist/assets/__vite-browser-external-D7Ct-6yo.js   0.13 kB │ gzip:  0.14 kB
dist/assets/_commonjsHelpers-DyVB06ra.js          0.58 kB │ gzip:  0.34 kB
dist/assets/index-YhLg4ZnN.js                     0.76 kB │ gzip:  0.42 kB
dist/assets/index-DIGhDJk_.js                     0.77 kB │ gzip:  0.42 kB
dist/assets/index-DMjNbz6u.js                     0.77 kB │ gzip:  0.42 kB
dist/assets/index-BZ0GEKVt.js                     7.84 kB │ gzip:  3.44 kB
dist/assets/index-CqtLqM9o.js                    21.48 kB │ gzip:  6.82 kB
dist/assets/index-BR3Heh4p.js                    43.62 kB │ gzip: 13.88 kB
dist/assets/url-CHIVpiFS.js                      48.60 kB │ gzip: 16.71 kB
✓ built in 1.11s

> cd-shell@1.0.0 post-build
> node scripts/post-build.js || bash scripts/post-build.sh

[sys] Found 8 controllers
[app] Found 12 controllers
[OK] Generated module wrapper: src/CdShell/sys/cd-comm/view/index.js
[OK] Generated module wrapper: src/CdShell/sys/cd-push/view/index.js
[OK] Generated module wrapper: src/CdShell/sys/cd-user/view/index.js
[OK] Generated module wrapper: src/CdShell/app/cd-geo/view/index.js
[OK] Generated module wrapper: src/CdShell/app/coops/view/index.js
[post-build] Controller → view sync complete.
--------------------------------------------------
[post-build] Build completed successfully.
10/11/2025, 12:32:39 PM
--------------------------------------------------
emp-12@emp-12 ~/cd-shell (main)> npm run preview

> cd-shell@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

///////////////////////////////////////
What is your take on the following behaviour.
preview is stuck on http but with --debug, it follows the config as expected.
```log
mp-12@emp-12 ~/cd-shell (main)> npm run preview

> cd-shell@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

```log
emp-12@emp-12 ~/cd-shell (main) [SIGINT]> npm run dev

> cd-shell@1.0.0 dev
> vite --debug

  vite:config no config file found. +0ms
  vite:config using resolved config: {
  vite:config   root: '/home/emp-12/cd-shell',
  vite:config   base: '/',
  vite:config   mode: 'development',
  vite:config   configFile: undefined,
  vite:config   logLevel: undefined,
  vite:config   clearScreen: undefined,

  ...other logs

  vite:config   worker: { format: 'iife', plugins: '() => plugins', rollupOptions: {} },
  vite:config   appType: 'spa',
  vite:config   experimental: { importGlobRestoreExtension: false, hmrPartialAccept: false },
  vite:config   webSocketToken: 'HQbGZlcaYBkY',
  vite:config   additionalAllowedHosts: [],
  vite:config   getSortedPlugins: [Function: getSortedPlugins],
  vite:config   getSortedPluginHooks: [Function: getSortedPluginHooks]
  vite:config } +9ms
  vite:deps Hash is consistent. Skipping. Use --force to override. +0ms

  VITE v5.4.20  ready in 187 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help

```

```json
"scripts": {
    "clean": "rm -rf dist dist-ts",
    "prebuild": "node scripts/prebuild-stubs.js",
    "compile-ts": "tsc --project tsconfig.json",
    "dev": "vite --debug",
    "build": "npm run clean && npm run prebuild && npm run compile-ts && vite build && npm run post-build",
    "post-build": "node scripts/post-build.js || bash scripts/post-build.sh",
    "preview": "vite preview",
    "rebuild": "npm run clean && npm run build",
    "analyze": "vite build --mode analyze"
  },
```

```log
mp-12@emp-12 ~/cd-shell (main)> npm run preview

> cd-shell@1.0.0 preview
> vite preview

  ➜  Local:   http://localhost:4173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

```ts
export default defineConfig({
  // server: config.viteHttpsServer, // Use HTTPS server configuration
  server: config.viteHttpServer, // Use HTTP server configuration
  // server: {
  //   https: {
  //     key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
  //     cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
  //   },
  //   port: 5173,
  //   host: "localhost",
  //   open: true,
  // },

  root: ".", // Root is the project base

  publicDir: "public",

  build: {
    outDir: "dist", // Final PWA bundle
    emptyOutDir: true,
    target: "esnext", // ✅ Use "esnext" instead of "es2022"
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es", // ✅ Ensure ESM output supports top-level await
      },
    },
  },

  esbuild: {
    target: "esnext", // ✅ Same here to bypass old browser targets
    supported: {
      "top-level-await": true, // ✅ Explicitly enable top-level await
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
    },
    extensions: [".js", ".ts"],
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext", // ✅ Extend same fix to optimizeDeps
      supported: {
        "top-level-await": true,
      },
    },
  },

  preview: config.viteHttpServer, // Use HTTP server configuration
  // preview: {
  //   https: {
  //     key: fs.readFileSync("/home/emp-12/.ssl/key.pem"),
  //     cert: fs.readFileSync("/home/emp-12/.ssl/cert.pem"),
  //   },
  //   port: 5173,
  //   host: "localhost",
  //   open: true,
  // },
});
```

////////////////////////////////////////////

What is your take on the following data.
It represent an attempt to make a socket.io connection via https.

// Browser inspector/console
```log
Initializing IDE push client (POC)... index-CjeQMhvw.js:13:26
[IdePushClientService] Initializing... index-CjeQMhvw.js:1:41355
[IdePushClientService] Connecting to https://localhost:3002... index-CjeQMhvw.js:1:41460
[IdePushClientService] Mock watcher active on: undefined index-CjeQMhvw.js:1:41971
IdePushClientService initialized index-CjeQMhvw.js:13:162
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 19:50:11 index-CvEMQszk.js:18:7645
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-CvEMQszk.js:18:506
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=ih169kfw. (Reason: CORS request did not succeed). Status code: (null).

[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
```

// Browser inspector/network/headers
```log
GET /socket.io/?EIO=4&transport=polling&t=ih169kfw undefined
Host: localhost:3002
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Origin: https://localhost:5173
Connection: keep-alive
Referer: https://localhost:5173/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Pragma: no-cache
Cache-Control: no-cache
```
// src/vite.config.ts
```ts
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";
// import config from "./config";

const viteConfig = {
  https: {
    key: fs.readFileSync(path.resolve("/home/emp-12/.ssl/key.pem")),
    cert: fs.readFileSync(path.resolve("/home/emp-12/.ssl/cert.pem")),
  },
  port: 5173,
  host: "localhost",
  open: true,
};
export default defineConfig({
  server: viteConfig, // Use HTTP server configuration

  preview: viteConfig, // Preview server same as dev server

  root: ".", // Root is the project base

  publicDir: "public",

  build: {
    outDir: "dist", // Final PWA bundle
    emptyOutDir: true,
    target: "esnext", // ✅ Use "esnext" instead of "es2022"
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es", // ✅ Ensure ESM output supports top-level await
      },
    },
  },

  esbuild: {
    target: "esnext", // ✅ Same here to bypass old browser targets
    supported: {
      "top-level-await": true, // ✅ Explicitly enable top-level await
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
    },
    extensions: [".js", ".ts"],
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext", // ✅ Extend same fix to optimizeDeps
      supported: {
        "top-level-await": true,
      },
    },
  },
});
```
// src/config.ts
```ts
export default {
  viteWorkspacePath: '/home/emp-12/cd-shell/src',
  cdSio: {
    endpoint: `https://localhost:3002`,
    serverHost: `localhost`,
    serverPort: `3002`,
    entryPoint: `/socket.io`,
    timeout: 15000,
  },
}
```
// src/CdShell/sys/cd-push/services/ide-push-client.service.js
```ts
import { IdePushClientService } from "../../cd-push/services/ide-push-client.service.js";
import config from "../../../../config";

export const ctlSignIn = {
  username: "",
  password: "",

  __template() {
    return `
      <form class="cd-sign-in">
        <h1 class="cd-heading">Sign In</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Sign In</button>
      </form>
    `;
  },

  __setup() {
    // -----------------------------------
    // 1️⃣ Initialize POC socket client
    // -----------------------------------
    console.info("Initializing IDE push client (POC)...");
    try {
      const apiUrl = config.cdSio.endpoint; // cd-api test endpoint
      const workspacePath = config.viteWorkspacePath; // replace with real path
      this.idePushClient = new IdePushClientService(apiUrl, workspacePath);
      console.log("IdePushClientService initialized");
    } catch (e) {
      console.error("Failed to initialize IdePushClientService:", e.message);
    }

    // -----------------------------------
    // 2️⃣ Attach form listener
    // -----------------------------------
    const form = document.getElementById("signInForm");
    if (!form) return;

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const { username, password } = this.processFormData();
      const data = {
        user: { userName: username, password },
        consumer: {
          consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
        },
      };
      this.auth(data);
    });
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Auth triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },
};
```

```js
import { io } from "socket.io-client";
// import { CdLog } from "../../sys/logging/cd-log.service.js";

export class IdePushClientService {
  constructor(apiUrl, workspacePath) {
    this.apiUrl = apiUrl;
    this.workspacePath = workspacePath;
    this.socket = null;

    console.info("[IdePushClientService] Initializing...");
    this.connect();
    this.mockWatchSave();
  }

  connect() {
    try {
      console.info(`[IdePushClientService] Connecting to ${this.apiUrl}...`);
      const sioOptions = {
        path: "/socket.io", // <-- fix
        transports: ["polling"],
        secure: false,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      };
      this.socket = io(this.apiUrl, sioOptions);

      this.socket.on("connect", () => {
        console.info("[IdePushClientService] ✅ Connected to cd-api");
      });

      this.socket.on("disconnect", () => {
        console.warn("[IdePushClientService] ⚠️ Disconnected from cd-api");
      });
    } catch (err) {
      console.error("[IdePushClientService] Connection error:", err.message);
    }
  }

  // 🔹 Mock watcher (browser-friendly)
  mockWatchSave() {
    console.info(
      `[IdePushClientService] Mock watcher active on: ${this.workspacePath}`
    );
  }

  // 🔹 Simulate "save" event trigger
  sendSaveEvent(filePath) {
    console.info(`[IdePushClientService] Sending save event for: ${filePath}`);
    if (this.socket && this.socket.connected) {
      this.socket.emit("ide-push-save", { file: filePath, ts: Date.now() });
    } else {
      console.warn(
        "[IdePushClientService] Cannot send save event — socket not connected."
      );
    }
  }
}

```
// backend bootstrap
```ts
export class Main {
    logger: Logging;
    allowedOrigins = [
        config.Cors.options.origin[5], // https://localhost:5173
        config.Cors.options.origin[6]  // https://192.168.0.156:5173
    ];
    constructor() {
        this.logger = new Logging();
    }
    async run() {
        this.logger.logInfo('Main::run()/01')
        // this.logger.logInfo('Main::run()/config.keyPath', {keyPath: config.keyPath} )
        // this.logger.logInfo('Main::run()/config.certPath', {certPath: config.certPath} )
        // this.logger.logInfo('Main::run()/config.caPath', {caPath: config.caPath} )
        // basic settings
        const app: Application = express();

        // Serve .well-known directory for Let's Encrypt validation
        // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

        const privateKey = fs.readFileSync(config.keyPath, 'utf8');
        const certificate = fs.readFileSync(config.certPath, 'utf8');


        let certAuth = '';
        // just in case certificate authority is not provided
        if (config.caPath.length > 0) {
            certAuth = fs.readFileSync(config.caPath, 'utf8');
        } else {
            certAuth = null
        }

        const credentials = {
            key: privateKey,
            cert: certificate,
            // ca: certAuth
        };


        const options = config.Cors.options;

        ////////////////////////////////////////////////////////////////////////////////
        const corsOptions = {
            origin: this.allowedOrigins, // Replace with your client URL
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization'],
            credentials: true
        };
        ////////////////////////////////////////////////////////////////////////////////

        let httpsServer = null;
        let corsOpts = null;

        //////////////////////////////////////////////////////////////////////////////
        app.use(cors(corsOptions));
        app.use(express.json()); // For parsing application/json
        app.options('*', cors(corsOptions)); // Enable pre-flight across-the-board
        //////////////////////////////////////////////////////////////////////////////

        // Serve .well-known directory for Let's Encrypt validation
        // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
        app.use(config.http.webroot, express.static(path.join(__dirname, config.http.webroot)));

        // Create HTTP server
        const httpServer = createHttpServer(app);

        // Create HTTPS server
        httpsServer = https.createServer(credentials, app);
        corsOpts = {
            cors: {
                options: config.Cors.options.allowedHeaders,
                origin: config.Cors.options.origin
            }
        }


        /**
         * When run on sio mode in production,
         * use SSL
         * use cors
         */
        if (config.pushService.sio.enabled) {
            this.logger.logInfo('Main::run()/02')

            // const io = new Server(httpsServer, corsOpts);
            /////////////////////////////////////////////////////
            const io = new Server(httpServer, {
                path: "/socket.io",
                cors: {
                    origin: this.allowedOrigins,
                    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                    credentials: true
                }
            });
            /////////////////////////////////////////////////////

            this.logger.logInfo('Main::run()/03')
            this.logger.logInfo('Main::run()/config.push.mode:', { mode: config.push.mode })
            // let pubClient = getRedisClient();
            let pubClient;
            let subClient;
            switch (config.push.mode) {
                case "PUSH_BASIC":
                    this.logger.logInfo('Main::run()/031')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort, legacyMode: true } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_CLUSTER":
                    this.logger.logInfo('Main::run()/032')
                    pubClient = new Redis.Cluster(config.push.startupNodes);
                    subClient = pubClient.duplicate();
                    break;
                case "PUSH_SENTINEL":
                    this.logger.logInfo('Main::run()/033')
                    pubClient = new Redis(config.push.sentinalOptions);
                    subClient = pubClient.duplicate();
                    break;
                default:
                    this.logger.logInfo('Main::run()/034')
                    pubClient = createClient({ host: config.push.redisHost, port: config.push.redisPort } as RedisClientOptions);
                    // pubClient = getRedisClient();
                    subClient = pubClient.duplicate();
                    break;
            }

            Promise.all([pubClient, subClient])
                .then(() => {
                    this.logger.logInfo('Main::run()/035')
                    const svSio = new SioService();
                    svSio.run(io, pubClient, subClient)
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        }

        /**
         * When run on app mode in production,
         * use without SSL...but behind nginx proxy server fitted with SSL
         * do not use cors...but set it at nginx
         */
        if (config.apiRoute === "/api" && config.secure === "false") {
            console.log("main/04")
            httpsServer = createServer(app);
            corsOpts = {
                cors: {
                    options: config.Cors.options.allowedHeaders,
                    origin: null
                }
            }
        }

        
        app.post('/sio/p-reg/', async (req: any, res: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res);
        });

        // set api entry point
        app.post(config.apiRoute, async (req: any, res: any) => {
            console.log("app.post/01")
            res.setHeader('Content-Type', 'application/json');
            ////////////////////
            // res.setHeader("Access-Control-Allow-Origin", "*");
            res.setHeader("Access-Control-Allow-Credentials", "true");
            res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
            res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
            CdInit(req, res, ds);
        });

        if (config.pushService.pusher.enabled) {
            app.post('/notify', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, channel, event } = req.body;
                // this.logger.logInfo("message:", message)
                pusher.trigger(channel, event, { message: "hello from server on '/notify'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/notify-user', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const { message, userId } = req.body;
                const channel = `private-user-${userId}`;

                pusher.trigger(channel, 'user-event', { message: "hello from server on '/notify-user'" })
                    .then(() => res.status(200).send("Notification sent from '/notify'"))
                    .catch((err: Error) => res.status(500).send(`Error sending notification: ${err.message}`));
            });

            app.post('/pusher/auth', (req: Request, res: Response) => {
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
                res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
                const socketId = req.body.socket_id;
                const channel = req.body.channel_name;
                const auth = pusher.authenticate(socketId, channel);
                res.send(auth);
            });
        }

        if (config.pushService.wss.enabled) {

            console.log("main/05")
            const expressServer = app.listen(config.wssPort, () => {
                console.log(`server is listening on ${config.wssPort}`);
            })
                .on('error', (e) => {
                    console.log(`Error:${e}`);
                });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////
            // Define the WebSocket server. Here, the server mounts to the `/ws`
            // route of the Express JS server.
            const wss = new WebSocket.Server({
                server: expressServer,
                path: '/ws'
            });
            /**
             * run the websocket
             */
            const cdWs = new WebsocketService();
            cdWs.run(wss);


        } else {

            if (config.http.enabled) {
                // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
                httpServer.listen(config.http.port, () => {
                    this.logger.logInfo(`HTTP server listening on port ${config.http.port}`);
                }).on('error', (e) => {
                    this.logger.logError(`HTTP server: listen()/Error: ${e}`);
                });
            }

            // start server
            httpsServer.listen(config.apiPort, () => {
                // console.log(`cd-api server is listening on ${config.apiPort}`);
                this.logger.logInfo(`cd-api server is listening on:`, { port: `${config.apiPort}` })
            })
                .on('error', (e) => {
                    this.logger.logError(`cd-api server: listen()/Error:${e}`)
                });
        }

    }

    originIsAllowed(origin: string) {
        return this.allowedOrigins.includes(origin);
    }

}
```

/////////////////////////////////////////////////////
These are partial browser logs focusing on the processing of attempted connection to the socket.io.
I have made it to capture to configuration used.

Browser inspect/console
```log
Initializing IDE push client (POC)... index-DQBaOkPT.js:13:26
[IdePushClientService] Initializing... index-DQBaOkPT.js:1:41355
[IdePushClientService] Connecting to https://localhost:3002... index-DQBaOkPT.js:1:41460
[IdePushClientService] socket.io options: {"path":"/socket.io","transports":["polling"],"secure":true,"reconnection":true,"reconnectionAttempts":3,"reconnectionDelay":2000}... index-DQBaOkPT.js:1:41653
[IdePushClientService] Mock watcher active on: /home/emp-12/cd-shell/src index-DQBaOkPT.js:1:42053
IdePushClientService initialized index-DQBaOkPT.js:13:162
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 20:36:28 index-D_TYUkyV.js:18:7645
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-D_TYUkyV.js:18:506
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=k4kb6nz0. (Reason: CORS request did not succeed). Status code: (null).

[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-D_TYUkyV.js:18:506
[SHELL] [DEBUG] bootstrapShell()/11: index-D_TYUkyV.js:18:506
loadTheme(): loading theme ID: default index-D_TYUkyV.js:18:1647
Theme loaded successfully: default index-D_TYUkyV.js:18:2167
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=k4mma1yb. (Reason: CORS request did not succeed). Status code: (null).

Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=k4ptzcb8. (Reason: CORS request did not succeed). Status code: (null).

Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=k4tphg3a. (Reason: CORS request did not succeed). Status code: (null).
```

Browser inspect/network/headers
```log
GET /socket.io/?EIO=4&transport=polling&t=k7d9s54l undefined
Host: localhost:3002
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Origin: https://localhost:5173
Connection: keep-alive
Referer: https://localhost:5173/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Pragma: no-cache
Cache-Control: no-cache
```

// emp-12@emp-12 ~> sudo netstat -nltp
```log
tcp6       0      0 :::3002                 :::*                    LISTEN      245922/node 
```
// confirmation with telnet
```log
emp-12@emp-12 ~> telnet localhost 3002
Trying 127.0.0.1...
Connected to localhost.
Escape character is '^]'.
```
// partial server logs:
// Note that, we are able to see the socket.io settings and confirmation of listening port for the server.
```log
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/01 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/02 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/sioOptions:{"path":"/socket.io","cors":{"origin":["https://localhost:5173/","https://192.168.0.156:5173/"],"methods":["GET","POST","PUT","DELETE","OPTIONS"],"credentials":true}} [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/03 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/config.push.mode: [CONTEXT] -> 
[object Object]
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/031 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: HTTP server listening on port 8081 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: server is listening on:port: 3002 [CONTEXT] -> {}
[10/11/2025, 8:31:49 PM] [INFO]: Main::run()/035 [CONTEXT] -> {}
```
/////////////////////////////////////////////////

Below are the latest logs
Browser inspect/console
```log
Initializing IDE push client (POC)... index-DQBaOkPT.js:13:26
[IdePushClientService] Initializing... index-DQBaOkPT.js:1:41355
[IdePushClientService] Connecting to https://localhost:3002... index-DQBaOkPT.js:1:41460
[IdePushClientService] socket.io options: {"path":"/socket.io","transports":["polling"],"secure":true,"reconnection":true,"reconnectionAttempts":3,"reconnectionDelay":2000}... index-DQBaOkPT.js:1:41653
[IdePushClientService] Mock watcher active on: /home/emp-12/cd-shell/src index-DQBaOkPT.js:1:42053
IdePushClientService initialized index-DQBaOkPT.js:13:162
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 21:15:25 index-D_TYUkyV.js:18:7645
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-D_TYUkyV.js:18:506
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=linfd22u. (Reason: CORS request did not succeed). Status code: (null).

[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-D_TYUkyV.js:18:506
[SHELL] [DEBUG] bootstrapShell()/11: index-D_TYUkyV.js:18:506
loadTheme(): loading theme ID: default index-D_TYUkyV.js:18:1647
Theme loaded successfully: default index-D_TYUkyV.js:18:2167
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=lipqryzj. (Reason: CORS request did not succeed). Status code: (null).

Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3002/socket.io/?EIO=4&transport=polling&t=litqp53u. (Reason: CORS request did not succeed). Status code: (null).
```
Browser inspect/network/headers
```log
GET /socket.io/?EIO=4&transport=polling&t=lhk6rqom undefined
Host: localhost:3002
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:143.0) Gecko/20100101 Firefox/143.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Origin: https://localhost:5173
Connection: keep-alive
Referer: https://localhost:5173/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Pragma: no-cache
Cache-Control: no-cache
```

Backend booting logs
```log
[10/11/2025, 9:11:45 PM] [INFO]: Main::run()/01 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/02 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/sioOptions:{"path":"/socket.io","cors":{"origin":["https://localhost:5173","https://192.168.0.156:5173"],"methods":["GET","POST","PUT","DELETE","OPTIONS"],"credentials":true}} [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/03 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/config.push.mode: [CONTEXT] -> 
[object Object]
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/031 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: HTTP server listening on port 8081 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: server is listening on:port: 3002 [CONTEXT] -> {}
[10/11/2025, 9:11:46 PM] [INFO]: Main::run()/035 [CONTEXT] -> {}
```

/////////////////////////////////////////////////////////
I eventually achieved a milestone by connecting to the backend.
Take a look at the browser logs, server logs and the respective codes for both, then suggest the next development towards dev-sync reality.

Browser logs
```log
Initializing IDE push client (POC)... index-DQBaOkPT.js:13:26
[IdePushClientService] Initializing... index-DQBaOkPT.js:1:41355
[IdePushClientService] Connecting to https://localhost:3002... index-DQBaOkPT.js:1:41460
[IdePushClientService] socket.io options: {"path":"/socket.io","transports":["polling"],"secure":true,"reconnection":true,"reconnectionAttempts":3,"reconnectionDelay":2000}... index-DQBaOkPT.js:1:41653
[IdePushClientService] Mock watcher active on: /home/emp-12/cd-shell/src index-DQBaOkPT.js:1:42053
IdePushClientService initialized index-DQBaOkPT.js:13:162
[ModuleService] Loaded 'cd-user' (Vite mode) at 11/10/2025 22:09:57 index-D_TYUkyV.js:18:7645
[SHELL] [DEBUG] Main::loadModule()/menu: 
Array []
index-D_TYUkyV.js:18:506
[SHELL] [DEBUG] Main::loadModule()/theme: 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-D_TYUkyV.js:18:506
[SHELL] [DEBUG] bootstrapShell()/11: index-D_TYUkyV.js:18:506
loadTheme(): loading theme ID: default index-D_TYUkyV.js:18:1647
[IdePushClientService] ✅ Connected to cd-api index-DQBaOkPT.js:1:41794
Theme loaded successfully: default index-D_TYUkyV.js:18:2167


```

Client service
```ts
export class IdePushClientService {
  constructor(apiUrl, workspacePath) {
    this.apiUrl = apiUrl;
    this.workspacePath = workspacePath;
    this.socket = null;

    console.info("[IdePushClientService] Initializing...");
    this.connect();
    this.mockWatchSave();
  }

  connect() {
    try {
      console.info(`[IdePushClientService] Connecting to ${this.apiUrl}...`);
      const sioOptions = {
        path: "/socket.io", // <-- fix
        transports: ["polling"],
        secure: true,
        reconnection: true,
        reconnectionAttempts: 3,
        reconnectionDelay: 2000,
      };
      console.info(`[IdePushClientService] socket.io options: ${JSON.stringify(sioOptions)}...`);
      this.socket = io(this.apiUrl, sioOptions);

      this.socket.on("connect", () => {
        console.info("[IdePushClientService] ✅ Connected to cd-api");
      });

      this.socket.on("disconnect", () => {
        console.warn("[IdePushClientService] ⚠️ Disconnected from cd-api");
      });
    } catch (err) {
      console.error("[IdePushClientService] Connection error:", err.message);
    }
  }

  // 🔹 Mock watcher (browser-friendly)
  mockWatchSave() {
    console.info(
      `[IdePushClientService] Mock watcher active on: ${this.workspacePath}`
    );
  }

  // 🔹 Simulate "save" event trigger
  sendSaveEvent(filePath) {
    console.info(`[IdePushClientService] Sending save event for: ${filePath}`);
    if (this.socket && this.socket.connected) {
      this.socket.emit("ide-push-save", { file: filePath, ts: Date.now() });
    } else {
      console.warn(
        "[IdePushClientService] Cannot send save event — socket not connected."
      );
    }
  }
}
```

backend logs
```log
[10/11/2025, 10:09:58 PM] [INFO]: a user connected [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/01 [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: starting getRegisteredEvents() [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"register-client","emittEvent":"push-registered-client","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"srv-received","emittEvent":"push-srv-received","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"msg-relayed","emittEvent":"push-msg-relayed","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"msg-pushed","emittEvent":"push-msg-pushed","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"msg-received","emittEvent":"push-delivered","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"msg-completed","emittEvent":"push-msg-completed","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"register","emittEvent":"registered","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"login","emittEvent":"push-menu","sFx":"pushEnvelop"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"send-memo","emittEvent":"push-memo","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"send-pub","emittEvent":"push-pub","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"send-react","emittEvent":"push-react","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"send-menu","emittEvent":"push-menu","sFx":"push"} [CONTEXT] -> {}
[10/11/2025, 10:09:58 PM] [INFO]: SioService::runRegisteredEvents(socket)/e:{"triggerEvent":"send-notif","emittEvent":"push-notif","sFx":"push"} [CONTEXT] -> {}
```


Backend service
```ts
export class SioService {
    logger: Logging;
    b = new BaseService();

    constructor() {
        this.logger = new Logging();
    }

    run(io, pubClient, subClient) {
        // this.logger.logInfo("SioService::run()/io:", io)
        // this.logger.logInfo("SioService::run()/pubClient:", pubClient)
        // this.logger.logInfo("SioService::run()/subClient:", subClient)
        const port = config.push.serverPort;
        pubClient.on("error", (err) => {
            this.logger.logInfo(`pubClient error: ${JSON.stringify(err)}`);
        });
        io.adapter(createAdapter(pubClient, subClient));
        io.on('connection', (socket) => {
            this.logger.logInfo('a user connected');
            this.runRegisteredEvents(socket, io, pubClient)
            socket.on('disconnect', () => {
                this.logger.logInfo('a user disconnected!');
            });
        });
    }

    /**
     * This array can be a configuration available in the database.
     * There would then be different sets depending on the calling application.
     * This would then mean one server can handle several applications..eg:
     * - memo
     * - tracking financial transaction
     * - authentication process
     * - system transaction tracking
     * triggerEvent: the listening event at the server to handle a given message
     *              or event emitted by the client
     * emittEvent: the listening event at the client to handles a given message
     *              or event emitted by the server
     * sFx: server function that handles a given message
     * 
     * cFx: client function that handles a given message
     */
    getRegisteredEvents(): PushEvent[] {
        this.logger.logInfo('starting getRegisteredEvents()');
        this.testColouredLogs();
        return [
            {
                triggerEvent: 'register-client',
                emittEvent: 'push-registered-client',
                sFx: 'push'
            },
            {
                triggerEvent: 'srv-received',
                emittEvent: 'push-srv-received',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-relayed',
                emittEvent: 'push-msg-relayed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-pushed',
                emittEvent: 'push-msg-pushed',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-received',
                emittEvent: 'push-delivered',
                sFx: 'push'
            },
            {
                triggerEvent: 'msg-completed',
                emittEvent: 'push-msg-completed',
                sFx: 'push'
            },
            {
                triggerEvent: 'register',
                emittEvent: 'registered',
                sFx: 'push'
            },
            {
                triggerEvent: 'login',
                emittEvent: 'push-menu',
                sFx: 'pushEnvelop'
            },
            {
                triggerEvent: 'send-memo',
                emittEvent: 'push-memo',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-pub',
                emittEvent: 'push-pub',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-react',
                emittEvent: 'push-react',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-menu',
                emittEvent: 'push-menu',
                sFx: 'push'
            },
            {
                triggerEvent: 'send-notif',
                emittEvent: 'push-notif',
                sFx: 'push'
            }
        ]
    }

    runRegisteredEvents(socket, io, pubClient) {
        this.logger.logInfo('SioService::runRegisteredEvents(socket)/01');
        // this.logger.logInfo('SioService::runRegisteredEvents(socket)/socket:', socket);
        // listen to registered events
        this.getRegisteredEvents().forEach((e) => {

            this.logger.logInfo(`SioService::runRegisteredEvents(socket)/e:${JSON.stringify(e)}`);
            socket.on(e.triggerEvent, async (payLoad: string) => {
                console.log('---------------------------------------')
                console.log(`socket.on${e.triggerEvent}`)
                console.log('---------------------------------------')
                this.logger.logInfo(`SioService::runRegisteredEvents()/e.triggerEvent:${e.triggerEvent}`);
                this.logger.logInfo(`SioService::runRegisteredEvents()/payLoad:${JSON.stringify(payLoad)}`);
                const pushEnvelop: ICdPushEnvelop = JSON.parse(payLoad)
                const sender = this.getSender(pushEnvelop.pushData.pushRecepients);
                this.logger.logInfo(`SioService::runRegisteredEvents()/sender:${JSON.stringify(sender)}`);
                await this.persistSenderData(sender, socket, pubClient)
                if (pushEnvelop.pushData.commTrack.completed) {
                    /**
                     * process message completion
                     */
                    this.logger.logInfo('SioService::getRegisteredEvents()/message processing completed')
                    this.logger.logInfo(`SioService::getRegisteredEvents()/pushEnvelop:${pushEnvelop}`);
                    console.log('--------------------------------------------------------------------------')
                    console.log('PROCESS COMPLETED')
                    console.log('--------------------------------------------------------------------------')
                } else {
                    this.relayMessages(pushEnvelop, io, pubClient)
                }

            });
        })
    }

    getSender(pushRecepients: ICommConversationSub[]): ICommConversationSub {
        return pushRecepients.filter((r) => r.subTypeId === 1)[0]
    }

    resourceHasSocket() {
        // confirm if resource has socket already
    }

    async persistSenderData(sender: ICommConversationSub, socket, pubClient) {
        this.logger.logInfo(`SioService::persistSenderData/01/socket.id: ${socket.id}`);
        sender.cdObjId.socketId = socket.id;
        const k = sender.cdObjId.resourceGuid;
        const v = JSON.stringify(sender);
        this.logger.logInfo(`SioService::persistSenderData()/k:${k}`);
        this.logger.logInfo(`SioService::persistSenderData()/v:${v}`);
        return await this.b.wsRedisCreate(k, v);
    }

    relayMessages(pushEnvelop: ICdPushEnvelop, io, pubClient) {
        if (pushEnvelop.pushData.commTrack.completed === true) {
            this.logger.logInfo(`SioService::relayMessages()/pushEnvelop:${pushEnvelop}`);
            console.log('--------------------------------------------------------------------------')
            console.log('PROCESS COMPLETED')
            console.log('--------------------------------------------------------------------------')

        } else {
            pushEnvelop.pushData.pushRecepients.forEach(async (recepient: ICommConversationSub) => {
                let payLoad = '';
                this.logger.logInfo(`SioService::relayMessages()/recepient:${JSON.stringify(recepient)}`);
                this.logger.logInfo("SioService::relayMessages()/pushEnvelop.pushData.pushRecepients:", pushEnvelop.pushData.pushRecepients);
                console.log("SioService::relayMessages()/pushEnvelop:", pushEnvelop);
                // const recepientSocket = this.recepientSocket(recepient, pubClient);
                const recepientDataStr = await this.destinationSocket(recepient);
                this.logger.logInfo("SioService::relayMessages()/pushEnvelop.pushData.recepientDataStr:", recepientDataStr);
                const recepientData = JSON.parse(recepientDataStr.r);
                this.logger.logInfo(`SioService::relayMessages()/recepientData:${JSON.stringify(recepientData)}`);

                if (recepientDataStr.r) {
                    const recepientSocketId = recepientData.cdObjId.socketId;
                    // const msg = JSON.stringify(pushEnvelop);
                    switch (recepient.subTypeId) {
                        case 1:
                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO SENDER')
                            console.log('--------------------------------------------------------------------------')
                            // handle message to sender:
                            // mark message as relayed plus relayedTime
                            // const pushEnvelop1 = this.shallow(pushEnvelop)
                            const pushEnvelop1: ICdPushEnvelop = JSON.parse(JSON.stringify(pushEnvelop));
                            pushEnvelop1.pushData.commTrack.relayTime = Number(new Date());

                            // pushEnvelop1.pushData.emittEvent = 'push-msg-relayed';
                            if (pushEnvelop1.pushData.commTrack.relayed !== true) {
                                pushEnvelop1.pushData.isNotification = true;
                            }

                            this.logger.logInfo(`SioService::relayMessages()/[switch 1] pushEnvelop:${JSON.stringify(pushEnvelop1)}`);
                            this.logger.logInfo('SioService::relayMessages()/[switch 1] sending confirmation message to sender');
                            this.logger.logInfo(`SioService::relayMessages()/[switch 1] pushEnvelop.pushData.triggerEvent:${pushEnvelop1.pushData.triggerEvent}`);
                            this.logger.logInfo('case-1: 01')
                            if (pushEnvelop1.pushData.isAppInit) {
                                /**
                                 * if the incoming message is for applitialization:
                                 * - nb: the resourceGuid is already saved in redis for reference
                                 * - save socket in envelop
                                 * - push message back to sender with socketid info
                                 * - the client app will rely on these data for subsequest communication by federated components of the app
                                 */
                                console.log('--------------------------------------------------------------------------')
                                console.log('SENDING APP-INIT-DATA')
                                console.log(`case-1: 011...isAppInit->triggerEvent === push-registered-client`)
                                console.log('--------------------------------------------------------------------------')
                                const socketStore: ISocketItem = {
                                    socketId: recepientSocketId,
                                    name: 'appInit',
                                    socketGuid: this.b.getGuid()
                                }
                                // save socket
                                pushEnvelop1.pushData.appSockets.push(socketStore)
                                // send back to sender
                                io.to(recepientSocketId).emit('push-registered-client', pushEnvelop1);
                            }
                            if (pushEnvelop1.pushData.isNotification) {
                                this.logger.logInfo('case-1: 02...isNotification')
                                if (pushEnvelop1.pushData.commTrack.relayed !== true && pushEnvelop1.pushData.commTrack.pushed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 04...isNotification->triggerEvent === msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    pushEnvelop1.pushData.emittEvent = 'push-msg-relayed';
                                    pushEnvelop1.pushData.commTrack.relayed = true;
                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                }

                                if (pushEnvelop1.pushData.commTrack.delivered === true && pushEnvelop1.pushData.commTrack.completed !== true ) {
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING NOTIFICATION')
                                    console.log(`case-1: 03...isNotification->event to emit === push-delivered`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                }

                                // was closed and open for testing on 8 jul 2024
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-received' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    this.logger.logInfo('SENDING NOTIFICATION')
                                    this.logger.logInfo(`case-1: 041...isNotification->triggerEvent === msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * this is notification from recepient to sender
                                     * to confirm message has been delivered
                                     */
                                    io.to(recepientSocketId).emit('push-delivered', pushEnvelop1);
                                }
                                // was closed and open for testing on 8 jul 2024
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-completed' && pushEnvelop1.pushData.commTrack.completed !== true) {
                                    console.log('--------------------------------------------------------------------------')
                                    this.logger.logInfo('SENDING NOTIFICATION')
                                    this.logger.logInfo(`case-1: 042...isNotification->triggerEvent === msg-completed`)
                                    console.log('--------------------------------------------------------------------------')

                                    /**
                                     * record completion of messaging
                                     */
                                    this.logger.logInfo('message completed')

                                }
                            } else {
                                this.logger.logInfo('case-1: 05')
                                // send notification to client for relay
                                if (pushEnvelop1.pushData.triggerEvent === 'msg-received') {
                                    this.logger.logInfo('case-1: 06')
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1/[msg-received]] sending 'msg-received' message to sender`);
                                    // payLoad = JSON.stringify(pushEnvelop);
                                    // io.to(recepientSocketId).emit('push-delivered', payLoad);
                                } else {
                                    this.logger.logInfo('case-1: 07')
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]] sending 'push-msg-relayed' message to sender`);
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/recepientSocketId:${JSON.stringify(recepientSocketId)}`)

                                    payLoad = JSON.stringify(pushEnvelop1);
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 1[push-msg-relayed]]/pushEnvelop1:${pushEnvelop1}`)
                                    console.log('--------------------------------------------------------------------------')
                                    console.log('SENDING PAYLOAD')
                                    console.log(`case-1: 08...seding payload ->emit event === 'push-msg-relayed`)
                                    console.log('--------------------------------------------------------------------------')
                                    io.to(recepientSocketId).emit('push-msg-relayed', pushEnvelop1);
                                    // io.to(recepientSocketId).emit('push-msg-relayed', '{"msg": "testing messege"}');
                                    // io.emit('push-msg-relayed', `{"msg": "testing messege"}`);
                                }
                            }

                            break;
                        case 7:

                            console.log('--------------------------------------------------------------------------')
                            console.log('STARTING MESSAGE TO RECEPIENTS')
                            console.log('No of app sockets:', { noOfSockets: pushEnvelop.pushData.appSockets.length })
                            console.log('--------------------------------------------------------------------------')
                            // const pushEnvelop7 = this.shallow(pushEnvelop)
                            const pushEnvelop7 = JSON.parse(JSON.stringify(pushEnvelop));
                            this.logger.logInfo(`SioService::relayMessages()/[switch 7] pushEnvelop copy:${JSON.stringify(pushEnvelop7)}`);
                            // handle message to destined recepient
                            // if(pushEnvelop.pushData.emittEvent === 'msg-received'){
                            //     // if it is message confirmation to sender
                            //     pushEnvelop.pushData.commTrack.deliveryTime = Number(new Date());
                            //     pushEnvelop.pushData.commTrack.deliverd = true;
                            // }
                            this.logger.logInfo('case-7: 01')
                            if (pushEnvelop7.pushData.isNotification) {
                                this.logger.logInfo('case-7: 02')
                            } else {
                                this.logger.logInfo('case-7: 03')
                                if (pushEnvelop7.pushData.commTrack.pushed) {
                                    this.logger.logInfo('case-7: 04')
                                } else {
                                    this.logger.logInfo('case-7: 05')
                                    pushEnvelop7.pushData.commTrack.relayTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.relayed = true;
                                    pushEnvelop7.pushData.commTrack.pushTime = Number(new Date());
                                    pushEnvelop7.pushData.commTrack.pushed = true;
                                    pushEnvelop7.pushData.triggerEvent = 'msg-pushed';
                                    pushEnvelop7.pushData.emittEvent = 'push-msg-pushed';
                                    this.logger.logInfo(`SioService::relayMessages()/[switch 7] pushEnvelop7:${JSON.stringify(pushEnvelop7)}`);
                                    if (pushEnvelop7.pushData.triggerEvent === 'msg-received') {
                                        this.logger.logInfo('case-7: 06')
                                        // while relaying 'msg-received', do not send to group 7 (recepients)
                                        this.logger.logInfo('SioService::relayMessages()/[switch 7] not sending message to recepient, this is just confirmation');
                                    } else {
                                        this.logger.logInfo('case-7: 07')
                                        this.logger.logInfo(`SioService::relayMessages()/[switch 7] sending to recepient:${JSON.stringify(pushEnvelop7)}`);
                                        console.log('--------------------------------------------------------------------------')
                                        console.log('SENDING PAYLOAD')
                                        console.log(`case-7: 08...seding payload ->emit event === ${pushEnvelop7.pushData.emittEvent}`)
                                        console.log(`case-7: 09...seding payload ->recepientSocketId = ${recepientSocketId}`)
                                        console.log('--------------------------------------------------------------------------')
                                        payLoad = JSON.stringify(pushEnvelop7);
                                        io.to(recepientSocketId).emit(pushEnvelop7.pushData.emittEvent, pushEnvelop7);
                                    }
                                }

                            }

                            break;
                    }
                } else {
                    this.logger.logInfo("@@@@@@@@@@@@@@@ No valid response for recepientData from the redis storage @@@@@@@@@@@@@@@@@")
                    this.logger.logInfo(`@@@@@@@@@@@@@@@ The client ${recepient.cdObjId.resourceName} may not be connected to the push server @@@@@@@@@@@@@@@@@`)
                }

            })
        }

    }

    async destinationSocket(recepient: ICommConversationSub) {
        this.logger.logInfo("SioService::destinationSocket()/recepient):", recepient)
        this.logger.logInfo("@@@@@@@@@@@@@@@@@@@@@@@@@@@ check recepeint @@@@@@@@@@@@@@@@@@@@@@@@@@@")
        const k = recepient.cdObjId.resourceGuid
        // return await pubClient.get(key, (err, socketDataStr) => {
        //     if (err) throw err;
        //     const recepientData: ICommConversationSub = JSON.parse(socketDataStr);
        //     const rs = recepientData.cdObjId.socketId;
        //     this.logger.logInfo('recepientSocket:', rs);
        //     return rs;
        // });
        return await this.b.wsRedisRead(k);
    }

    async getRooms(io) {
        const rooms = await io.of('/').adapter.allRooms();
        this.logger.logInfo(rooms); // a Set containing all rooms (across every node)
        return rooms;
    }

    shallow<T extends object>(source: T): T {
        // return {
        //     ...source,
        // }
        ///////////////////////////////////////
        const copy = {} as T
        Object.keys(source).forEach((key) => {
            copy[key as keyof T] = source[key as keyof T]
        })
        return copy
        ////////////////////////////////////////////
    }

}
```






















///////////////////////////////////////

## ToDo:

Documentation:

- Menu System:menu/services/menuRenderer.ts → How the raw menu config is turned into HTML/DOM.

- Module Loader:module/services/module.service.ts → How modules are discovered and loaded.
  - build via 'npm run build'
    - process compilation to dist-ts
    - vite compiles to dist
    - execute post-build.js
  - index.html calls app.ts
  - app.ts calls main.ts
  - main.ts calls module loader
  - run 'npm run preview


- Theme Loader:theme/services/theme-loader.ts → How CSS and JSON configs are applied dynamically.

- Config Files: config/shell.config.ts and config/themeConfig.ts → Default settings, structure, and developer extension points.

- Logger Utility:utils/logger.ts → For developers to know how to debug and integrate logs in their modules.

Classing the codes:
- convert the codes from function to classes (Done)
- Make sure the process can compile all the codes into dist-ts

- update of documentation for 
  - module loading (doc0005)
  - directives (doc0007)

Change the design for lifecycle of dev-controllers to runtime-controller
  Goal:
  - raising the bar for live interactions with dev browser
  - borrow from cd-cli code in terms of saving dev-code as objects
  - is it possible to make use of git state in a given file to manage auto updates
  - how can we implement watcher that can update browser during development
  - use of descriptors
  - goal: when codes are being changed, the browser can be configured to respond simultenously
    - capacity to make changes vie (manaual, cd-cli or ai)
    - capacity to run visual tests of functions for a given module which displays browser or device.
Implementation:
- proof of concept (convert dev-controller to runtime-controller)
- implementation plan
- integration of cd-cli
  



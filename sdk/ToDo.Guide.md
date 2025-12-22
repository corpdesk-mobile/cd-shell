//////////////////////////////////////////////
Below are some files that hints on how the node.js/typescript cd-shell pages load.
Let me know options that I have and what you recommend for avaoiding FOUC.
// index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Corpdesk Shell</title>

    <!-- Vendor-only static dependencies -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
  </head>

  <body>
    <header id="cd-header">
      <button id="cd-burger" aria-label="Menu toggle">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
      </button>

      <img id="cd-logo" alt="Logo" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"></aside>
      <main id="cd-main-content"></main>
    </div>

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
```

// src/main.ts

```ts
export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  // private svThemeLoader!: ThemeLoaderService;
  private logger = new LoggerService();

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svModule = new ModuleService();
    this.svMenu = new MenuService();
    this.svController = new ControllerService();
    this.svTheme = new ThemeService();
    // this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);

    // ✅ Load shell config and apply log level
    const shellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    diag_css("Main.run() started");

    // ----------------------------
    // STEP 0: Load shell config
    // ----------------------------
    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    // ----------------------------
    // STEP 1: Core service instantiation
    // ----------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 2: Load all cached metadata
    // ----------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    // ----------------------------
    // STEP 3: Apply UI-system + Theme pipeline
    // ----------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    // ----------------------------
    // STEP 4: Theme config (logo + title)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById(
      "cd-logo"
    ) as HTMLImageElement | null;
    if (logoEl && themeConfig.logo) {
      logoEl.src = themeConfig.logo;
    }

    // ----------------------------
    // STEP 5: Prepare menu
    // ----------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }
          if (item.children) item.children = recursive(item.children);
          return item;
        });
      };
      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    // ----------------------------
    // STEP 6: Render sidebar
    // ----------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    // ----------------------------
    // STEP 7: Auto-load default controller
    // ----------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    // ----------------------------
    // STEP 8: Burger + Mobile UX
    // ----------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);

      applyMobileState();
    }

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

  /**
   * Purpose: Load UI System + Load Theme + Activate UI-System-specific logic.
   */
  async applyStartupUiSettings(): Promise<void> {
    const cfgSvc = ConfigService.getInstance();
    // ensure sys cache is ready
    await this.svSysCache.ensureReady();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
    if (!uiConfig) {
      console.warn("[Main.applyStartupUiSettings] uiConfig missing");
      return;
    }

    const systemId = uiConfig.defaultUiSystemId;
    const themeId = uiConfig.defaultThemeId;

    diag_css("[MAIN.applyStartupUiSettings] start", { systemId, themeId });

    // Use singletons bound to same SysCache instance
    const uiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    const uiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);

    // 1) Activate UI system (loads CSS + JS)
    try {
      await uiSystemLoader.activate(systemId);
      diag_css("[MAIN.applyStartupUiSettings] ui-system activated", {
        systemId,
      });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] activate failed", err);
      diag_css("[MAIN.applyStartupUiSettings] activate failed", { err });
    }

    // 2) Load structural shell CSS (base + index) AFTER system to ensure layering
    try {
      await uiSystemLoader.loadCSS("/themes/common/base.css", "shell-base");
      await uiSystemLoader.loadCSS("/assets/css/index.css", "shell-index");
      diag_css("[MAIN.applyStartupUiSettings] shell CSS loaded", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] shell CSS load failed", err);
    }

    // 3) load theme override CSS
    try {
      await uiThemeLoader.loadThemeById(themeId);
      diag_css("[MAIN.applyStartupUiSettings] theme css injected", { themeId });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] theme load failed", err);
    }

    // 4) per-system applyTheme (sets data-bs-theme, md classes, etc.)
    try {
      await uiSystemLoader.applyTheme(systemId, themeId);
      diag_css("[MAIN.applyStartupUiSettings] system applyTheme complete", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] applyTheme failed", err);
    }

    diag_css("[MAIN.applyStartupUiSettings] done", {});
  }

  async loadShellConfig(): Promise<ShellConfig> {
    const res = await fetch("/shell.config.json");
    if (!res.ok) {
      throw new Error(`Failed to load shell config: ${res.statusText}`);
    }
    return await res.json();
  }
}
```

// src/CdShell/sys/cd-user/view/sign-up.controller.js

```js
export const ctlSignUp = {
  username: "",
  password: "",
  binder: null,

  /**
   * Initializes the controller — constructs the form and binder.
   */
  __init() {
    this.form = new CdFormGroup({
      userName: new CdFormControl("", [
        CdValidators.required("Username is required"),
      ]),
      password: new CdFormControl("", [
        CdValidators.required("Password is required"),
        CdValidators.minLength(4, "Password must be at least 4 characters"),
      ]),
    });

    // Initialize binder — form selector must match template form ID
    this.binder = new CdDirectiveBinderService(this.form, "#signUpForm", this);
  },

  __template() {
    return `
      <form id="signUpForm" class="cd-sign-up">
        <h1 class="cd-heading">Signup</h1>

        <label>Username</label>
        <input cd-model="username" placeholder="Username" />

        <label>Password</label>
        <input cd-model="password" type="password" placeholder="Password" />

        <button type="button" cd-click="auth">Signup</button>
      </form>
    `;
  },

  __setup() {
    console.log("[cd-user] Controller setup complete");
  },

  auth() {
    console.log("Signup triggered with:", this.username, this.password);
    alert(`Hello, ${this.username}!`);
  },

  // 💡 NEW: Deactivation Hook - Runs when user clicks *away*
  __deactivate() {
    // Stop any active animations, remove DOM-dependent listeners, etc.
    // The binder must provide a way to remove all listeners.
    if (this.binder?.unbindAllDomEvents) {
      this.binder.unbindAllDomEvents();
    }
  },

  // 💡 NEW: Activation Hook - Runs when view is *injected*
  async __activate() {
    // Re-establish DOM bindings and apply current form state
    if (this.binder?.bindToDom) {
      // This method must find the newly injected DOM (#settingsForm)
      // and re-attach all form control listeners (input, change, blur)
      await this.binder.bindToDom();
    }
    // Optional: Restore scroll position, run focus logic, etc.
  },
};
```

/////////////////////////////////////////////////
I have added showSplash() to Main.
Below the current state of Main.run().
To avoid any ambiguity, give me the full run() integrated with showSplash() and how the spash screen is removed.

```ts
export class Main {
  async run() {
    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");

    diag_css("Main.run() started");

    // ----------------------------
    // STEP 0: Load shell config
    // ----------------------------
    const shellConfig: ShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    // ----------------------------
    // STEP 1: Core service instantiation
    // ----------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    // ----------------------------
    // STEP 2: Load all cached metadata
    // ----------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    // ----------------------------
    // STEP 3: Apply UI-system + Theme pipeline
    // ----------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    // ----------------------------
    // STEP 4: Theme config (logo + title)
    // ----------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById(
      "cd-logo"
    ) as HTMLImageElement | null;
    if (logoEl && themeConfig.logo) {
      logoEl.src = themeConfig.logo;
    }

    // ----------------------------
    // STEP 5: Prepare menu
    // ----------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] => {
        return items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }
          if (item.children) item.children = recursive(item.children);
          return item;
        });
      };
      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    // ----------------------------
    // STEP 6: Render sidebar
    // ----------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    // ----------------------------
    // STEP 7: Auto-load default controller
    // ----------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );

      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    // ----------------------------
    // STEP 8: Burger + Mobile UX
    // ----------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);

      applyMobileState();
    }

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }
}
```

/////////////////////////////////////////////
Codes for the class below has been taken from working Angular implementation.
We need to refactor it to the document we have just developed and to rely on HttpSerivce that was shared earlier.
Assume you are working on a new class but using the codes just a a reference on the contract it was meant to fulfill.
Let me know if you need any further clarification.
You may need to propose for items for UserModel to support building of envelops similar to the example we used earlier.

```ts
export class UserService extends GenericService<UserModel> {
  // b = new BaseService<UserModel>();
  private svAppState: AppStateService;
  // private svServer: ServerService;
  private svHttp: HttpService;
  public svSocket: SocketIoService;
  public svSio: SioClientService;
  private env: EnvConfig;

  private logger = new LoggerService();

  private postData: any;
  cd_token: string | undefined = "";
  userData: User[] = [];
  cuid = "";
  userName = "";
  fullName = "";
  contacts = [];
  allUsers = [];
  cuidAvatar = "";
  currentUser: any;
  currentProfile: any = {
    name: "Login/Register",
    picture: "assets/cd/branding/coop/avatarCircle.svg",
  };
  pals: any;
  public usersData$: Observable<UserData[]>;
  // CdResponse
  public userDataResp$: Observable<any>;
  isInvalidSelUsers = true;
  selectedUsers: User[] = [];

  ///////////////////////////////////////////////////////////////////////////////////////////////
  // ADAPTATION FROM GENERIC SERVICE
  constructor() {
    super();
    this.svSio.setEnv(this.env);
    this.svSio.initSio();
  }

  async init(): Promise<void> {
    console.log("starting SignInController::init()");
    // Initialize HttpService
    const httpService = new HttpService(true); // Enable debug mode
    const baseUrl = await httpService.getCdApiUrl(config.cdApiLocal);
  }

  async auth(data: {
    user: UserModel;
    consumer: ConsumerModel;
  }): Promise<void> {
    console.log("starting SignInController:auth()");
    console.log("SignInController:auth()/data:", data);
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

  setEnv(env: EnvConfig) {
    this.env = env;
  }

  userDataResp(resp: ICdResponse) {
    console.log("starting cdUiLib::UserService::userDataResp()");
    if (resp) {
      console.log("cdUiLib::UserService::init()/res:", resp);
      // this.cd_token = resp.app_state.sess.cd_token;
      this.cd_token = resp.app_state.sess!.cd_token;
      // { name: 'Login/Register', picture: 'assets/cd/branding/coop/avatarCircle.svg' }
      // this.currentUser = resp.data;
      // this.currentUser.name = 'Login/Register';
      if (resp.app_state.success) {
        if ("userData" in resp.data) {
          this.currentProfile.name = resp.data.userData.username;
          this.currentUser = resp.data.userData.username;
          this.cuid = resp.data.userData.user_id;
          this.pals = resp.data.pals;
          // this.currentUser.picture = 'assets/cd/branding/coop/avatarCircle.svg';
          const avatarUrl = `${this.env.shellHost}/user-resources/${resp.data.userData.user_guid}/avatar-01/a.jpg`;
          console.log("avatarUrl:", avatarUrl);
          this.currentProfile.picture = avatarUrl;
        }
      }
    }
  }

  // authObsv(authData: AuthData) {
  //   console.log('authObsv(authData: AuthData)');
  //   this.setEnvelopeAuth(authData);
  //   /*
  //   post login request to server
  //   */
  //   console.log('Submit()/this.postData:', JSON.stringify(this.postData))
  //   return this.svServer.proc(this.postData);
  // }

  auth$(authData: IAuthData) {
    console.log("auth$(authData: AuthData)");
    delete authData.rememberMe;
    this.setEnvelopeAuth(authData);
    // console.log('Submit()/this.postData:', JSON.stringify(this.postData))
    this.svServer.setEnv(this.env);
    return this.svServer.proc(this.postData);
  }

  setEnvelopeAuth(authData: IAuthData) {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "Login",
      dat: {
        f_vals: [
          {
            data: authData,
          },
        ],
        token: null,
      },
      args: null,
    };
  }

  // getUserData(loginResp: CdResponse) {
  //   // console.log('starting UserService::getUserData()');
  //   // console.log('UserService::getUserData()/loginResp:', loginResp);
  //   this.setUserData(loginResp);
  // }

  configPushPayload(
    triggerEvent: string,
    emittEvent: string,
    cuid: number | string
  ): ICdPushEnvelop {
    console.log("starting cdUiLib::UserService::configPushPayload()");
    const pushEnvelope: ICdPushEnvelop = {
      pushData: {
        pushGuid: "",
        m: "",
        pushRecepients: [],
        triggerEvent: "",
        emittEvent: "",
        token: "",
        isNotification: null,
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

    const users = [
      {
        userId: cuid,
        subTypeId: 1,
        cdObjId: {
          appId: this.env.appId,
          ngModule: "UserModule",
          resourceName: "SessionService",
          resourceGuid: uuidv4(),
          jwtToken: "",
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
        },
      },
      // {
      //   userId: 1011,
      //   subTypeId: 1,
      //   cdObjId: {
      //     appId: this.env.appId,
      //     ngModule: 'UserModule',
      //     resourceName: 'SessionService',
      //     resourceGuid: uuidv4(),
      //     jwtToken: '',
      //     socket: null,
      //     socketId: '',
      //     commTrack: {
      //       initTime: Number(new Date()),
      //       relayTime: null,
      //       relayed: false,
      //       pushed: false,
      //       pushTime: null,
      //       deliveryTime: null,
      //       delivered: false,
      //       completed: false,
      //       completedTime: null
      //     },
      //   },
      // }
    ];

    const envl: ICdPushEnvelop = { ...pushEnvelope };
    envl.pushData.triggerEvent = triggerEvent;
    envl.pushData.emittEvent = emittEvent;

    // set sender
    const uSender: any = { ...users[0] };
    uSender.subTypeId = 1;
    envl.pushData.pushRecepients.push(uSender);

    // set recepient
    const uRecepient: any = { ...users[0] };
    uRecepient.subTypeId = 7;
    envl.pushData.pushRecepients.push(uRecepient);

    console.log(
      "starting cdUiLib::UserService::configPushPayload()/envl:",
      envl
    );

    return envl;
  }

  setUserData(loginResp: any) {
    this.svSio.initSio();
    console.log("starting cdUiLib::UserService::setUserData(loginResp)");
    console.log("cdUiLib::UserService::setUserData(res)/loginResp:", loginResp);
    this.setEnvelopUserDataPost(loginResp);
    // console.log('UserService::setUserData(res)/this.postData:', JSON.stringify(this.postData));
    this.svServer.proc(this.postData).subscribe((loginResp: any) => {
      // console.log('UserService::setUserData(res)/userDataResp:', userDataResp);
      // this.svMenu.init(userDataResp);
      this.userDataResp(loginResp);
      // this.svNotif.init(userDataResp);
      this.svAppState.setMode("anon");
      // this.svMessages.init(userDataResp);
      const loginData: ILoginData = loginResp["data"];
      if (loginResp.app_state.success) {
        this.env.consumer = loginData.consumer[0].consumerGuid;
        // const cdEnvelop = { req: this.postData, resp: loginResp };

        /**
         * emittEvent is null because the purpose here is to
         * register user socket on successfull login.
         * At the time of this note, no broadcast event is set
         */
        // const pushEnvelop: ICdPushEnvelop = {
        //   pushRecepients: null,
        //   pushData: null,
        //   emittEvent: null,
        //   triggerEvent: 'login',
        //   req: null,
        //   resp: userDataResp
        // };
        // const pushEnvelop = this.configPushPayload('login', 'push-menu', loginData.userData.userId)
        // this.emitLogin(pushEnvelop);
        // this.svSio.sendPayLoad(pushEnvelop);
      }
    });
  }

  setEnvelopUserDataPost(loginResp: ICdResponse) {
    // console.log('starting UserService::setUserDataPost()');
    // console.log('setEnvelopUserDataPost/loginResp:', loginResp.app_state)
    /*
    set post data
    */
    this.postData = {
      ctx: "Sys",
      m: "Moduleman",
      c: "ModulesController",
      a: "GetModuleUserData",
      dat: {
        fields: null,
        token: loginResp.app_state.sess!.cd_token,
      },
      args: null,
    };
  }

  getUsersObsv(f: CdFilter[] | null) {
    // console.log('starting getUsersObsv()');
    this.setEnvelopeUsers(f);
    // console.log('this.postData:', JSON.stringify(this.postData));
    /*
    post request to server and return observable
    */
    return this.svServer.proc(this.postData);
  }

  setEnvelopeUsers(f: CdFilter[] | null) {
    let flt;
    if (f) {
      flt = [
        {
          filter: f,
        },
      ];
    } else {
      flt = null;
    }
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "actionGet",
      dat: {
        f_vals: flt,
        token: this.cd_token,
      },
      args: null,
    };
  }

  registerUser(data: any) {
    console.log(data);
    console.log(data.is_sys_module);
    this.setEnvelopeRegUser(data);
    /*
    post login request to server
    */
    this.svServer.proc(this.postData).subscribe((res: any) => {
      console.log(res);
      this.setRespRegUser(res.data);
    });
  }

  /**
   * 
   * @param data 
   * {
          "ctx": "Sys",
          "m": "Moduleman",
          "c": "ModulesController",
          "a": "actionRegisterModule",
          "dat": {
              "f_vals": [
                  {
                      "data": {
                          "module_name": "FooModule",
                          "is_sys_module": false,
                          "module_type_id": 1
                      }
                  }
              ],
              "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
          },
          "args": null
      }
   */
  setEnvelopeRegUser(regData: any) {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "Register",
      dat: {
        f_vals: [
          {
            data: regData,
            clientContext: this.env.clientContext,
          },
        ],
        docproc: {},
        token: this.svServer.token,
      },
      args: null,
    };
  }

  activateUser$(activationData: any) {
    console.log(activationData);
    this.setEnvelopeActivateUser(activationData);
    /*
    post login request to server
    */
    return this.svServer.proc(this.postData);
  }

  /**
   * 
   * @param data 
   * {
          "ctx": "Sys",
          "m": "User",
          "c": "User",
          "a": "ActivateUser",
          "dat": {
              "f_vals": [
                  {
                      "data": {
                          "activationKey": "459bc3d0-c10e-4264-9e37-5175c379b620"
                          "userId": 13,
                          "sid": 23
                      }
                  }
              ],
              "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
          },
          "args": null
      }
   */
  setEnvelopeActivateUser(activationData: any) {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "ActivateUser",
      dat: {
        f_vals: [
          {
            query: { where: activationData[0] },
            consumer: activationData[1],
          },
        ],
        docproc: {},
        token: this.svServer.token,
      },
      args: null,
    };
  }

  setRespRegUser(data: any) {
    console.log(data);
  }

  getAllUsers() {
    this.setEnvelopeAllUsers();
    /*
    post login request to server
    */
    this.svServer.proc(this.postData).subscribe((res) => {
      console.log("UserService::getAllUsers()/subscribe/res>>");
      console.log(res);
      this.setRespAllUsers(res);
    });
  }

  /**
   * {
            "ctx": "Sys",
            "m": "User",
            "c": "UserController",
            "a": "actionJoinGroup",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "user_id": 1010,
                            "group_guid_parent": "25E5D480-1F1E-166B-F1CD-0BA2BD86DC22"
                        }
                    }
                ],
                "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
            },
            "args": null
        }
   */
  setEnvelopeAllUsers() {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "actionGetAll",
      dat: {
        f_vals: [],
        docproc: {},
        token: this.svServer.token,
      },
      args: null,
    };
  }

  getUser$(reqQuery: EnvelopFValItem, sid: string) {
    this.setEnvelopeGetUser(reqQuery, sid);
    return this.svServer.proc(this.postData);
  }

  /**
   * ToDo: sort the token riddle...when being fetched for veryfying the user the 1st time
   * During registration, the sid retrieved should be able to allow verification of user.
   * At the moment a static one is used below. Not secure or tanable.
   * 
   * {
            "ctx": "Sys",
            "m": "User",
            "c": "UserController",
            "a": "actionJoinGroup",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "user_id": 1010,
                            "group_guid_parent": "25E5D480-1F1E-166B-F1CD-0BA2BD86DC22"
                        }
                    }
                ],
                "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
            },
            "args": null
        }
   */
  setEnvelopeGetUser(reqQuery: EnvelopFValItem, sid: string) {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "GetCount",
      dat: {
        f_vals: [reqQuery],
        token: sid,
      },
      args: {},
    };
  }
  /**
   * In the future, userId will be depricated.
   * At the backend, userId will be derived from cdToken
   * @param cdToken
   * @param userId
   * @returns
   */
  getUserProfile$(cdToken: string, userId?: number) {
    this.setEnvelopeGetUserProfile(cdToken, userId);
    return this.svServer.proc(this.postData);
  }

  /**
   * ToDo: sort the token riddle...when being fetched for veryfying the user the 1st time
   * During registration, the sid retrieved should be able to allow verification of user.
   * At the moment a static one is used below. Not secure or tanable.
   * 
   * {
            "ctx": "Sys",
            "m": "User",
            "c": "User",
            "a": "GetUserProfile",
            "dat": {
                "f_vals": [
                    {
                        "data": {
                            "userId": 1010
                        }
                    }
                ],
                "token": "mT6blaIfqWhzNXQLG8ksVbc1VodSxRZ8lu5cMgda"
            },
            "args": null
        }
   */
  setEnvelopeGetUserProfile(cdToken: string, userId?: number) {
    /**
     * In the future, userId will not be required but just the sid.
     * At the backend userId will be derived using cdToken
     */
    if (!userId) {
      userId = -1;
    }
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "GetUserProfile",
      dat: {
        f_vals: [
          {
            data: {
              userId: userId,
            },
          },
        ],
        token: cdToken,
      },
      args: {},
    };
  }

  setRespAllUsers(res: any) {
    console.log(res);
    this.allUsers = res["data"];
  }

  emitLogin(cdEnvelop: ICdPushEnvelop) {
    console.log("starting cdUiLib::UserService::emitLogin()");
    // this.svSocket.emit('login', cdEnvelop);

    cdEnvelop.pushData.triggerEvent = "login";
    cdEnvelop.pushData.emittEvent = "push-menu";
    this.svSio.sendPayLoad(cdEnvelop);
  }

  /**
   * The above is to effect switching to default image when user has not
   * set avatar.
   * Desired method is to use a directive.
   * Attempted sample: <project-dir>/src/app/pages/cd-palette/directives/default-image.directive.ts
   */
  getAvatar(User: any) {
    let src;
    if (User.done_avatar) {
      src = `${this.env.USER_RESOURCES}/${User.user_guid}/avatar-01/a.jpg`;
    } else {
      src = `${this.env.USER_RESOURCES}/ooooooooo/avatar-01/a.jpg`;
    }
    return src;
  }

  /**
   * get users registered under a given consumer
   * For demo purpose, we are just pulling all the users
   * However, yet to be implemented is registration of
   * <consumer_guig>-users where all the registered users will be kept.
   */
  getConsumerUsersObsv() {
    return this.getUsersObsv(null);
  }

  getGroupUsersObsv(groupGuidParent: any) {
    this.setEnvelopeGetGroupUsers(groupGuidParent);
    return this.svServer.proc(this.postData);
  }
  /**
   * {
          "ctx": "Sys",
          "m": "User",
          "c": "GroupMemberController",
          "a": "actionGetGroupUsers",
          "dat": {
              "f_vals": [
                  {
                      "data": {
                          "group_guid_parent": "08E30801-A7C0-E6A0-3FB1-394E7A71B456"
                      }
                  }
              ],
              "token": "15910E2B-5491-679D-3028-C99CE64CAC53"
          },
          "args": null
      }
   */
  setEnvelopeGetGroupUsers(groupGuidParent: any) {
    this.postData = {
      ctx: "Sys",
      m: "User",
      c: "GroupMemberController",
      a: "actionGetGroupUsers",
      dat: {
        f_vals: [
          {
            data: {
              group_guid_parent: groupGuidParent,
            },
          },
        ],
        docproc: {},
        token: this.svServer.token,
      },
      args: null,
    };
  }
}
```

//////////////////////////////////////////////
Do a documentation for implementing http request and processing the response from a corpdesk client.
The simple process is, developer implementing an http request of the type ICdRequest and expects a ICdResponse via HttpService. There is some guide in the HttpService: confirm if it is up to date or need to be revised.
I have shared example with ModuleRegisterService.registerModuleInCdInstance() showing the service and model structures.
Below the following reference:
Extracts from src/CdShell/sys/base/i-base.ts

```ts
// cd request format
export interface ICdRequest {
  ctx: string;
  m: string;
  c: string;
  a: string;
  dat: EnvelopDat;
  args: any | null;
}

export interface EnvelopDat {
  f_vals: EnvelopFValItem[];
  token: string | null;
}

export interface EnvelopFValItem {
  query?: IQuery | null;
  data?: any;
  extData?: any;
  jsonUpdate?: any;
  /**
   * Developer-specific objects (like cdObj, userObj, etc.)
   * Any additional property is allowed here.
   */
  [key: string]: any;
}

export interface ICdResponse {
  app_state: IAppState;
  data: any;
}

export interface IAppState {
  success: boolean;
  info: IRespInfo | null;
  sess: ISessResp | null;
  cache: object | null;
  sConfig?: IServerConfig;
}

export interface IServerConfig {
  usePush: boolean;
  usePolling: boolean;
  useCacheStore: boolean;
}

export interface IRespInfo {
  messages: string[];
  code: string | null;
  app_msg: string | null;
}

export interface ISessResp {
  cd_token?: string;
  userId?: number | string | null;
  jwt: {
    jwtToken: string | null;
    checked: boolean;
    checkTime: number | null;
    authorized: boolean;
    ttl: number | null;
  } | null;
  ttl: number;
  initUuid?: string;
  initTime?: string;
}
```

// src/CdShell/sys/base/http.service.ts

```ts
/**
 * 
 * Usage Guide
 * ***********************************************
//  1. Using Preset Profile (cdApiLocal)
const httpService = new HttpService(true); // Enable debugMode
const postData: ICdRequest;
const result = await httpService.proc(
  postData,
  'cdApiLocal', // Optional since it's the default
);

if (result.state) {
  console.log('✅ Modules:', result.data);
} else {
  console.error('❌ Error:', result.message);
}

***************************************************

// 2. Using profile:
const httpService = new HttpService(true); // With debug logs
// Optionally initialize the profile (skipped automatically if `request()` or `proc()` is called)
await httpService.init('deepseek');

const profileName = 'deepseek';

const config: AxiosRequestConfig = {
  method: 'POST',
  url: '/chat/completions',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer #apiKey', // Will be decrypted automatically
  },
  data: {
    model: 'deepseek-chat',
    messages: [
      { role: 'user', content: 'What is the capital of Kenya?' },
    ],
  },
};

// Make the request (profile must exist in your cd-cli profile list)
const response = await httpService.request(config, profileName);

if (response.state) {
  console.log('✅ Response from Deepseek:', response.data);
} else {
  console.error('❌ Error calling Deepseek:', response.message);
}

*************************************************************************
3.

const profileDetails = profile.cdCliProfileData.details;
const result = await httpService.request(profileDetails.httpConfig, 'deepseek');

*******************************************************************************

4. Typical profile with httpConfig

{
  "cdCliProfileName": "deepseek",
  "cdCliProfileData": {
    "details": {
      "apiKey": {
        "name": "apiKey",
        "description": "Encrypted Deepseek API key",
        "value": null,
        "encryptedValue": "<long-encrypted-string>",
        "isEncrypted": true,
        "encryptionMeta": {
          "name": "default",
          "algorithm": "aes-256-cbc",
          "encoding": "hex",
          "ivLength": 16,
          "iv": "<iv-hex>",
          "encryptedAt": "2025-05-25T10:24:35.527Z"
        }
      },
      "baseUrl": "https://api.deepseek.com/v1",
      "defaultModel": "deepseek-chat",
      "cryptFields": ["apiKey"],
      "httpConfig": {
        "method": "POST",
        "url": "/chat/completions",
        "headers": {
          "Content-Type": "application/json",
          "Authorization": "Bearer #apiKey"
        },
        "data": null
      },
      "encrypted": true
    }
  }
}
 */

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// import * as https from "https";
// // import { CdCliProfileController } from "../cd-cli/controllers/cd-cli-profile.cointroller.js";
import CdLog from "../cd-comm/controllers/cd-logger.controller.js";
import type { CdFxReturn, ICdRequest, ICdResponse } from "./i-base.js";
// import { IProfileDetails } from "../cd-cli/models/cd-cli-profile.model.js";
// import config from "../../../config.js";
// import CdCliVaultController from "../cd-cli/controllers/cd-cli-vault.controller.js";
import { inspect } from "util";
import config from "../../../config.js";

export class HttpService {
  private instances: Map<string, AxiosInstance> = new Map();
  private cdApiAxiosConfig?: AxiosRequestConfig;

  constructor(private cfg = config) {}

  private get env() {
    return this.cfg.env || { app: "cd-shell", debug: false };
  }

  private log(...args: any[]) {
    if (this.env.debug) console.log("[HttpService]", ...args);
  }

  private async ensureInstance(profileName?: string, endpoint?: string) {
    const name = profileName || "cdApiLocal";
    if (this.instances.has(name)) return;

    const baseURL =
      endpoint ||
      this.cfg.cdApi?.endpoint ||
      this.cfg.profiles?.[name]?.endpoint;

    if (!baseURL) throw new Error(`No endpoint found for profile '${name}'.`);

    const instance = axios.create({
      baseURL,
      timeout: this.cfg.cdApi?.timeout || 15000,
      // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { "Content-Type": "application/json" },
    });

    this.instances.set(name, instance);
    this.cdApiAxiosConfig = { method: "POST", url: baseURL, data: null };

    this.log(`Initialized Axios instance [${name}] → ${baseURL}`);
  }

  async request<T = any>(
    config: AxiosRequestConfig,
    profileName = "cdApiLocal"
  ): Promise<CdFxReturn<T>> {
    const instance = this.instances.get(profileName);
    if (!instance)
      return {
        state: false,
        data: null,
        message: `Instance ${profileName} missing.`,
      };

    try {
      this.log("Request Config:", config);
      const response = await instance.request<T>(config);
      return { state: true, data: response.data, message: "Request succeeded" };
    } catch (e: any) {
      const message =
        e.response?.data?.app_state?.info?.app_msg ||
        e.message ||
        "Unknown error";
      this.log("Request Error:", message);
      return {
        state: false,
        data: null,
        message: `HTTP Error: ${inspect(message, { depth: 3 })}`,
      };
    }
  }

  async proc(
    params: ICdRequest,
    profileName?: string
  ): Promise<CdFxReturn<ICdResponse>> {
    const app = this.env.app;
    const name = profileName || "cdApiLocal";
    const endpoint =
      app === "cd-cli"
        ? this.cfg.profiles?.[name]?.endpoint
        : this.cfg.cdApi?.endpoint;

    await this.ensureInstance(name, endpoint);
    const cfg: AxiosRequestConfig = {
      ...(this.cdApiAxiosConfig || {}),
      data: params,
    };

    return this.request<ICdResponse>(cfg, name);
  }
}
```

```ts
@Entity({
  name: "module",
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: "module_id",
  })
  moduleId?: number;

  @Column({
    name: "module_guid",
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column("varchar", {
    name: "module_name",
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column("varchar", {
    name: "module_description",
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: "doc_id",
    nullable: true,
  })
  docId?: number;

  @Column({
    name: "module_is_public",
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: "is_sys_module",
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: "module_enabled",
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column("datetime", {
    name: "last_modification_date",
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: "group_guid",
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: "module_type_id",
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: "order",
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "Create",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
          isSysModule: false,
        },
        cdObj: {
          cdObjName: "",
          cdObjTypeGuid: "809a6e31-9fb1-4874-b61a-38cf2708a3bb",
          parentModuleGuid: "04060dfa-fc94-4e3a-98bc-9fbd739deb87",
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "PurgeModule",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
        },
      },
    ],
  },
  args: null,
};

export interface ICdModule {
  ctx: string;
  moduleId: string;
  moduleName: string;
  // controller: any;
  controllers: IControllerInfo[];
  moduleGuid?: string;
  // template?: any;
  menu?: MenuItem[];
  moduleVersion?: string;
  modulePath?: string;
  moduleUrl?: string;
  moduleType?: string;
  moduleConfig?: string;
  isDefault?: boolean;
}
```

// src/CdShell/sys/moduleman/models/module.model.ts

```ts
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from "uuid";
import { validateOrReject } from "class-validator";
import { MenuItem } from "./menu.model";
import { IControllerInfo } from "./controller.model";
import { ICdRequest } from "../../base";

@Entity({
  name: "module",
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: "module_id",
  })
  moduleId?: number;

  @Column({
    name: "module_guid",
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column("varchar", {
    name: "module_name",
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column("varchar", {
    name: "module_description",
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: "doc_id",
    nullable: true,
  })
  docId?: number;

  @Column({
    name: "module_is_public",
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: "is_sys_module",
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: "module_enabled",
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column("datetime", {
    name: "last_modification_date",
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: "group_guid",
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: "module_type_id",
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: "order",
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "Create",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
          isSysModule: false,
        },
        cdObj: {
          cdObjName: "",
          cdObjTypeGuid: "809a6e31-9fb1-4874-b61a-38cf2708a3bb",
          parentModuleGuid: "04060dfa-fc94-4e3a-98bc-9fbd739deb87",
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "PurgeModule",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
        },
      },
    ],
  },
  args: null,
};

export interface ICdModule {
  ctx: string;
  moduleId: string;
  moduleName: string;
  // controller: any;
  controllers: IControllerInfo[];
  moduleGuid?: string;
  // template?: any;
  menu?: MenuItem[];
  moduleVersion?: string;
  modulePath?: string;
  moduleUrl?: string;
  moduleType?: string;
  moduleConfig?: string;
  isDefault?: boolean;
}
```

// src/CdShell/sys/moduleman/services/module-register.service.ts

```ts
export class ModuleRegisterService {
  b = new BaseService();
  http = new HttpService();
  // ctlSession = new CdCliProfileController();
  cdToken = "";

  constructor() {}

  setCdToken(token: string): this {
    EnvCreate.dat.token = token;
    EnvPurge.dat.token = token;
    this.b.logWithContext(this, `setCdToken:token`, token, "debug");
    return this;
  }

  setModuleName(name: string): this {
    EnvCreate.dat.f_vals[0].data.moduleName = name;
    EnvCreate.dat.f_vals[0].cdObj.cdObjName = name;
    EnvPurge.dat.f_vals[0].data.moduleName = name;
    return this;
  }

  setRequestCtx(ctx: CdCtx): this {
    EnvCreate.ctx = ctx;
    EnvPurge.ctx = ctx;
    return this;
  }

  setModuleCtx(ctx: CdCtx): this {
    EnvCreate.dat.f_vals[0].data.isSysModule = ctx === CdCtx.Sys;
    return this;
  }

  build(): ICdRequest {
    return EnvCreate;
  }

  async registerModuleInCdInstance(
    moduleData: CdModuleDescriptor
  ): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:start`,
        {
          module: moduleData.name,
        },
        "debug"
      );

      // await this.init();

      // 1️⃣ Build ICdRequest envelope for module registration
      this.setCdToken(this.cdToken)
        .setModuleName(moduleData.name)
        .setRequestCtx(CdCtx.Sys)
        .setModuleCtx(moduleData.ctx)
        .build();

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:envCreate`,
        inspect(EnvCreate, { depth: 4 }),
        "debug"
      );

      // 2️⃣ send request to cd-api
      const response = await this.http.proc(EnvCreate, "cdApiLocal");

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:responseRaw`,
        inspect(response, { depth: 4 }),
        "debug"
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:networkError`,
          { msg },
          "error"
        );
        return {
          state: CdFxStateLevel.NetworkError,
          data: null,
          message: msg,
        };
      }

      const cdResp: ICdResponse = response.data;

      // 3️⃣ Validate app_state
      if (!cdResp.app_state.success) {
        const appMsg =
          cdResp.app_state.info?.app_msg ||
          cdResp.app_state.info?.messages?.join("; ") ||
          "Unknown error during module registration";

        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:failed`,
          {
            module: moduleData.name,
            appMsg,
          },
          "error"
        );

        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' registration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg ||
        `Module '${moduleData.name}' registered successfully.`;

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:success`,
        {
          module: moduleData.name,
          msg: successMsg,
        },
        "debug"
      );

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to register module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:exception`,
        { error: e },
        "error"
      );
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }

  async deRegisterModuleFromCdInstance(
    moduleData: CdModuleDescriptor
  ): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:start`,
        { module: moduleData.name },
        "debug"
      );

      // await this.init();

      this.setCdToken(this.cdToken)
        .setModuleName(moduleData.name)
        .setRequestCtx(CdCtx.Sys)
        .build();

      const response = await this.http.proc(EnvPurge, "cdApiLocal");
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:responseRaw`,
        response,
        "debug"
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        return {
          state: CdFxStateLevel.NetworkError,
          data: null,
          message: msg,
        };
      }

      const cdResp: ICdResponse = response.data;

      // 3️⃣ Validate app_state
      if (!cdResp.app_state.success) {
        const appMsg =
          cdResp.app_state.info?.app_msg ||
          cdResp.app_state.info?.messages?.join("; ") ||
          "Unknown error during module deregistration";

        // 🔎 Detect the idempotency case
        if (/not found/i.test(appMsg)) {
          const skipMsg = `Module '${moduleData.name}' already absent, skipping purge.`;
          this.b.logWithContext(
            this,
            `deRegisterModuleFromCdInstance:notFound`,
            { appMsg },
            "warn"
          );

          return {
            state: CdFxStateLevel.LogicalFailure, // workflow will proceed
            data: null,
            message: skipMsg,
          };
        }

        // 🚨 Other failures remain actual errors
        this.b.logWithContext(
          this,
          `deRegisterModuleFromCdInstance:failed`,
          { module: moduleData.name, appMsg },
          "error"
        );
        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' deregistration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg ||
        `Module '${moduleData.name}' deregistered successfully.`;

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to deregister module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:exception`,
        { error: e },
        "error"
      );
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }
}
```

///////////////////////////////////
Current state of user model
Do not remove any item but you can add or modify existing.
Where possible try not to break existing logics.
// src/CdShell/sys/cd-user/models/user.model.ts

```ts
import type { ICdRequest } from "../../base/i-base.js";
import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from "../../base/i-base.js";
import { BaseService } from "../../base/base.service.js";
import { UserController } from "../controllers/user.controller.js";
// import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "../../../sys/utils/orm-shim";

export interface IUserModel {
  userId?: number;
  userGuid?: string;
  userName: string;
  password?: string;
  email?: string;
  companyId?: number;
  docId?: number;
  mobile?: string;
  gender?: number;
  birthDate?: string;
  postalAddr?: string;
  fName?: string;
  mName?: string;
  lName?: string;
  nationalId?: number;
  passportId?: number;
  userEnabled?: boolean | number;
  zipCode?: string;
  activationKey?: string;
  userTypeId?: number;
  userProfile?: string;
}

DEFAULT_DAT.f_vals[0].data = {
  userName: "",
  password: "",
} as IUserModel;

export const DEFAULT_ENVELOPE_LOGIN: ICdRequest = {
  ctx: SYS_CTX,
  m: "User",
  c: "User",
  a: "Login",
  dat: DEFAULT_DAT,
  args: DEFAULT_ARGS,
};

@Entity({
  name: "user",
  synchronize: false,
})
export class UserModel {
  @PrimaryGeneratedColumn({
    name: "user_id",
  })
  userId?: number;

  @Column({
    name: "user_guid",
    length: 36,
  })
  userGuid?: string;

  @Column("varchar", {
    name: "user_name",
    length: 50,
    nullable: true,
  })
  userName!: string;

  @Column("char", {
    name: "password",
    length: 60,
    default: null,
  })
  password?: string;

  @Column("varchar", {
    length: 60,
    unique: true,
    nullable: true,
  })
  email?: string; // REMOVED DUPLICATE @Column() decorator

  @Column({
    name: "company_id",
    default: null,
  })
  companyId?: number;

  @Column({
    name: "doc_id",
    default: null,
  })
  docId?: number;

  @Column({
    name: "mobile",
    default: null,
  })
  mobile?: string;

  @Column({
    name: "gender",
    default: null,
  })
  gender?: number;

  @Column({
    name: "birth_date",
    default: null,
  })
  birthDate?: Date;

  @Column({
    name: "postal_addr",
    default: null,
  })
  postalAddr?: string;

  @Column({
    name: "f_name",
    default: null,
  })
  fName?: string;

  @Column({
    name: "m_name",
    default: null,
  })
  mName?: string;

  @Column({
    name: "l_name",
    default: null,
  })
  lName?: string;

  @Column({
    name: "national_id",
    default: null,
  })
  nationalId?: number;

  @Column({
    name: "passport_id",
    default: null,
  })
  passportId?: number;

  @Column({
    name: "user_enabled",
    default: null,
  })
  userEnabled?: boolean;

  @Column("char", {
    name: "zip_code",
    length: 5,
    default: null,
  })
  zipCode?: string;

  @Column({
    name: "activation_key",
    length: 36,
  })
  activationKey?: string;

  @Column({
    name: "user_type_id",
    default: null,
  })
  userTypeId?: number;

  @Column({
    name: "user_profile",
    default: null,
  })
  userProfile?: string;
}

// ... rest of your interfaces and exports remain the same
export interface IUserProfileAccess {
  userPermissions?: IProfileUserAccess[];
  groupPermissions?: IProfileGroupAccess[];
}

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
  fieldPermissions?: IUserProfileAccess;
  avatar?: string;
  userData: UserModel;
  areasOfInterest?: string[];
  bio?: string;
  affiliatedInstitutions?: string[];
  following?: string[];
  followers?: string[];
  friends?: string[];
  groups?: string[];
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

export const userProfileDefault: IUserProfile = {
  fieldPermissions: {
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
        groupId: 0,
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
```

////////////////////////////////////////

We had resolved to includ licence.consumerGuid as a property to shell.config.ts
I have reviewed the decision to adopt what has been working for a long time now in the front end implemented with Angular.
In Angular by default there is a file environment.ts for setting various configurations.
Over time we developed an interface EnvConfig but not to details.
We can take this opportunity to ride on it but with some refinement.
The ones with 'any' needs to be properly defined.
Also most are optional but is not marked in the interface definition.
Once we do so, we can then just add envConfig: EnvConfig in the shell.config.json.
Note that based on new arrangement, we can do away with licence and environment properties and replace with envConfig.
Below is the interface and as sample data based on production environment.

```ts
export interface EnvConfig {
  clientAppGuid: string;
  appId: string;
  production: boolean;
  apiEndpoint: string;
  sioEndpoint: string;
  wsEndpoint: string;
  wsMode: string;
  pushConfig: any;
  consumerToken?: string;
  clientContext: any;
  USER_RESOURCES: string;
  apiHost: string;
  shellHost: string;
  sioHost: string;
  CD_PORT?: number;
  consumer: string;
  clientAppId: number;
  SOCKET_IO_PORT: number;
  defaultauth?: string;
  mfManifestPath?: string;
  apiOptions?: any;
  sioOptions?: any;
  wsOptions?: any;
  initialPage?: string;
  firebaseConfig?: any;
  logLevel?: any;
}
```

Typical environment.ts for Angular based front end that has been used in production.
Values for data may not be real for security reason.

```ts
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { HttpHeaders } from "@angular/common/http";
import { EnvConfig } from "@corpdesk/core";
// import { NgxLoggerLevel } from "ngx-logger";

// const h = new HttpHeaders({'Content-Type': 'application/json'});

const API_HOST = "https://asdap.africa";
const API_ROUTE = "/api";
const API_PORT = "3001";
const SIO_PORT = "3002";
const PUSH_HOST = API_HOST;
const SIO_ROUTE = "/sio";

// https://asdap.africa:3001/api
export const environment: EnvConfig = {
  // logLevel: NgxLoggerLevel.DEBUG,
  appId: "",
  production: false,
  apiEndpoint: `${API_HOST}:${API_PORT}${API_ROUTE}`,
  sioEndpoint: `${PUSH_HOST}:${SIO_PORT}`,
  wsEndpoint: "ws://asdap.africa:3000",
  wsMode: "sio",
  pushConfig: {
    sio: {
      enabled: true,
    },
    wss: {
      enabled: false,
    },
    pusher: {
      enabled: true,
      apiKey: "DtVRY9V5j41KwS******VcqwBH5wb96no",
      options: {
        cluster: "ap2",
        forceTLS: true,
        userAuthentication: {
          // endpoint: "/pusher/user-auth",
          endpoint: "https://asdap.africa:3002/pusher/auth",
          transport: "ajax",
          params: {},
          headers: {},
          includeCredentials: true,
          customHandler: null,
        },
        channelAuthorization: {
          endpoint: "https://asdap.africa:3002/pusher/auth",
        },
        authEndpoint: "https://asdap.africa:3002/pusher/auth",
      },
    },
  },
  CD_PORT: 3001,
  consumerToken: "B0B3DA99-18******F69575DCD", // current company consumer
  USER_RESOURCES: "http://routed-93/user-resources",
  apiHost: "https://asdap.africa",
  sioHost: "https://asdap.africa",
  shellHost: "https://asdap.africa",
  consumer: "",
  clientAppGuid: "ca0fe39f-92b******4fc462a2",
  clientContext: {
    entity: "ASDAP", // context of client eg company, project or proramme eg ASDAP, MPEPZ...OR company name
    clientAppId: 2, // this client application identifies itself to the server with this id
    consumerToken: "B0B3DA99-18******-1E3F69575DCD", // current company consumer
  },
  clientAppId: 2, // this client application identifies itself to the server with this id: to depricate in favour of clientContex
  SOCKET_IO_PORT: 3002, // push server port
  defaultauth: "cd-auth", // fckService | cd-auth | firebase
  initialPage: "dashboard", // the default page, on successful login
  mfManifestPath: "/assets/mf.manifest.json",
  apiOptions: {
    headers: { "Content-Type": "application/json" },
  },
  // this.socket = io(`${this.env.sioEndpoint}`,this.env.sioOptions);
  sioOptions: {
    path: "/socket.io",
    transports: ["websocket", "polling"],
    secure: true,
  },
  firebaseConfig: {
    apiKey: "",
    authDomain: "",
    databaseURL: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    measurementId: "",
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
```

// public/shell.config.json
// based on new arrangement, we can do away with licence and environment properties and replace with envConfig

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "material-design",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/assets/ui-systems/"
  },
  "splash": {
    "enabled": true,
    "path": "/splashscreens/corpdesk-default.html",
    "minDuration": 3400
  },
  "license": {
    "consumerGuid": "A1B2C3D4-E5F6-7890-1234-56789ABCDEF0",
    "termsAccepted": true,
    "installationDate": "2025-12-11T00:00:00Z"
  },
  "environment": {
    "apiBaseUrl": "https://api.corpdesk.local"
  }
}
```

///////////////////////////////////////////
Based on the latest update for shell.config.json, refactor SysCasheService to additionally be able to provide data for envConfig and its children.
For the sake of POC, you do not have to avail all data but leave it up to you to suggest some key ones starting with consumeGuid.

```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";

export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>();
  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

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

  /**
   * Loads:
   * - uiConfig
   * - uiSystems (simple list)
   * - uiSystemDescriptors (FULL expanded descriptors)
   * - themes
   * - formVariants
   * - themeDescriptors
   */
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return; // already loaded

    console.log("[SysCacheService] 01: Starting Eager Load");

    const shellConfig = await this.configService.loadConfig();
    const uiConfig = shellConfig.uiConfig;
    this.cache.set("uiConfig", uiConfig);

    // ---------------------------------------------
    // Fetch available systems (raw descriptors)
    // ---------------------------------------------
    const uiSystemsData =
      await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    console.log("[SysCacheService] uiSystemsData:", uiSystemsData);

    // ---------------------------------------------
    // Normalize full descriptors
    // ---------------------------------------------
    const fullDescriptors = uiSystemsData.map((sys: any) => {
      return {
        id: sys.id,
        name: sys.name,
        version: sys.version,
        description: sys.description,

        // Assets
        cssUrl: sys.cssUrl,
        jsUrl: sys.jsUrl,
        assetPath: sys.assetPath,
        stylesheets: sys.stylesheets || [],
        scripts: sys.scripts || [],

        // Themes
        themesAvailable: sys.themesAvailable || [],
        themeActive: sys.themeActive || null,

        // Concept Mapping & directives
        conceptMappings: sys.conceptMappings || {},
        directiveMap: sys.directiveMap || {},

        // Rendering metadata
        tokenMap: sys.tokenMap || {},
        containers: sys.containers || [],
        components: sys.components || [],
        renderRules: sys.renderRules || {},

        // Metadata
        metadata: sys.metadata || {},
        extensions: sys.extensions || {},
        author: sys.author,
        license: sys.license,
        repository: sys.repository,

        displayName: sys.displayName || sys.name,
      };
    });

    // ---------------------------------------------
    // Simple list for UI (id + name only)
    // ---------------------------------------------
    const simpleSystems = fullDescriptors.map((sys) => ({
      id: sys.id,
      name: sys.name,
      displayName: sys.displayName,
      themesAvailable: sys.themesAvailable,
    }));

    console.log("[SysCacheService] Normalized Systems:", simpleSystems);

    // ---------------------------------------------
    // Load theme lists & full theme.json descriptors
    // ---------------------------------------------
    const uiThemesData =
      await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    const themes = (uiThemesData.themes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
    }));

    const variants = (uiThemesData.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
    }));

    const descriptors = uiThemesData.descriptors || [];

    // ---------------------------------------------
    // Store everything
    // ---------------------------------------------
    this.cache.set("uiSystems", simpleSystems);
    this.cache.set("uiSystemDescriptors", fullDescriptors);
    this.cache.set("themes", themes);
    this.cache.set("formVariants", variants);
    this.cache.set("themeDescriptors", descriptors);
    this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

    console.log(
      `[SysCacheService] Load complete. Systems: ${simpleSystems.length}, Themes: ${themes.length}`
    );
  }

  // ---------------------------------------------
  // Accessors
  // ---------------------------------------------
  public getUiSystems(): any[] {
    return this.cache.get("uiSystems") || [];
  }

  public getUiSystemDescriptors(): any[] {
    return this.cache.get("uiSystemDescriptors") || [];
  }

  public getThemes(): any[] {
    return this.cache.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.cache.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.cache.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.cache.get("uiConfigNormalized") || {};
  }

  public get(key: string): any {
    console.log(`[SysCacheService][get] key: ${key}`);
    console.log("[SysCacheService][get] this.cache:", this.cache);
    return this.cache.get(key);
  }

  public get uiSystemLoader(): UiSystemLoaderService {
    return this._uiSystemLoader;
  }

  public get uiThemeLoader(): UiThemeLoaderService {
    return this._uiThemeLoader;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) await this.loadAndCacheAll();
  }
}
```

//////////////////////////////////////////////////////

Hi Chase. Below is what you had suggested as the new version of UserService.
I had also shared implementation of http.service.ts, module-register.service.ts and module.model.ts.
But the recommendation you given for UserService did not seem to have refered to any of the above references.
Noted disparities:

1. The recommendations make reference to none existing this.http.post()
2. ModuleRegisterService.registerModuleInCdInstance() made use of clean build process:
   this.setCdToken(this.cdToken)
   .setModuleName(moduleData.name)
   .setRequestCtx(CdCtx.Sys)
   .setModuleCtx(moduleData.ctx)
   .build();
   This pattern was not followed.

I have shard the references again. Try to fix the above issues.

// src/CdShell/sys/cd-user/services/user.service.ts

```ts
// src/CdApi/sys/user/services/user.service.ts
import { ICdRequest, ICdResponse, EnvelopFValItem } from "../../base/i-base";
import { HttpService } from "../../base/http.service";
import { UserModel } from "../models/user.model.js";
import { SysCacheService } from "../../moduleman/services/sys-cache.service";
import { LoggerService } from "../../../utils/logger.service";

export class UserService {
  private http: HttpService;
  private cache: SysCacheService;
  private logger = new LoggerService();

  private cd_token: string | undefined = "";
  private postData: ICdRequest | null = null;

  constructor(cacheService: SysCacheService, httpService?: HttpService) {
    this.cache = cacheService;
    this.http = httpService || new HttpService();
  }

  /**
   * Login a user via ICdRequest/ICdResponse
   */
  async login(user: UserModel): Promise<ICdResponse> {
    const consumerGuid = this.cache.getConsumerGuid();

    const request: ICdRequest = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: "Login",
      dat: {
        f_vals: [
          {
            data: { ...user, consumerGuid },
          },
        ],
        token: null,
      },
      args: null,
    };

    try {
      const response = await this.http.post<ICdResponse>("/api", request);
      if (response.app_state.success) {
        this.cd_token = response.app_state.sess?.cd_token;
      }
      return response;
    } catch (err: any) {
      this.logger.error("UserService.login error:", err);
      throw err;
    }
  }

  /**
   * Generic method to execute any user-related action
   */
  async executeAction(
    action: string,
    f_vals: EnvelopFValItem[],
    token?: string
  ): Promise<ICdResponse> {
    const consumerGuid = this.cache.getConsumerGuid();

    const request: ICdRequest = {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: action,
      dat: {
        f_vals: f_vals.map((item) => ({
          ...item,
          data: { ...(item.data || {}), consumerGuid },
        })),
        token: token || this.cd_token || null,
      },
      args: null,
    };

    try {
      const response = await this.http.post<ICdResponse>("/api", request);
      if (response.app_state.success) {
        this.cd_token = response.app_state.sess?.cd_token;
      }
      return response;
    } catch (err: any) {
      this.logger.error(`UserService.executeAction(${action}) error:`, err);
      throw err;
    }
  }

  /**
   * Example: register a user
   */
  async registerUser(user: UserModel): Promise<ICdResponse> {
    const f_vals: EnvelopFValItem[] = [{ data: user }];
    return this.executeAction("Register", f_vals);
  }

  /**
   * Example: activate a user
   */
  async activateUser(activationData: any): Promise<ICdResponse> {
    const f_vals: EnvelopFValItem[] = [
      {
        query: { where: activationData[0] },
        consumer: activationData[1],
      },
    ];
    return this.executeAction("ActivateUser", f_vals);
  }

  /**
   * Example: get user profile
   */
  async getUserProfile(userId?: number): Promise<ICdResponse> {
    const f_vals: EnvelopFValItem[] = [
      {
        data: {
          userId: userId ?? -1,
        },
      },
    ];
    return this.executeAction("GetUserProfile", f_vals);
  }

  /**
   * Set token manually (optional)
   */
  setToken(token: string) {
    this.cd_token = token;
  }

  /**
   * Helper: build envelope for custom use
   */
  buildEnvelope(
    action: string,
    f_vals: EnvelopFValItem[],
    token?: string
  ): ICdRequest {
    const consumerGuid = this.cache.getConsumerGuid();

    return {
      ctx: "Sys",
      m: "User",
      c: "User",
      a: action,
      dat: {
        f_vals: f_vals.map((item) => ({
          ...item,
          data: { ...(item.data || {}), consumerGuid },
        })),
        token: token || this.cd_token || null,
      },
      args: null,
    };
  }
}
```

// src/CdShell/sys/base/http.service.ts

```ts
import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
// import * as https from "https";
// // import { CdCliProfileController } from "../cd-cli/controllers/cd-cli-profile.cointroller.js";
import CdLog from "../cd-comm/controllers/cd-logger.controller.js";
import type { CdFxReturn, ICdRequest, ICdResponse } from "./i-base.js";
// import { IProfileDetails } from "../cd-cli/models/cd-cli-profile.model.js";
// import config from "../../../config.js";
// import CdCliVaultController from "../cd-cli/controllers/cd-cli-vault.controller.js";
import { inspect } from "util";
import config from "../../../config.js";

export class HttpService {
  private instances: Map<string, AxiosInstance> = new Map();
  private cdApiAxiosConfig?: AxiosRequestConfig;

  constructor(private cfg = config) {}

  private get env() {
    return this.cfg.env || { app: "cd-shell", debug: false };
  }

  private log(...args: any[]) {
    if (this.env.debug) console.log("[HttpService]", ...args);
  }

  private async ensureInstance(profileName?: string, endpoint?: string) {
    const name = profileName || "cdApiLocal";
    if (this.instances.has(name)) return;

    const baseURL =
      endpoint ||
      this.cfg.cdApi?.endpoint ||
      this.cfg.profiles?.[name]?.endpoint;

    if (!baseURL) throw new Error(`No endpoint found for profile '${name}'.`);

    const instance = axios.create({
      baseURL,
      timeout: this.cfg.cdApi?.timeout || 15000,
      // httpsAgent: new https.Agent({ rejectUnauthorized: false }),
      headers: { "Content-Type": "application/json" },
    });

    this.instances.set(name, instance);
    this.cdApiAxiosConfig = { method: "POST", url: baseURL, data: null };

    this.log(`Initialized Axios instance [${name}] → ${baseURL}`);
  }

  async request<T = any>(
    config: AxiosRequestConfig,
    profileName = "cdApiLocal"
  ): Promise<CdFxReturn<T>> {
    const instance = this.instances.get(profileName);
    if (!instance)
      return {
        state: false,
        data: null,
        message: `Instance ${profileName} missing.`,
      };

    try {
      this.log("Request Config:", config);
      const response = await instance.request<T>(config);
      return { state: true, data: response.data, message: "Request succeeded" };
    } catch (e: any) {
      const message =
        e.response?.data?.app_state?.info?.app_msg ||
        e.message ||
        "Unknown error";
      this.log("Request Error:", message);
      return {
        state: false,
        data: null,
        message: `HTTP Error: ${inspect(message, { depth: 3 })}`,
      };
    }
  }

  async proc(
    params: ICdRequest,
    profileName?: string
  ): Promise<CdFxReturn<ICdResponse>> {
    const app = this.env.app;
    const name = profileName || "cdApiLocal";
    const endpoint =
      app === "cd-cli"
        ? this.cfg.profiles?.[name]?.endpoint
        : this.cfg.cdApi?.endpoint;

    await this.ensureInstance(name, endpoint);
    const cfg: AxiosRequestConfig = {
      ...(this.cdApiAxiosConfig || {}),
      data: params,
    };

    return this.request<ICdResponse>(cfg, name);
  }
}
```

// src/CdShell/sys/moduleman/models/module.model.ts

```ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from "uuid";
import { validateOrReject } from "class-validator";
import { MenuItem } from "./menu.model";
import { IControllerInfo } from "./controller.model";
import { ICdRequest } from "../../base";

@Entity({
  name: "module",
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: "module_id",
  })
  moduleId?: number;

  @Column({
    name: "module_guid",
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column("varchar", {
    name: "module_name",
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column("varchar", {
    name: "module_description",
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: "doc_id",
    nullable: true,
  })
  docId?: number;

  @Column({
    name: "module_is_public",
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: "is_sys_module",
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: "module_enabled",
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column("datetime", {
    name: "last_modification_date",
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: "group_guid",
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: "module_type_id",
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: "order",
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "Create",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
          isSysModule: false,
        },
        cdObj: {
          cdObjName: "",
          cdObjTypeGuid: "809a6e31-9fb1-4874-b61a-38cf2708a3bb",
          parentModuleGuid: "04060dfa-fc94-4e3a-98bc-9fbd739deb87",
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: "Sys",
  m: "Moduleman",
  c: "Module",
  a: "PurgeModule",
  dat: {
    token: "",
    f_vals: [
      {
        data: {
          moduleName: "",
        },
      },
    ],
  },
  args: null,
};

export interface ICdModule {
  ctx: string;
  moduleId: string;
  moduleName: string;
  // controller: any;
  controllers: IControllerInfo[];
  moduleGuid?: string;
  // template?: any;
  menu?: MenuItem[];
  moduleVersion?: string;
  modulePath?: string;
  moduleUrl?: string;
  moduleType?: string;
  moduleConfig?: string;
  isDefault?: boolean;
}
```

// src/CdShell/sys/moduleman/services/module-register.service.ts

```ts
import {
  CdFxReturn,
  CdFxStateLevel,
  ICdRequest,
  ICdResponse,
} from "../../../sys/base/i-base.js";
import {
  CdCtx,
  CdModuleDescriptor,
} from "../../../sys/dev-descriptor/index.js";
import config from "../../../../config.js";
import CdLog from "../../cd-comm/controllers/cd-logger.controller.js";
import { BaseService } from "../../base/base.service.js";
import { HttpService } from "../../base/http.service.js";
import { EnvCreate, EnvPurge } from "../models/module.model.js";
import { inspect } from "node:util";
import { SessonController } from "../../cd-user/controllers/session.controller.js";

export class ModuleRegisterService {
  b = new BaseService();
  http = new HttpService();
  cdToken = "";

  constructor() {}

  setCdToken(token: string): this {
    EnvCreate.dat.token = token;
    EnvPurge.dat.token = token;
    this.b.logWithContext(this, `setCdToken:token`, token, "debug");
    return this;
  }

  setModuleName(name: string): this {
    EnvCreate.dat.f_vals[0].data.moduleName = name;
    EnvCreate.dat.f_vals[0].cdObj.cdObjName = name;
    EnvPurge.dat.f_vals[0].data.moduleName = name;
    return this;
  }

  setRequestCtx(ctx: CdCtx): this {
    EnvCreate.ctx = ctx;
    EnvPurge.ctx = ctx;
    return this;
  }

  setModuleCtx(ctx: CdCtx): this {
    EnvCreate.dat.f_vals[0].data.isSysModule = ctx === CdCtx.Sys;
    return this;
  }

  build(): ICdRequest {
    return EnvCreate;
  }

  async registerModuleInCdInstance(
    moduleData: CdModuleDescriptor
  ): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:start`,
        {
          module: moduleData.name,
        },
        "debug"
      );

      // await this.init();

      // 1️⃣ Build ICdRequest envelope for module registration
      this.setCdToken(this.cdToken)
        .setModuleName(moduleData.name)
        .setRequestCtx(CdCtx.Sys)
        .setModuleCtx(moduleData.ctx)
        .build();

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:envCreate`,
        inspect(EnvCreate, { depth: 4 }),
        "debug"
      );

      // 2️⃣ send request to cd-api
      const response = await this.http.proc(EnvCreate, "cdApiLocal");

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:responseRaw`,
        inspect(response, { depth: 4 }),
        "debug"
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:networkError`,
          { msg },
          "error"
        );
        return {
          state: CdFxStateLevel.NetworkError,
          data: null,
          message: msg,
        };
      }

      const cdResp: ICdResponse = response.data;

      // 3️⃣ Validate app_state
      if (!cdResp.app_state.success) {
        const appMsg =
          cdResp.app_state.info?.app_msg ||
          cdResp.app_state.info?.messages?.join("; ") ||
          "Unknown error during module registration";

        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:failed`,
          {
            module: moduleData.name,
            appMsg,
          },
          "error"
        );

        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' registration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg ||
        `Module '${moduleData.name}' registered successfully.`;

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:success`,
        {
          module: moduleData.name,
          msg: successMsg,
        },
        "debug"
      );

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to register module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:exception`,
        { error: e },
        "error"
      );
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }

  async deRegisterModuleFromCdInstance(
    moduleData: CdModuleDescriptor
  ): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:start`,
        { module: moduleData.name },
        "debug"
      );

      // await this.init();

      this.setCdToken(this.cdToken)
        .setModuleName(moduleData.name)
        .setRequestCtx(CdCtx.Sys)
        .build();

      const response = await this.http.proc(EnvPurge, "cdApiLocal");
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:responseRaw`,
        response,
        "debug"
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        return {
          state: CdFxStateLevel.NetworkError,
          data: null,
          message: msg,
        };
      }

      const cdResp: ICdResponse = response.data;

      // 3️⃣ Validate app_state
      if (!cdResp.app_state.success) {
        const appMsg =
          cdResp.app_state.info?.app_msg ||
          cdResp.app_state.info?.messages?.join("; ") ||
          "Unknown error during module deregistration";

        // 🔎 Detect the idempotency case
        if (/not found/i.test(appMsg)) {
          const skipMsg = `Module '${moduleData.name}' already absent, skipping purge.`;
          this.b.logWithContext(
            this,
            `deRegisterModuleFromCdInstance:notFound`,
            { appMsg },
            "warn"
          );

          return {
            state: CdFxStateLevel.LogicalFailure, // workflow will proceed
            data: null,
            message: skipMsg,
          };
        }

        // 🚨 Other failures remain actual errors
        this.b.logWithContext(
          this,
          `deRegisterModuleFromCdInstance:failed`,
          { module: moduleData.name, appMsg },
          "error"
        );
        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' deregistration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg ||
        `Module '${moduleData.name}' deregistered successfully.`;

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to deregister module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:exception`,
        { error: e },
        "error"
      );
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }
}
```

///////////////////////////////////////////////////////

From the codes below, I was expecting an svg splashscreen to show before the page loads.
I am currently getting a continous blank screen.
The logs do not show any error.
Assist me to examine the codes and additionally recommend more log point to confirm or help detect where the issue could be.
// index.html

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Corpdesk Shell</title>

    <!-- Vendor-only static dependencies -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
    />
  </head>

  <body>
    <div id="cd-splash"></div>
    <div id="cd-root" style="visibility: hidden">
      <header id="cd-header">
        <button id="cd-burger" aria-label="Menu toggle">
          <span class="bar top"></span>
          <span class="bar middle"></span>
          <span class="bar bottom"></span>
        </button>

        <img id="cd-logo" alt="Logo" />
        <span id="cd-app-name">Corpdesk Shell</span>
      </header>

      <div id="cd-layout">
        <div id="cd-overlay" class="hidden"></div>
        <aside id="cd-sidebar"></aside>
        <main id="cd-main-content"></main>
      </div>
    </div>

    <script type="module" src="/src/app.ts"></script>
  </body>
</html>
```

// public/splashscreens/corpdesk-default.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Corpdesk</title>

    <style>
      html,
      body {
        margin: 0;
        padding: 0;
        background: #000;
        width: 100%;
        height: 100%;
        overflow: hidden;
      }

      #splash-container {
        position: fixed;
        inset: 0;
        background: #000;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Fade-out class applied from hideSplash() */
      .fade-out {
        opacity: 0;
        transition: opacity 0.7s ease-in-out;
      }
    </style>
  </head>

  <body>
    <div id="splash-container">
      <!-- Animated SVG -->
      <svg id="corpdesk-svg" width="200" height="200" viewBox="0 0 41.66 41.65">
        <defs>
          <!-- Glow filter -->
          <filter id="soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="1.8"
              result="blur1"
            />
            <feColorMatrix
              in="blur1"
              type="matrix"
              values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0"
              result="glow"
            />
            <feBlend in="SourceGraphic" in2="glow" mode="screen" />
          </filter>

          <!-- Stroke drawing preset -->
          <style>
            .outline {
              stroke-dasharray: 200;
              stroke-dashoffset: 200;
            }
          </style>
        </defs>

        <!-- THE OUTER CIRCLE (color reveal last) -->
        <circle
          id="outerCircle"
          cx="25.57"
          cy="24.85"
          r="20.83"
          transform="matrix(0.03, -1, 1, 0.03, -4.65, 45.76)"
          fill="#f04d23"
          opacity="0"
        >
          <!-- Reveal animation -->
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            begin="3s"
            dur="0.8s"
            fill="freeze"
          />
        </circle>

        <!-- THE BLACK SEGMENT -->
        <path
          id="segment"
          d="M25.57,38.5a13.51,13.51,0,0,0,0-27Z"
          transform="translate(-4.74 -4.02)"
          fill="#231f20"
          opacity="0"
        >
          <animate
            attributeName="opacity"
            from="0"
            to="1"
            begin="3s"
            dur="0.8s"
            fill="freeze"
          />
        </path>

        <!-- OUTLINE -->
        <path
          id="outline"
          d="M34.54,12.72a15,15,0,1,1-18.06.08"
          transform="translate(-4.74 -4.02)"
          class="outline"
          fill="none"
          stroke="#fff"
          stroke-width="3.6"
          filter="url(#soft-glow)"
        >
          <!-- Step 1: Draw outline -->
          <animate
            attributeName="stroke-dashoffset"
            from="200"
            to="0"
            dur="1.4s"
            begin="0.1s"
            fill="freeze"
          />

          <!-- Step 2: Glow pulse -->
          <animate
            attributeName="opacity"
            values="1;0.4;1"
            dur="1.2s"
            begin="1.5s"
            repeatCount="2"
          />

          <!-- Step 3: Fade outline for final reveal -->
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            begin="3s"
            dur="0.6s"
            fill="freeze"
          />
        </path>

        <!-- CLOCK HAND (line) -->
        <line
          id="hand"
          x1="21.15"
          y1="23"
          x2="21.15"
          y2="4.14"
          stroke="#fff"
          stroke-width="3.6"
          stroke-linecap="round"
          opacity="1"
        >
          <!-- Step 1: Rotate around center -->
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 21.15 23"
            to="360 21.15 23"
            dur="2.6s"
            begin="0.6s"
            fill="freeze"
          />

          <!-- Step 2: Fade out at reveal -->
          <animate
            attributeName="opacity"
            from="1"
            to="0"
            begin="3s"
            dur="0.5s"
            fill="freeze"
          />
        </line>
      </svg>
    </div>

    <script>
      setTimeout(() => {
        const ev = new CustomEvent("CorpdeskSplashDone");
        window.dispatchEvent(ev);
      }, 3800);
    </script>
  </body>
</html>
```

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",

  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },

  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",

  "uiConfig": {
    "defaultUiSystemId": "material-design",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/assets/ui-systems/"
  },

  "splash": {
    "enabled": true,
    "path": "/splashscreens/corpdesk-default.html",
    "minDuration": 3400
  },
  "envConfig": {...}
}
```

```ts
export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  // private svThemeLoader!: ThemeLoaderService;
  private logger = new LoggerService();

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);

    window.addEventListener("CorpdeskSplashDone", () => {
      this.hideSplash();
    });
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svModule = new ModuleService();
    this.svMenu = new MenuService();
    this.svController = new ControllerService();
    this.svTheme = new ThemeService();
    // this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);

    // ✅ Load shell config and apply log level
    const shellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    await this.showSplash(); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load shell config
    //---------------------------------------
    const shellConfig: IShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }

          if (item.children) item.children = recursive(item.children);
          return item;
        });

      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );
      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);
      applyMobileState();
    }

    //---------------------------------------
    // SPLASH: Hide AFTER the entire system boots
    //---------------------------------------
    await this.hideSplash(); // fade-out splash, reveal application

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

  /**
   * Purpose: Load UI System + Load Theme + Activate UI-System-specific logic.
   */
  async applyStartupUiSettings(): Promise<void> {
    const cfgSvc = ConfigService.getInstance();
    // ensure sys cache is ready
    await this.svSysCache.ensureReady();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
    if (!uiConfig) {
      console.warn("[Main.applyStartupUiSettings] uiConfig missing");
      return;
    }

    const systemId = uiConfig.defaultUiSystemId;
    const themeId = uiConfig.defaultThemeId;

    diag_css("[MAIN.applyStartupUiSettings] start", { systemId, themeId });

    // Use singletons bound to same SysCache instance
    const uiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    const uiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);

    // 1) Activate UI system (loads CSS + JS)
    try {
      await uiSystemLoader.activate(systemId);
      diag_css("[MAIN.applyStartupUiSettings] ui-system activated", {
        systemId,
      });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] activate failed", err);
      diag_css("[MAIN.applyStartupUiSettings] activate failed", { err });
    }

    // 2) Load structural shell CSS (base + index) AFTER system to ensure layering
    try {
      await uiSystemLoader.loadCSS("/themes/common/base.css", "shell-base");
      await uiSystemLoader.loadCSS("/assets/css/index.css", "shell-index");
      diag_css("[MAIN.applyStartupUiSettings] shell CSS loaded", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] shell CSS load failed", err);
    }

    // 3) load theme override CSS
    try {
      await uiThemeLoader.loadThemeById(themeId);
      diag_css("[MAIN.applyStartupUiSettings] theme css injected", { themeId });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] theme load failed", err);
    }

    // 4) per-system applyTheme (sets data-bs-theme, md classes, etc.)
    try {
      await uiSystemLoader.applyTheme(systemId, themeId);
      diag_css("[MAIN.applyStartupUiSettings] system applyTheme complete", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] applyTheme failed", err);
    }

    diag_css("[MAIN.applyStartupUiSettings] done", {});
  }

  async loadShellConfig(): Promise<IShellConfig> {
    const res = await fetch("/shell.config.json");
    if (!res.ok) {
      throw new Error(`Failed to load shell config: ${res.statusText}`);
    }
    return await res.json();
  }

  async showSplash(): Promise<void> {
    return new Promise<void>((resolve) => {
      const path = "public/splashscreens/corpdesk-default.html";

      fetch(path)
        .then((r) => r.text())
        .then((html) => {
          const wrapper = document.createElement("div");
          wrapper.id = "cd-splash";
          wrapper.innerHTML = html;
          document.body.appendChild(wrapper);

          // Wait for animation-ready
          setTimeout(() => resolve(), 50);
        })
        .catch((err) => {
          console.error("Failed to load splashscreen:", err);
          resolve(); // fail-open
        });
    });
  }

  async hideSplash(): Promise<void> {
    return new Promise<void>((resolve) => {
      const splash = document.getElementById("cd-splash");
      if (!splash) return resolve();

      // Apply fade-out CSS class
      const container = splash.querySelector(
        "#splash-container"
      ) as HTMLElement;
      if (container) container.classList.add("fade-out");

      // Remove after animation
      setTimeout(() => {
        if (splash && splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
        resolve();
      }, 800); // must be > CSS transition time
    });
  }
}
```

/////////////////////////////////////////////////////////
Hey Chase, we need to prepare the corpdesk api to be able to save cd-shell configurations in consumer and user profiles.
Note that we have already included shellConfig?: IUserShellConfig; in IUserProfile and shellConfig?: IConsumerShellConfig; in IConsumerProfile. Both use same pattern of profile structure.

I have shared UserService showing only the methods related to user profile.
We need to repeat the pattern for consumer based on it model.
Feel free to ask any emerging quesiton because much as we are trying to replicate the pattern, there are contextual differences. But also be bold enough to recommend the proposals as you see it.

```ts
@Entity({
  name: "user",
  synchronize: false,
})
// @CdModel
export class UserModel {
  b?: BaseService;

  @PrimaryGeneratedColumn({
    name: "user_id",
  })
  userId?: number;

  @Column({
    name: "user_guid",
    length: 36,
    default: uuidv4(),
  })
  userGuid?: string;

  @Column("varchar", {
    name: "user_name",
    length: 50,
    nullable: true,
  })
  userName: string;

  @Column("char", {
    name: "password",
    length: 60,
    default: null,
  })
  password?: string;

  @Column("varchar", {
    length: 60,
    unique: true,
    nullable: true,
  })
  @IsEmail()
  email?: string;

  @Column({
    name: "company_id",
    default: null,
  })
  // @IsInt()
  companyId?: number;

  @Column({
    name: "doc_id",
    default: null,
  })
  // @IsInt()
  docId?: number;

  @Column({
    name: "mobile",
    default: null,
  })
  mobile?: string;

  @Column({
    name: "gender",
    default: null,
  })
  gender?: number;

  @Column({
    name: "birth_date",
    default: null,
  })
  // @IsDate()
  birthDate?: Date;

  @Column({
    name: "postal_addr",
    default: null,
  })
  postalAddr?: string;

  @Column({
    name: "f_name",
    default: null,
  })
  fName?: string;

  @Column({
    name: "m_name",
    default: null,
  })
  mName?: string;

  @Column({
    name: "l_name",
    default: null,
  })
  lName?: string;

  @Column({
    name: "national_id",
    default: null,
  })
  // @IsInt()
  nationalId?: number;

  @Column({
    name: "passport_id",
    default: null,
  })
  // @IsInt()
  passportId?: number;

  @Column({
    name: "user_enabled",
    default: null,
  })
  userEnabled?: boolean;

  @Column("char", {
    name: "zip_code",
    length: 5,
    default: null,
  })
  zipCode?: string;

  @Column({
    name: "activation_key",
    length: 36,
    default: uuidv4(),
  })
  activationKey?: string;

  @Column({
    name: "user_type_id",
    default: null,
  })
  userTypeId?: number;

  @Column({
    name: "user_profile",
    default: null,
  })
  // userProfile?: string | ObjectLiteral;
  userProfile?: string;

  @OneToMany((type) => DocModel, (doc) => doc.user) // note: we will create user property in the Docs class
  docs?: DocModel[];

  // HOOKS
  @BeforeInsert()
  @BeforeUpdate()
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
  avatar: {
    url: `https://${config.http.hostName}/assets/images/users/avatar-anon.jpg`,
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
```

```ts
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
  consumerData: ConsumerModel; // base object like userData in IUserProfile

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

  /**
   * minimal consumer data placeholder
   */
  consumerData: {
    consumerName: "",
    companyId: null,
    consumerEnabled: true,
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
export class UserService extends CdService {
  logger: Logging;
  cdToken: string;
  b: BaseService;
  userModel;
  mail: MailService;
  db;
  srvSess: SessionService;
  svModule: ModuleService;
  svConsumer: ConsumerService;
  requestPswd: string;
  plData: any;

  // i: IRespInfo = {
  //     messages: null,
  //     code: '',
  //     app_msg: ''
  // };

  loginState = false;

  /*
   * create rules
   */
  cRules: any = {
    required: ["userName", "email", "password"],
    noDuplicate: ["userName", "email"],
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // STARTING USER PROFILE FEATURES
  // Public method to update user profile (e.g., avatar, bio)
  async updateUserProfile(req, res): Promise<void> {
    try {
      // note that 'ignoreCache' is set to true because old data may introduce confussion
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "UserService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );

      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedUserProfile = {} as IUserProfile;
      let strUserProfile = "{}";

      const existingUserProfile = await this.existingUserProfile(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      this.logger.logDebug(
        "UserService:updateCurrentUserProfile()/existingUserProfile:",
        existingUserProfile
      );

      if (await this.validateProfileData(req, res, existingUserProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("UserService::updateUserProfile()/01");
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/jsonUpdate:",
          jsonUpdate
        );
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/existingUserProfile:",
          existingUserProfile
        );
        modifiedUserProfile = await this.modifyProfile(
          existingUserProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "UserService::updateUserProfile()/strUserProfile2:",
          modifiedUserProfile
        );
        strUserProfile = JSON.stringify(modifiedUserProfile);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug("UserService::updateUserProfile()/021");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "UserService::updateUserProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedUserProfile = (await this.modifyProfile(
          userProfileDefault,
          jsonUpdate
        )) as IUserProfile;
        // the update should not contain userData
        if ("userData" in modifiedUserProfile) {
          delete modifiedUserProfile.userData;
        }

        this.logger.logDebug(
          "UserService::updateUserProfile()/modifiedUserProfile:",
          modifiedUserProfile
        );
        strUserProfile = JSON.stringify(modifiedUserProfile);
      }

      this.logger.logDebug("UserService::updateUserProfile()/03");
      requestQuery.update = { userProfile: strUserProfile };
      this.logger.logDebug(
        "UserService::updateUserProfile()/requestQuery:",
        JSON.stringify(requestQuery)
      );

      // update user profile
      const serviceInput: IServiceInput<any> = {
        serviceInstance: this,
        serviceModel: UserModel,
        docName: "UserService::updateUserProfile",
        dSource: 1,
        cmd: {
          action: "update",
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "UserService::updateUserProfile()/serviceInput:",
        serviceInput
      );
      // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
      const updateRet = await this.updateI(req, res, serviceInput);
      const newProfile: IUserProfile[] = await this.existingUserProfile(
        req,
        res,
        requestQuery.where.userId
      );
      this.logger.logDebug(
        "UserService::updateUserProfile()/newProfile1:",
        JSON.stringify(newProfile)
      );

      /**
       * No password is droped from the payload
       */
      if ("userData" in newProfile[0]) {
        if ("password" in newProfile[0].userData) {
          delete newProfile[0].userData.password;
        }
      }

      this.logger.logDebug(
        "UserService::updateUserProfile()/newProfile2:",
        JSON.stringify(newProfile)
      );
      const ret = {
        updateRet: updateRet,
        newProfile: newProfile,
      };

      // Respond with the retrieved profile data
      this.b.cdResp.data = ret;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:updateUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /////////////////////////////////////////////
  // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
  //

  async existingUserProfile(req, res, cuid) {
    this.logger.logDebug(`UserServices::existingUserProfile())/cuid:${cuid}`);
    const si: IServiceInput<any> = {
      serviceInstance: this,
      serviceModel: UserModel,
      docName: "UserService::existingUserProfile",
      dSource: 1,
      cmd: {
        action: "find",
        query: { select: ["userProfile"], where: { userId: cuid } },
      },
      // mapping: { profileField: "userProfile" },
    };
    return this.b.read(req, res, si);
  }

  async modifyProfile(existingData, profileConfig) {
    return await ProfileServiceHelper.modifyProfile(
      existingData,
      profileConfig
    );
  }

  async getUserProfile(req, res) {
    try {
      this.logger.logDebug("UserService::getUserProfile()/01");
      const pl = this.b.getPlData(req);
      const userId = pl.userId;

      // Retrieve the user profile using an internal method
      const profile = await this.getUserProfileI(req, res, userId);
      if (profile) {
        this.logger.logDebug("UserService::getUserProfile()/02");
        this.b.i.code = "UserService::getUserProfile";
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        await this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = profile;
        await this.b.respond(req, res);
      } else {
        this.logger.logDebug("UserService::getUserProfile()/03");
        const e = "the user provided is invalid";
        this.b.err.push(e);
        const i = {
          messages: this.b.err,
          code: "UserService:getProfile",
          app_msg: "",
        } as IRespInfo;
        this.b.serviceErr(req, res, e, i.code);
        this.b.respond(req, res);
      }
    } catch (e) {
      this.logger.logDebug("UserService::getUserProfile()/04");
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      this.b.serviceErr(req, res, e, i.code);
      this.b.respond(req, res);
    }
  }

  // Public method to get a user profile
  async getCurrentUserProfile(req, res) {
    try {
      const svSession = new SessionService();
      const session = await svSession.getSession(req, res);
      const userId = session[0].currentUserId;
      this.logger.logDebug(
        `UserServices::getCurrentUserProfile9)/userId:${userId}`
      );
      // Retrieve the user profile using an internal method
      const profile = await this.getUserProfileI(req, res, userId);

      // Respond with the retrieved profile data
      this.b.cdResp.data = profile;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  // Internal method to retrieve user profile
  async getUserProfileI(
    req,
    res,
    userId: number
  ): Promise<IUserProfile | null> {
    try {
      this.logger.logDebug("UserServices::getUserProfileI()/01");
      this.logger.logDebug("UserServices::getUserProfileI()/userId:", userId);
      // // Use BaseService to retrieve user profile
      // const result = await this.b.read(req, res, serviceInput);
      const user: UserModel[] = await this.getUserByID(req, res, userId);
      this.logger.logDebug(
        "UserServices::getUserProfileI()/user:",
        JSON.stringify(user)
      );
      this.logger.logDebug("UserServices::getUserProfileI()/02");
      if (user && user[0].userProfile) {
        this.logger.logDebug("UserServices::getUserProfileI()/03");
        delete user[0].password;
        // Create a deep copy of user[0].userProfile to avoid circular references
        let userProfileJSON: IUserProfile = cloneDeep(user[0]); // deep copy using lodash

        this.logger.logDebug("UserServices::getUserProfileI()/04");
        let userData: UserModel = cloneDeep(user[0]);
        // delete userData.userProfile;
        delete userData.password;
        userProfileJSON = cloneDeep(userData.userProfile) as IUserProfile;
        userProfileJSON.userData = cloneDeep(userData);
        delete userProfileJSON.userData.userProfile;

        this.logger.logDebug("UserServices::getUserProfileI()/06");
        return userProfileJSON; // Return the cloned userProfileJSON
      } else {
        this.logger.logDebug("UserServices::getUserProfileI()/07");
        /**
         * If the profile is null update records to default then return the default profile
         */
        // update user profile with default
        const serviceInput: IServiceInput<any> = {
          serviceInstance: this,
          serviceModel: UserModel,
          docName: "UserService::getUserProfileI",
          dSource: 1,
          cmd: {
            action: "update",
            query: {
              where: { userId: user[0].userId },
              update: { userProfile: JSON.stringify(userProfileDefault) },
            },
          },
        };
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/serviceInput:",
          serviceInput
        );
        // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
        const updateRet = await this.updateI(req, res, serviceInput);
        this.logger.logDebug(
          "UserService::getUserProfileI()/updateRet:",
          updateRet
        );
        if (updateRet.affected > 0) {
          return userProfileDefault;
        } else {
          return null;
        }
      }
    } catch (e) {
      this.logger.logDebug("UserServices::getUserProfileI()/08");
      this.b.err.push(`The user provided is invalid; ${e.toString()}`);
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  // Internal method to handle profile updates
  async updateUserProfileI(
    req,
    res,
    userId: string,
    newProfileData: Partial<IUserProfile>
  ) {
    try {
      // Use BaseService method to handle JSON updates for user_profile field
      const serviceInput = {
        serviceModel: this.db.user,
        cmd: {
          query: {
            where: { user_id: userId },
            update: { user_profile: newProfileData },
          },
        },
      };

      await this.b.updateJSONColumnQB(
        req,
        res,
        serviceInput,
        "user_profile",
        newProfileData
      );
      return newProfileData; // Return updated profile
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  // Helper method to validate profile data
  async validateProfileData(req, res, profileData: any): Promise<boolean> {
    this.logger.logDebug(
      "UserService::validateProfileData()/profileData:",
      profileData
    );
    // const profileData: IUserProfile = updateData.update.userProfile
    // this.logger.logDebug("UserService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      this.logger.logDebug("UserService::validateProfileData()/01");
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (!profileData.fieldPermissions || !profileData.userData) {
      this.logger.logDebug("UserService::validateProfileData()/02");
      return false;
    }

    // Example validation for bio length
    if (profileData.bio && profileData.bio.length > 500) {
      this.logger.logDebug("UserService::validateProfileData()/03");
      const e = "Bio data is too long";
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: "UserService:validateProfileData",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }

  // Internal helper method to get a user by ID
  async getUserByIdI(uid: number): Promise<UserModel> {
    return await this.db.user.findOne({ where: { userId: uid } });
  }
}
```

///////////////////////////////////

You can comment on the ProfileServiceHelper and recommend any integration action given that ConsumerService is also now its consumer besides UserService.
// src/CdApi/sys/utils/profile-service-helper.ts

```ts
/**
 * Future development must remove any coop related items in this class.
 * The class should be general.
 * All coop items must be isolated in coops directory
 * This util directory where this file resides should contain system related and shared utilities
 *
 * modifyProfile() should have access policy
 *  - self can modify active coopId
 *  - self can only modify self if request coopRole is equal or higher that the coopRole to modify and
 *    the target must fall withing the same jurisdiction
 *  - implement expiring roles
 */

import {
  ICoopRole,
  MemberMeta,
} from "../../app/coops/models/coop-member.model";
import { IQuery, IServiceInput } from "../base/i-base";
import { Logging } from "../base/winston.log";
import { JMorph, JUpdateInstruction } from "./j-morph";
import { safeStringify } from "./safe-stringify";

export class ProfileServiceHelper {
  static logger: Logging = new Logging();

  /**
   * Fetches the profile and removes sensitive fields.
   */
  static async fetchProfile(req, res, si: IServiceInput<any>) {
    // const profileData = await service.getProfile(req, res, { where: { id: userIdOrMemberId } });
    const profileData = await si.serviceInstance.getI(req, res, si.cmd.query);
    if (profileData.length > 0) {
      // Remove sensitive data
      // const res = profileData.map(({ password, ...data }) => data)[0];
      // this.logger.logDebug("ProfileServiceHelper::fetchProfile/res[si.mapping.profileField]:", res[si.mapping.profileField])
      // return res[si.mapping.profileField]
      return res;
    }
    return null;
  }

  /**
   * Modifies the profile based on the provided configuration.
   */

  /**
     * 
     * Example of profileConfig
     * const profileConfig = [
            {
                path: ["memberMeta", "acl", "coopRole"],
                value: {
                    coopId: 1,
                    coopRole: [
                        { scope: CoopsAclScope.COOPS_MEMBER, geoLocationId: 101 }
                    ]
                },
                action: "create" // Could also be "update", "delete", "read"
            },
            {
                path: ["memberMeta", "acl", "coopRole"],
                value: {
                    coopId: 2,
                    coopRole: [
                        { scope: CoopsAclScope.COOPS_ADMIN, geoLocationId: 202 }
                    ]
                },
                action: "update"
            }
        ];

        ---------------------------------------------------------
        Usage:
        const updatedProfile = ProfileServiceHelper.modifyProfile(existingData, profileConfig);


     * @param existingData 
     * @param profileDefaultConfig 
     * @param permissionTypes 
     * @returns 
     */
  static async modifyProfile(existingData: any, profileConfig: any[]) {
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/01");
    let updatedProfile = { ...existingData };
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/02");
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/existingData:",
      existingData
    );
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/profileConfig:",
      profileConfig
    );
    for (const update of profileConfig) {
      const { path, value, action } = update;
      const [firstKey, ...remainingPath] = path;
      this.logger.logDebug("ProfileServiceHelper::modifyProfile()/03");
      // Route based on the action specified in profileConfig
      if (
        firstKey === "memberMeta" &&
        remainingPath[0] === "acl" &&
        remainingPath[1] === "coopRole"
      ) {
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/04");
        switch (action) {
          case "create":
            updatedProfile = await this.createCoopRole(
              updatedProfile,
              remainingPath,
              value
            );
            // this.logger.logDebug("ProfileServiceHelper::modifyProfile()/updatedProfile1:", JSON.stringify(updatedProfile))
            break;
          case "update":
            updatedProfile = await this.updateCoopRole(
              updatedProfile,
              remainingPath,
              value
            );
            break;
          case "delete":
            updatedProfile = await this.deleteCoopRole(
              updatedProfile,
              remainingPath,
              value.coopId
            );
            break;
          case "read":
            await this.readCoopRole(
              updatedProfile,
              remainingPath,
              value.coopId
            );
            break;
          default:
            console.warn(`Unsupported action: ${action}`);
        }
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/05");
      } else {
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/06");
        const jsonUpdate: JUpdateInstruction[] = [
          {
            path: path,
            value: value,
            action: action,
          },
        ];
        // this.applyJsonUpdate(updatedProfile, path, value);
        updatedProfile = JMorph.applyUpdates(updatedProfile, jsonUpdate);
        this.logger.logDebug(
          "ProfileServiceHelper::modifyProfile()/updatedProfile:",
          JSON.stringify(await updatedProfile)
        );
      }
    }
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/07");
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/updatedProfile2:",
      JSON.stringify(await updatedProfile)
    );
    /**
     * Sync updated data with memberData which is still in the state it was retrieved from db.
     */
    updatedProfile = this.syncCoopMemberProfiles(updatedProfile);

    return await updatedProfile;
  }

  /**
   * Updates permissions based on the type and ID key.
   */
  static updatePermissions(
    profile: any,
    newValue: any,
    permissionType: "userPermissions" | "groupPermissions",
    idKey: string
  ) {
    const permissionList = profile.fieldPermissions[permissionType];
    const existingIndex = permissionList.findIndex(
      (permission) =>
        permission[idKey] === newValue[idKey] &&
        permission.field === newValue.field
    );

    if (existingIndex > -1) {
      permissionList[existingIndex] = newValue;
    } else {
      permissionList.push(newValue);
    }

    return profile;
  }

  /**
   * Applies a JSON update based on a path.
   */
  static applyJsonUpdate(
    profile: any,
    path: (string | number | string[])[],
    value: any
  ) {
    this.logger.logDebug("ProfileServiceHelper::applyJsonUpdate()/01");
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/profile:",
      JSON.stringify(profile)
    );
    this.logger.logDebug("ProfileServiceHelper::applyJsonUpdate()/path:", path);
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/value:",
      value
    );
    let current = profile;

    for (let i = 0; i < path.length - 1; i++) {
      let key = path[i];
      if (Array.isArray(key)) {
        key = key.join(".");
      }

      if (!current[key]) {
        current[key] = typeof path[i + 1] === "number" ? [] : {};
      }

      current = current[key];
    }

    let finalKey = path[path.length - 1];
    if (Array.isArray(finalKey)) {
      finalKey = finalKey.join(".");
    }

    current[finalKey] = value;
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/current:",
      JSON.stringify(current)
    );
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/current[finalKey]:",
      current[finalKey]
    );
  }

  static async createCoopRole(
    profile: any,
    path: (string | number | string[])[],
    newValue: MemberMeta
  ) {
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/profile:",
      profile
    );
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/newValue:",
      newValue
    );
    const aclList: MemberMeta[] = profile.memberMeta.acl;

    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/aclList:",
      aclList
    );

    // Validate and clean aclList
    for (let i = aclList.length - 1; i >= 0; i--) {
      if (!this.validateAclItem(aclList[i])) {
        console.warn(`Removing non-compliant item at index ${i}:`, aclList[i]);
        aclList.splice(i, 1); // Remove non-compliant item
      }
    }

    // Remove existing role for the same coopId to avoid duplication
    const existingIndex = aclList.findIndex(
      (acl) => acl.coopId === newValue.coopId
    );
    if (existingIndex !== -1) {
      aclList.splice(existingIndex, 1);
    }

    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/newValue.coopRole:",
      newValue.coopRole
    );

    // Add the new role
    aclList.push({
      coopId: newValue.coopId,
      coopActive: true,
      coopRole: newValue.coopRole,
    });

    profile.memberMeta.acl = aclList;
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/aclList2:",
      aclList
    );
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/profile:",
      JSON.stringify(await profile)
    );

    return await profile;
  }

  static updateCoopRole(
    profile: any,
    path: (string | number | string[])[],
    newValue: any
  ) {
    const aclList = profile.memberMeta.acl;
    const targetAcl = aclList.find(
      (acl: any) => acl.coopId === newValue.coopId
    );

    if (targetAcl) {
      targetAcl.coopRole = newValue.coopRole;
    } else {
      console.warn(
        `No existing coopRole found with coopId ${newValue.coopId} to update.`
      );
    }

    return profile;
  }

  static deleteCoopRole(
    profile: any,
    path: (string | number | string[])[],
    coopId: number
  ) {
    const aclList = profile.memberMeta.acl;
    const index = aclList.findIndex((acl: any) => acl.coopId === coopId);

    if (index !== -1) {
      aclList.splice(index, 1);
    } else {
      console.warn(
        `No existing coopRole found with coopId ${coopId} to delete.`
      );
    }

    return profile;
  }

  static readCoopRole(
    profile: any,
    path: (string | number | string[])[],
    coopId: number
  ) {
    const aclList = profile.memberMeta.acl;
    const targetAcl = aclList.find((acl: any) => acl.coopId === coopId);

    if (targetAcl) {
      this.logger.logDebug(
        `Read coopRole for coopId ${coopId}:`,
        targetAcl.coopRole
      );
      // Optionally, return the coopRole or perform further operations
      return targetAcl.coopRole;
    } else {
      console.warn(`No coopRole found for coopId ${coopId}`);
    }
  }

  static validateAclItem(item: any): boolean {
    const isValidCoopId =
      typeof item.coopId === "number" || item.coopId === null;
    const isValidCoopActive = typeof item.coopActive === "boolean";
    const isValidCoopRole =
      typeof item.coopRole === "object" && item.coopRole !== null; // Assuming ICoopRole is an object
    const isValidAclRole =
      item.aclRole === undefined ||
      (typeof item.aclRole === "object" && item.aclRole !== null); // Optional property
    const isValidCoopMemberData =
      item.coopMemberData === undefined || Array.isArray(item.coopMemberData); // Optional property

    return (
      isValidCoopId &&
      isValidCoopActive &&
      isValidCoopRole &&
      isValidAclRole &&
      isValidCoopMemberData
    );
  }

  static syncCoopMemberProfiles(modifiedProfile: any) {
    this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/01");
    this.logger.logDebug(
      "ProfileServiceHelper::syncCoopMemberProfiles()/modifiedProfile:",
      modifiedProfile
    );
    if ("memberMeta" in modifiedProfile) {
      // Extract the modified acl from memberMeta
      const updatedAcl = modifiedProfile.memberMeta.acl;
      this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/02");
      // Go through each memberData item and replace its coopMemberProfile with updatedAcl
      modifiedProfile.memberMeta.memberData.forEach((member: any) => {
        this.logger.logDebug(
          "ProfileServiceHelper::syncCoopMemberProfiles()/03"
        );
        member.coopMemberProfile = [...updatedAcl]; // Spread operator to create a copy of updatedAcl
      });
    }
    this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/04");
    return modifiedProfile;
  }
}
```

////////////////////////////////////////////
To help you understand how coop got involved in this, take a look at CoopMemberModel and CoopMemberService.
The idea was to have a way of having user profile to be extensible to developer module like coop which has members and the profile context can need special properties.
The service only shows related methods.
The understanding can help you improve the helper class.

```ts
@Entity({
  name: "coop_member",
  synchronize: false,
})
// @CdModel
export class CoopMemberModel {
  @PrimaryGeneratedColumn({
    name: "coop_member_id",
  })
  coopMemberId?: number;

  @Column({
    name: "coop_member_guid",
    length: 40,
    default: uuidv4(),
  })
  coopMemberGuid?: string;

  @Column({
    name: "coop_member_type_id",
    nullable: true,
  })
  coopMemberTypeId: number;

  @Column({
    name: "user_id",
    nullable: true,
  })
  userId: number;

  @Column({
    name: "doc_id",
    nullable: true,
  })
  docId?: number;

  @Column({
    name: "coop_member_enabled",
    nullable: true,
  })
  coopMemberEnabled: boolean;

  @Column({
    name: "coop_id",
    nullable: true,
  })
  coopId: number;

  // coop_member_approved
  @Column({
    name: "coop_member_approved",
    nullable: true,
  })
  coopMemberApproved?: string;

  @Column({
    name: "coop_active",
    nullable: true,
  })
  coopActive: boolean;

  @Column({
    name: "coop_member_profile",
    nullable: true,
  })
  coopMemberProfile: string;
}

export interface IMemberProfileAccess {
  userPermissions: IProfileMemberAccess[];
  groupPermissions: IProfileGroupAccess[];
}

/**
 * Improved versin should have just one interface and
 * instead of userId or groupId, cdObjId is applied.
 * This would then allow any object permissions to be set
 * Automation and 'role' concept can then be used to manage permission process
 */
export interface IProfileMemberAccess {
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

// export interface ICoopMemberProfile extends IUserProfile {
//     memberMeta: {
//         memberData: CoopMemberViewModel[];
//         acl: MemberMeta[]; // affiliation with various SACCOS (privilege-related data in various SACCOS)
//     };
// }

export interface ICoopMembership {
  memberProfile: ICoopMemberProfile; // affiliation with various SACCOS (privilege-related data in various SACCOS)
  coopMemberData?: CoopMemberViewModel[]; // affilication with various SACCOS(selection of coop_member_view where the current user appears)
}

export interface ICoopMemberProfile extends IUserProfile {
  memberMeta: MemberMeta[]; // affiliation with various SACCOS (privilege-related data in various SACCOS)
}

export interface MemberMeta {
  coopId: number | null;
  coopActive: boolean;
  coopRole: ICoopRole;
  aclRole?: IAclRole;
}

// Define a type that excludes 'memberMeta' from ICoopMemberProfile
// export type IUserProfileOnly = Omit<ICoopMemberProfile, "memberMeta">;

/**
 * Note that coop membership prrofile is an extension of user profile
 * Note that the first item is userProfile and by default has a value imported from userProfileDefault,
 * On load, date will be set from database.
 * the data below is just a default,
 * details are be managed with 'roles' features
 *
 */

export const coopMemberProfileDefault: ICoopMemberProfile = {
  ...userProfileDefault, // Copy all properties from userProfileDefault
  memberMeta: [
    {
      coopId: -1,
      aclRole: {
        aclRoleName: "guest",
        permissions: {
          userPermissions: [
            {
              read: false,
              field: "",
              write: false,
              hidden: true,
              cdObjId: 0,
              execute: false,
            },
          ],
          groupPermissions: [
            {
              read: false,
              field: "",
              write: false,
              hidden: true,
              cdObjId: 0,
              execute: false,
            },
          ],
        },
      },
      coopActive: false,
      coopRole: [],
    },
  ],
};

export const coopMemberDataDefault: CoopMemberViewModel = {
  coopId: -1,
  userId: -1,
  coopActive: false,
  coopMemberProfile: JSON.stringify(coopMemberProfileDefault),
};

export const coopMembershipDefault: ICoopMembership = {
  memberProfile: coopMemberProfileDefault,
  coopMemberData: [coopMemberDataDefault],
};

/**
 * Example usage
 * const role: CoopsRoles = CoopsRoles.COOPS_GUEST;
 * console.log(role); // Output: 11
 */

// Enum for ACL Scope
export const enum CoopsAclScope {
  COOPS_GUEST = 11,
  COOPS_USER = 12,
  COOPS_MEMBER = 13,
  COOPS_SACCO_ADMIN = 14,
  COOPS_REGIONAL_ADMIN = 15,
  COOPS_NATIONAL_ADMIN = 16,
  COOPS_CONTINENTAL_ADMIN = 17,
  COOPS_GLOBAL_ADMIN = 18,
  COOPS_NATIONAL_REGULATOR = 19,
  COOPS_MEMBER_APPLICANT = 20,
}

export const allScopes: {
  value: number;
  label: string;
  order: number;
  cdGeoPoliticalTypeId?: number;
}[] = [
  {
    value: CoopsAclScope.COOPS_GUEST,
    label: "Guest",
    order: 10,
    cdGeoPoliticalTypeId: -1,
  },
  {
    value: CoopsAclScope.COOPS_USER,
    label: "User",
    order: 20,
    cdGeoPoliticalTypeId: -1,
  },
  {
    value: CoopsAclScope.COOPS_MEMBER_APPLICANT,
    label: "Member Applicant",
    order: 30,
    cdGeoPoliticalTypeId: -1,
  },
  {
    value: CoopsAclScope.COOPS_MEMBER,
    label: "Member",
    order: 40,
    cdGeoPoliticalTypeId: -1,
  },
  {
    value: CoopsAclScope.COOPS_SACCO_ADMIN,
    label: "Sacco Admin",
    order: 50,
    cdGeoPoliticalTypeId: -1,
  },
  {
    value: CoopsAclScope.COOPS_REGIONAL_ADMIN,
    label: "Regional Admin",
    order: 60,
    cdGeoPoliticalTypeId: 16,
  },
  {
    value: CoopsAclScope.COOPS_NATIONAL_ADMIN,
    label: "National Admin",
    order: 70,
    cdGeoPoliticalTypeId: 10,
  },
  {
    value: CoopsAclScope.COOPS_NATIONAL_REGULATOR,
    label: "National Regulator",
    order: 80,
    cdGeoPoliticalTypeId: 10,
  },
  {
    value: CoopsAclScope.COOPS_CONTINENTAL_ADMIN,
    label: "Continental Admin",
    order: 90,
    cdGeoPoliticalTypeId: 11,
  },
  {
    value: CoopsAclScope.COOPS_GLOBAL_ADMIN,
    label: "Global Admin",
    order: 100,
    cdGeoPoliticalTypeId: 19,
  },
];

// Interface for ICoopAcl
export interface ICoopAcl {
  scope: CoopsAclScope;
  geoLocationId: number | null;
}

/**
 * Interface for CoopScope, which is an array of CoopAcl
 * Usage:
 * const coopScope: CoopScope = [
  { scope: CoopsAclScope.COOPS_GUEST, geoLocationId: null },
  { scope: CoopsAclScope.COOPS_SACCO_ADMIN, geoLocationId: 123 },
  { scope: CoopsAclScope.COOPS_GLOBAL_ADMIN, geoLocationId: 456 }
];

console.log(coopScope);
 */
export interface ICoopRole extends Array<ICoopAcl> {}

export function getSearchQuery(searchKey: string) {
  return [
    {
      coopMemberId: `Like('%${searchKey}%')`,
    },
    {
      coopMemberName: `Like('%${searchKey}%')`,
    },
    {
      coopMemberGuid: `Like('%${searchKey}%')`,
    },
    {
      userName: `Like('%${searchKey}%')`,
    },
    {
      email: `Like('%${searchKey}%')`,
    },
    {
      mobile: `Like('%${searchKey}%')`,
    },
    {
      fName: `Like('%${searchKey}%')`,
    },
    {
      mName: `Like('%${searchKey}%')`,
    },
    {
      lName: `Like('%${searchKey}%')`,
    },
    {
      nationalId: `Like('%${searchKey}%')`,
    },
    {
      coopName: `Like('%${searchKey}%')`,
    },
    {
      cdGeoLocationName: `Like('%${searchKey}%')`,
    },
  ];
}
```

```ts
export class CoopMemberService extends CdService {
  logger: Logging;
  b: BaseService;
  cdToken: string;
  uid: number;
  serviceModel: CoopMemberModel;
  srvSess: SessionService;
  validationCreateParams;
  existingUserProfile: IUserProfile;
  mergedProfile: ICoopMembership;
  coopMemberData: CoopMemberViewModel[];
  cuAclType: AclTypeModel[]; // current user acl type data

  /*
   * validation rules for create()
   */
  cRules: ValidationRules = {
    required: ["userId", "coopId"],
    noDuplicate: ["userId", "coopId"],
  };

  /**
   * Assemble components of the profile from existing or use default to setup the first time
   * @param req
   * @param res
   */
  async setCoopMemberProfileI(req, res, byToken: boolean) {
    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/01");

    // note that 'ignoreCache' is set to true because old data may introduce confussion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );
    this.uid = sessionDataExt.currentUser.userId;

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.

    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/02");
    /**
     * Asses if request for self or for another user
     * - if request action is 'GetMemberProfile'
     * - and 'userId' is set
     */
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/req.post.a",
      req.post.a
    );

    const plQuery = await this.b.getPlQuery(req);
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/plQuery:",
      plQuery
    );
    if (!byToken) {
      this.uid = plQuery.where.userId;
    }

    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/uid0:", {
      d: this.uid,
    });

    /**
     * get member data
     */
    this.coopMemberData = await this.getCoopMemberI(req, res, {
      where: { userId: this.uid },
      distinct: true,
    });

    if (!this.coopMemberData) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    if (this.coopMemberData.length === 0) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    /**
     * Remove any duplicates
     */
    // this.coopMemberData = this.coopMemberCleaner(this.coopMemberData);
    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/this.coopMemberData:",
      this.coopMemberData
    );

    const svUser = new UserService();
    let userProfileResult = await svUser.existingUserProfile(
      req,
      res,
      this.uid
    );
    if (!userProfileResult) {
      userProfileResult = userProfileDefault;
    }
    if (userProfileResult.length === 0) {
      userProfileResult = userProfileDefault;
    } else {
      this.existingUserProfile = userProfileResult[0];
    }
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/existingUserProfile:",
      this.existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, this.existingUserProfile)) {
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/03");
      // merge coopMemberProfile data
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        this.existingUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/04");
      if (this.validateGetCoopMemberProfile(req, res, byToken)) {
        this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/05");
        this.logger.logDebug(
          "CoopMemberService::setCoopMemberProfile()/this.uid:",
          { d: this.uid }
        );
        const uRet = await svUser.getUserByID(req, res, this.uid);
        this.logger.logDebug(
          "CoopMemberService::setCoopMemberProfile()/uRet:",
          { d: uRet }
        );
        if (uRet.length > 0) {
          const { password, userProfile, ...filteredUserData } = uRet[0];
          this.logger.logDebug(
            "CoopMemberService::setCoopMemberProfile()/filteredUserData:",
            filteredUserData
          );
          userProfileDefault.userData = filteredUserData;
        }
      } else {
        this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
      }

      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault1:",
        userProfileDefault
      );
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06-1");
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = this.uid;
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/07");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault2:",
        userProfileDefault
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/profileDefaultConfig:",
        profileDefaultConfig
      );
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/08");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfile()/this.mergedProfile2:",
        { d: JSON.stringify(this.mergedProfile) }
      );
    }
  }

  async resetCoopMemberProfileI(req, res, byToken: boolean) {
    this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/01");
    // note that 'ignoreCache' is set to true because old data may introduce confusion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    this.logger.logDebug(
      "CoopMemberService::resetCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.
    //   hint:
    this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/02");
    const svUser = new UserService();
    const existingUserProfile = await svUser.existingUserProfile(
      req,
      res,
      sessionDataExt.currentUser.userId
    );
    this.logger.logDebug(
      "CoopMemberService::resetCoopMemberProfileI()/existingUserProfile:",
      existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, existingUserProfile)) {
      this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/03");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/04");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile2:",
        this.mergedProfile
      );
    }
  }

  async mergeUserProfile(
    req,
    res,
    userProfile,
    byToken
  ): Promise<ICoopMembership> {
    this.logger.logDebug("CoopMemberService::mergeUserProfile()/01");

    CdLogger.debug("CoopMemberService::mergeUserProfile()/03");

    const plQuery = this.b.getPlQuery(req);
    if (!byToken) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/04");
      this.uid = plQuery.where.userId;
    }

    this.logger.logDebug("CoopMemberService::mergeUserProfile()/this.uid:", {
      d: this.uid,
    });

    const q = {
      where: { userId: this.uid },
      distinct: true,
    };
    this.logger.logDebug("CoopMemberService::mergeUserProfile()/q:", { d: q });

    /**
     * get collection profile data only
     */
    let existingProfileData: CoopMemberViewModel[] =
      await this.existingCoopMemberData(req, res, this.uid);
    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/existingProfileData:",
      { r: JSON.stringify(existingProfileData) }
    );

    let existingMemberMeta: MemberMeta[] =
      await this.extractMemberMeta(existingProfileData);

    if (!existingMemberMeta) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/05:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    if (existingMemberMeta.length === 0) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/06:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/existingMemberMeta:",
      existingMemberMeta
    );

    const mergedProfile: ICoopMembership = {
      memberProfile: {
        ...userProfile,
        memberMeta: existingMemberMeta,
      },
      coopMemberData: this.coopMemberData,
    };

    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/mergedProfile:",
      mergedProfile
    );

    return mergedProfile;
  }

  async updateCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMembership;
      let strModifiedCoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.setCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/01");
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile1:",
          modifiedCoopMemberProfile
        );

        // modified profile
        strModifiedCoopMemberProfile = JSON.stringify(
          modifiedCoopMemberProfile
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strModifiedCoopMemberProfile:",
          strModifiedCoopMemberProfile
        );
        // userProfile
        strUserProfile = safeStringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = safeStringify(
          modifiedCoopMemberProfile.memberProfile.memberMeta
        );
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/021"
        );
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile2:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = JSON.stringify(
          modifiedCoopMemberProfile.memberProfile.memberMeta
        );
      }

      this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-0:",
        { d: JSON.stringify(await modifiedCoopMemberProfile) }
      );

      const existingCoopMember = await this.beforeUpdateMemberProfile(req, res);
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/existingCoopMember:",
        { d: JSON.stringify(existingCoopMember) }
      );

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        { d: JSON.stringify(requestQuery) }
      );

      if (!requestQuery.update) {
        const e = "Update data is not defined";
        CdLogger.error(e);
        this.b.err.push(e);
        const i = {
          messages: this.b.err,
          code: "CoopMemberService:updateCurrentUserProfile",
          app_msg: "",
        };
        await this.b.serviceErr(req, res, e, i.code);
        await this.b.respond(req, res);
      }

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput.cmd:",
        serviceInput.cmd
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/newCoopMemberProfile:",
        newCoopMemberProfile
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/fullProfile:",
        { d: JSON.stringify(await fullProfile) }
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-1:",
        { d: JSON.stringify(modifiedCoopMemberProfile) }
      );
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/finalRet:",
        { d: JSON.stringify(finalRet) }
      );

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /**
   * Before updating,
   * 1. Get the api request
   * 2. Extract target user
   * 3. Extract target coopId
   * 4. Check if target user is a member of target coop
   * 5. if member does not exist, create
   */
  async beforeUpdateMemberProfile(
    req,
    res
  ): Promise<boolean | CoopMemberModel> {
    /**
     * 1. Get the api request
     */
    let uid = -1;
    let plQuery = null;
    let coopId = -1;
    let coopMember: boolean | CoopMemberModel = null;
    const pl = req.post;
    const coopMemberProfile = null;
    if (req.post.a === "UpdateCoopMemberProfile") {
      plQuery = await this.b.getPlQuery(req);
      this.logger.logDebug(
        "CoopMemberService::beforeUpdateMemberProfile()/plQuery:",
        plQuery
      );
      // 2. Extract target user
      uid = plQuery.where.userId;
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/coopMember1:",
        { d: uid }
      );
      // 3. Extract target coopId
      coopId = pl.dat.f_vals[0].jsonUpdate[0].value.coopId;
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/coopId:",
        { d: coopId }
      );
      // 4. Check if target user is a member of target coop
      const retMemberExists = await this.coopMemberExists(req, res, {
        filter: { userId: uid },
      });
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/retMemberExists:",
        { d: retMemberExists }
      );
      // 5. if member does not exist, create
      if (retMemberExists.length === 0) {
        // const cdCliQuery: CdCliModel = cdCliData;
        // const svCdCli = new CdCliService();
        const newCoopMember: CoopMemberModel = {
          coopMemberGuid: this.b.getGuid(),
          userId: uid,
          coopId: coopId,
          coopMemberProfile: JSON.stringify(coopMemberProfileDefault),
          coopMemberTypeId: 103, // Initially the member should be viewed as Guest. Later to be promoted by SACCO admin
          coopMemberEnabled: true,
          coopActive: true,
        };
        this.logger.logDebug(
          "CdCliService::beforeUpdateMemberProfile()/newCoopMember:",
          newCoopMember
        );
        const si = {
          serviceInstance: this,
          serviceModel: CoopMemberModel,
          serviceModelInstance: this.serviceModel,
          docName: "CoopMemberService::beforeUpdateMemberProfile",
          dSource: 1,
        };
        const createIParams: CreateIParams = {
          serviceInput: si,
          controllerData: newCoopMember,
        };
        coopMember = await this.createI(req, res, createIParams);
        this.logger.logDebug(
          "CdCliService::beforeUpdateMemberProfile()/coopMember:",
          { d: coopMember }
        );
      } else {
        coopMember = retMemberExists[0];
      }
    }
    this.logger.logInfo(
      `CdCliService::beforeUpdateMemberProfile()/coopMember2:${await coopMember}`
    );
    return await coopMember;
  }

  async resetCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.resetCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/01");
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile3:",
          modifiedCoopMemberProfile
        );

        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        strCoopMemberData = JSON.stringify(
          modifiedCoopMemberProfile.memberMeta[0]
        );
        // memberData
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/021"
        );
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile4:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      }

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile3:",
        modifiedCoopMemberProfile
      );

      this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput:",
        serviceInput
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /////////////////////////////////////////////
  // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
  //

  async existingCoopMemberData(req, res, cuid): Promise<CoopMemberViewModel[]> {
    const si: IServiceInput = {
      serviceInstance: this,
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::existingUserProfile",
      dSource: 1,
      cmd: {
        action: "find",
        query: { select: ["coopMemberProfile"], where: { userId: cuid } },
      },
      // mapping: { profileField: "coopMemberProfile" },
    };
    const existinCoopMemberData: CoopMemberViewModel[] = await this.b.read(
      req,
      res,
      si
    );
    this.logger.logDebug(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData:",
      existinCoopMemberData
    );
    this.logger.logDebug(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData.length:",
      { d: existinCoopMemberData.length }
    );
    return existinCoopMemberData;
    // return formatedExistingData = await this.extractMemberMeta(existinCoopMemberData);
  }

  async extractMemberMeta(
    existingProfileData: CoopMemberViewModel[]
  ): Promise<MemberMeta[]> {
    const uniqueMap = new Map<string, MemberMeta>();

    for (const viewModel of existingProfileData) {
      const profileList = viewModel.coopMemberProfile ?? [];

      for (const meta of profileList) {
        // Generate a unique key for comparison
        const key = `${meta.coopId}-${meta.coopRole?.id ?? "null"}`;

        // Only add if not already present
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, meta);
        }
      }
    }

    // Return array of unique MemberMeta
    return Array.from(uniqueMap.values());
  }

  // Helper method to validate profile data
  async validateProfileData(
    req,
    res,
    profileData: ICoopMembership
  ): Promise<boolean> {
    this.logger.logDebug(
      "CoopMemberService::validateProfileData()/profileData:",
      profileData
    );
    // const profileData: IUserProfile = updateData.update.userProfile
    // this.logger.logDebug("CoopMemberService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/01");
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (
      !profileData.memberProfile.fieldPermissions ||
      !profileData.memberProfile.userData
    ) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/02");
      this.logger.logDebug(
        "CoopMemberService::validateProfileData()/profileData.userData:",
        profileData.memberProfile.userData
      );
      this.logger.logDebug(
        "CoopMemberService::validateProfileData()/profileData.fieldPermissions:",
        profileData.memberProfile.fieldPermissions
      );
      return false;
    }

    // Example validation for bio length
    if (
      profileData.memberProfile.bio &&
      profileData.memberProfile.bio.length > 500
    ) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/03");
      const e = "Bio data is too long";
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:validateProfileData",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }
}
```

///////////////////////////////////////////
coops is a module for managing cooperative/saccos/unions operations.
In light of refined profile structures, take a look at the CoopMemberService and refactor based on the latest shapes.
I have placed IEntityMemberProfile, IEntityProfile and ICdMemberProfile in src/CdApi/sys/base/i-base.ts.

The tree of files below shows how coop-member concept fits in coops module.

```sh
emp-12@emp-12 ~/c/cd-api (main)> tree src/CdApi/app/coops/
src/CdApi/app/coops/
├── asdap.service
├── asdap-service.sh
├── asdap-sio.service
├── config.ts
├── controllers
│   ├── coop.controller.ts
│   ├── coop-member.controller.ts
│   ├── coop-stat.controller.ts
│   ├── coop-stat-public-filter.controller.ts
│   └── coop-stat-ref.controller.ts
├── extra
│   ├── africa-coop-data
│   │   ├──

    ...trancated

├── models
│   ├── coop-member.model.ts
│   ├── coop-member-type.model.ts
│   ├── coop-member-view.model_corr.ts
│   ├── coop-member-view.model.ts
│   ├── coop.model.ts
│   ├── coop-stat.model.ts
│   ├── coop-stat-public-filter.model.ts
│   ├── coop-stat-ref.model.ts
│   ├── coop-stat-view.model.ts
│   ├── coop-type.model.ts
│   ├── coop-view.model.ts
│   └── ICoops.ts
├── notes
├── README.md
├── sample-data.json
├── services
│   ├── coop-member.service.ts
│   ├── coop.service.ts
│   ├── coop-stat-public-filter.service.ts
│   ├── coop-stat-ref.service.ts
│   ├── coop-stat.service.ts
│   └── coop-type.service.ts
└── standard economic-indicators
```

```ts
export class CoopMemberService extends CdService {
  logger: Logging;
  b: BaseService;
  cdToken: string;
  uid: number;
  serviceModel: CoopMemberModel;
  srvSess: SessionService;
  validationCreateParams;
  existingUserProfile: IUserProfile;
  mergedProfile: ICoopMembership;
  coopMemberData: CoopMemberViewModel[];
  cuAclType: AclTypeModel[]; // current user acl type data

  /*
   * validation rules for create()
   */
  cRules: ValidationRules = {
    required: ["userId", "coopId"],
    noDuplicate: ["userId", "coopId"],
  };

  /**
   * Assemble components of the profile from existing or use default to setup the first time
   * @param req
   * @param res
   */
  async setCoopMemberProfileI(req, res, byToken: boolean) {
    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/01");

    // note that 'ignoreCache' is set to true because old data may introduce confussion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );
    this.uid = sessionDataExt.currentUser.userId;

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.

    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/02");
    /**
     * Asses if request for self or for another user
     * - if request action is 'GetMemberProfile'
     * - and 'userId' is set
     */
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/req.post.a",
      req.post.a
    );

    const plQuery = await this.b.getPlQuery(req);
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/plQuery:",
      plQuery
    );
    if (!byToken) {
      this.uid = plQuery.where.userId;
    }

    this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/uid0:", {
      d: this.uid,
    });

    /**
     * get member data
     */
    this.coopMemberData = await this.getCoopMemberI(req, res, {
      where: { userId: this.uid },
      distinct: true,
    });

    if (!this.coopMemberData) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    if (this.coopMemberData.length === 0) {
      this.coopMemberData = [coopMemberDataDefault];
    }

    /**
     * Remove any duplicates
     */
    // this.coopMemberData = this.coopMemberCleaner(this.coopMemberData);
    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/this.coopMemberData:",
      this.coopMemberData
    );

    const svUser = new UserService();
    let userProfileResult = await svUser.existingUserProfile(
      req,
      res,
      this.uid
    );
    if (!userProfileResult) {
      userProfileResult = userProfileDefault;
    }
    if (userProfileResult.length === 0) {
      userProfileResult = userProfileDefault;
    } else {
      this.existingUserProfile = userProfileResult[0];
    }
    this.logger.logDebug(
      "CoopMemberService::setCoopMemberProfileI()/existingUserProfile:",
      this.existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, this.existingUserProfile)) {
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/03");
      // merge coopMemberProfile data
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        this.existingUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/04");
      if (this.validateGetCoopMemberProfile(req, res, byToken)) {
        this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/05");
        this.logger.logDebug(
          "CoopMemberService::setCoopMemberProfile()/this.uid:",
          { d: this.uid }
        );
        const uRet = await svUser.getUserByID(req, res, this.uid);
        this.logger.logDebug(
          "CoopMemberService::setCoopMemberProfile()/uRet:",
          { d: uRet }
        );
        if (uRet.length > 0) {
          const { password, userProfile, ...filteredUserData } = uRet[0];
          this.logger.logDebug(
            "CoopMemberService::setCoopMemberProfile()/filteredUserData:",
            filteredUserData
          );
          userProfileDefault.userData = filteredUserData;
        }
      } else {
        this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
      }

      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault1:",
        userProfileDefault
      );
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/06-1");
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = this.uid;
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/07");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/userProfileDefault2:",
        userProfileDefault
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/profileDefaultConfig:",
        profileDefaultConfig
      );
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug("CoopMemberService::setCoopMemberProfileI()/08");
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::setCoopMemberProfile()/this.mergedProfile2:",
        { d: JSON.stringify(this.mergedProfile) }
      );
    }
  }

  async resetCoopMemberProfileI(req, res, byToken: boolean) {
    this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/01");
    // note that 'ignoreCache' is set to true because old data may introduce confusion
    const svSess = new SessionService();
    const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
      req,
      res,
      true
    );
    this.logger.logDebug(
      "CoopMemberService::resetCoopMemberProfileI()/sessionDataExt:",
      sessionDataExt
    );

    //     - get and clone userProfile, then get coopMemberProfile data and append to cloned userProfile.
    //   hint:
    this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/02");
    const svUser = new UserService();
    const existingUserProfile = await svUser.existingUserProfile(
      req,
      res,
      sessionDataExt.currentUser.userId
    );
    this.logger.logDebug(
      "CoopMemberService::resetCoopMemberProfileI()/existingUserProfile:",
      existingUserProfile
    );
    let modifiedUserProfile;

    if (await svUser.validateProfileData(req, res, existingUserProfile)) {
      this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/03");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile1:",
        this.mergedProfile
      );
    } else {
      this.logger.logDebug("CoopMemberService::resetCoopMemberProfileI()/04");
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res
      );
      const { password, userProfile, ...filteredUserData } =
        sessionDataExt.currentUser;
      userProfileDefault.userData = filteredUserData;
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/userProfileDefault:",
        userProfileDefault
      );
      // use default, assign the userId
      profileDefaultConfig[0].value.userId = sessionDataExt.currentUser.userId;
      modifiedUserProfile = await svUser.modifyProfile(
        userProfileDefault,
        profileDefaultConfig
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/modifiedUserProfile:",
        modifiedUserProfile
      );
      this.mergedProfile = await this.mergeUserProfile(
        req,
        res,
        modifiedUserProfile,
        byToken
      );
      this.logger.logDebug(
        "CoopMemberService::resetCoopMemberProfileI()/this.mergedProfile2:",
        this.mergedProfile
      );
    }
  }

  async mergeUserProfile(
    req,
    res,
    userProfile,
    byToken
  ): Promise<ICoopMembership> {
    this.logger.logDebug("CoopMemberService::mergeUserProfile()/01");

    CdLogger.debug("CoopMemberService::mergeUserProfile()/03");

    const plQuery = this.b.getPlQuery(req);
    if (!byToken) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/04");
      this.uid = plQuery.where.userId;
    }

    this.logger.logDebug("CoopMemberService::mergeUserProfile()/this.uid:", {
      d: this.uid,
    });

    const q = {
      where: { userId: this.uid },
      distinct: true,
    };
    this.logger.logDebug("CoopMemberService::mergeUserProfile()/q:", { d: q });

    /**
     * get collection profile data only
     */
    let existingProfileData: CoopMemberViewModel[] =
      await this.existingCoopMemberData(req, res, this.uid);
    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/existingProfileData:",
      { r: JSON.stringify(existingProfileData) }
    );

    let existingMemberMeta: MemberMeta[] =
      await this.extractMemberMeta(existingProfileData);

    if (!existingMemberMeta) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/05:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    if (existingMemberMeta.length === 0) {
      CdLogger.debug("CoopMemberService::mergeUserProfile()/06:");
      existingMemberMeta = coopMemberProfileDefault.memberMeta;
    }

    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/existingMemberMeta:",
      existingMemberMeta
    );

    const mergedProfile: ICoopMembership = {
      memberProfile: {
        ...userProfile,
        memberMeta: existingMemberMeta,
      },
      coopMemberData: this.coopMemberData,
    };

    this.logger.logDebug(
      "CoopMemberService::mergeUserProfile()/mergedProfile:",
      mergedProfile
    );

    return mergedProfile;
  }

  async updateCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMembership;
      let strModifiedCoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.setCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/01");
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile1:",
          modifiedCoopMemberProfile
        );

        // modified profile
        strModifiedCoopMemberProfile = JSON.stringify(
          modifiedCoopMemberProfile
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strModifiedCoopMemberProfile:",
          strModifiedCoopMemberProfile
        );
        // userProfile
        strUserProfile = safeStringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = safeStringify(
          modifiedCoopMemberProfile.memberProfile.memberMeta
        );
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/021"
        );
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile2:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        // strCoopMemberData = JSON.stringify(
        //   modifiedCoopMemberProfile.memberMeta[0].coopMemberData
        // );
        // memberData
        strAcl = JSON.stringify(
          modifiedCoopMemberProfile.memberProfile.memberMeta
        );
      }

      this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-0:",
        { d: JSON.stringify(await modifiedCoopMemberProfile) }
      );

      const existingCoopMember = await this.beforeUpdateMemberProfile(req, res);
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/existingCoopMember:",
        { d: JSON.stringify(existingCoopMember) }
      );

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        { d: JSON.stringify(requestQuery) }
      );

      if (!requestQuery.update) {
        const e = "Update data is not defined";
        CdLogger.error(e);
        this.b.err.push(e);
        const i = {
          messages: this.b.err,
          code: "CoopMemberService:updateCurrentUserProfile",
          app_msg: "",
        };
        await this.b.serviceErr(req, res, e, i.code);
        await this.b.respond(req, res);
      }

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput.cmd:",
        serviceInput.cmd
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/newCoopMemberProfile:",
        newCoopMemberProfile
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/fullProfile:",
        { d: JSON.stringify(await fullProfile) }
      );
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/strUserProfile1-1:",
        { d: JSON.stringify(modifiedCoopMemberProfile) }
      );
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/finalRet:",
        { d: JSON.stringify(finalRet) }
      );

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /**
   * Before updating,
   * 1. Get the api request
   * 2. Extract target user
   * 3. Extract target coopId
   * 4. Check if target user is a member of target coop
   * 5. if member does not exist, create
   */
  async beforeUpdateMemberProfile(
    req,
    res
  ): Promise<boolean | CoopMemberModel> {
    /**
     * 1. Get the api request
     */
    let uid = -1;
    let plQuery = null;
    let coopId = -1;
    let coopMember: boolean | CoopMemberModel = null;
    const pl = req.post;
    const coopMemberProfile = null;
    if (req.post.a === "UpdateCoopMemberProfile") {
      plQuery = await this.b.getPlQuery(req);
      this.logger.logDebug(
        "CoopMemberService::beforeUpdateMemberProfile()/plQuery:",
        plQuery
      );
      // 2. Extract target user
      uid = plQuery.where.userId;
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/coopMember1:",
        { d: uid }
      );
      // 3. Extract target coopId
      coopId = pl.dat.f_vals[0].jsonUpdate[0].value.coopId;
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/coopId:",
        { d: coopId }
      );
      // 4. Check if target user is a member of target coop
      const retMemberExists = await this.coopMemberExists(req, res, {
        filter: { userId: uid },
      });
      this.logger.logDebug(
        "CdCliService::beforeUpdateMemberProfile()/retMemberExists:",
        { d: retMemberExists }
      );
      // 5. if member does not exist, create
      if (retMemberExists.length === 0) {
        // const cdCliQuery: CdCliModel = cdCliData;
        // const svCdCli = new CdCliService();
        const newCoopMember: CoopMemberModel = {
          coopMemberGuid: this.b.getGuid(),
          userId: uid,
          coopId: coopId,
          coopMemberProfile: JSON.stringify(coopMemberProfileDefault),
          coopMemberTypeId: 103, // Initially the member should be viewed as Guest. Later to be promoted by SACCO admin
          coopMemberEnabled: true,
          coopActive: true,
        };
        this.logger.logDebug(
          "CdCliService::beforeUpdateMemberProfile()/newCoopMember:",
          newCoopMember
        );
        const si = {
          serviceInstance: this,
          serviceModel: CoopMemberModel,
          serviceModelInstance: this.serviceModel,
          docName: "CoopMemberService::beforeUpdateMemberProfile",
          dSource: 1,
        };
        const createIParams: CreateIParams = {
          serviceInput: si,
          controllerData: newCoopMember,
        };
        coopMember = await this.createI(req, res, createIParams);
        this.logger.logDebug(
          "CdCliService::beforeUpdateMemberProfile()/coopMember:",
          { d: coopMember }
        );
      } else {
        coopMember = retMemberExists[0];
      }
    }
    this.logger.logInfo(
      `CdCliService::beforeUpdateMemberProfile()/coopMember2:${await coopMember}`
    );
    return await coopMember;
  }

  async resetCoopMemberProfile(req, res, byToken): Promise<void> {
    try {
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "CoopMemberService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );
      const svUser = new UserService();
      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedCoopMemberProfile: ICoopMemberProfile;
      let strUserProfile;
      let strCoopMemberData;
      let strAcl;
      let userProfile = await svUser.getUserProfileI(
        req,
        res,
        sessionDataExt.currentUser.userId
      );

      /**
       * extract from db and merge with user profile to form coopMemberProfile
       * 1. profile data from current user coop_member entity.
       * 2. membership data
       */
      await this.resetCoopMemberProfileI(req, res, byToken);

      if (await this.validateProfileData(req, res, this.mergedProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/01");
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/jsonUpdate:",
          jsonUpdate
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          this.mergedProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/strUserProfile3:",
          modifiedCoopMemberProfile
        );

        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        // acl
        strCoopMemberData = JSON.stringify(
          modifiedCoopMemberProfile.memberMeta[0]
        );
        // memberData
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/021"
        );
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedCoopMemberProfile = await svUser.modifyProfile(
          userProfileDefault,
          jsonUpdate
        );
        this.logger.logDebug(
          "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile4:",
          modifiedCoopMemberProfile
        );
        // strCoopMemberData = JSON.stringify(modifiedCoopMemberProfile)
        // userProfile
        strUserProfile = JSON.stringify(userProfile);
        strAcl = JSON.stringify(modifiedCoopMemberProfile.memberMeta);
      }

      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/modifiedCoopMemberProfile3:",
        modifiedCoopMemberProfile
      );

      this.logger.logDebug("CoopMemberService::updateCoopMemberProfile()/03");
      requestQuery.update = { coopMemberProfile: strAcl };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/requestQuery:",
        requestQuery
      );

      // update coopMemberProfile
      let serviceInput: IServiceInput = {
        serviceInstance: this,
        serviceModel: CoopMemberModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/serviceInput:",
        serviceInput
      );
      const updateCoopMemberRet = await this.updateI(req, res, serviceInput);
      const newCoopMemberProfile = await this.existingCoopMemberData(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      let retCoopMember = {
        updateRet: updateCoopMemberRet,
        newProfile: newCoopMemberProfile,
      };

      const userUpdateQuery = {
        update: { userProfile: strUserProfile },
        where: {
          userId: sessionDataExt.currentUser.userId,
        },
      };
      // update user
      const userServiceInput: IServiceInput = {
        serviceInstance: svUser,
        serviceModel: UserModel,
        docName: "CoopMemberService::updateCoopMemberProfile",
        cmd: {
          query: userUpdateQuery,
        },
      };
      this.logger.logDebug(
        "CoopMemberService::updateCoopMemberProfile()/userServiceInput:",
        userServiceInput
      );
      const userUpdateRet = await svUser.updateI(req, res, userServiceInput);
      const fullProfile = await this.getI(req, res, {
        where: { userId: sessionDataExt.currentUser.userId },
      });
      const finalRet = {
        updateRet: updateCoopMemberRet,
        userUpdateRet: userUpdateRet,
        newProfile: modifiedCoopMemberProfile,
      };

      // Respond with the retrieved profile data
      this.b.cdResp.data = finalRet;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:updateCurrentUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /////////////////////////////////////////////
  // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
  //

  async existingCoopMemberData(req, res, cuid): Promise<CoopMemberViewModel[]> {
    const si: IServiceInput = {
      serviceInstance: this,
      serviceModel: CoopMemberViewModel,
      docName: "CoopMemberService::existingUserProfile",
      dSource: 1,
      cmd: {
        action: "find",
        query: { select: ["coopMemberProfile"], where: { userId: cuid } },
      },
      // mapping: { profileField: "coopMemberProfile" },
    };
    const existinCoopMemberData: CoopMemberViewModel[] = await this.b.read(
      req,
      res,
      si
    );
    this.logger.logDebug(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData:",
      existinCoopMemberData
    );
    this.logger.logDebug(
      "CoopMemberService::existingCoopMemberData()/existinCoopMemberData.length:",
      { d: existinCoopMemberData.length }
    );
    return existinCoopMemberData;
    // return formatedExistingData = await this.extractMemberMeta(existinCoopMemberData);
  }

  async extractMemberMeta(
    existingProfileData: CoopMemberViewModel[]
  ): Promise<MemberMeta[]> {
    const uniqueMap = new Map<string, MemberMeta>();

    for (const viewModel of existingProfileData) {
      const profileList = viewModel.coopMemberProfile ?? [];

      for (const meta of profileList) {
        // Generate a unique key for comparison
        const key = `${meta.coopId}-${meta.coopRole?.id ?? "null"}`;

        // Only add if not already present
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, meta);
        }
      }
    }

    // Return array of unique MemberMeta
    return Array.from(uniqueMap.values());
  }

  // Helper method to validate profile data
  async validateProfileData(
    req,
    res,
    profileData: ICoopMembership
  ): Promise<boolean> {
    this.logger.logDebug(
      "CoopMemberService::validateProfileData()/profileData:",
      profileData
    );
    // const profileData: IUserProfile = updateData.update.userProfile
    // this.logger.logDebug("CoopMemberService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/01");
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (
      !profileData.memberProfile.fieldPermissions ||
      !profileData.memberProfile.userData
    ) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/02");
      this.logger.logDebug(
        "CoopMemberService::validateProfileData()/profileData.userData:",
        profileData.memberProfile.userData
      );
      this.logger.logDebug(
        "CoopMemberService::validateProfileData()/profileData.fieldPermissions:",
        profileData.memberProfile.fieldPermissions
      );
      return false;
    }

    // Example validation for bio length
    if (
      profileData.memberProfile.bio &&
      profileData.memberProfile.bio.length > 500
    ) {
      this.logger.logDebug("CoopMemberService::validateProfileData()/03");
      const e = "Bio data is too long";
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: "CoopMemberService:validateProfileData",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }
}
```

In your proposed CoopMemberProfileService.resolveProfiles(), you have await this.coopMemberService.getMemberMetaByUser() but this method does not exist.
The closest is CoopMemberService.extractMemberMeta().
Re examine the codes shared earlier for CoopMemberService.

definition of CoopMemberService.extractMemberMeta()

```ts
async extractMemberMeta(
    existingProfileData: CoopMemberViewModel[]
  ): Promise<MemberMeta[]> {
    const uniqueMap = new Map<string, MemberMeta>();

    for (const viewModel of existingProfileData) {
      const profileList = viewModel.coopMemberProfile ?? [];

      for (const meta of profileList) {
        // Generate a unique key for comparison
        const key = `${meta.coopId}-${meta.coopRole?.id ?? "null"}`;

        // Only add if not already present
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, meta);
        }
      }
    }

    // Return array of unique MemberMeta
    return Array.from(uniqueMap.values());
  }
```

Example of usage for CoopMemberService.extractMemberMeta():

```ts
/**
 * get collection profile data only
 */
let existingProfileData: CoopMemberViewModel[] =
  await this.existingCoopMemberData(req, res, this.uid);
this.logger.logDebug(
  "CoopMemberService::mergeUserProfile()/existingProfileData:",
  { r: JSON.stringify(existingProfileData) }
);

let existingMemberMeta: MemberMeta[] =
  await this.extractMemberMeta(existingProfileData);
```

//////////////////////////////////////////////
A given profile in a givne JSON field need speceial treatment.
This is examplified in UserService profile related methods shown below.
We need to have an equivalent for ConsumerService while bearing in mind the contextual defference between IUserProfile and IConsumerProfile.
ConsumerModel is shared here for reference.

```ts
export class UserService extends CdService {
  logger: Logging;
  cdToken: string;
  b: BaseService;
  userModel;
  mail: MailService;
  db;
  srvSess: SessionService;
  svModule: ModuleService;
  svConsumer: ConsumerService;
  requestPswd: string;
  plData: any;

  loginState = false;

  /*
   * create rules
   */
  cRules: any = {
    required: ["userName", "email", "password"],
    noDuplicate: ["userName", "email"],
  };

  //////////////////////////////////////////////////////////////////////////////////////////////////
  // STARTING USER PROFILE FEATURES
  // Public method to update user profile (e.g., avatar, bio)
  async updateUserProfile(req, res): Promise<void> {
    try {
      // note that 'ignoreCache' is set to true because old data may introduce confussion
      const svSess = new SessionService();
      const sessionDataExt: ISessionDataExt = await svSess.getSessionDataExt(
        req,
        res,
        true
      );
      this.logger.logDebug(
        "UserService::updateCurrentUserProfile()/sessionDataExt:",
        sessionDataExt
      );

      const requestQuery: IQuery = req.post.dat.f_vals[0].query;
      const jsonUpdate = req.post.dat.f_vals[0].jsonUpdate;
      let modifiedUserProfile = {} as IUserProfile;
      let strUserProfile = "{}";

      const existingUserProfile = await this.existingUserProfile(
        req,
        res,
        sessionDataExt.currentUser.userId
      );
      this.logger.logDebug(
        "UserService:updateCurrentUserProfile()/existingUserProfile:",
        existingUserProfile
      );

      if (await this.validateProfileData(req, res, existingUserProfile)) {
        /*
                - if not null and is valid data
                    - use jsonUpdate to update currentUserProfile
                        use the method modifyUserProfile(existingData: IUserProfile, jsonUpdate): string
                    - use session data to modify 'userData' in the default user profile
                    - 
                */
        this.logger.logDebug("UserService::updateUserProfile()/01");
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/jsonUpdate:",
          jsonUpdate
        );
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/existingUserProfile:",
          existingUserProfile
        );
        modifiedUserProfile = await this.modifyProfile(
          existingUserProfile,
          jsonUpdate
        );
        this.logger.logDebug(
          "UserService::updateUserProfile()/strUserProfile2:",
          modifiedUserProfile
        );
        strUserProfile = JSON.stringify(modifiedUserProfile);
      } else {
        /*
                - if null or invalid, 
                    - take the default json data defined in the UserModel, 
                    - update userData using sessionData, then 
                    - do update based on given jsonUpdate in the api request
                    - converting to string and then updating the userProfile field in the row/s defined in query.where property.
                */
        this.logger.logDebug("UserService::updateUserProfile()/021");
        const { password, userProfile, ...filteredUserData } =
          sessionDataExt.currentUser;
        userProfileDefault.userData = filteredUserData;
        this.logger.logDebug(
          "UserService::updateUserProfile()/userProfileDefault:",
          userProfileDefault
        );
        modifiedUserProfile = (await this.modifyProfile(
          userProfileDefault,
          jsonUpdate
        )) as IUserProfile;
        // the update should not contain userData
        if ("userData" in modifiedUserProfile) {
          delete modifiedUserProfile.userData;
        }

        this.logger.logDebug(
          "UserService::updateUserProfile()/modifiedUserProfile:",
          modifiedUserProfile
        );
        strUserProfile = JSON.stringify(modifiedUserProfile);
      }

      this.logger.logDebug("UserService::updateUserProfile()/03");
      requestQuery.update = { userProfile: strUserProfile };
      this.logger.logDebug(
        "UserService::updateUserProfile()/requestQuery:",
        JSON.stringify(requestQuery)
      );

      // update user profile
      const serviceInput: IServiceInput<any> = {
        serviceInstance: this,
        serviceModel: UserModel,
        docName: "UserService::updateUserProfile",
        dSource: 1,
        cmd: {
          action: "update",
          query: requestQuery,
        },
      };
      this.logger.logDebug(
        "UserService::updateUserProfile()/serviceInput:",
        serviceInput
      );
      // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
      const updateRet = await this.updateI(req, res, serviceInput);
      const newProfile: IUserProfile[] = await this.existingUserProfile(
        req,
        res,
        requestQuery.where.userId
      );
      this.logger.logDebug(
        "UserService::updateUserProfile()/newProfile1:",
        JSON.stringify(newProfile)
      );

      /**
       * No password is droped from the payload
       */
      if ("userData" in newProfile[0]) {
        if ("password" in newProfile[0].userData) {
          delete newProfile[0].userData.password;
        }
      }

      this.logger.logDebug(
        "UserService::updateUserProfile()/newProfile2:",
        JSON.stringify(newProfile)
      );
      const ret = {
        updateRet: updateRet,
        newProfile: newProfile,
      };

      // Respond with the retrieved profile data
      this.b.cdResp.data = ret;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:updateUserProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  /////////////////////////////////////////////
  // NEW USER PROFILE METHODS...USING COMMON CLASS ProfileServiceHelper
  //

  async existingUserProfile(req, res, cuid) {
    this.logger.logDebug(`UserServices::existingUserProfile())/cuid:${cuid}`);
    const si: IServiceInput<any> = {
      serviceInstance: this,
      serviceModel: UserModel,
      docName: "UserService::existingUserProfile",
      dSource: 1,
      cmd: {
        action: "find",
        query: { select: ["userProfile"], where: { userId: cuid } },
      },
      // mapping: { profileField: "userProfile" },
    };
    return this.b.read(req, res, si);
  }

  async modifyProfile(existingData, profileConfig) {
    return await ProfileServiceHelper.modifyProfile(
      existingData,
      profileConfig
    );
  }

  async getUserProfile(req, res) {
    try {
      this.logger.logDebug("UserService::getUserProfile()/01");
      const pl = this.b.getPlData(req);
      const userId = pl.userId;

      // Retrieve the user profile using an internal method
      const profile = await this.getUserProfileI(req, res, userId);
      if (profile) {
        this.logger.logDebug("UserService::getUserProfile()/02");
        this.b.i.code = "UserService::getUserProfile";
        const svSess = new SessionService();
        svSess.sessResp.cd_token = req.post.dat.token;
        svSess.sessResp.ttl = svSess.getTtl();
        await this.b.setAppState(true, this.b.i, svSess.sessResp);
        this.b.cdResp.data = profile;
        await this.b.respond(req, res);
      } else {
        this.logger.logDebug("UserService::getUserProfile()/03");
        const e = "the user provided is invalid";
        this.b.err.push(e);
        const i = {
          messages: this.b.err,
          code: "UserService:getProfile",
          app_msg: "",
        } as IRespInfo;
        this.b.serviceErr(req, res, e, i.code);
        this.b.respond(req, res);
      }
    } catch (e) {
      this.logger.logDebug("UserService::getUserProfile()/04");
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      this.b.serviceErr(req, res, e, i.code);
      this.b.respond(req, res);
    }
  }

  // Public method to get a user profile
  async getCurrentUserProfile(req, res) {
    try {
      const svSession = new SessionService();
      const session = await svSession.getSession(req, res);
      const userId = session[0].currentUserId;
      this.logger.logDebug(
        `UserServices::getCurrentUserProfile9)/userId:${userId}`
      );
      // Retrieve the user profile using an internal method
      const profile = await this.getUserProfileI(req, res, userId);

      // Respond with the retrieved profile data
      this.b.cdResp.data = profile;
      return await this.b.respond(req, res);
    } catch (e) {
      this.b.err.push(e.toString());
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  // Internal method to retrieve user profile
  async getUserProfileI(
    req,
    res,
    userId: number
  ): Promise<IUserProfile | null> {
    try {
      this.logger.logDebug("UserServices::getUserProfileI()/01");
      this.logger.logDebug("UserServices::getUserProfileI()/userId:", userId);
      // // Use BaseService to retrieve user profile
      // const result = await this.b.read(req, res, serviceInput);
      const user: UserModel[] = await this.getUserByID(req, res, userId);
      this.logger.logDebug(
        "UserServices::getUserProfileI()/user:",
        JSON.stringify(user)
      );
      this.logger.logDebug("UserServices::getUserProfileI()/02");
      if (user && user[0].userProfile) {
        this.logger.logDebug("UserServices::getUserProfileI()/03");
        delete user[0].password;
        // Create a deep copy of user[0].userProfile to avoid circular references
        let userProfileJSON: IUserProfile = cloneDeep(user[0]); // deep copy using lodash

        this.logger.logDebug("UserServices::getUserProfileI()/04");
        let userData: UserModel = cloneDeep(user[0]);
        // delete userData.userProfile;
        delete userData.password;
        userProfileJSON = cloneDeep(userData.userProfile) as IUserProfile;
        userProfileJSON.userData = cloneDeep(userData);
        delete userProfileJSON.userData.userProfile;

        this.logger.logDebug("UserServices::getUserProfileI()/06");
        return userProfileJSON; // Return the cloned userProfileJSON
      } else {
        this.logger.logDebug("UserServices::getUserProfileI()/07");
        /**
         * If the profile is null update records to default then return the default profile
         */
        // update user profile with default
        const serviceInput: IServiceInput<any> = {
          serviceInstance: this,
          serviceModel: UserModel,
          docName: "UserService::getUserProfileI",
          dSource: 1,
          cmd: {
            action: "update",
            query: {
              where: { userId: user[0].userId },
              update: { userProfile: JSON.stringify(userProfileDefault) },
            },
          },
        };
        this.logger.logDebug(
          "UserService::updateCurrentUserProfile()/serviceInput:",
          serviceInput
        );
        // const ret = await this.b.updateJSONColumn(req, res, serviceInput)
        const updateRet = await this.updateI(req, res, serviceInput);
        this.logger.logDebug(
          "UserService::getUserProfileI()/updateRet:",
          updateRet
        );
        if (updateRet.affected > 0) {
          return userProfileDefault;
        } else {
          return null;
        }
      }
    } catch (e) {
      this.logger.logDebug("UserServices::getUserProfileI()/08");
      this.b.err.push(`The user provided is invalid; ${e.toString()}`);
      const i = {
        messages: this.b.err,
        code: "UserService:getProfile",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      await this.b.respond(req, res);
    }
  }

  // Internal method to handle profile updates
  async updateUserProfileI(
    req,
    res,
    userId: string,
    newProfileData: Partial<IUserProfile>
  ) {
    try {
      // Use BaseService method to handle JSON updates for user_profile field
      const serviceInput = {
        serviceModel: this.db.user,
        cmd: {
          query: {
            where: { user_id: userId },
            update: { user_profile: newProfileData },
          },
        },
      };

      await this.b.updateJSONColumnQB(
        req,
        res,
        serviceInput,
        "user_profile",
        newProfileData
      );
      return newProfileData; // Return updated profile
    } catch (error) {
      throw new Error(`Error updating user profile: ${error.message}`);
    }
  }

  // Helper method to validate profile data
  async validateProfileData(req, res, profileData: any): Promise<boolean> {
    this.logger.logDebug(
      "UserService::validateProfileData()/profileData:",
      profileData
    );
    // const profileData: IUserProfile = updateData.update.userProfile
    // this.logger.logDebug("UserService::validateProfileData()/profileData:", profileData)
    // Check if profileData is null or undefined
    if (!profileData) {
      this.logger.logDebug("UserService::validateProfileData()/01");
      return false;
    }

    // Validate that the required fields of IUserProfile exist
    if (!profileData.fieldPermissions || !profileData.userData) {
      this.logger.logDebug("UserService::validateProfileData()/02");
      return false;
    }

    // Example validation for bio length
    if (profileData.bio && profileData.bio.length > 500) {
      this.logger.logDebug("UserService::validateProfileData()/03");
      const e = "Bio data is too long";
      this.b.err.push(e);
      const i = {
        messages: this.b.err,
        code: "UserService:validateProfileData",
        app_msg: "",
      };
      await this.b.serviceErr(req, res, e, i.code);
      return false; // Bio is too long
    }
    return true;
  }

  // Internal helper method to get a user by ID
  async getUserByIdI(uid: number): Promise<UserModel> {
    return await this.db.user.findOne({ where: { userId: uid } });
  }
}
```

```ts
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
  consumerData: ConsumerModel; // base object like userData in IUserProfile

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

  /**
   * minimal consumer data placeholder
   */
  consumerData: {
    consumerName: "",
    companyId: null,
    consumerEnabled: true,
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

//////////////////////////////////////////////////
The new changes in ProfileServiceHelper was to introduce strategic improvements but breaking changes was to be avoided.
Several resources from arlier codes are looking for some core facility in the ProfileServiceHelper:
ProfileServiceHelper.modifyProfile(
existingData,
profileConfig
)
How do we tackle this?
Below is the earlier ProfileServiceHelper.

```ts
/**
 * Future development must remove any coop related items in this class.
 * The class should be general.
 * All coop items must be isolated in coops directory
 * This util directory where this file resides should contain system related and shared utilities
 *
 * modifyProfile() should have access policy
 *  - self can modify active coopId
 *  - self can only modify self if request coopRole is equal or higher that the coopRole to modify and
 *    the target must fall withing the same jurisdiction
 *  - implement expiring roles
 */

import {
  ICoopRole,
  MemberMeta,
} from "../../app/coops/models/coop-member.model";
import { IQuery, IServiceInput } from "../base/i-base";
import { Logging } from "../base/winston.log";
import { JMorph, JUpdateInstruction } from "./j-morph";
import { safeStringify } from "./safe-stringify";

export class ProfileServiceHelper {
  static logger: Logging = new Logging();

  /**
   * Fetches the profile and removes sensitive fields.
   */
  static async fetchProfile(req, res, si: IServiceInput<any>) {
    // const profileData = await service.getProfile(req, res, { where: { id: userIdOrMemberId } });
    const profileData = await si.serviceInstance.getI(req, res, si.cmd.query);
    if (profileData.length > 0) {
      // Remove sensitive data
      // const res = profileData.map(({ password, ...data }) => data)[0];
      // this.logger.logDebug("ProfileServiceHelper::fetchProfile/res[si.mapping.profileField]:", res[si.mapping.profileField])
      // return res[si.mapping.profileField]
      return res;
    }
    return null;
  }

  /**
   * Modifies the profile based on the provided configuration.
   */

  /**
     * 
     * Example of profileConfig
     * const profileConfig = [
            {
                path: ["memberMeta", "acl", "coopRole"],
                value: {
                    coopId: 1,
                    coopRole: [
                        { scope: CoopsAclScope.COOPS_MEMBER, geoLocationId: 101 }
                    ]
                },
                action: "create" // Could also be "update", "delete", "read"
            },
            {
                path: ["memberMeta", "acl", "coopRole"],
                value: {
                    coopId: 2,
                    coopRole: [
                        { scope: CoopsAclScope.COOPS_ADMIN, geoLocationId: 202 }
                    ]
                },
                action: "update"
            }
        ];

        ---------------------------------------------------------
        Usage:
        const updatedProfile = ProfileServiceHelper.modifyProfile(existingData, profileConfig);


     * @param existingData 
     * @param profileDefaultConfig 
     * @param permissionTypes 
     * @returns 
     */
  static async modifyProfile(existingData: any, profileConfig: any[]) {
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/01");
    let updatedProfile = { ...existingData };
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/02");
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/existingData:",
      existingData
    );
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/profileConfig:",
      profileConfig
    );
    for (const update of profileConfig) {
      const { path, value, action } = update;
      const [firstKey, ...remainingPath] = path;
      this.logger.logDebug("ProfileServiceHelper::modifyProfile()/03");
      // Route based on the action specified in profileConfig
      if (
        firstKey === "memberMeta" &&
        remainingPath[0] === "acl" &&
        remainingPath[1] === "coopRole"
      ) {
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/04");
        switch (action) {
          case "create":
            updatedProfile = await this.createCoopRole(
              updatedProfile,
              remainingPath,
              value
            );
            // this.logger.logDebug("ProfileServiceHelper::modifyProfile()/updatedProfile1:", JSON.stringify(updatedProfile))
            break;
          case "update":
            updatedProfile = await this.updateCoopRole(
              updatedProfile,
              remainingPath,
              value
            );
            break;
          case "delete":
            updatedProfile = await this.deleteCoopRole(
              updatedProfile,
              remainingPath,
              value.coopId
            );
            break;
          case "read":
            await this.readCoopRole(
              updatedProfile,
              remainingPath,
              value.coopId
            );
            break;
          default:
            console.warn(`Unsupported action: ${action}`);
        }
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/05");
      } else {
        this.logger.logDebug("ProfileServiceHelper::modifyProfile()/06");
        const jsonUpdate: JUpdateInstruction[] = [
          {
            path: path,
            value: value,
            action: action,
          },
        ];
        // this.applyJsonUpdate(updatedProfile, path, value);
        updatedProfile = JMorph.applyUpdates(updatedProfile, jsonUpdate);
        this.logger.logDebug(
          "ProfileServiceHelper::modifyProfile()/updatedProfile:",
          JSON.stringify(await updatedProfile)
        );
      }
    }
    this.logger.logDebug("ProfileServiceHelper::modifyProfile()/07");
    this.logger.logDebug(
      "ProfileServiceHelper::modifyProfile()/updatedProfile2:",
      JSON.stringify(await updatedProfile)
    );
    /**
     * Sync updated data with memberData which is still in the state it was retrieved from db.
     */
    updatedProfile = this.syncCoopMemberProfiles(updatedProfile);

    return await updatedProfile;
  }

  /**
   * Updates permissions based on the type and ID key.
   */
  static updatePermissions(
    profile: any,
    newValue: any,
    permissionType: "userPermissions" | "groupPermissions",
    idKey: string
  ) {
    const permissionList = profile.fieldPermissions[permissionType];
    const existingIndex = permissionList.findIndex(
      (permission) =>
        permission[idKey] === newValue[idKey] &&
        permission.field === newValue.field
    );

    if (existingIndex > -1) {
      permissionList[existingIndex] = newValue;
    } else {
      permissionList.push(newValue);
    }

    return profile;
  }

  /**
   * Applies a JSON update based on a path.
   */
  static applyJsonUpdate(
    profile: any,
    path: (string | number | string[])[],
    value: any
  ) {
    this.logger.logDebug("ProfileServiceHelper::applyJsonUpdate()/01");
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/profile:",
      JSON.stringify(profile)
    );
    this.logger.logDebug("ProfileServiceHelper::applyJsonUpdate()/path:", path);
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/value:",
      value
    );
    let current = profile;

    for (let i = 0; i < path.length - 1; i++) {
      let key = path[i];
      if (Array.isArray(key)) {
        key = key.join(".");
      }

      if (!current[key]) {
        current[key] = typeof path[i + 1] === "number" ? [] : {};
      }

      current = current[key];
    }

    let finalKey = path[path.length - 1];
    if (Array.isArray(finalKey)) {
      finalKey = finalKey.join(".");
    }

    current[finalKey] = value;
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/current:",
      JSON.stringify(current)
    );
    this.logger.logDebug(
      "ProfileServiceHelper::applyJsonUpdate()/current[finalKey]:",
      current[finalKey]
    );
  }

  static async createCoopRole(
    profile: any,
    path: (string | number | string[])[],
    newValue: MemberMeta
  ) {
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/profile:",
      profile
    );
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/newValue:",
      newValue
    );
    const aclList: MemberMeta[] = profile.memberMeta.acl;

    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/aclList:",
      aclList
    );

    // Validate and clean aclList
    for (let i = aclList.length - 1; i >= 0; i--) {
      if (!this.validateAclItem(aclList[i])) {
        console.warn(`Removing non-compliant item at index ${i}:`, aclList[i]);
        aclList.splice(i, 1); // Remove non-compliant item
      }
    }

    // Remove existing role for the same coopId to avoid duplication
    const existingIndex = aclList.findIndex(
      (acl) => acl.coopId === newValue.coopId
    );
    if (existingIndex !== -1) {
      aclList.splice(existingIndex, 1);
    }

    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/newValue.coopRole:",
      newValue.coopRole
    );

    // Add the new role
    aclList.push({
      coopId: newValue.coopId,
      coopActive: true,
      coopRole: newValue.coopRole,
    });

    profile.memberMeta.acl = aclList;
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/aclList2:",
      aclList
    );
    this.logger.logDebug(
      "ProfileServiceHelper::createCoopRole()/profile:",
      JSON.stringify(await profile)
    );

    return await profile;
  }

  static updateCoopRole(
    profile: any,
    path: (string | number | string[])[],
    newValue: any
  ) {
    const aclList = profile.memberMeta.acl;
    const targetAcl = aclList.find(
      (acl: any) => acl.coopId === newValue.coopId
    );

    if (targetAcl) {
      targetAcl.coopRole = newValue.coopRole;
    } else {
      console.warn(
        `No existing coopRole found with coopId ${newValue.coopId} to update.`
      );
    }

    return profile;
  }

  static deleteCoopRole(
    profile: any,
    path: (string | number | string[])[],
    coopId: number
  ) {
    const aclList = profile.memberMeta.acl;
    const index = aclList.findIndex((acl: any) => acl.coopId === coopId);

    if (index !== -1) {
      aclList.splice(index, 1);
    } else {
      console.warn(
        `No existing coopRole found with coopId ${coopId} to delete.`
      );
    }

    return profile;
  }

  static readCoopRole(
    profile: any,
    path: (string | number | string[])[],
    coopId: number
  ) {
    const aclList = profile.memberMeta.acl;
    const targetAcl = aclList.find((acl: any) => acl.coopId === coopId);

    if (targetAcl) {
      this.logger.logDebug(
        `Read coopRole for coopId ${coopId}:`,
        targetAcl.coopRole
      );
      // Optionally, return the coopRole or perform further operations
      return targetAcl.coopRole;
    } else {
      console.warn(`No coopRole found for coopId ${coopId}`);
    }
  }

  static validateAclItem(item: any): boolean {
    const isValidCoopId =
      typeof item.coopId === "number" || item.coopId === null;
    const isValidCoopActive = typeof item.coopActive === "boolean";
    const isValidCoopRole =
      typeof item.coopRole === "object" && item.coopRole !== null; // Assuming ICoopRole is an object
    const isValidAclRole =
      item.aclRole === undefined ||
      (typeof item.aclRole === "object" && item.aclRole !== null); // Optional property
    const isValidCoopMemberData =
      item.coopMemberData === undefined || Array.isArray(item.coopMemberData); // Optional property

    return (
      isValidCoopId &&
      isValidCoopActive &&
      isValidCoopRole &&
      isValidAclRole &&
      isValidCoopMemberData
    );
  }

  static syncCoopMemberProfiles(modifiedProfile: any) {
    this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/01");
    this.logger.logDebug(
      "ProfileServiceHelper::syncCoopMemberProfiles()/modifiedProfile:",
      modifiedProfile
    );
    if ("memberMeta" in modifiedProfile) {
      // Extract the modified acl from memberMeta
      const updatedAcl = modifiedProfile.memberMeta.acl;
      this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/02");
      // Go through each memberData item and replace its coopMemberProfile with updatedAcl
      modifiedProfile.memberMeta.memberData.forEach((member: any) => {
        this.logger.logDebug(
          "ProfileServiceHelper::syncCoopMemberProfiles()/03"
        );
        member.coopMemberProfile = [...updatedAcl]; // Spread operator to create a copy of updatedAcl
      });
    }
    this.logger.logDebug("ProfileServiceHelper::syncCoopMemberProfiles()/04");
    return modifiedProfile;
  }
}
```

///////////////////////////////////////////////

In the Main.run(), step 4, we have:

```ts
const themeConfig = await this.svTheme.loadThemeConfig();
```

On success, themeConfig contains data including consumerGuid.
It is therefore possible to perform login via anon user.
This should return consumer configurations that can be used to render ui as per the consumer.
Where user are allowed to set theme items, this will be effected when they successfully login and load their profile.
We first want to deal with loading consumer setting during anon login (default page load)
So we need to call UserService.login().
We then make use of the response to fill up the ui-system and theme setting from the consumer settings.
Initially we just focus on successfull login and ability to read response.
Then we check if we are able to access the consumer ui-systm and theme setting.
When this is successful, we will demo loging in when consumerGuid is switched, and test various settings to show tenancy independence.

themeConfig data:

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "material-design",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/assets/ui-systems/"
  },
  "splash": {
    "enabled": true,
    "path": "/splashscreens/corpdesk-default.html",
    "minDuration": 3400
  },
  "envConfig": {
    "appId": "",
    "production": true,
    "apiEndpoint": "https://localhost:3001/api",
    "sioEndpoint": "https://localhost:3002",
    "wsEndpoint": "wss://localhost:3000",
    "wsMode": "sio",
    "pushConfig": {
      "sio": {
        "enabled": true
      },
      "wss": {
        "enabled": false
      },
      "pusher": {
        "enabled": false,
        "apiKey": "",
        "options": {
          "cluster": "",
          "forceTLS": true
        }
      }
    },
    "clientAppGuid": "ca0fe39f-92b2-484d-91ef-487d4fc462a2",
    "clientContext": {
      "entity": "ASDAP",
      "clientAppId": 2,
      "consumerToken": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
    },
    "USER_RESOURCES": "https://assets.corpdesk.com/user-resources",
    "apiHost": "https://localhost",
    "sioHost": "https://localhost",
    "shellHost": "https://localhost",
    "consumer": "ACME_CORP",
    "clientAppId": 2,
    "SOCKET_IO_PORT": 3002,
    "defaultauth": "cd-auth",
    "initialPage": "dashboard",
    "mfManifestPath": "/assets/mf.manifest.json",
    "apiOptions": {
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "sioOptions": {
      "path": "/socket.io",
      "transports": ["websocket", "polling"],
      "secure": true
    },
    "logLevel": "debug"
  }
}
```

```ts
export class UserService {
  private http = new HttpService();
  private logger = new LoggerService();
  private cdToken = "";
  private svConfig: ConfigService;
  private cache: SysCacheService;

  constructor() {
    this.svConfig = new ConfigService();
    this.cache = new SysCacheService(this.svConfig);
  }

  // ---------------------------------------------
  // Token handling (mirrors ModuleRegisterService)
  // ---------------------------------------------
  setCdToken(token: string): this {
    this.cdToken = token;
    EnvUserLogin.dat.token = token;
    EnvUserProfile.dat.token = token;
    return this;
  }

  // ---------------------------------------------
  // Login
  // ---------------------------------------------
  async login(user: UserModel): Promise<ICdResponse> {
    const consumerGuid = this.cache.getConsumerGuid();
    if (!consumerGuid) {
      throw new Error("consumerGuid missing in SysCacheService");
    }

    EnvUserLogin.dat.f_vals[0].data = {
      userName: user.userName,
      password: user.password,
      consumerGuid,
    };

    this.logger.debug(
      "[UserService] EnvUserLogin",
      inspect(EnvUserLogin, { depth: 4 })
    );

    const fx = await this.http.proc(EnvUserLogin, "cdApiLocal");

    if (!fx.state || !fx.data) {
      throw new Error(`Login request failed: ${fx.message}`);
    }

    const resp = fx.data;

    if (resp.app_state?.sess?.cd_token) {
      this.setCdToken(resp.app_state.sess.cd_token);
    }

    return resp;
  }
}
```

json anon login request

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
          "userName": "anon",
          "password": "-",
          "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
        }
      }
    ],
    "token": null
  },
  "args": null
}
```

```ts
export class Main {
  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    await this.showSplash(); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load shell config
    //---------------------------------------
    const shellConfig: IShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }

          if (item.children) item.children = recursive(item.children);
          return item;
        });

      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );
      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);
      applyMobileState();
    }

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.appReady = true;
    this.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }
}
```

//////////////////////////////////////
I was thinking currently, the ui-system and themes data that is controlling the rendering is coming from Main.loadShellConfig().
We need to use the same method and its output should still be the one to provide the data.
It is just its datasource policy that has changed to be more dynamic.
We can refactor Main.loadShellConfig() to take in the argument of IConsumerProfile and IUserProfile.
Note that its only current source is the shell.config.joson.
The method can then implement the resolution based on existing policy.

```ts
async loadShellConfig(): Promise<IShellConfig> {
    const res = await fetch("/shell.config.json");
    if (!res.ok) {
      throw new Error(`Failed to load shell config: ${res.statusText}`);
    }
    return await res.json();
  }
```

////////////////////////////////////////
Thanks for the effort. Attend to the following issues:

1. What was:
   async applyStartupUiSettings(): Promise<void>
   is now:
   private async applyStartupUiSettings(shellConfig: IShellConfig) {
   await this.svUiSystemLoader.applyUiSystem(shellConfig.uiConfig);
   await this.svUiThemeLoader.applyTheme(shellConfig.uiConfig);
   }
   But the two proposed methods have not been implemented.
   Can you work on that.

2. The Main.mergeShellConfigWithPolicy(), we have the line:
   const policies = consumerShell.enforcedPolicies || {};
   But Property 'enforcedPolicies' does not exist on type 'IConsumerShellConfig'

```ts
export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Consumer may lock or restrict UI options for all users.
   * These form the base policy.
   */
  lockDown?: {
    /** Prevent users from changing their UI system */
    uiSystem?: boolean;

    /** Prevent users from changing their theme */
    theme?: boolean;

    /** Prevent users from changing form variant */
    formVariant?: boolean;
  };

  /**
   * Consumer-level options for UI system and theme allowances.
   */
  allowedOptions?: {
    uiSystems?: string[]; // which UI-systems users may pick from
    themes?: string[]; // which themes users may pick from
    formVariants?: string[]; // (e.g., standard | outline | filled)
  };
}
```

///////////////////////////////////////////////////
Having looked at what you have done so far, it is now ok to see beyond Main as you resolve the outstanding issues.
Take a look at UiSystemLoaderService and UiThemeLoaderService and see how to use them to resolve the following:

1. Confirm if the proposed call to UiSystemLoaderService.applyUiSystem() can be replaced by UiSystemLoaderService.activate() or if there is any already existing substitute in the UiSystemLoaderService.
2. Confirm if the proposed call to UiThemeLoaderService.applyTheme() can be substituted by UiThemeLoaderService.loadThemeById() or UiSystemLoaderService.applyTheme()

```ts
export class UiSystemLoaderService {
  private static instance: UiSystemLoaderService | null = null;
  private activeSystem: UiSystemDescriptor | null = null;
  private sysCache!: SysCacheService;

  constructor(sysCache: SysCacheService) {
    this.sysCache = sysCache;
  }

  public static getInstance(sysCache?: SysCacheService): UiSystemLoaderService {
    if (!UiSystemLoaderService.instance) {
      if (!sysCache)
        throw new Error(
          "UiSystemLoaderService.getInstance requires SysCacheService on first call."
        );
      UiSystemLoaderService.instance = new UiSystemLoaderService(sysCache);
    }
    return UiSystemLoaderService.instance;
  }

  async fetchAvailableSystems(
    uiConfig: UiConfig
  ): Promise<UiSystemDescriptor[]> {
    const baseFolder =
      uiConfig.uiSystemBasePath || "/public/assets/ui-systems/";

    const systemIds = UiSystemAdapterRegistry.list();
    console.log("[UiSystemLoaderService] Registered UI Systems:", systemIds);

    const descriptors: UiSystemDescriptor[] = [];

    for (const id of systemIds) {
      const descriptorUrl = `${baseFolder}${id}/descriptor.json`;

      try {
        console.log(
          `[UiSystemLoaderService] Loading descriptor: ${descriptorUrl}`
        );

        const res = await fetch(descriptorUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        // Build absolute path prefix
        const prefix = `${baseFolder}${id}/`;

        descriptors.push({
          ...json,

          // ensure id (in case descriptor uses a different internal id)
          id,

          // Expand asset URLs
          cssUrl: json.cssUrl ? prefix + json.cssUrl : undefined,
          jsUrl: json.jsUrl ? prefix + json.jsUrl : undefined,

          stylesheets: (json.stylesheets || []).map(
            (file: string) => prefix + file
          ),

          scripts: (json.scripts || []).map((file: string) => prefix + file),

          // keep themes as-is, they already define absolute paths typically
          themesAvailable: json.themesAvailable || [],
          themeActive: json.themeActive || null,

          conceptMappings: json.conceptMappings || {},
          directiveMap: json.directiveMap || {},
        });
      } catch (err) {
        console.warn(
          `[UiSystemLoaderService] Failed to load ${descriptorUrl}`,
          err
        );

        // fallback minimal descriptor (bootstrap-538 had wrong mappings before)
        const prefix = `${baseFolder}${id}/`;

        descriptors.push({
          id,
          name: id,
          version: "unknown",

          cssUrl: `${prefix}${id}.min.css`,
          jsUrl: `${prefix}${id}.min.js`,

          stylesheets: [],
          scripts: [],
          conceptMappings: {},
          themesAvailable: [],
          themeActive: null,
        });
      }
    }

    return descriptors;
  }

  list(): UiSystemDescriptor[] {
    return this.sysCache.get("uiSystems") || [];
  }

  getSystemById(id: string): UiSystemDescriptor | undefined {
    const available = this.sysCache.get("uiSystems") || [];
    return available.find((s: any) => s.id === id);
  }

  public async activate(id: string): Promise<void> {
    diag_css("[UiSystemLoaderService.activate] START", { id });

    await this.sysCache.ensureReady();

    if (!id) {
      const auto = (this as any).detectUiSystem?.();
      if (auto?.id) id = auto.id;
    }

    // 🔥 FIXED: USE FULL DESCRIPTOR
    const descriptorFromCache = this.getFullDescriptor(id);

    console.log(
      "[UiSystemLoaderService.activate] descriptorFromCache:",
      descriptorFromCache
    );

    const fallbackDescriptor: any = {
      id,
      cssUrl: `/assets/ui-systems/${id}/${id}.min.css`,
      jsUrl: `/assets/ui-systems/${id}/${id}.min.js`,
      assetPath: `/assets/ui-systems/${id}`,
      stylesheets: [],
      scripts: [],
      conceptMappings: {}, // included for safety
      directiveMap: {},
      metadata: {},
      extensions: {},
    };

    const descriptor = descriptorFromCache || fallbackDescriptor;
    this.activeSystem = descriptor;

    // Expose runtime descriptor (adapters/services read this)
    try {
      (window as any).CdActiveUiDescriptor = descriptor;
      (window as any).CD_ACTIVE_UISYSTEM = id;
      (window as any).CdShellActiveUiSystem = id;
    } catch (err) {
      console.warn(
        "[UiSystemLoaderService.activate] Could not set global descriptor",
        err
      );
    }

    // 3) Remove previous ui-system assets
    document
      .querySelectorAll("link[data-cd-uisystem], script[data-cd-uisystem]")
      .forEach((el) => el.remove());
    diag_css("[UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS", {});

    // 4) Resolve paths
    const cssPath =
      descriptor.cssUrl ||
      `${descriptor.assetPath || `/assets/ui-systems/${id}`}/bootstrap.min.css`;
    const jsPath =
      descriptor.jsUrl ||
      `${descriptor.assetPath || `/assets/ui-systems/${id}`}/${id}.min.js`;
    const bridgeCssPath = `${descriptor.assetPath || `/assets/ui-systems/${id}`}/bridge.css`;

    diag_css("[UiSystemLoaderService.activate] RESOLVED PATHS", {
      cssPath,
      jsPath,
      bridgeCssPath,
    });

    // 5) Load main CSS
    try {
      await this.loadCSS(cssPath, id);
      diag_css("[UiSystemLoaderService.activate] CSS LOADED", { cssPath });
    } catch (err) {
      diag_css("[UiSystemLoaderService.activate] CSS LOAD FAILED", {
        cssPath,
        err,
      });
    }

    // 6) Load optional bridge.css (non-fatal)
    try {
      await this.loadCSS(bridgeCssPath, `${id}-bridge`);
      diag_css("[UiSystemLoaderService.activate] BRIDGE CSS LOADED", {
        bridgeCssPath,
      });
    } catch (err) {
      console.log(
        `[UiSystemLoaderService.activate] bridge.css not found for ${id} (optional)`
      );
      diag_css("[UiSystemLoaderService.activate] BRIDGE CSS LOAD FAILED", {
        bridgeCssPath,
        err,
      });
    }

    // 7) Load system JS (optional)
    try {
      await this.loadScript(jsPath, id);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOADED", { jsPath });
    } catch (err) {
      console.warn("[UiSystemLoaderService.activate] script load failed", err);
      diag_css("[UiSystemLoaderService.activate] SCRIPT LOAD FAILED", {
        jsPath,
        err,
      });
    }

    // 8) Tell the in-app adapter (registered via UiSystemAdapterRegistry) to activate
    try {
      // UiSystemAdapterRegistry should expose a `get(id)` (or similar) that returns a registered adapter instance
      const { UiSystemAdapterRegistry } = await import(
        "./ui-system-registry.service"
      );
      const adapter = UiSystemAdapterRegistry.get(id);

      if (adapter && typeof adapter.activate === "function") {
        await adapter.activate(descriptor);
        diag_css("[UiSystemLoaderService.activate] ADAPTER ACTIVATED", { id });
      } else {
        console.log(
          `[UiSystemLoaderService.activate] No in-app adapter registered for ${id} (skipping)`
        );
      }
    } catch (err) {
      console.warn(
        "[UiSystemLoaderService.activate] adapter activation failed",
        err
      );
    }

    // 9) Done
    diag_css("[UiSystemLoaderService.activate] COMPLETE", { activeSystem: id });
  }

  /**
   * applyTheme(systemId, themeId)
   * - find adapter for systemId, fetch theme descriptor via SysCacheService / UiThemeLoaderService
   * - call adapter.applyTheme(themeDescriptor)
   */
  public async applyTheme(systemId: string, themeId: string): Promise<void> {
    diag_css("[UiSystemLoaderService.applyTheme] start", { systemId, themeId });
    // const adapter = UiSystemAdapterFactory.getAdapter(systemId);
    const adapter = UiSystemAdapterRegistry.get(systemId);
    console.log(
      "[UiSystemLoaderService.applyTheme] adapter received:",
      adapter
    );
    if (!adapter) {
      console.warn(
        "[UiSystemLoaderService.applyTheme] no adapter for",
        systemId
      );
      return;
    }

    // get theme descriptor from cache
    const descriptors = this.sysCache.get("themeDescriptors") || [];
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      descriptors
    );
    const themeDescriptor = descriptors.find((d: any) => d.id === themeId);
    console.log(
      "[UiSystemLoaderService][applyTheme] descriptors:",
      themeDescriptor
    );

    // supply descriptor if found, else just themeId
    await adapter.applyTheme(themeDescriptor || themeId);
    diag_css("[UiSystemLoaderService.applyTheme] done", { systemId, themeId });
  }

  public async loadCSS(path: string, id: string): Promise<string> {
    diag_css("[UiSystemLoaderService.loadCSS] REQUEST", { path, id });

    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;
        link.setAttribute("data-cd-uisystem", id);
        link.setAttribute("data-cd-origin", "ui-system");

        link.onload = () => {
          const resolved = (link as HTMLLinkElement).href;
          diag_css("[UiSystemLoaderService.loadCSS] LOADED", {
            path,
            id,
            resolved,
            order: Array.from(head.querySelectorAll("link")).map(
              (l) => (l as HTMLLinkElement).href
            ),
          });
          resolve(resolved);
        };

        link.onerror = (ev) => {
          diag_css("[UiSystemLoaderService.loadCSS] ERROR", { path, id, ev });
          reject(new Error(`Failed to load CSS: ${path}`));
        };

        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        diag_css("[UiSystemLoaderService.loadCSS] EXCEPTION", {
          path,
          id,
          err,
        });
        reject(err);
      }
    });
  }

  public async loadScript(path: string, id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const script = document.createElement("script");
        script.src = path;
        script.async = true;
        script.setAttribute("data-cd-uisystem", id);
        script.setAttribute("data-cd-origin", "ui-system");
        script.onload = () => resolve();
        script.onerror = (ev) => reject(ev);

        const body = document.body || document.getElementsByTagName("body")[0];
        if (!body) return reject(new Error("document.body missing"));
        body.appendChild(script);
      } catch (err) {
        reject(err);
      }
    });
  }

  getActive(): UiSystemDescriptor | null {
    console.log(`[UiSystemLoaderService][getActive] start.`);
    return this.activeSystem;
  }

  private detectFromRuntime(): string | null {
    return window.CdShellActiveUiSystem || window.CD_ACTIVE_UISYSTEM || null;
  }

  private detectFromMeta(): string | null {
    const meta = document.querySelector(
      'meta[name="cd-uiform"]'
    ) as HTMLMetaElement | null;

    return meta?.content || null;
  }

  public detectUiSystem(): UiSystemDescriptor {
    const runtimeId = this.detectFromRuntime();
    if (runtimeId) {
      return { ...DEFAULT_SYSTEM, id: runtimeId };
    }

    const metaId = this.detectFromMeta();
    if (metaId) {
      return { ...DEFAULT_SYSTEM, id: metaId };
    }

    return DEFAULT_SYSTEM;
  }

  private getFullDescriptor(id: string): UiSystemDescriptor | undefined {
    const list = this.sysCache.get("uiSystemDescriptors") || [];
    return list.find((d: any) => d.id === id);
  }
}
```

```ts
export class UiThemeLoaderService {
  private static readonly ACTIVE_THEME_KEY = "cd-active-theme-id";
  private static readonly ACTIVE_FORM_VARIANT_KEY = "cd-active-form-variant";
  private static instance: UiThemeLoaderService | null = null;
  private configService = ConfigService.getInstance();
  private sysCache!: SysCacheService;

  constructor(sysCache: SysCacheService) {
    this.sysCache = sysCache;
  }

  public static getInstance(sysCache?: SysCacheService): UiThemeLoaderService {
    if (!UiThemeLoaderService.instance) {
      if (!sysCache)
        throw new Error(
          "UiThemeLoaderService.getInstance requires SysCacheService on first call."
        );
      UiThemeLoaderService.instance = new UiThemeLoaderService(sysCache);
    }
    return UiThemeLoaderService.instance;
  }

  /**
   * Fetch available themes:
   * - Read uiConfig.accessibleThemes or infer
   * - For each theme id, fetch /themes/<id>/theme.json (descriptor)
   * - Return shape: { themes: [{id,name}], variants: [...], descriptors: [full objects], uiConfig }
   */
  public async fetchAvailableThemes(uiConfig: UiConfig): Promise<any> {
    console.log("[UiThemeLoaderService][fetchAvailableThemes] start", uiConfig);

    const accessible = (uiConfig && uiConfig.accessibleThemes) ||
      (this.configService as any).config?.themeConfig?.accessibleThemes || [
        "default",
        "dark",
      ];
    const descriptors: any[] = [];

    for (const id of accessible) {
      const path = `/themes/${id}/theme.json`;
      try {
        const res = await fetch(path);
        if (!res.ok) {
          console.warn(
            `[UiThemeLoaderService] theme descriptor not found: ${path}`
          );
          continue;
        }
        const desc = await res.json();
        descriptors.push(desc);
      } catch (err) {
        console.warn(
          `[UiThemeLoaderService] error fetching theme descriptor ${path}`,
          err
        );
      }
    }

    // produce lightweight lists
    const themes = descriptors.map((d) => ({ id: d.id, name: d.name }));
    const variants = [
      { id: "standard", name: "Standard" },
      { id: "compact", name: "Compact" },
      { id: "floating", name: "Floating" },
    ];

    return {
      themes,
      variants,
      descriptors,
      uiConfig,
    };
  }

  /**
   * loadThemeById - injects ONLY the theme override CSS (theme.css)
   * base + index should be loaded by Main (or UiSystemLoader) earlier
   */
  public async loadThemeById(themeId: string): Promise<void> {
    diag_css("[UiThemeLoaderService.loadThemeById] start", { themeId });
    // remove previous theme links (data-cd-theme)
    document.querySelectorAll("link[data-cd-theme]").forEach((l) => l.remove());

    const desc = this.getThemeDescriptor(themeId);
    if (!desc) {
      diag_css("[UiThemeLoaderService.loadThemeById] descriptor not found", {
        themeId,
      });
      // still try fallback path
      const fallback = `/themes/${themeId}/theme.css`;
      await this.injectStyle(fallback, themeId, "theme");
      return;
    }

    // prefer descriptor.css or descriptor.css path
    const cssPath = desc.css || desc.cssPath || `/themes/${themeId}/theme.css`;
    await this.injectStyle(cssPath, themeId, "theme");

    diag_css("[UiThemeLoaderService.loadThemeById] loaded", {
      themeId,
      cssPath,
    });
  }

  /**
   * Return full descriptor previously cached in SysCacheService
   */
  public getThemeDescriptor(themeId: string): any | undefined {
    const descriptors = this.sysCache.get("themeDescriptors") || [];
    return descriptors.find((d: any) => d.id === themeId);
  }

  public async loadFormVariant(formType = "standard"): Promise<void> {
    document
      .querySelectorAll("link[data-cd-form]")
      .forEach((el) => el.remove());
    const path = `/themes/common/forms/variants/cd-form-${formType}.css`;
    await this.injectStyle(path, formType, "form");
  }

  private async injectStyle(
    path: string,
    key: string,
    type: "theme" | "form" = "theme"
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return reject(new Error("document.head missing"));

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = path;

        if (type === "theme") link.setAttribute("data-cd-theme", key);
        else link.setAttribute("data-cd-form", key);

        link.onload = () => resolve();
        link.onerror = (ev) => reject(new Error(`failed to load ${path}`));

        // preserve order: append to head end
        head.insertAdjacentElement("beforeend", link);
      } catch (err) {
        reject(err);
      }
    });
  }

  getActiveThemeId(): string {
    console.log(`[UiThemeLoaderService][getActiveThemeId] start.`);
    return localStorage.getItem(UiThemeLoaderService.ACTIVE_THEME_KEY) || "";
  }

  getActiveFormVariantId(): string {
    return (
      localStorage.getItem(UiThemeLoaderService.ACTIVE_FORM_VARIANT_KEY) ||
      "standard"
    );
  }
}
```

/////////////////////////////////////////////////

In the 2nd input for mergeShellConfig, we have consumerProfile?.shellConfig.
At this point we are have the error:
Type 'IConsumerShellConfig' has no properties in common with type 'Partial<IUserShellConfig>'.ts(2559)
(property) IConsumerProfile.shellConfig?: IConsumerShellConfig
Consumer-level shell config (base for all users)

```ts
export class Main {
  async loadShellConfig(
    consumerProfile?: IConsumerProfile,
    userProfile?: IUserProfile
  ): Promise<IUserShellConfig> {
    const baseConfig = await this.loadStaticShellConfig();

    const withConsumer = this.mergeShellConfig(
      baseConfig,
      consumerProfile?.shellConfig
    );

    const finalConfig = this.mergeShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return finalConfig;
  }

  private mergeShellConfig(
    base: IUserShellConfig,
    override?: Partial<IUserShellConfig>
  ): IUserShellConfig {
    if (!override) return base;

    return {
      ...base,
      ...override,
      uiConfig: {
        ...base.uiConfig,
        ...override.uiConfig,
      },
      themeConfig: {
        ...base.themeConfig,
        ...override.themeConfig,
      },
    };
  }
}
```

```ts
export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Consumer may lock or restrict UI options for all users.
   * These form the base policy.
   */
  lockDown?: {
    /** Prevent users from changing their UI system */
    uiSystem?: boolean;

    /** Prevent users from changing their theme */
    theme?: boolean;

    /** Prevent users from changing form variant */
    formVariant?: boolean;
  };

  /**
   * Consumer-level options for UI system and theme allowances.
   */
  allowedOptions?: {
    uiSystems?: string[]; // which UI-systems users may pick from
    themes?: string[]; // which themes users may pick from
    formVariants?: string[]; // (e.g., standard | outline | filled)
  };
}

export interface IConsumerProfile {
  /** Basic company/tenant information */
  consumerData: ConsumerModel;

  /** Optional business descriptions, tags, extra metadata */
  bio?: string;
  missionStatement?: string;
  tags?: string[];
  industries?: string[];
  preferences?: Record<string, any>;

  /** Consumer-level shell config (base for all users) */
  shellConfig?: IConsumerShellConfig;

  /**
   * Consumer-wide access control
   * Future-proofed for menu permissions, module access, etc.
   */
  permissions?: {
    moduleAccess?: string[]; // e.g., ["hr", "finance", "assets"]
    featureFlags?: string[];
  };
}
```

/////////////////////////////////////////////////
launch process is encountering some issue.
Below is the log.
You can advise we need more log points to identify the issue.

```log
[UiSystemAdapterRegistry] register: bootstrap-502
Object {  }
index-Cy6wDeOF.js:48:11525
[Bootstrap538AdapterService] constructor() index-Cy6wDeOF.js:48:12642
[UiSystemAdapterRegistry] register: bootstrap-538
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-Cy6wDeOF.js:48:11525
[MaterialDesignAdapter] constructor() index-Cy6wDeOF.js:48:16931
[UiSystemAdapterRegistry] register: material-design
Object { descriptor: null, observer: null, appliedSet: WeakSet [], mdcInitQueued: false, mdcInstances: Set [] }
index-Cy6wDeOF.js:48:11525
[UiSystemAdapterRegistry] register: plain
Object {  }
index-Cy6wDeOF.js:48:11525
[Bootstrap538AdapterService] constructor() index-Cy6wDeOF.js:48:12642
[MaterialDesignAdapter] constructor() index-Cy6wDeOF.js:48:16931
Uncaught kd: Column type for Me#userGuid is not defined and cannot be guessed. Make sure you have turned on an "emitDecoratorMetadata": true option in tsconfig.json. Also make sure you have imported "reflect-metadata" on top of the main entry file in your application (before any entity imported).If you are using JavaScript instead of TypeScript you must explicitly provide a column type.
    S https://localhost:5173/assets/index-Cy6wDeOF.js:62
    kd https://localhost:5173/assets/index-Cy6wDeOF.js:62
    Fe https://localhost:5173/assets/index-Cy6wDeOF.js:72
    Ie https://localhost:5173/assets/index-Cy6wDeOF.js:76
    <anonymous> https://localhost:5173/assets/index-Cy6wDeOF.js:76
index-Cy6wDeOF.js:62:28148
    S https://localhost:5173/assets/index-Cy6wDeOF.js:62
    kd https://localhost:5173/assets/index-Cy6wDeOF.js:62
    Fe https://localhost:5173/assets/index-Cy6wDeOF.js:72
    Ie https://localhost:5173/assets/index-Cy6wDeOF.js:76
    <anonymous> https://localhost:5173/assets/index-Cy6wDeOF.js:76
Error: Promised response from onMessage listener went out of scope index.js:4716:38


```

//////////////////////////////////////

```json
{
  "appName": "Corpdesk PWA",
  "fallbackTitle": "Corpdesk PWA",
  "appVersion": "1.0.0",
  "appDescription": "Corpdesk PWA",
  "themeConfig": {
    "currentThemePath": "/themes/default/theme.json",
    "accessibleThemes": ["default", "dark", "contrast"]
  },
  "defaultModulePath": "sys/cd-user",
  "logLevel": "debug",
  "uiConfig": {
    "defaultUiSystemId": "material-design",
    "defaultThemeId": "dark",
    "defaultFormVariant": "standard",
    "uiSystemBasePath": "/assets/ui-systems/"
  },
  "splash": {
    "enabled": true,
    "path": "/splashscreens/corpdesk-default.html",
    "minDuration": 3400
  },
  "envConfig": {
    "appId": "",
    "production": true,
    "apiEndpoint": "https://localhost:3001/api",
    "sioEndpoint": "https://localhost:3002",
    "wsEndpoint": "wss://localhost:3000",
    "wsMode": "sio",
    "pushConfig": {
      "sio": {
        "enabled": true
      },
      "wss": {
        "enabled": false
      },
      "pusher": {
        "enabled": false,
        "apiKey": "",
        "options": {
          "cluster": "",
          "forceTLS": true
        }
      }
    },
    "clientAppGuid": "ca0fe39f-92b2-484d-91ef-487d4fc462a2",
    "clientContext": {
      "entity": "ASDAP",
      "clientAppId": 2,
      "consumerToken": "B0B3DA99-1859-A499-90F6-1E3F69575DCD"
    },
    "USER_RESOURCES": "https://assets.corpdesk.com/user-resources",
    "apiHost": "https://localhost",
    "sioHost": "https://localhost",
    "shellHost": "https://localhost",
    "consumer": "ACME_CORP",
    "clientAppId": 2,
    "SOCKET_IO_PORT": 3002,
    "defaultauth": "cd-auth",
    "initialPage": "dashboard",
    "mfManifestPath": "/assets/mf.manifest.json",
    "apiOptions": {
      "headers": {
        "Content-Type": "application/json"
      }
    },
    "sioOptions": {
      "path": "/socket.io",
      "transports": ["websocket", "polling"],
      "secure": true
    },
    "logLevel": "debug"
  }
}
```

//////////////////////////////////////////////
At this stage we are interested in how errors are handled.
The logs below shows behaviour when login attempte encounters network error.
The behaviour should be proper reporting but not fatal failure.
The process should be directed to next alternative source of config.
As this is happening the logs should show a trail of logs and warning on items that did not work and why.
Perhaps shell.config.json.

```log
[SHELL] [DEBUG] [Main.loginAnonUser] Performing anon login index-DbJJqnIE.js:48:1132
[SHELL] [DEBUG] [Main.loginAnonUser] conumerGuid: B0B3DA99-1859-A499-90F6-1E3F69575DCD index-DbJJqnIE.js:48:1132
[SHELL] [DEBUG] [UserService] EnvUserLogin { ctx: 'Sys',
  m: 'User',
  c: 'User',
  a: 'Login',
  dat:
   { token: null,
     f_vals:
      [ { data:
           { userName: 'anon',
             password: '-',
             consumerGuid: 'B0B3DA99-1859-A499-90F6-1E3F69575DCD' } } ] },
  args: null } index-DbJJqnIE.js:48:1132
[HttpService] Initialized Axios instance [cdApiLocal] → https://localhost:3001/api index-DbJJqnIE.js:57:7302
[HttpService] Request Config:
Object { method: "POST", url: "https://localhost:3001/api", data: {…} }
index-DbJJqnIE.js:57:7302
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3001/api. (Reason: CORS request did not succeed). Status code: (null).
2
[HttpService] Request Error: Network Error index-DbJJqnIE.js:57:7302
[BOOTSTRAP ERROR] Error: Login request failed: HTTP Error: 'Network Error'
    login https://localhost:5173/assets/index-DbJJqnIE.js:57
index-DbJJqnIE.js:57:15443
[SHELL] [DEBUG] [Splash] animation completed index-DbJJqnIE.js:48:1132
[SHELL] [DEBUG] [Splash] waiting
Object { splashAnimDone: true, appReady: false }
index-DbJJqnIE.js:48:1132
Error: Promised response from onMessage listener went out of scope
```

```ts
export class UserService {
  async login(user: UserModel, consumerGuid: string): Promise<ICdResponse> {
    // const consumerGuid = this.cache.getConsumerGuid();
    if (!consumerGuid) {
      throw new Error("consumerGuid missing in SysCacheService");
    }

    EnvUserLogin.dat.f_vals[0].data = {
      userName: user.userName,
      password: user.password,
      consumerGuid,
    };

    this.logger.debug(
      "[UserService] EnvUserLogin",
      inspect(EnvUserLogin, { depth: 4 })
    );

    const fx = await this.http.proc(EnvUserLogin, "cdApiLocal");

    if (!fx.state || !fx.data) {
      throw new Error(`Login request failed: ${fx.message}`);
    }

    const resp = fx.data;

    if (resp.app_state?.sess?.cd_token) {
      this.setCdToken(resp.app_state.sess.cd_token);
    }

    return resp;
  }
}
```

```ts
export Main{
  async run() {
    //---------------------------------------
    // SPLASH
    //---------------------------------------
    await this.showSplash();

    this.logger.setLevel("debug");
    this.logger.debug("Main.run() started");

    //---------------------------------------
    // STEP 0: Load static shell config
    //---------------------------------------
    const staticShellConfig = await this.loadStaticShellConfig();

    //---------------------------------------
    // STEP 1: Init SysCache
    //---------------------------------------
    this.svSysCache = SysCacheService.getInstance(this.svConfig);
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cache (includes envConfig + consumerGuid)
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();

    //---------------------------------------
    // STEP 3: ANON LOGIN (consumer context)
    //---------------------------------------
    await this.loginAnonUser();

    //---------------------------------------
    // STEP 4: Resolve shell config (consumer-aware)
    //---------------------------------------
    const shellConfig = await this.loadShellConfig(this.consumerProfile);

    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 5: Apply UI-System + Theme
    //---------------------------------------
    await this.applyStartupUiSettings(shellConfig);

    //---------------------------------------
    // STEP 6: Theme config (logo, title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 7: Continue normal bootstrap
    //---------------------------------------
    await this.bootstrapUi(shellConfig);

    //---------------------------------------
    // READY
    //---------------------------------------
    this.appReady = true;
    this.tryHideSplash();
    this.logger.debug("Main.run() complete");
  }

  async loadShellConfig(
    consumerProfile?: IConsumerProfile,
    userProfile?: IUserProfile
  ): Promise<IUserShellConfig> {
    const baseConfig = await this.loadStaticShellConfig();

    const withConsumer = this.mergeShellConfig(
      baseConfig,
      consumerProfile?.shellConfig
    );

    const finalConfig = this.mergeShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return finalConfig;
  }
}
```

/////////////////////////////////////////////
Below is an actual ICdResponse from anon successfull login.
Use it to refine your recommendations.

```json
{
  "app_state": {
    "success": true,
    "info": {
      "messages": [],
      "code": "",
      "app_msg": "Welcome anon!",
      "respState": {
        "cdLevel": null,
        "cdDescription": null,
        "httpCode": null,
        "httpDescription": null
      }
    },
    "sess": {
      "cd_token": "f54ba740-0a1b-403e-a9c1-a0557b86f967",
      "userId": 1000,
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
      "consumerGuid": "B0B3DA99-1859-A499-90F6-1E3F69575DCD",
      "consumerName": "emp_services",
      "consumerEnabled": 1,
      "docId": 9276,
      "companyId": 85,
      "companyGuid": "8a7ee96e-6c76-11ec-a1b0-4184d18c49ca",
      "consumerProfile": null
    },
    "menuData": [
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
      }
    ],
    "userData": {
      "userId": 1000,
      "userGuid": "331fb293-5fc0-4586-af33-02ac6c23e0dc",
      "userName": "anon",
      "password": "$2b$10$b.NfAerv.eeGsT6ivKEK5eijj64vD9OvWZkCPZ0snGblRbkXr1Fgi",
      "email": null,
      "companyId": null,
      "docId": null,
      "mobile": null,
      "gender": null,
      "birthDate": null,
      "postalAddr": null,
      "fName": null,
      "mName": null,
      "lName": null,
      "nationalId": null,
      "passportId": null,
      "userEnabled": true,
      "zipCode": null,
      "activationKey": null,
      "userTypeId": null,
      "userProfile": {
        "avatar": {
          "url": "https://asdap.africa/assets/images/users/avatar-anon.jpg"
        },
        "userData": {
          "fName": "",
          "lName": "",
          "userName": ""
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
            }
          ]
        }
      }
    },
    "userProfile": [
      {
        "userProfile": {
          "avatar": {
            "url": "https://asdap.africa/assets/images/users/avatar-anon.jpg"
          },
          "userData": {
            "fName": "",
            "lName": "",
            "userName": ""
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
              }
            ]
          }
        }
      }
    ]
  }
}
```

//////////////////////////////////////////////

I am working on consumer response from the backend. It is currently null.
Still it is one of the issues we must be able to deal with gracefully.
Otherwise the profile is expected to be of IConsumerProfile | null.
Non-the-less, following are reference for ConsumerModel.
Use them to refine further the expected graceful behaviour of frontend.

```ts
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
  consumerData: ConsumerModel; // base object like userData in IUserProfile

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

  /**
   * minimal consumer data placeholder
   */
  consumerData: {
    consumerName: "",
    companyId: null,
    consumerEnabled: true,
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

///////////////////////////////////////////////////
As we plan to introduce ShellConfigResolverService, I have shared some existing methods and ConfigService class.
I am suggesting we need to consider how to integrate the relevent config methods into ConfigService without reating new class. This will also relieve Main of config related methods so it remains clean and focussed.

```ts
export class Main {
  // ===================================================================
  // LOGIN
  // ===================================================================
  private async loginAnonUser(): Promise<void> {
    this.logger.debug("[Main.loginAnonUser] Performing anon login");

    const consumerGuid = this.svSysCache.getConsumerGuid();
    this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);

    if (!consumerGuid) {
      this.logger.warn(
        "[Main.loginAnonUser] No consumerGuid → skipping anon login"
      );
      return;
    }

    const anonUser: UserModel = {
      userName: "anon",
      password: "-",
    };

    const resp = await this.svUser.login(anonUser, consumerGuid);

    if (!resp) {
      this.logger.warn(
        "[Main.loginAnonUser] anon login failed → continuing with static shell config"
      );
      return;
    }

    this.logger.debug("[Main.loginAnonUser] anon login success");

    this.consumerProfile = resp.data.consumerProfile || null;
    this.userProfile = resp.userProfile || null;
  }

  // ===================================================================
  // SHELL CONFIG RESOLUTION
  // ===================================================================

  async loadShellConfig(
    consumerProfile?: IConsumerProfile,
    userProfile?: IUserProfile
  ): Promise<IUserShellConfig> {
    const baseConfig = await this.loadStaticShellConfig();

    const withConsumer = this.mergeShellConfig(
      baseConfig,
      consumerProfile?.shellConfig
    );

    const finalConfig = this.mergeShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return finalConfig;
  }

  private async loadStaticShellConfig(): Promise<IUserShellConfig> {
    return await this.svConfig.loadConfig();
  }

  private mergeShellConfig(
    base: IUserShellConfig,
    override?: Partial<IUserShellConfig>
  ): IUserShellConfig {
    if (!override) return base;

    return {
      ...base,
      ...override,
      uiConfig: {
        ...base.uiConfig,
        ...override.uiConfig,
      },
      themeConfig: {
        ...base.themeConfig,
        ...override.themeConfig,
      },
    };
  }

  private mergeShellConfigWithPolicy(
    base: IUserShellConfig,
    userShell?: Partial<IUserShellConfig>,
    consumerShell?: IConsumerShellConfig
  ): IUserShellConfig {
    if (!userShell || !consumerShell) return base;

    const lockDown = consumerShell.lockDown || {};

    return {
      ...base,

      uiConfig: {
        ...base.uiConfig,

        // ---------------------------------------
        // UI SYSTEM
        // ---------------------------------------
        defaultUiSystemId: lockDown.uiSystem
          ? base.uiConfig.defaultUiSystemId
          : (userShell.uiConfig?.defaultUiSystemId ??
            base.uiConfig.defaultUiSystemId),

        // ---------------------------------------
        // THEME
        // ---------------------------------------
        defaultThemeId: lockDown.theme
          ? base.uiConfig.defaultThemeId
          : (userShell.uiConfig?.defaultThemeId ??
            base.uiConfig.defaultThemeId),

        // ---------------------------------------
        // FORM VARIANT
        // ---------------------------------------
        defaultFormVariant: lockDown.formVariant
          ? base.uiConfig.defaultFormVariant
          : (userShell.uiConfig?.defaultFormVariant ??
            base.uiConfig.defaultFormVariant),
      },
    };
  }
}
```

// src/CdShell/sys/moduleman/services/config.service.ts

```ts
// import { ShellConfig } from "../../base";
import { IShellConfig } from "../../base";
import { UserService } from "../../cd-user/services/user.service";
import { UiConfig } from "../models/config.model";
import { ConsumerService } from "./consumer.service";

// ConfigService (singleton)
export class ConfigService {
  private static instance: ConfigService | null = null;
  private config: IShellConfig | null = null;
  private readonly CONFIG_PATH = "/shell.config.json";

  constructor() {}

  public static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  async loadConfig(): Promise<IShellConfig> {
    if (this.config) return this.config;

    try {
      const res = await fetch(this.CONFIG_PATH);
      if (!res.ok) throw new Error(`Failed to load config ${res.status}`);
      this.config = (await res.json()) as IShellConfig;
      console.log("[ConfigService] loaded config:", this.config);
      return this.config;
    } catch (err) {
      console.error("[ConfigService] loadConfig error:", err);
      // fallback defaults
      this.config = {
        appName: "Corpdesk",
        fallbackTitle: "Corpdesk",
        appVersion: "0.0.0",
        appDescription: "",
        themeConfig: {
          currentThemePath: "/themes/default/theme.json",
          accessibleThemes: ["default", "dark"],
        },
        defaultModulePath: "sys/cd-user",
        logLevel: "debug",
        uiConfig: {
          defaultUiSystemId: "bootstrap-538",
          defaultThemeId: "default",
          defaultFormVariant: "standard",
          uiSystemBasePath: "/public/assets/ui-systems/",
        },
      } as IShellConfig;
      return this.config;
    }
  }

  /**
   * Convenience: returns uiConfig. Ensure loadConfig() called before.
   */
  getUiConfig(): UiConfig {
    if (!this.config) {
      throw new Error("ConfigService: config not loaded; call loadConfig()");
    }
    return this.config.uiConfig;
  }
}
```

///////////////////////////////////////
Neither consumerShell.userPersonalizationAllowed nor consumerShell.enforcedPolicies exists as recommended in ConfigService. We can review consumer model data and figure out whether to create them or use relevant exiting properties.

```ts
export class ConfigService {
  private applyUserShellConfigWithPolicy(
    base: IUserShellConfig,
    userShell?: Partial<IUserShellConfig>,
    consumerShell?: IConsumerShellConfig
  ): IUserShellConfig {
    // No user config or no consumer context
    if (!userShell || !consumerShell) return base;

    // 🔑 MASTER GATE
    const allowUser = consumerShell.userPersonalizationAllowed === true;

    if (!allowUser) {
      console.info("[ConfigService] User personalization disabled by consumer");
      return base;
    }

    const locks = consumerShell.enforcedPolicies ?? {};

    return {
      ...base,
      uiConfig: {
        ...base.uiConfig,

        defaultUiSystemId: locks.lockUiSystem
          ? base.uiConfig.defaultUiSystemId
          : (userShell.uiConfig?.defaultUiSystemId ??
            base.uiConfig.defaultUiSystemId),

        defaultThemeId: locks.lockTheme
          ? base.uiConfig.defaultThemeId
          : (userShell.uiConfig?.defaultThemeId ??
            base.uiConfig.defaultThemeId),

        defaultFormVariant: locks.lockFormVariant
          ? base.uiConfig.defaultFormVariant
          : (userShell.uiConfig?.defaultFormVariant ??
            base.uiConfig.defaultFormVariant),
      },
    };
  }
}
```

// src/CdShell/sys/moduleman/models/consumer.model.ts

```ts
// import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  PrimaryColumn,
  Unique,
} from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from "uuid";
import { validateOrReject } from "class-validator";
import { IShellConfig } from "../../base";
// import { IShellConfig } from "./config.model";

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
  })
  consumerGuid?: string;

  @Column("varchar", {
    name: "consumer_name",
    length: 50,
    nullable: true,
  })
  consumerName!: string;

  @Column("tinyint", {
    name: "consumer_enabled",
    default: null,
  })
  consumerEnabled!: boolean | number | null;

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
}

export interface IConsumerShellConfig extends IShellConfig {
  /**
   * Consumer may lock or restrict UI options for all users.
   * These form the base policy.
   */
  lockDown?: {
    /** Prevent users from changing their UI system */
    uiSystem?: boolean;

    /** Prevent users from changing their theme */
    theme?: boolean;

    /** Prevent users from changing form variant */
    formVariant?: boolean;
  };

  /**
   * Consumer-level options for UI system and theme allowances.
   */
  allowedOptions?: {
    uiSystems?: string[]; // which UI-systems users may pick from
    themes?: string[]; // which themes users may pick from
    formVariants?: string[]; // (e.g., standard | outline | filled)
  };
}

export interface IConsumerProfile {
  /** Basic company/tenant information */
  consumerData: ConsumerModel;

  /** Optional business descriptions, tags, extra metadata */
  bio?: string;
  missionStatement?: string;
  tags?: string[];
  industries?: string[];
  preferences?: Record<string, any>;

  /** Consumer-level shell config (base for all users) */
  shellConfig?: IConsumerShellConfig;

  /**
   * Consumer-wide access control
   * Future-proofed for menu permissions, module access, etc.
   */
  permissions?: {
    moduleAccess?: string[]; // e.g., ["hr", "finance", "assets"]
    featureFlags?: string[];
  };
}
```

////////////////////////////////////
Below is vite config.
I need some way in which we can enable or disable https mode.
This configuration will only affect development only for vite.
Should it be done via shell.config.ts?
Eg secure: boolean

// src/vite.config.ts

```ts
import { defineConfig } from "vite";
import fs from "fs";
import path from "path";

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
  server: {
    ...viteConfig,
    // Add headers for WASM and OPFS support
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  preview: {
    ...viteConfig,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },

  root: ".",
  publicDir: "public",

  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext", // Important for WASM and modern features
    modulePreload: true,
    rollupOptions: {
      input: path.resolve(__dirname, "public/index.html"),
      output: {
        format: "es",
      },
      external: [
        // Externalize Node.js modules that shouldn't be bundled for browser
        "redis",
        "chalk",
        "util",
        "fs",
        "path",
        "crypto",
        "stream",
        "http",
        "https",
        "net",
        "tls",
        "zlib",
        "os",
        "child_process",
        "cluster",
        "dgram",
        "dns",
        "domain",
        "module",
        "readline",
        "repl",
        "tty",
        "url",
        "vm",
        "worker_threads",
        "perf_hooks",
        "querystring",
        "buffer",
        "assert",
        "constants",
        "events",
        "punycode",
        "string_decoder",
        "timers",
        "uglify-js",
      ],
    },
  },

  esbuild: {
    target: "esnext",
    supported: {
      "top-level-await": true,
    },
    // Add TypeScript decorator support
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
        // emitDecoratorMetadata: true,
        useDefineForClassFields: false,
      },
    },
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shell": path.resolve(__dirname, "dist-ts/CdShell"),
      // Redirect problematic Node.js modules to browser-friendly shims
      redis: path.resolve(__dirname, "src/CdShell/sys/utils/redis-shim.ts"),
      chalk: path.resolve(__dirname, "src/CdShell/sys/utils/chalk-shim.ts"),
      util: path.resolve(__dirname, "src/CdShell/sys/utils/util-shim.ts"),
      path: path.resolve(__dirname, "src/CdShell/sys/utils/path-shim.ts"),
      fs: path.resolve(__dirname, "src/CdShell/sys/utils/fs-shim.ts"),
      os: path.resolve(__dirname, "src/CdShell/sys/utils/os-shim.ts"),
      crypto: path.resolve(__dirname, "src/CdShell/sys/utils/crypto-shim.ts"),
      stream: path.resolve(__dirname, "src/CdShell/sys/utils/stream-shim.ts"),
      buffer: path.resolve(__dirname, "src/CdShell/sys/utils/buffer-shim.ts"),
      // Optional: Add shims for other commonly used Node.js modules
      process: path.resolve(__dirname, "src/CdShell/sys/utils/process-shim.ts"),
    },
    extensions: [".js", ".ts", ".wasm"], // Add WASM extension
  },

  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
      supported: {
        "top-level-await": true,
      },
      // Define globals for esbuild
      define: {
        global: "globalThis",
      },
    },
    exclude: [
      // Exclude Node.js modules and WASM packages from optimization
      "redis",
      "chalk",
      "util",
      "fs",
      "path",
      "crypto",
      "stream",
      "os",
      "sql.js",
      "@sqlite.org/sqlite-wasm",
      "dexie",
      // Add other Node.js specific modules
      "http",
      "https",
      "net",
      "tls",
      "zlib",
      "child_process",
      "cluster",
      "dgram",
      "dns",
    ],
    include: [
      // Force include reflect-metadata for dependency optimization
      "reflect-metadata",
      "lodash",
      "moment",
      "uuid",
    ],
  },

  define: {
    // Global constants for environment detection
    __IS_NODE__: JSON.stringify(false),
    __IS_BROWSER__: JSON.stringify(true),
    __IS_PWA__: JSON.stringify(true),

    // Define process.env for browser environment
    "process.env.NODE_ENV": JSON.stringify(
      process.env.NODE_ENV || "production"
    ),
    "process.version": JSON.stringify("v18.0.0"),
    "process.versions": JSON.stringify({ node: "18.0.0" }),
    "process.platform": JSON.stringify("browser"),
    "process.arch": JSON.stringify("x64"),
    "process.cwd": JSON.stringify(() => "/"),

    // Global polyfill
    global: "globalThis",
  },

  // Plugins array if you need to add any in the future
  plugins: [
    // You can add Vite plugins here as needed
    // Example: wasm plugin, legacy browser support, etc.
  ],
});
```

///////////////////////////////////////////
I am currently getting the following error:
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://localhost:3001/api. (Reason: CORS request did not succeed). Status code: (null).

Check the references given below to examine how the CORS issue is coming about.

Request headers from the browser:

```log
OPTIONS /api undefined
Host: localhost:3001
User-Agent: Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:146.0) Gecko/20100101 Firefox/146.0
Accept: */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br, zstd
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type
Referer: https://localhost:5173/
Origin: https://localhost:5173
Connection: keep-alive
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: same-site
Priority: u=4
Pragma: no-cache
Cache-Control: no-cache
```

Under browser inspect/Network/Security: We have "MOZILLA_PKIX_ERROR_SELF_SIGNED_CERT"

// Backend api: src/config.ts

```ts
// <proj-directory>/src/config.ts
import mysql from "mysql2";
import * as fs from "fs";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { DataSource, DataSourceOptions, DatabaseType } from "typeorm";
import path from "path";
import { RunMode } from "./CdApi/sys/base/i-base";
import { inspect } from "util";
import { ModuleConfig } from "./CdApi/sys/moduleman/models/module.model";
dotenv.config();

const entitiesConfigPath = path.join(
  __dirname,
  "configs",
  "module-entities.json"
);

const API_HOST_NAME = process.env.API_HOST_NAME;
const API_HOST_IP = process.env.API_HOST_IP;
const HTTP_PORT = process.env.HTTP_PORT;
const HTTP_WEBROOT = process.env.HTTP_WEBROOT;
const HTTP_ENABLED = process.env.HTTP_ENABLED === "true";
const API_PORT = process.env.API_PORT;
const API_ROUTE = process.env.API_ROUTE;
const END_POINT = `${process.env.API_URL}:${API_PORT}`;

export default {
  runMode: RunMode.UNRESTRICTED_DEVELOPER_MODE,
  secure: process.env.SECURE,
  http: {
    hostName: API_HOST_NAME,
    hostIp: API_HOST_IP,
    enabled: HTTP_ENABLED,
    port: HTTP_PORT,
    webroot: HTTP_WEBROOT,
  },
  keyPath: process.env.KEY_PATH,
  certPath: process.env.CERT_PATH,
  caPath: process.env.CSR_PATH,
  apiPort: process.env.API_PORT,
  apiRoute: API_ROUTE,
  endPoint: END_POINT,
  cacheTtl: process.env.CACHE_TTL,
  userActivationUrl: process.env.USER_ACTIVATION_URL,
  Cors: {
    options: {
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
        `https://localhost:5173`,
        `http://localhost:80`,
        `http://127.0.0.1:80`,
        `https://${API_HOST_NAME}`,
        `https://www.${API_HOST_NAME}`,
        `https://cd-user.${API_HOST_NAME}`,
        `https://cd-comm.${API_HOST_NAME}`,
        `https://cd-moduleman.${API_HOST_NAME}`,
      ],
      preflightContinue: false,
    },
  },
};
```

// Backend api: src/main.ts

```ts
// basic imports

import config from "./config";
// import express from 'express';
import express, { Application, Request, Response } from "express";
import cors from "cors";
import "reflect-metadata";

// database imports
import { MysqlDataSource as ds } from "./CdApi/sys/base/data-source";

// corpdesk engine imports
import { CdInit } from "./CdApi/init";

// push server imports
import { createClient, RedisClientOptions } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer } from "http";
import { createServer as createHttpServer } from "http";
import https from "https";
import { createServer as createHttpsServer } from "https";
import fs from "fs";
import path from "path";
import * as WebSocket from "ws";
import { server as WebSocketServer } from "websocket";
import { Server, Socket } from "socket.io";
import Redis from "ioredis";
import { SioService } from "./CdApi/sys/cd-push/services/sio.service";
import { Logging } from "./CdApi/sys/base/winston.log";
import { WebsocketService } from "./CdApi/sys/cd-push/services/websocket.service";
import pusher from "./CdApi/sys/cd-push/services/pusher";
import { getRedisClient } from "./CdApi/sys/base/redis-client";

export class Main {
  logger: Logging;
  allowedOrigins = [config.Cors.options.origin[5]];
  constructor() {
    this.logger = new Logging();
  }
  async run() {
    this.logger.logInfo("Main::run()/01");
    // this.logger.logInfo('Main::run()/config.keyPath', {keyPath: config.keyPath} )
    // this.logger.logInfo('Main::run()/config.certPath', {certPath: config.certPath} )
    // this.logger.logInfo('Main::run()/config.caPath', {caPath: config.caPath} )
    // basic settings
    const app: Application = express();

    // Serve .well-known directory for Let's Encrypt validation
    // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

    const privateKey = fs.readFileSync(config.keyPath, "utf8");
    const certificate = fs.readFileSync(config.certPath, "utf8");

    let certAuth = "";
    // just in case certificate authority is not provided
    if (config.caPath.length > 0) {
      certAuth = fs.readFileSync(config.caPath, "utf8");
    } else {
      certAuth = null;
    }

    const credentials = {
      key: privateKey,
      cert: certificate,
      // ca: certAuth
    };

    const options = config.Cors.options;

    ////////////////////////////////////////////////////////////////////////////////
    const corsOptions = {
      origin: config.Cors.options.origin[3], // Replace with your client URL
      // origin: 'http://localhost', // for localhost teting
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };
    ////////////////////////////////////////////////////////////////////////////////

    let httpsServer = null;
    let corsOpts = null;

    //////////////////////////////////////////////////////////////////////////////
    app.use(cors(corsOptions));
    app.use(express.json()); // For parsing application/json
    app.options("*", cors(corsOptions)); // Enable pre-flight across-the-board
    //////////////////////////////////////////////////////////////////////////////

    // Serve .well-known directory for Let's Encrypt validation
    // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
    app.use(
      config.http.webroot,
      express.static(path.join(__dirname, config.http.webroot))
    );

    // Create HTTP server
    const httpServer = createHttpServer(app);

    // Create HTTPS server
    httpsServer = https.createServer(credentials, app);
    corsOpts = {
      cors: {
        options: config.Cors.options.allowedHeaders,
        origin: config.Cors.options.origin,
      },
    };

    /**
     * When run on sio mode in production,
     * use SSL
     * use cors
     */
    if (config.pushService.sio.enabled) {
      this.logger.logInfo("Main::run()/02");

      // const io = new Server(httpsServer, corsOpts);
      /////////////////////////////////////////////////////
      const io = new Server(httpsServer, {
        cors: {
          origin: config.Cors.options.origin[5],
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
      /////////////////////////////////////////////////////

      this.logger.logInfo("Main::run()/03");
      this.logger.logInfo("Main::run()/config.push.mode:", {
        mode: config.push.mode,
      });
      // let pubClient = getRedisClient();
      let pubClient;
      let subClient;
      switch (config.push.mode) {
        case "PUSH_BASIC":
          this.logger.logInfo("Main::run()/031");
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
            legacyMode: true,
          } as RedisClientOptions);
          // pubClient = getRedisClient();
          subClient = pubClient.duplicate();
          break;
        case "PUSH_CLUSTER":
          this.logger.logInfo("Main::run()/032");
          pubClient = new Redis.Cluster(config.push.startupNodes);
          subClient = pubClient.duplicate();
          break;
        case "PUSH_SENTINEL":
          this.logger.logInfo("Main::run()/033");
          pubClient = new Redis(config.push.sentinalOptions);
          subClient = pubClient.duplicate();
          break;
        default:
          this.logger.logInfo("Main::run()/034");
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
          } as RedisClientOptions);
          // pubClient = getRedisClient();
          subClient = pubClient.duplicate();
          break;
      }

      Promise.all([pubClient, subClient]).then(() => {
        this.logger.logInfo("Main::run()/035");
        const svSio = new SioService();
        svSio.run(io, pubClient, subClient);
      });
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    /**
     * When run on app mode in production,
     * use without SSL...but behind nginx proxy server fitted with SSL
     * do not use cors...but set it at nginx
     */
    if (config.apiRoute === "/api" && config.secure === "false") {
      console.log("main/04");
      httpsServer = createServer(app);
      corsOpts = {
        cors: {
          options: config.Cors.options.allowedHeaders,
          origin: null,
        },
      };
    }

    // app.all('*', function (req, res, next) {
    //     // res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //     res.header('Access-Control-Allow-Headers', 'Content-Type');
    //     if ('OPTIONS' == req.method) {
    //         res.sendStatus(200);
    //     } else {
    //         next();
    //     }
    // });

    app.post("/sio/p-reg/", async (req: any, res: any) => {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      );
      CdInit(req, res);
    });

    // set api entry point
    app.post(config.apiRoute, async (req: any, res: any) => {
      console.log("app.post/01");
      res.setHeader("Content-Type", "application/json");
      ////////////////////
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      );
      CdInit(req, res, ds);
    });

    if (config.pushService.pusher.enabled) {
      app.post("/notify", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const { message, channel, event } = req.body;
        // this.logger.logInfo("message:", message)
        pusher
          .trigger(channel, event, {
            message: "hello from server on '/notify'",
          })
          .then(() => res.status(200).send("Notification sent from '/notify'"))
          .catch((err: Error) =>
            res.status(500).send(`Error sending notification: ${err.message}`)
          );
      });

      app.post("/notify-user", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const { message, userId } = req.body;
        const channel = `private-user-${userId}`;

        pusher
          .trigger(channel, "user-event", {
            message: "hello from server on '/notify-user'",
          })
          .then(() => res.status(200).send("Notification sent from '/notify'"))
          .catch((err: Error) =>
            res.status(500).send(`Error sending notification: ${err.message}`)
          );
      });

      app.post("/pusher/auth", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const socketId = req.body.socket_id;
        const channel = req.body.channel_name;
        const auth = pusher.authenticate(socketId, channel);
        res.send(auth);
      });
    }

    if (config.pushService.wss.enabled) {
      console.log("main/05");
      const expressServer = app
        .listen(config.wssPort, () => {
          console.log(`server is listening on ${config.wssPort}`);
        })
        .on("error", (e) => {
          console.log(`Error:${e}`);
        });
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      // Define the WebSocket server. Here, the server mounts to the `/ws`
      // route of the Express JS server.
      const wss = new WebSocket.Server({
        server: expressServer,
        path: "/ws",
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

      // wsServer.on('request', function (request) {
      //     if (!this.originIsAllowed(request.origin)) {
      //         request.reject();
      //         console.log('Connection from origin ' + request.origin + ' rejected.');
      //         return;
      //     }

      //     const connection = request.accept(null, request.origin);
      //     console.log('Connection accepted.');

      //     connection.on('message', function (message) {
      //         if (message.type === 'utf8') {
      //             console.log('Received Message: ' + message.utf8Data);
      //             connection.sendUTF('Hello Client');
      //         }
      //     });

      //     connection.on('close', function (reasonCode, description) {
      //         console.log('Peer ' + connection.remoteAddress + ' disconnected.');
      //     });
      // });
    } else {
      if (config.http.enabled) {
        // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
        httpServer
          .listen(config.http.port, () => {
            this.logger.logInfo(
              `HTTP server listening on port ${config.http.port}`
            );
          })
          .on("error", (e) => {
            this.logger.logError(`HTTP server: listen()/Error: ${e}`);
          });
      }

      // start server
      httpsServer
        .listen(config.apiPort, () => {
          // console.log(`cd-api server is listening on ${config.apiPort}`);
          this.logger.logInfo(`cd-api server is listening on:`, {
            port: `${config.apiPort}`,
          });
        })
        .on("error", (e) => {
          this.logger.logError(`cd-api server: listen()/Error:${e}`);
        });
    }
  }

  originIsAllowed(origin: string) {
    return this.allowedOrigins.includes(origin);
  }
}
```

///////////////////////////////////////////////////////////
Below is the refactored main.ts that you had recomended.
Take a look at it again with the config.ts and confirm if the settings for config.secure can switch it from http to https.
If not, you can try and refactor.

```ts
/**
 * ============================================================
 * Corpdesk API Main Entry
 * ============================================================
 *
 * Responsibilities:
 * - Initialize Express
 * - Configure HTTPS / HTTP servers
 * - Apply centralized CORS policy
 * - Mount Corpdesk engine (CdInit)
 * - Bootstrap Push services (SIO / WSS / Pusher)
 *
 * Design Principles:
 * - TLS must succeed before CORS can function
 * - CORS must be centralized (never per-route)
 * - SSL may be handled here (dev) or by reverse proxy (prod)
 * - API must never hard-fail on cross-origin noise
 */

import express, { Application } from "express";
import cors from "cors";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import "reflect-metadata";

import config from "./config";
import { CdInit } from "./CdApi/init";
import { MysqlDataSource as ds } from "./CdApi/sys/base/data-source";
import { Logging } from "./CdApi/sys/base/winston.log";

// Push / realtime imports
import { Server } from "socket.io";
import Redis from "ioredis";
import { createClient, RedisClientOptions } from "redis";
import { SioService } from "./CdApi/sys/cd-push/services/sio.service";
import { WebsocketService } from "./CdApi/sys/cd-push/services/websocket.service";
import pusher from "./CdApi/sys/cd-push/services/pusher";

export class Main {
  private logger: Logging;

  constructor() {
    this.logger = new Logging();
  }

  /**
   * ============================================================
   * ENTRY POINT
   * ============================================================
   */
  async run() {
    this.logger.logInfo("Main.run() :: starting");

    /**
     * ------------------------------------------------------------
     * EXPRESS INITIALIZATION
     * ------------------------------------------------------------
     */
    const app: Application = express();

    /**
     * ------------------------------------------------------------
     * CENTRALIZED CORS CONFIGURATION
     * ------------------------------------------------------------
     *
     * IMPORTANT:
     * - TLS MUST succeed first (cert must be trusted)
     * - CORS is evaluated AFTER TLS handshake
     * - Never mix manual headers with cors()
     */
    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        // Allow non-browser clients (curl, postman)
        if (!origin) return callback(null, true);

        if (config.Cors.options.origin.includes(origin)) {
          return callback(null, true);
        }

        this.logger.logWarn("[CORS] Blocked origin", { origin });
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));
    app.use(express.json());

    /**
     * ------------------------------------------------------------
     * STATIC FILE SERVING
     * ------------------------------------------------------------
     *
     * Used for:
     * - .well-known (Let's Encrypt)
     * - Public assets (if any)
     */
    if (config.http.webroot) {
      app.use(
        config.http.webroot,
        express.static(path.join(__dirname, config.http.webroot))
      );
    }

    /**
     * ------------------------------------------------------------
     * API ENTRY POINT
     * ------------------------------------------------------------
     *
     * This is the ONLY API endpoint for Corpdesk.
     * All routing is delegated to CdInit.
     */
    app.post(config.apiRoute, async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      CdInit(req, res, ds);
    });

    /**
     * ============================================================
     * SERVER CREATION (HTTP / HTTPS)
     * ============================================================
     */
    let httpServer: http.Server | null = null;
    let httpsServer: https.Server | null = null;

    /**
     * ------------------------------------------------------------
     * HTTPS SERVER (DEV or STANDALONE PROD)
     * ------------------------------------------------------------
     *
     * NOTE:
     * - Certificates MUST be trusted by browser
     * - Otherwise CORS will fail with status (null)
     */
    if (config.secure === "true") {
      const privateKey = fs.readFileSync(config.keyPath, "utf8");
      const certificate = fs.readFileSync(config.certPath, "utf8");

      const credentials = {
        key: privateKey,
        cert: certificate,
      };

      httpsServer = https.createServer(credentials, app);

      httpsServer.listen(config.apiPort, () => {
        this.logger.logInfo("HTTPS API listening", {
          port: config.apiPort,
        });
      });
    }

    /**
     * ------------------------------------------------------------
     * HTTP SERVER (LOCAL DEV / PROXY MODE)
     * ------------------------------------------------------------
     *
     * Typical production usage:
     * - Node runs HTTP
     * - Nginx handles SSL + CORS
     */
    if (config.http.enabled) {
      httpServer = http.createServer(app);

      httpServer.listen(config.http.port, () => {
        this.logger.logInfo("HTTP server listening", {
          port: config.http.port,
        });
      });
    }

    /**
     * ============================================================
     * SOCKET.IO (PUSH SERVICE)
     * ============================================================
     */
    if (config.pushService?.sio?.enabled && httpsServer) {
      this.logger.logInfo("Initializing Socket.IO");

      const io = new Server(httpsServer, {
        cors: {
          origin: config.Cors.options.origin,
          credentials: true,
        },
      });

      let pubClient: any;
      let subClient: any;

      switch (config.push.mode) {
        case "PUSH_CLUSTER":
          pubClient = new Redis.Cluster(config.push.startupNodes);
          subClient = pubClient.duplicate();
          break;

        case "PUSH_SENTINEL":
          pubClient = new Redis(config.push.sentinalOptions);
          subClient = pubClient.duplicate();
          break;

        default:
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
            legacyMode: true,
          } as RedisClientOptions);
          subClient = pubClient.duplicate();
      }

      await Promise.all([pubClient.connect?.(), subClient.connect?.()]);

      const svSio = new SioService();
      svSio.run(io, pubClient, subClient);
    }

    /**
     * ============================================================
     * WEBSOCKET SERVER (RAW WSS)
     * ============================================================
     */
    if (config.pushService?.wss?.enabled && httpServer) {
      const wss = new WebsocketService();
      wss.run(httpServer);
    }

    /**
     * ============================================================
     * PUSHER ENDPOINTS (OPTIONAL)
     * ============================================================
     */
    if (config.pushService?.pusher?.enabled) {
      app.post("/notify", async (req, res) => {
        const { message, channel, event } = req.body;
        await pusher.trigger(channel, event, { message });
        res.status(200).send("Notification sent");
      });
    }

    this.logger.logInfo("Main.run() :: completed");
  }
}
```

// src/config.ts

```ts
import mysql from "mysql2";
import * as fs from "fs";
import * as dotenv from "dotenv";
import "reflect-metadata";
import { DataSource, DataSourceOptions, DatabaseType } from "typeorm";
import path from "path";
import { RunMode } from "./CdApi/sys/base/i-base";
import { inspect } from "util";
import { ModuleConfig } from "./CdApi/sys/moduleman/models/module.model";
dotenv.config();

const entitiesConfigPath = path.join(
  __dirname,
  "configs",
  "module-entities.json"
);

const API_HOST_NAME = process.env.API_HOST_NAME;
const API_HOST_IP = process.env.API_HOST_IP;
// http port for runnint webroot without SSL. Used by letsencrypt validation and automation
const HTTP_PORT = process.env.HTTP_PORT;
// control the server to serve http or not. Eg cd-api should be able to serve http but sio should not.
const HTTP_WEBROOT = process.env.HTTP_WEBROOT;
const HTTP_ENABLED = process.env.HTTP_ENABLED === "true";
const API_PORT = process.env.API_PORT;
const API_ROUTE = process.env.API_ROUTE;
const END_POINT = `${process.env.API_URL}:${API_PORT}`;

export const empMailConfig = {
  domain: "empservices.co.ke",
  incomingServer: "mail.empservices.co.ke",
  imapPort: 993,
  outgoingServer: "mail.empservices.co.ke",
  smtpPort: 465,
};
export default {
  wssPort: process.env.WSS_PORT,
  secure: process.env.SECURE,
  http: {
    hostName: API_HOST_NAME,
    hostIp: API_HOST_IP,
    enabled: HTTP_ENABLED,
    port: HTTP_PORT,
    webroot: HTTP_WEBROOT,
  },
  keyPath: process.env.KEY_PATH,
  certPath: process.env.CERT_PATH,
  caPath: process.env.CSR_PATH,
  apiPort: process.env.API_PORT,
  apiRoute: API_ROUTE,
  endPoint: END_POINT,
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
        `https://localhost:5173`,
        `http://localhost:80`,
        `http://127.0.0.1:80`,
        `https://${API_HOST_NAME}`,
        `https://www.${API_HOST_NAME}`,
        `https://cd-user.${API_HOST_NAME}`,
        `https://cd-comm.${API_HOST_NAME}`,
        `https://cd-moduleman.${API_HOST_NAME}`,
      ],
      preflightContinue: false,
    },
  },
};
```

//////////////////////////////////
I am getting the following error:
No overload matches this call.
The last overload gave the following error.
Argument of type '({ mode }: ConfigEnv) => { server: { port: number; host: string; open: boolean; headers: { "Cross-Origin-Opener-Policy": string; "Cross-Origin-Embedder-Policy": string; }; https: boolean | { ...; }; }; ... 8 more ...; plugins: any[]; }' is not assignable to parameter of type 'UserConfigExport'.
Type '({ mode }: ConfigEnv) => { server: { port: number; host: string; open: boolean; headers: { "Cross-Origin-Opener-Policy": string; "Cross-Origin-Embedder-Policy": string; }; https: boolean | { ...; }; }; ... 8 more ...; plugins: any[]; }' is not assignable to type 'UserConfigFnObject'.
Call signature return types '{ server: { port: number; host: string; open: boolean; headers: { "Cross-Origin-Opener-Policy": string; "Cross-Origin-Embedder-Policy": string; }; https: boolean | { key: NonSharedBuffer; cert: NonSharedBuffer; }; }; ... 8 more ...; plugins: any[]; }' and 'UserConfig' are incompatible.
The types of 'server.https' are incompatible between these types.
Type 'boolean | { key: NonSharedBuffer; cert: NonSharedBuffer; }' is not assignable to type 'ServerOptions<typeof IncomingMessage, typeof ServerResponse>'.
Type 'false' has no properties in common with type 'ServerOptions<typeof IncomingMessage, typeof ServerResponse>'.ts(2769)

on the line:
export default defineConfig(({ mode }) => {...

//////////////////////////////////////

// src/main.ts

```ts
/**
 * ============================================================
 * Corpdesk API Main Entry
 * ============================================================
 *
 * Responsibilities:
 * - Initialize Express
 * - Configure HTTPS / HTTP servers
 * - Apply centralized CORS policy
 * - Mount Corpdesk engine (CdInit)
 * - Bootstrap Push services (SIO / WSS / Pusher)
 *
 * Design Principles:
 * - TLS must succeed before CORS can function
 * - CORS must be centralized (never per-route)
 * - SSL may be handled here (dev) or by reverse proxy (prod)
 * - API must never hard-fail on cross-origin noise
 */

import express, { Application } from "express";
import cors from "cors";
import https from "https";
import http from "http";
import fs from "fs";
import path from "path";
import "reflect-metadata";

import config from "./config";
import { CdInit } from "./CdApi/init";
import { MysqlDataSource as ds } from "./CdApi/sys/base/data-source";
import { Logging } from "./CdApi/sys/base/winston.log";

// Push / realtime imports
import { Server } from "socket.io";
import Redis from "ioredis";
import { createClient, RedisClientOptions } from "redis";
import { SioService } from "./CdApi/sys/cd-push/services/sio.service";
import { WebsocketService } from "./CdApi/sys/cd-push/services/websocket.service";
import pusher from "./CdApi/sys/cd-push/services/pusher";

export class Main {
  private logger: Logging;

  constructor() {
    this.logger = new Logging();
  }

  /**
   * ============================================================
   * ENTRY POINT
   * ============================================================
   */
  async run() {
    this.logger.logInfo("Main.run() :: starting");

    /**
     * ------------------------------------------------------------
     * EXPRESS INITIALIZATION
     * ------------------------------------------------------------
     */
    const app: Application = express();

    /**
     * ------------------------------------------------------------
     * CENTRALIZED CORS CONFIGURATION
     * ------------------------------------------------------------
     *
     * IMPORTANT:
     * - TLS MUST succeed first (cert must be trusted)
     * - CORS is evaluated AFTER TLS handshake
     * - Never mix manual headers with cors()
     */
    const corsOptions: cors.CorsOptions = {
      origin: (origin, callback) => {
        // Allow non-browser clients (curl, postman)
        if (!origin) return callback(null, true);

        if (config.Cors.options.origin.includes(origin)) {
          return callback(null, true);
        }

        this.logger.logWarn("[CORS] Blocked origin", { origin });
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    };

    app.use(cors(corsOptions));
    app.options("*", cors(corsOptions));
    app.use(express.json());

    /**
     * ------------------------------------------------------------
     * STATIC FILE SERVING
     * ------------------------------------------------------------
     *
     * Used for:
     * - .well-known (Let's Encrypt)
     * - Public assets (if any)
     */
    if (config.http.webroot) {
      app.use(
        config.http.webroot,
        express.static(path.join(__dirname, config.http.webroot))
      );
    }

    /**
     * ------------------------------------------------------------
     * API ENTRY POINT
     * ------------------------------------------------------------
     *
     * This is the ONLY API endpoint for Corpdesk.
     * All routing is delegated to CdInit.
     */
    app.post(config.apiRoute, async (req, res) => {
      res.setHeader("Content-Type", "application/json");
      CdInit(req, res, ds);
    });

    /**
     * ============================================================
     * SERVER CREATION (HTTP / HTTPS)
     * ============================================================
     */
    let httpServer: http.Server | null = null;
    let httpsServer: https.Server | null = null;

    /**
     * ------------------------------------------------------------
     * HTTPS SERVER (DEV or STANDALONE PROD)
     * ------------------------------------------------------------
     *
     * NOTE:
     * - Certificates MUST be trusted by browser
     * - Otherwise CORS will fail with status (null)
     */
    if (config.secure === "true") {
      const privateKey = fs.readFileSync(config.keyPath, "utf8");
      const certificate = fs.readFileSync(config.certPath, "utf8");

      const credentials = {
        key: privateKey,
        cert: certificate,
      };

      httpsServer = https.createServer(credentials, app);

      httpsServer.listen(config.apiPort, () => {
        this.logger.logInfo("HTTPS API listening", {
          port: config.apiPort,
        });
      });
    }

    /**
     * ------------------------------------------------------------
     * HTTP SERVER (LOCAL DEV / PROXY MODE)
     * ------------------------------------------------------------
     *
     * Typical production usage:
     * - Node runs HTTP
     * - Nginx handles SSL + CORS
     */
    if (config.http.enabled) {
      httpServer = http.createServer(app);

      httpServer.listen(config.http.port, () => {
        this.logger.logInfo("HTTP server listening", {
          port: config.http.port,
        });
      });
    }

    /**
     * ============================================================
     * SOCKET.IO (PUSH SERVICE)
     * ============================================================
     */
    if (config.pushService?.sio?.enabled && httpsServer) {
      this.logger.logInfo("Initializing Socket.IO");

      const io = new Server(httpsServer, {
        cors: {
          origin: config.Cors.options.origin,
          credentials: true,
        },
      });

      let pubClient: any;
      let subClient: any;

      switch (config.push.mode) {
        case "PUSH_CLUSTER":
          pubClient = new Redis.Cluster(config.push.startupNodes);
          subClient = pubClient.duplicate();
          break;

        case "PUSH_SENTINEL":
          pubClient = new Redis(config.push.sentinalOptions);
          subClient = pubClient.duplicate();
          break;

        default:
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
            legacyMode: true,
          } as RedisClientOptions);
          subClient = pubClient.duplicate();
      }

      await Promise.all([pubClient.connect?.(), subClient.connect?.()]);

      const svSio = new SioService();
      svSio.run(io, pubClient, subClient);
    }

    /**
     * ============================================================
     * WEBSOCKET SERVER (RAW WSS)
     * ============================================================
     */
    if (config.pushService?.wss?.enabled && httpServer) {
      const wss = new WebsocketService();
      wss.run(httpServer);
    }

    /**
     * ============================================================
     * PUSHER ENDPOINTS (OPTIONAL)
     * ============================================================
     */
    if (config.pushService?.pusher?.enabled) {
      app.post("/notify", async (req, res) => {
        const { message, channel, event } = req.body;
        await pusher.trigger(channel, event, { message });
        res.status(200).send("Notification sent");
      });
    }

    this.logger.logInfo("Main.run() :: completed");
  }
}
```

/////////////////////////////////////
Below is the main.ts before you worked on it.
I have also included the structure of .env
Note that thre was considerations for:

- run in api mode (port 3001)
- run in sio mode (port 3002)
  Either of the above can run in http or https mode via SECURE settings in the .env file
  To run on sio mode, the switch is in config.ts:
  // config.pushService.sio.enabled
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

```ts
// basic imports

import config from "./config";
// import express from 'express';
import express, { Application, Request, Response } from "express";
import cors from "cors";
import "reflect-metadata";

// database imports
import { MysqlDataSource as ds } from "./CdApi/sys/base/data-source";

// corpdesk engine imports
import { CdInit } from "./CdApi/init";

// push server imports
import { createClient, RedisClientOptions } from "redis";
import { createAdapter } from "@socket.io/redis-adapter";
import { createServer } from "http";
import { createServer as createHttpServer } from "http";
import https from "https";
import { createServer as createHttpsServer } from "https";
import fs from "fs";
import path from "path";
import * as WebSocket from "ws";
import { server as WebSocketServer } from "websocket";
import { Server, Socket } from "socket.io";
import Redis from "ioredis";
import { SioService } from "./CdApi/sys/cd-push/services/sio.service";
import { Logging } from "./CdApi/sys/base/winston.log";
import { WebsocketService } from "./CdApi/sys/cd-push/services/websocket.service";
import pusher from "./CdApi/sys/cd-push/services/pusher";
import { getRedisClient } from "./CdApi/sys/base/redis-client";

export class Main {
  logger: Logging;
  allowedOrigins = [config.Cors.options.origin[5]];
  constructor() {
    this.logger = new Logging();
  }
  async run() {
    this.logger.logInfo("Main::run()/01");
    // this.logger.logInfo('Main::run()/config.keyPath', {keyPath: config.keyPath} )
    // this.logger.logInfo('Main::run()/config.certPath', {certPath: config.certPath} )
    // this.logger.logInfo('Main::run()/config.caPath', {caPath: config.caPath} )
    // basic settings
    const app: Application = express();

    // Serve .well-known directory for Let's Encrypt validation
    // app.use('/.well-known/acme-challenge', express.static(path.join(__dirname, '.well-known/acme-challenge')));

    const privateKey = fs.readFileSync(config.keyPath, "utf8");
    const certificate = fs.readFileSync(config.certPath, "utf8");

    let certAuth = "";
    // just in case certificate authority is not provided
    if (config.caPath.length > 0) {
      certAuth = fs.readFileSync(config.caPath, "utf8");
    } else {
      certAuth = null;
    }

    const credentials = {
      key: privateKey,
      cert: certificate,
      // ca: certAuth
    };

    const options = config.Cors.options;

    ////////////////////////////////////////////////////////////////////////////////
    const corsOptions = {
      origin: config.Cors.options.origin[3], // Replace with your client URL
      // origin: 'http://localhost', // for localhost teting
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    };
    ////////////////////////////////////////////////////////////////////////////////

    let httpsServer = null;
    let corsOpts = null;

    //////////////////////////////////////////////////////////////////////////////
    app.use(cors(corsOptions));
    app.use(express.json()); // For parsing application/json
    app.options("*", cors(corsOptions)); // Enable pre-flight across-the-board
    //////////////////////////////////////////////////////////////////////////////

    // Serve .well-known directory for Let's Encrypt validation
    // To test: curl http://localhost:8080/.well-known/acme-challenge/test-file -v
    app.use(
      config.http.webroot,
      express.static(path.join(__dirname, config.http.webroot))
    );

    // Create HTTP server
    const httpServer = createHttpServer(app);

    // Create HTTPS server
    httpsServer = https.createServer(credentials, app);
    corsOpts = {
      cors: {
        options: config.Cors.options.allowedHeaders,
        origin: config.Cors.options.origin,
      },
    };

    /**
     * When run on sio mode in production,
     * use SSL
     * use cors
     */
    if (config.pushService.sio.enabled) {
      this.logger.logInfo("Main::run()/02");

      // const io = new Server(httpsServer, corsOpts);
      /////////////////////////////////////////////////////
      const io = new Server(httpsServer, {
        cors: {
          origin: config.Cors.options.origin[5],
          methods: ["GET", "POST"],
          credentials: true,
        },
      });
      /////////////////////////////////////////////////////

      this.logger.logInfo("Main::run()/03");
      this.logger.logInfo("Main::run()/config.push.mode:", {
        mode: config.push.mode,
      });
      // let pubClient = getRedisClient();
      let pubClient;
      let subClient;
      switch (config.push.mode) {
        case "PUSH_BASIC":
          this.logger.logInfo("Main::run()/031");
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
            legacyMode: true,
          } as RedisClientOptions);
          // pubClient = getRedisClient();
          subClient = pubClient.duplicate();
          break;
        case "PUSH_CLUSTER":
          this.logger.logInfo("Main::run()/032");
          pubClient = new Redis.Cluster(config.push.startupNodes);
          subClient = pubClient.duplicate();
          break;
        case "PUSH_SENTINEL":
          this.logger.logInfo("Main::run()/033");
          pubClient = new Redis(config.push.sentinalOptions);
          subClient = pubClient.duplicate();
          break;
        default:
          this.logger.logInfo("Main::run()/034");
          pubClient = createClient({
            host: config.push.redisHost,
            port: config.push.redisPort,
          } as RedisClientOptions);
          // pubClient = getRedisClient();
          subClient = pubClient.duplicate();
          break;
      }

      Promise.all([pubClient, subClient]).then(() => {
        this.logger.logInfo("Main::run()/035");
        const svSio = new SioService();
        svSio.run(io, pubClient, subClient);
      });
      ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    }

    /**
     * When run on app mode in production,
     * use without SSL...but behind nginx proxy server fitted with SSL
     * do not use cors...but set it at nginx
     */
    if (config.apiRoute === "/api" && config.secure === "false") {
      console.log("main/04");
      httpsServer = createServer(app);
      corsOpts = {
        cors: {
          options: config.Cors.options.allowedHeaders,
          origin: null,
        },
      };
    }

    // app.all('*', function (req, res, next) {
    //     // res.header('Access-Control-Allow-Origin', 'URLs to trust of allow');
    //     res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    //     res.header('Access-Control-Allow-Headers', 'Content-Type');
    //     if ('OPTIONS' == req.method) {
    //         res.sendStatus(200);
    //     } else {
    //         next();
    //     }
    // });

    app.post("/sio/p-reg/", async (req: any, res: any) => {
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      );
      CdInit(req, res);
    });

    // set api entry point
    app.post(config.apiRoute, async (req: any, res: any) => {
      console.log("app.post/01");
      res.setHeader("Content-Type", "application/json");
      ////////////////////
      // res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,HEAD,OPTIONS,POST,PUT"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
      );
      CdInit(req, res, ds);
    });

    if (config.pushService.pusher.enabled) {
      app.post("/notify", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const { message, channel, event } = req.body;
        // this.logger.logInfo("message:", message)
        pusher
          .trigger(channel, event, {
            message: "hello from server on '/notify'",
          })
          .then(() => res.status(200).send("Notification sent from '/notify'"))
          .catch((err: Error) =>
            res.status(500).send(`Error sending notification: ${err.message}`)
          );
      });

      app.post("/notify-user", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const { message, userId } = req.body;
        const channel = `private-user-${userId}`;

        pusher
          .trigger(channel, "user-event", {
            message: "hello from server on '/notify-user'",
          })
          .then(() => res.status(200).send("Notification sent from '/notify'"))
          .catch((err: Error) =>
            res.status(500).send(`Error sending notification: ${err.message}`)
          );
      });

      app.post("/pusher/auth", (req: Request, res: Response) => {
        res.setHeader("Access-Control-Allow-Credentials", "true");
        res.setHeader(
          "Access-Control-Allow-Methods",
          "GET,HEAD,OPTIONS,POST,PUT"
        );
        res.setHeader(
          "Access-Control-Allow-Headers",
          "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
        );
        const socketId = req.body.socket_id;
        const channel = req.body.channel_name;
        const auth = pusher.authenticate(socketId, channel);
        res.send(auth);
      });
    }

    if (config.pushService.wss.enabled) {
      console.log("main/05");
      const expressServer = app
        .listen(config.wssPort, () => {
          console.log(`server is listening on ${config.wssPort}`);
        })
        .on("error", (e) => {
          console.log(`Error:${e}`);
        });
      ///////////////////////////////////////////////////////////////////////////////////////////////////////
      // Define the WebSocket server. Here, the server mounts to the `/ws`
      // route of the Express JS server.
      const wss = new WebSocket.Server({
        server: expressServer,
        path: "/ws",
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

      // wsServer.on('request', function (request) {
      //     if (!this.originIsAllowed(request.origin)) {
      //         request.reject();
      //         console.log('Connection from origin ' + request.origin + ' rejected.');
      //         return;
      //     }

      //     const connection = request.accept(null, request.origin);
      //     console.log('Connection accepted.');

      //     connection.on('message', function (message) {
      //         if (message.type === 'utf8') {
      //             console.log('Received Message: ' + message.utf8Data);
      //             connection.sendUTF('Hello Client');
      //         }
      //     });

      //     connection.on('close', function (reasonCode, description) {
      //         console.log('Peer ' + connection.remoteAddress + ' disconnected.');
      //     });
      // });
    } else {
      if (config.http.enabled) {
        // Start HTTP server (for Let's Encrypt and optional redirect to HTTPS)
        httpServer
          .listen(config.http.port, () => {
            this.logger.logInfo(
              `HTTP server listening on port ${config.http.port}`
            );
          })
          .on("error", (e) => {
            this.logger.logError(`HTTP server: listen()/Error: ${e}`);
          });
      }

      // start server
      httpsServer
        .listen(config.apiPort, () => {
          // console.log(`cd-api server is listening on ${config.apiPort}`);
          this.logger.logInfo(`cd-api server is listening on:`, {
            port: `${config.apiPort}`,
          });
        })
        .on("error", (e) => {
          this.logger.logError(`cd-api server: listen()/Error:${e}`);
        });
    }
  }

  originIsAllowed(origin: string) {
    return this.allowedOrigins.includes(origin);
  }
}
```

// .env

```sh
# http port for runnint webroot without SSL. Used by letsencrypt validation and automation
HTTP_PORT=8080
HTTP_ENABLED=true
HTTP_WEBROOT="/.well-known/acme-challenge"
# using ssl?
SECURE="false"
# can be sio (socket.io) or wss (websocket)
PUSH_MODE="PUSH_BASIC"
# API_HOST_NAME="asdap.africa"
API_HOST_NAME="localhost"
# API_HOST_IP="146.190.165.51"
API_HOST_IP="127.0.0.1"
API_PORT=3001
API_URL="https://localhost"
API_ROUTE="/api"
WSS_PORT=3003
ORIGIN_URL="https://localhost"
ORIGIN_URL_1="https://asdap.africa"
ORIGIN_URL_2="http://localhost"
ORIGIN_PORT=443

# mysql dev
DB_MS_CONN_NAME="mysql"
DB_MS_HOST="localhost"
DB_MS_USER="cd"
DB_MS_PORT="3306"
DB_MS_PWD="ml******jA"
DB_MS_NAME="cd1213"

# sqlight dev
DB_SL_CONN_NAME="sqlight"
DB_SL_HOST="localhost"
DB_SL_USER="cd"
DB_SL_PORT="3306"
DB_SL_PWD="mlx******jA"
DB_SL_NAME="cd1213"

DB_REDIS_HOST="localhost"
DB_REDIS_PORT="6379"

CACHE_TTL="3600"
SIO_HOST="localhost"
NODE_ENV="development"
LOG_LEVEL="debug"
TZ = "Africa/Nairobi"
LOCALE="en-US"

KEY_PATH="/home/emp-12/.ssl/key.pem"
CERT_PATH="/home/emp-12/.ssl/cert.pem"
CSR_PATH=""
# KEY_PATH="/etc/letsencrypt/live/cd-api.co.ke/privkey.pem"
# CERT_PATH="/etc/letsencrypt/live/cd-api.co.ke/cert.pem"
# CA_PATH="/etc/letsencrypt/live/cd-api.co.ke/chain.pem"
USER_ACTIVATION_URL="https******ccount/home"
EMAIL_ADDRESS="corpd******l.com"
EMAIL_USERNAME="cor******ail.com"
EMAIL_PASSWORD="Mw6u******S8a"
EMAIL_ASDAP_PASS="W?Q******8f"
MAIL_ZEPTO_API_KEY="Zoho-enczapi******skmJjFM8h+g=="

# https://www.back4app.com // geographical database
B4A_URL="https://parseapi.back4app.com"
# This is app's application id
X_Parse_Application_Id='NATJ******PKu9Gw8'
# This is app's REST API key
X_Parse_REST_API_Key='egoi5uSuqG******mWndUQ9'

```

/////////////////////////////////////
Currnt state of application launch:

- The splash screen runs ok
- When the main page is meant to load, only logo, its label (Corpdesk Shell) is visible. Without the background. The rest of the page is empty.
  As if only the header is visible but the rest of the page is on 'hide'.
- I have shared the html that the <body> is rendering
- Main.run() is also shared together with its logs for reference.

```ts
export class Main {
  async run() {
    //---------------------------------------
    // SPLASH
    //---------------------------------------
    await this.showSplash();

    this.logger.setLevel("debug");
    this.logger.debug("Main.run() started");

    //---------------------------------------
    // STEP 0: Load static shell config
    //---------------------------------------
    const staticShellConfig = await this.svConfig.loadConfig();

    //---------------------------------------
    // STEP 1: Init SysCache
    //---------------------------------------
    this.svSysCache = SysCacheService.getInstance(this.svConfig);
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cache (includes envConfig + consumerGuid)
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();

    //---------------------------------------
    // STEP 3: ANON LOGIN (consumer context)
    //---------------------------------------
    await this.loginAnonUser();

    //---------------------------------------
    // STEP 4: Resolve shell config (consumer-aware)
    //---------------------------------------
    const shellConfig = await this.svConfig.resolveShellConfig();

    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 5: Apply UI-System + Theme
    //---------------------------------------
    await this.applyStartupUiSettings(shellConfig);

    //---------------------------------------
    // STEP 6: Theme config (logo, title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 7: Continue normal bootstrap
    //---------------------------------------
    await this.bootstrapUi(shellConfig);

    //---------------------------------------
    // READY
    //---------------------------------------
    this.appReady = true;
    this.tryHideSplash();
    this.logger.debug("Main.run() complete");
  }
}
```

```html
<body>
  <div id="cd-root" style="visibility: visible;">
    <header id="cd-header">
      <button id="cd-burger" aria-label="Menu toggle">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
      </button>

      <img id="cd-logo" alt="Logo" src="/themes/default/logo.png" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar"></aside>
      <main id="cd-main-content"></main>
    </div>
  </div>

  <script
    src="/assets/ui-systems/material-design/material-components-web.min.js"
    async=""
    data-cd-uisystem="material-design"
    data-cd-origin="ui-system"
  ></script>
</body>
```

```log
[UiSystemAdapterRegistry] register: bootstrap-502
Object {  }
index-v8oJYEnk.js:48:11502
[Bootstrap538AdapterService] constructor() index-v8oJYEnk.js:48:12619
[UiSystemAdapterRegistry] register: bootstrap-538
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-v8oJYEnk.js:48:11502
[MaterialDesignAdapter] constructor() index-v8oJYEnk.js:48:16896
[UiSystemAdapterRegistry] register: material-design
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet [], mdcInitQueued: false, mdcInstances: Set [] }
index-v8oJYEnk.js:48:11502
[Bootstrap538AdapterService] constructor() index-v8oJYEnk.js:48:12619
[MaterialDesignAdapter] constructor() index-v8oJYEnk.js:48:16896
start 1 index-v8oJYEnk.js:57:14777
[SHELL] [DEBUG] [Main] init(): starting index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-v8oJYEnk.js:48:1132
[ModuleService][constructor]: starting index-v8oJYEnk.js:48:3582
[ModuleService] Running under Vite (browser). index-v8oJYEnk.js:48:3655
[ConfigService] loaded config:
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-v8oJYEnk.js:52:14503
[SHELL] [DEBUG] [Main] init(): completed index-v8oJYEnk.js:48:1132
[ConfigService] loaded config:
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-v8oJYEnk.js:52:14503
[SHELL] [DEBUG] [Splash] loading
Object { path: "/splashscreens/corpdesk-default.html", minDuration: 3400 }
index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] Main.run() started index-v8oJYEnk.js:48:1132
[SysCacheService] 01: Starting Eager Load index-v8oJYEnk.js:48:9211
[UiSystemLoaderService] Registered UI Systems:
Array(3) [ "bootstrap-502", "bootstrap-538", "material-design" ]
index-v8oJYEnk.js:52:8420
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-502/descriptor.json index-v8oJYEnk.js:52:8552
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-v8oJYEnk.js:52:8552
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-v8oJYEnk.js:52:8552
[UiThemeLoaderService][fetchAvailableThemes] start
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-v8oJYEnk.js:52:16730
[SysCacheService] Load complete. index-v8oJYEnk.js:48:10532
[SHELL] [DEBUG] [Main.loginAnonUser] Performing anon login index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Main.loginAnonUser] consumerGuid B0B3DA99-1859-A499-90F6-1E3F69575DCD index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [UserService.login] attempting login
Object { user: "anon", consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD" }
index-v8oJYEnk.js:48:1132
[HttpService] proc() → profile: cdApiLocal, endpoint: http://localhost:3001/api index-v8oJYEnk.js:57:8531
[HttpService] Initialized Axios instance [cdApiLocal] → http://localhost:3001/api index-v8oJYEnk.js:57:7301
[HttpService] Request Config:
Object { method: "POST", url: "http://localhost:3001/api", data: {…} }
index-v8oJYEnk.js:57:7301
[SHELL] [DEBUG] [UserService.login] res:
Object { res: {…} }
index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Main.loginAnonUser] anon login success index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Main] Applying startup UI settings
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-v8oJYEnk.js:48:1132
[CSS-DIAG] [UiSystemLoaderService.activate] START
Object { id: "material-design" }
index-v8oJYEnk.js:48:11365
[UiSystemLoaderService.activate] descriptorFromCache:
Object { id: "material-design", name: "Material Components Web", version: "1.0.0", description: "Material Components Web (MDC) UI System for Corpdesk. Provides mdc classes and theme support.", cssUrl: "/assets/ui-systems/material-design/material-components-web.min.css", jsUrl: "/assets/ui-systems/material-design/material-components-web.min.js", assetPath: "/assets/ui-systems/material-design", stylesheets: (1) […], scripts: (1) […], themesAvailable: (2) […], … }
index-v8oJYEnk.js:52:9657
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS
Object {  }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css", jsPath: "/assets/ui-systems/material-design/material-components-web.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design", resolved: "http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css", order: (2) […] }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED
Object { jsPath: "/assets/ui-systems/material-design/material-components-web.min.js" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [MaterialDesignAdapter] activate() START
Object { id: "material-design" }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] Loaded conceptMappings:
Object { button: {…}, card: {…}, input: {…}, formGroup: {…} }
index-v8oJYEnk.js:48:17104
[MaterialDesignAdapter] mapAll() — START index-v8oJYEnk.js:52:7168
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 0 }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 0 }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 0 }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] mapAll() — END index-v8oJYEnk.js:52:7438
[CSS-DIAG] [MaterialDesignAdapter] MutationObserver ATTACH
Object {  }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [MaterialDesignAdapter] activate() COMPLETE
Object { active: "material-design" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER ACTIVATED
Object { id: "material-design" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE
Object { activeSystem: "material-design" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start
Object { themeId: "dark" }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] loaded
Object { themeId: "dark", cssPath: "/themes/dark/theme.css" }
index-v8oJYEnk.js:48:11365
ThemeService::loadThemeConfig(default) index-v8oJYEnk.js:48:1597
[SHELL] [DEBUG] [Splash] waiting
Object { splashAnimDone: false, appReady: true }
index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] Main.run() complete index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Splash] animation completed index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Splash] conditions met → hiding splash index-v8oJYEnk.js:48:1132
[SHELL] [DEBUG] [Splash] removed, app revealed index-v8oJYEnk.js:48:1132
[MaterialDesignAdapter] mapAll() — START index-v8oJYEnk.js:52:7168
[MaterialDesignAdapter] getMapping('button') =
Object { class: "mdc-button mdc-button--raised" }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapButtons()
Object { count: 0 }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] getMapping('input') =
Object { class: "mdc-text-field__input", attrs: {} }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapInputs()
Object { candidates: 0 }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] getMapping('formGroup') =
Object { class: "mdc-form-field" }
index-v8oJYEnk.js:48:18446
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups()
Object { count: 0 }
index-v8oJYEnk.js:48:11365
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts()
Object { concepts: (1) […] }
index-v8oJYEnk.js:48:11365
[MaterialDesignAdapter] mapAll() — END index-v8oJYEnk.js:52:7438
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1069:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css
Source Map URL: material-components-web.min.css.map
```

///////////////////////////////////////////
You can consider the following:
Remember:

1. we had broken down the lengthy method into helper methods.
   If you can review below how the sidebar was setup with menu data plus how the main content was initiated, they could be the missing logics.
2. The other thing we did is to make the method that was responsible for loading config to now 'resolve' the data source for the config. This was not to interfere with the flow. The flow should be assumed to be the save as earlier except for note no. 1 above.

// earlier code showing how sidebar and main content pages were filled up

```ts
export class Main {
  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    await this.showSplash(); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load shell config
    //---------------------------------------
    const shellConfig: IShellConfig = await this.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }

          if (item.children) item.children = recursive(item.children);
          return item;
        });

      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );
      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);
      applyMobileState();
    }

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.appReady = true;
    this.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }
}
```

//////////////////////////////////////////////////
Below is the current state of Main.
Notice, we had a stub for what is currntly missing.
YOu can integrate what is your recomendation into the existing and produce a full Main.
If there is any new method destined for another class host, you can mention.

```ts
import "reflect-metadata"; // MUST BE FIRST IMPORT
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { IConsumerProfile } from "./CdShell/sys/moduleman/models/consumer.model";
import {
  IUserProfile,
  IUserShellConfig,
  UserModel,
} from "./CdShell/sys/cd-user/models/user.model";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";

export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  private logger = new LoggerService();

  private splashAnimDone = false;
  private appReady = false;

  private svUser = new UserService();

  public consumerProfile: IConsumerProfile | null = null;
  public userProfile: IUserProfile | null = null;

  constructor() {
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svTheme = new ThemeService();
    // this.svUiThemeLoader = new UiThemeLoaderService(this.svSysCache);

    // ✅ Load shell config and apply log level
    const shellConfig = await this.svConfig.loadConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    //---------------------------------------
    // SPLASH
    //---------------------------------------
    await this.showSplash();

    this.logger.setLevel("debug");
    this.logger.debug("Main.run() started");

    //---------------------------------------
    // STEP 0: Load static shell config
    //---------------------------------------
    const staticShellConfig = await this.svConfig.loadConfig();

    //---------------------------------------
    // STEP 1: Init SysCache
    //---------------------------------------
    this.svSysCache = SysCacheService.getInstance(this.svConfig);
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cache (includes envConfig + consumerGuid)
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();

    //---------------------------------------
    // STEP 3: ANON LOGIN (consumer context)
    //---------------------------------------
    await this.loginAnonUser();

    //---------------------------------------
    // STEP 4: Resolve shell config (consumer-aware)
    //---------------------------------------
    const shellConfig = await this.svConfig.resolveShellConfig();

    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 5: Apply UI-System + Theme
    //---------------------------------------
    await this.applyStartupUiSettings(shellConfig);

    //---------------------------------------
    // STEP 6: Theme config (logo, title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 7: Continue normal bootstrap
    //---------------------------------------
    await this.bootstrapUi(shellConfig);

    //---------------------------------------
    // READY
    //---------------------------------------
    this.appReady = true;
    this.tryHideSplash();
    this.logger.debug("Main.run() complete");
  }

  // ===================================================================
  // LOGIN
  // ===================================================================
  private async loginAnonUser(): Promise<void> {
    this.logger.debug("[Main.loginAnonUser] Performing anon login");

    const consumerGuid = this.svSysCache.getConsumerGuid();
    this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);

    if (!consumerGuid) {
      this.logger.warn(
        "[Main.loginAnonUser] No consumerGuid → skipping anon login"
      );
      return;
    }

    const anonUser: UserModel = {
      userName: "anon",
      password: "-",
    };

    const resp = await this.svUser.login(anonUser, consumerGuid);

    if (!resp) {
      this.logger.warn(
        "[Main.loginAnonUser] anon login failed → continuing with static shell config"
      );
      return;
    }

    this.logger.debug("[Main.loginAnonUser] anon login success");

    this.consumerProfile = resp.data.consumer.consumerProfile || null;
    this.userProfile = resp.data.userData.userProfile || null;
  }

  private async bootstrapUi(shellConfig: IUserShellConfig) {
    // This method contains your existing:
    // - menu preparation
    // - sidebar rendering
    // - default controller loading
    // - mobile UX wiring
    // (unchanged — omitted here for brevity)
  }

  // // ===================================================================
  // // UI BOOTSTRAP (existing logic preserved)
  // // ===================================================================

  private async applyStartupUiSettings(
    shellConfig: IUserShellConfig
  ): Promise<void> {
    const uiConfig = shellConfig.uiConfig;
    if (!uiConfig) return;

    this.logger.debug("[Main] Applying startup UI settings", uiConfig);

    // ---------------------------------------
    // 1. Activate UI System
    // ---------------------------------------
    if (uiConfig.defaultUiSystemId) {
      await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
    }

    // ---------------------------------------
    // 2. Apply Theme (CSS-level)
    // ---------------------------------------
    if (uiConfig.defaultThemeId) {
      await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
    }

    // ---------------------------------------
    // 3. Apply Form Variant
    // ---------------------------------------
    if (uiConfig.defaultFormVariant) {
      await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
    }
  }

  async showSplash(): Promise<void> {
    return new Promise(async (resolve) => {
      const splash = document.getElementById("cd-splash");
      if (!splash) return resolve();

      const shellConfig = await this.svConfig.resolveShellConfig();
      const path = shellConfig.splash?.path;
      const minDuration = shellConfig.splash?.minDuration ?? 3000;

      this.logger.debug("[Splash] loading", { path, minDuration });

      const html = await fetch(path).then((r) => r.text());
      splash.innerHTML = html;
      splash.style.display = "block";

      // Animation latch
      setTimeout(() => {
        this.logger.debug("[Splash] animation completed");
        this.splashAnimDone = true;
        this.tryHideSplash();
      }, minDuration);

      resolve();
    });
  }

  private async tryHideSplash() {
    if (!this.splashAnimDone || !this.appReady) {
      this.logger.debug("[Splash] waiting", {
        splashAnimDone: this.splashAnimDone,
        appReady: this.appReady,
      });
      return;
    }

    this.logger.debug("[Splash] conditions met → hiding splash");
    await this.hideSplash();
  }

  async hideSplash(): Promise<void> {
    return new Promise<void>((resolve) => {
      const splash = document.getElementById("cd-splash");
      const root = document.getElementById("cd-root");

      if (!splash) return resolve();

      const container = splash.querySelector(
        "#splash-container"
      ) as HTMLElement;
      container?.classList.add("fade-out");

      setTimeout(() => {
        splash.remove();
        if (root) root.style.visibility = "visible";
        this.logger.debug("[Splash] removed, app revealed");
        resolve();
      }, 800);
    });
  }
}
```

////////////////////////////////////
We are now having the page rendered.
But there are a few formating issues.
1. sidebar is appearing as a row after the header before cd-main-content
2. Earlier the background for the header was blue. It is now just blackish
3. The background for sidbar was dark but slightly lighter than the conten area. Now they are equally dark
4. The login form is now not 100% as earlier but shorter and centralized.
In short, there could be some css issue.
We have not changed any logic or css values, there must be flow issue that is resulting in css undesired effect.

```html
<body>
  <div id="cd-root" style="visibility: visible;">
    <header id="cd-header">
      <button id="cd-burger" aria-label="Menu toggle">
        <span class="bar top"></span>
        <span class="bar middle"></span>
        <span class="bar bottom"></span>
      </button>

      <img id="cd-logo" alt="Logo" src="/themes/default/logo.png" />
      <span id="cd-app-name">Corpdesk Shell</span>
    </header>

    <div id="cd-layout">
      <div id="cd-overlay" class="hidden"></div>
      <aside id="cd-sidebar">
        <ul class="metismenu" id="menu">
          <li
            id="menu-item-menu-item-cd-user"
            class=""
            data-id="menu-item-cd-user"
            data-type="route"
            data-route="sys/cd-user"
            tabindex="0"
            role="button"
          >
            <a
              href="#"
              class="cd-menu-link has-arrow mm-collapsed"
              data-id="menu-item-cd-user"
              aria-expanded="false"
              ><span class="cd-menu-label">cd-user</span
              ><i class="menu-arrow fa-solid fa-chevron-right"></i
            ></a>
            <ul class="mm-collapse" style="">
              <li
                id="menu-item-menu-item-cd-user-sign-in"
                class=""
                data-id="menu-item-cd-user-sign-in"
                data-type="route"
                data-route="sys/cd-user/sign-in"
                tabindex="0"
                role="button"
              >
                <a
                  href="/sys/cd-user/sign-in"
                  class="cd-menu-link"
                  data-id="menu-item-cd-user-sign-in"
                  ><span class="cd-menu-label">sign-in</span></a
                >
              </li>

              <li
                id="menu-item-menu-item-cd-user-sign-up"
                class=""
                data-id="menu-item-cd-user-sign-up"
                data-type="route"
                data-route="sys/cd-user/sign-up"
                tabindex="0"
                role="button"
              >
                <a
                  href="/sys/cd-user/sign-up"
                  class="cd-menu-link"
                  data-id="menu-item-cd-user-sign-up"
                  ><span class="cd-menu-label">sign-up</span></a
                >
              </li>
            </ul>
          </li>

          <li
            id="menu-item-menu-item-cd-admin"
            class=""
            data-id="menu-item-cd-admin"
            data-type="route"
            data-route="sys/cd-admin"
            tabindex="0"
            role="button"
          >
            <a
              href="#"
              class="cd-menu-link has-arrow mm-collapsed"
              data-id="menu-item-cd-admin"
              aria-expanded="false"
              ><span class="cd-menu-label">cd-admin</span
              ><i class="menu-arrow fa-solid fa-chevron-right"></i
            ></a>
            <ul class="mm-collapse" style="">
              <li
                id="menu-item-menu-item-cd-admin-settings"
                class=""
                data-id="menu-item-cd-admin-settings"
                data-type="route"
                data-route="sys/cd-admin/settings"
                tabindex="0"
                role="button"
              >
                <a
                  href="/sys/cd-admin/settings"
                  class="cd-menu-link"
                  data-id="menu-item-cd-admin-settings"
                  ><span class="cd-menu-label">settings</span></a
                >
              </li>
            </ul>
          </li>
        </ul>
      </aside>
      <main id="cd-main-content">
        <form id="signInForm" class="cd-form">
          <label
            class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded"
            data-md-transformed="1"
            style="--mdc-ripple-fg-size: 288px; --mdc-ripple-fg-scale: 1.7126931456154395; --mdc-ripple-fg-translate-start: -63px, -117px; --mdc-ripple-fg-translate-end: 96px, -116px;"
            ><span class="mdc-text-field__ripple"></span
            ><span class="mdc-floating-label" for="userName">Username</span
            ><input
              id="userName"
              name="userName"
              cdformcontrol=""
              placeholder=""
              class="mdc-text-field__input cd-valid" /><span
              class="mdc-line-ripple"
              style="transform-origin: 81px center 0px;"
            ></span
          ></label>

          <label
            class="mdc-text-field mdc-text-field--filled cd-md-text-field mdc-ripple-upgraded"
            data-md-transformed="1"
            ><span class="mdc-text-field__ripple"></span
            ><span class="mdc-floating-label" for="password">Password</span
            ><input
              id="password"
              name="password"
              type="password"
              cdformcontrol=""
              placeholder=""
              class="cd-valid mdc-text-field__input" /><span
              class="mdc-line-ripple"
            ></span
          ></label>

          <button cdbutton="" class="mdc-button mdc-button--raised">
            Sign In
          </button>
        </form>
      </main>
    </div>
  </div>

  <script
    src="/assets/ui-systems/material-design/material-components-web.min.js"
    async=""
    data-cd-uisystem="material-design"
    data-cd-origin="ui-system"
  ></script>
</body>
```

```log
[UiSystemAdapterRegistry] register: bootstrap-502 
Object {  }
index-B5BK6woa.js:15:23109
[Bootstrap538AdapterService] constructor() index-B5BK6woa.js:15:24226
[UiSystemAdapterRegistry] register: bootstrap-538 
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-B5BK6woa.js:15:23109
[MaterialDesignAdapter] constructor() index-B5BK6woa.js:15:28503
[UiSystemAdapterRegistry] register: material-design 
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet(3), mdcInitQueued: false, mdcInstances: Set(2) }
index-B5BK6woa.js:15:23109
[Bootstrap538AdapterService] constructor() index-B5BK6woa.js:15:24226
[MaterialDesignAdapter] constructor() index-B5BK6woa.js:15:28503
start 1 index-B5BK6woa.js:57:4988
[ModuleService][constructor]: starting index-B5BK6woa.js:15:15479
[ModuleService] Running under Vite (browser). index-B5BK6woa.js:15:15552
[SHELL] [DEBUG] [Main] init(): starting index-B5BK6woa.js:15:13029
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-B5BK6woa.js:19:14500
[SHELL] [DEBUG] [Main] init(): completed index-B5BK6woa.js:15:13029
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-B5BK6woa.js:19:14500
[SHELL] [DEBUG] Main.run() started index-B5BK6woa.js:15:13029
[SysCacheService] 01: Starting Eager Load index-B5BK6woa.js:15:20818
[UiSystemLoaderService] Registered UI Systems: 
Array(3) [ "bootstrap-502", "bootstrap-538", "material-design" ]
index-B5BK6woa.js:19:8417
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-502/descriptor.json index-B5BK6woa.js:19:8549
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-B5BK6woa.js:19:8549
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-B5BK6woa.js:19:8549
[UiThemeLoaderService][fetchAvailableThemes] start 
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-B5BK6woa.js:19:16727
[SysCacheService] Load complete. index-B5BK6woa.js:15:22139
[SHELL] [DEBUG] [UserService.login] attempting login 
Object { user: "anon", consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD" }
index-B5BK6woa.js:15:13029
[HttpService] proc() → profile: cdApiLocal, endpoint: http://localhost:3001/api index-B5BK6woa.js:33:6447
[HttpService] Initialized Axios instance [cdApiLocal] → http://localhost:3001/api index-B5BK6woa.js:33:5217
[HttpService] Request Config: 
Object { method: "POST", url: "http://localhost:3001/api", data: {…} }
index-B5BK6woa.js:33:5217
[SHELL] [DEBUG] [UserService.login] res: 
Object { res: {…} }
index-B5BK6woa.js:15:13029
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "material-design" }
index-B5BK6woa.js:15:22972
[UiSystemLoaderService.activate] descriptorFromCache: 
Object { id: "material-design", name: "Material Components Web", version: "1.0.0", description: "Material Components Web (MDC) UI System for Corpdesk. Provides mdc classes and theme support.", cssUrl: "/assets/ui-systems/material-design/material-components-web.min.css", jsUrl: "/assets/ui-systems/material-design/material-components-web.min.js", assetPath: "/assets/ui-systems/material-design", stylesheets: (1) […], scripts: (1) […], themesAvailable: (2) […], … }
index-B5BK6woa.js:19:9654
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css", jsPath: "/assets/ui-systems/material-design/material-components-web.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design", resolved: "http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css", order: (2) […] }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED 
Object { jsPath: "/assets/ui-systems/material-design/material-components-web.min.js" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] activate() START 
Object { id: "material-design" }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] Loaded conceptMappings: 
Object { button: {…}, card: {…}, input: {…}, formGroup: {…} }
index-B5BK6woa.js:15:28711
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[CSS-DIAG] [MaterialDesignAdapter] MutationObserver ATTACH 
Object {  }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] activate() COMPLETE 
Object { active: "material-design" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER ACTIVATED 
Object { id: "material-design" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE 
Object { activeSystem: "material-design" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start 
Object { themeId: "dark" }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] loaded 
Object { themeId: "dark", cssPath: "/themes/dark/theme.css" }
index-B5BK6woa.js:15:22972
ThemeService::loadThemeConfig(default) index-B5BK6woa.js:15:13494
[SHELL] [DEBUG] [Main] bootstrapUi(): start index-B5BK6woa.js:15:13029
[ModuleService][constructor]: starting index-B5BK6woa.js:15:15479
[ModuleService] Running under Vite (browser). index-B5BK6woa.js:15:15552
[Preload] Loading dev-sync index-B5BK6woa.js:15:17822
ModuleService::loadModule()/01: index-B5BK6woa.js:15:18460
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-B5BK6woa.js:15:18624
[ModuleService] 1 index-B5BK6woa.js:15:18684
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-B5BK6woa.js:15:18961
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-B5BK6woa.js:15:19120
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-B5BK6woa.js:15:19179
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-B5BK6woa.js:15:19331
[ModuleService] Loaded 'dev-sync' (Vite mode) at 19/12/2025, 19:04:58 index-B5BK6woa.js:15:19419
[Preload] Controller component 'IdeAgentService' not found in module dev-sync. index-B5BK6woa.js:15:18118
[Preload] Completed IdeAgentService index-B5BK6woa.js:15:18217
[Preload] Loading dev-sync index-B5BK6woa.js:15:17822
ModuleService::loadModule()/01: index-B5BK6woa.js:15:18460
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-B5BK6woa.js:15:18624
[ModuleService] 1 index-B5BK6woa.js:15:18684
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-B5BK6woa.js:15:18961
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-B5BK6woa.js:15:19120
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-B5BK6woa.js:15:19179
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-B5BK6woa.js:15:19331
[ModuleService] Loaded 'dev-sync' (Vite mode) at 19/12/2025, 19:04:58 index-B5BK6woa.js:15:19419
[Preload] Controller component 'IdeAgentClientService' not found in module dev-sync. index-B5BK6woa.js:15:18118
[Preload] Completed IdeAgentClientService index-B5BK6woa.js:15:18217
ModuleService::loadModule()/01: index-B5BK6woa.js:15:18460
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-B5BK6woa.js:15:18624
[ModuleService] 1 index-B5BK6woa.js:15:18684
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-user/view/index.js index-B5BK6woa.js:15:18961
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", isDefault: true, moduleId: "cd-user", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (2) […], menu: (1) […] }
index-B5BK6woa.js:15:19120
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…}, {…} ]
index-B5BK6woa.js:15:19179
[ModuleService] Loaded 'cd-user' (Vite mode) at 19/12/2025, 19:04:58 index-B5BK6woa.js:15:19419
ModuleService::loadModule()/01: index-B5BK6woa.js:15:18460
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-admin/view/index.js index-B5BK6woa.js:15:18624
[ModuleService] 1 index-B5BK6woa.js:15:18684
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-admin/view/index.js index-B5BK6woa.js:15:18961
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-admin", moduleName: "cd-admin", moduleGuid: "aaaa-bbbb-cccc-dddd", controllers: (1) […], menu: (1) […], isDefault: false }
index-B5BK6woa.js:15:19120
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-B5BK6woa.js:15:19179
[ModuleService] Loaded module metadata passively: cd-admin. Setup skipped. index-B5BK6woa.js:15:19331
[ModuleService] Loaded 'cd-admin' (Vite mode) at 19/12/2025, 19:04:58 index-B5BK6woa.js:15:19419
[ControllerService][findControllerInfoByRoute] controllerName: sign-in index-B5BK6woa.js:33:9124
[ControllerService][findControllerInfoByRoute] mod: ...trancated... index-B5BK6woa.js:33:9204
[ControllerService][findControllerInfoByRoute] controllerName: sign-up index-B5BK6woa.js:33:9124
[ControllerService][findControllerInfoByRoute] mod: ...trancated... index-B5BK6woa.js:33:9204
[ControllerService][findControllerInfoByRoute] controllerName: settings index-B5BK6woa.js:33:9124
[ControllerService][findControllerInfoByRoute] mod: ...trancated... index-B5BK6woa.js:33:9204
ThemeService::loadThemeConfig(default) index-B5BK6woa.js:15:13494
Starting renderMenuWithSystem() index-B5BK6woa.js:40:8129
renderMenuWithSystem()/01 index-B5BK6woa.js:40:8178
MenuService::renderPlainMenu()/menu: 
        ...trancated...
      index-B5BK6woa.js:40:8790
renderMenuWithSystem()/adapter: {"instance":null} index-B5BK6woa.js:40:8400
renderMenuWithSystem()/03 index-B5BK6woa.js:40:8588
renderMenuWithSystem()/04 index-B5BK6woa.js:40:8675
MenuService::loadResource()/start... index-B5BK6woa.js:40:10637
[MenuService][loadResource] options: 
Object { item: {…} }
index-B5BK6woa.js:40:10689
[ControllerCacheService][getInstance] start... index-B5BK6woa.js:40:6771
MenuService::loadResource()/02: Retrieving controller via cache service index-B5BK6woa.js:40:11155
[ControllerCacheService][getOrInitializeController] start... index-B5BK6woa.js:40:6919
[ControllerCacheService] Creating new instance for: sys/cd-user/sign-in index-B5BK6woa.js:40:7103
CdFormGroup::_constructor()/01 cd-directive-binder.service-DGbLY5eG.js:1:46
CdDirectiveBinderService::constructor()/start cd-directive-binder.service-DGbLY5eG.js:1:1416
[Binder] UI-System set to: material-design (via window.CD_ACTIVE_UISYSTEM) cd-directive-binder.service-DGbLY5eG.js:1:1622
[ControllerCacheService] Cached instance for sys/cd-user/sign-in index-B5BK6woa.js:40:7762
[MenuService] Waiting for controller services to initialize... attempt 1 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 2 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 3 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 4 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 5 index-B5BK6woa.js:40:11478
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[MenuService] Waiting for controller services to initialize... attempt 6 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 7 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 8 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 9 index-B5BK6woa.js:40:11478
[MenuService] Waiting for controller services to initialize... attempt 10 index-B5BK6woa.js:40:11478
MenuService::loadResource()/03: Injecting template into DOM index-B5BK6woa.js:40:11621
MenuService::loadResource()/04: Executing __activate() index-B5BK6woa.js:40:11876
[ctlSignIn][__activate] 01 index-BEx0eJtE.js:28:584
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
MenuService::loadResource()/end index-B5BK6woa.js:40:12121
[SHELL] [DEBUG] [Main] bootstrapUi(): complete index-B5BK6woa.js:15:13029
[SHELL] [DEBUG] Main.run() complete index-B5BK6woa.js:15:13029
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] Applying mapping to element: 
Object { tag: "BUTTON", mapping: {…} }
index-B5BK6woa.js:15:30270
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 2 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapInputs: FIELD #0 
Object { field: div.cd-form-field }
index-B5BK6woa.js:19:5901
[MaterialDesignAdapter] MDCTextField constructed 
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded, inst: {…} }
index-B5BK6woa.js:19:2184
[MaterialDesignAdapter] mapInputs: transformed wrapper  
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded }
index-B5BK6woa.js:19:6359
[MaterialDesignAdapter] mapInputs: FIELD #1 
Object { field: div.cd-form-field }
index-B5BK6woa.js:19:5901
[MaterialDesignAdapter] MDCTextField constructed 
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded, inst: {…} }
index-B5BK6woa.js:19:2184
[MaterialDesignAdapter] mapInputs: transformed wrapper  
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded }
index-B5BK6woa.js:19:6359
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
[MaterialDesignAdapter] mapAll() — START index-B5BK6woa.js:19:7165
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-B5BK6woa.js:15:30053
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-B5BK6woa.js:15:22972
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-B5BK6woa.js:15:22972
[MaterialDesignAdapter] mapAll() — END index-B5BK6woa.js:19:7435
Menu clicked → ID: menu-item-cd-user, Label: cd-user index-B5BK6woa.js:40:9605
MenuService:onMenuClick()/item: ...trancated... index-B5BK6woa.js:40:9672
[MenuService] Toggling menu node expansion for 'cd-admin' index-B5BK6woa.js:40:10224
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1069:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css
Source Map URL: material-components-web.min.css.map
```

/////////////////////////////////////
From your instruction:
Then call it in Main

👉 Immediately after UI + theme load

await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);

// 🔑 Reassert shell layout LAST
this.svUiSystemLoader.reapplyShellLayout();

It would mean we fix this.svUiSystemLoader.reapplyShellLayout(); in Main.applyStartupUiSettings().
If so give me the full revised Main.applyStartupUiSettings().
```ts
private async applyStartupUiSettings(
    shellConfig: IUserShellConfig
  ): Promise<void> {
    const uiConfig = shellConfig.uiConfig;
    if (!uiConfig) return;

    if (uiConfig.defaultUiSystemId) {
      await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
    }

    if (uiConfig.defaultThemeId) {
      await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
    }

    if (uiConfig.defaultFormVariant) {
      await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
    }
  }
```

////////////////////////////////////////

No change detected.
I have highliged <div id="cd-layout"> in teh inspector then copied section of the css displayed.
I hope this can help.
If there is any test that you can recommend, you can let me know so I share the result.

```css
element {
}
@layer {
  * {
    scrollbar-color: var(--darkreader-background-b0b0b0, #414648) var(--darkreader-background-f1f1f1, #222425);
  }
}
element {
  visibility: visible;
}
body, input, textarea, select, button {
  color: var(--darkreader-text--cd-color-text, var(--darkreader-text-000000, #cdcbc8));
}
body, input, textarea, select, button {
  font-family: var(--cd-bridge-body-font-family);
  font-size: var(--cd-bridge-body-font-size);
  color: var(--cd-color-text);
}
@layer {
  html, body {
    color: var(--darkreader-text-000000, #cdcbc8);
  }
}
element {
  --cd-secondary-color: #eeeeee;
  --cd-accent-color: #ff4081;
  --cd-background-color: white;
  --cd-text-color: black;
  --cd-primary-color: #007bff;
  --darkreader-bg--cd-primary-color: var(--darkreader-background-007bff, #065ab5);
  --darkreader-text--cd-primary-color: var(--darkreader-text-007bff, #3291e0);
}
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;
  --darkreader-text--cd-color-text: var(--darkreader-text-111111, #c3c1bd);
}
:root {
  --cd-bridge-body-font-family: "Roboto", "Helvetica", Arial, sans-serif;
  --cd-bridge-body-font-size: 1rem;
  --cd-color-text: #111;
}
:root {
}
```

//////////////////////////////////////////////////////////
I went back to a working version then copied the Main.run().
It could not run with latest applyStartupUiSettings(shellConfig: IUserShellConfig), which required and argument.
So I used the old version as shown below.
So this works.
But not that we still did not have the anon login fitted.
What we now need to do is to restart decomposition but one stet at a time and keep testing.
After successfull decomposition, then we can restore the anon login.
```ts
export class Main{
  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    await this.showSplash(); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load shell config
    //---------------------------------------
    const shellConfig: IShellConfig = await this.svConfig.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.applyStartupUiSettings();
    diag_css("UI-System + Theme applied");

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const allowedModules: ICdModule[] = await this.svModule.getAllowedModules();
    const defaultModule = allowedModules.find((m) => m.isDefault);
    const defaultControllerName = defaultModule?.controllers.find(
      (c) => c.default
    )?.name;

    diag_css("Modules Loaded", { allowedModules });

    const rawMenu: MenuItem[] = allowedModules.flatMap((mod) => {
      const recursive = (items: MenuItem[]): MenuItem[] =>
        items.map((item) => {
          if (item.itemType === "route" && item.route) {
            const cinfo = this.svController.findControllerInfoByRoute(
              mod,
              item.route
            );
            if (cinfo) {
              (item as any).controller = cinfo.instance;
              (item as any).template =
                typeof cinfo.template === "function"
                  ? cinfo.template
                  : () => cinfo.template;

              (item as any).moduleId = mod.moduleId;

              if (mod.isDefault && cinfo.name === defaultControllerName)
                (item as any).moduleDefault = true;
            }
          }

          if (item.children) item.children = recursive(item.children);
          return item;
        });

      return recursive(mod.menu || []);
    });

    const preparedMenu = this.svMenu.prepareMenu(rawMenu);
    diag_css("Menu prepared", preparedMenu);

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    try {
      const resTheme = await fetch(shellConfig.themeConfig.currentThemePath);
      const theme = (await resTheme.json()) as ITheme;
      this.svMenu.renderMenuWithSystem(preparedMenu, theme);

      const sidebarEl = document.getElementById("cd-sidebar");
      if (
        sidebarEl &&
        (!sidebarEl.innerHTML || sidebarEl.innerHTML.trim() === "")
      ) {
        this.svMenu.renderPlainMenu(preparedMenu, "cd-sidebar");
      }

      diag_css("Sidebar rendered");
      diag_sidebar();
    } catch (err) {
      console.error("[Main] Failed rendering menu", err);
    }

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    try {
      const defaultModuleMenu = preparedMenu.find(
        (m) => m.label === defaultModule?.moduleId
      );
      const defaultMenuItem = defaultModuleMenu?.children?.find(
        (it) => it.moduleDefault
      );

      if (defaultMenuItem) {
        await this.svMenu.loadResource({ item: defaultMenuItem });
      }

      diag_css("Default controller loaded");
    } catch (err) {
      console.warn("[Main] auto-load default view failed", err);
    }

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    const burger = document.getElementById("cd-burger");
    const sidebar = document.getElementById("cd-sidebar");
    const overlay = document.getElementById("cd-overlay");

    const isMobile = () => window.matchMedia("(max-width: 900px)").matches;

    const applyMobileState = () => {
      if (!isMobile()) {
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
        burger.classList.remove("open");
      }
    };

    if (burger && sidebar && overlay) {
      burger.addEventListener("click", () => {
        burger.classList.toggle("open");
        sidebar.classList.toggle("open");
        overlay.classList.toggle("hidden");
      });

      overlay.addEventListener("click", () => {
        burger.classList.remove("open");
        sidebar.classList.remove("open");
        overlay.classList.add("hidden");
      });

      window.addEventListener("resize", applyMobileState);
      applyMobileState();
    }

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.appReady = true;
    this.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

  // // ===================================================================
  // // UI BOOTSTRAP (existing logic preserved)
  // // ===================================================================

  // private async applyStartupUiSettings(
  //   shellConfig: IUserShellConfig
  // ): Promise<void> {
  //   const uiConfig = shellConfig.uiConfig;
  //   if (!uiConfig) return;

  //   this.logger.debug("[Main] Applying startup UI settings", uiConfig);

  //   // ---------------------------------------
  //   // 1. Activate UI System
  //   // ---------------------------------------
  //   if (uiConfig.defaultUiSystemId) {
  //     await this.svUiSystemLoader.activate(uiConfig.defaultUiSystemId);
  //   }

  //   // ---------------------------------------
  //   // 2. Apply Theme (CSS-level)
  //   // ---------------------------------------
  //   if (uiConfig.defaultThemeId) {
  //     await this.svUiThemeLoader.loadThemeById(uiConfig.defaultThemeId);
  //   }

  //   // ---------------------------------------
  //   // 3. Apply Form Variant
  //   // ---------------------------------------
  //   if (uiConfig.defaultFormVariant) {
  //     await this.svUiThemeLoader.loadFormVariant(uiConfig.defaultFormVariant);
  //   }
  // }

  /**
   * Purpose: Load UI System + Load Theme + Activate UI-System-specific logic.
   */
  async applyStartupUiSettings(): Promise<void> {
    const cfgSvc = ConfigService.getInstance();
    // ensure sys cache is ready
    await this.svSysCache.ensureReady();

    const uiConfig = this.svSysCache.get("uiConfig") as UiConfig;
    if (!uiConfig) {
      console.warn("[Main.applyStartupUiSettings] uiConfig missing");
      return;
    }

    const systemId = uiConfig.defaultUiSystemId;
    const themeId = uiConfig.defaultThemeId;

    diag_css("[MAIN.applyStartupUiSettings] start", { systemId, themeId });

    // Use singletons bound to same SysCache instance
    const uiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    const uiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);

    // 1) Activate UI system (loads CSS + JS)
    try {
      await uiSystemLoader.activate(systemId);
      diag_css("[MAIN.applyStartupUiSettings] ui-system activated", {
        systemId,
      });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] activate failed", err);
      diag_css("[MAIN.applyStartupUiSettings] activate failed", { err });
    }

    // 2) Load structural shell CSS (base + index) AFTER system to ensure layering
    try {
      await uiSystemLoader.loadCSS("/themes/common/base.css", "shell-base");
      await uiSystemLoader.loadCSS("/assets/css/index.css", "shell-index");
      diag_css("[MAIN.applyStartupUiSettings] shell CSS loaded", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] shell CSS load failed", err);
    }

    // 3) load theme override CSS
    try {
      await uiThemeLoader.loadThemeById(themeId);
      diag_css("[MAIN.applyStartupUiSettings] theme css injected", { themeId });
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] theme load failed", err);
    }

    // 4) per-system applyTheme (sets data-bs-theme, md classes, etc.)
    try {
      await uiSystemLoader.applyTheme(systemId, themeId);
      diag_css("[MAIN.applyStartupUiSettings] system applyTheme complete", {});
    } catch (err) {
      console.warn("[MAIN.applyStartupUiSettings] applyTheme failed", err);
    }

    diag_css("[MAIN.applyStartupUiSettings] done", {});
  }
}
```

/////////////////////////////////////////////
Just a reminder Main.loginAnonUser() was introduced to get and set config values from consumer and user profile.
This was then to be resolved via ConfigService.resolveShellConfig()
```ts
export class Main{
  // ===================================================================
  // LOGIN
  // ===================================================================
  private async loginAnonUser(): Promise<void> {
    this.logger.debug("[Main.loginAnonUser] Performing anon login");

    const consumerGuid = this.svSysCache.getConsumerGuid();
    this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);

    if (!consumerGuid) {
      this.logger.warn(
        "[Main.loginAnonUser] No consumerGuid → skipping anon login"
      );
      return;
    }

    const anonUser: UserModel = {
      userName: "anon",
      password: "-",
    };

    const resp = await this.svUser.login(anonUser, consumerGuid);

    if (!resp) {
      this.logger.warn(
        "[Main.loginAnonUser] anon login failed → continuing with static shell config"
      );
      return;
    }

    this.logger.debug("[Main.loginAnonUser] anon login success");

    this.consumerProfile = resp.data.consumer.consumerProfile || null;
    this.userProfile = resp.data.userData.userProfile || null;
  }
}
```

```ts
export class ConfigService{
  async resolveShellConfig(
    consumerProfile?: IConsumerProfile | null,
    userProfile?: IUserProfile | null
  ): Promise<IUserShellConfig> {
    const base = await this.loadConfig();

    // 1. Apply consumer defaults
    const withConsumer = this.applyConsumerShellConfig(
      base,
      consumerProfile?.shellConfig
    );

    // 2. Apply user overrides (if allowed)
    const final = this.applyUserShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return final;
  }
}
```

///////////////////////////////////////////////////////
Hey Chase. Now disengage from the decomposition context and focus the next issue below.
Decomposition has been test and and successful up to where we are.
We now turn special attention to implementation of ACL based configuration as opposed to just getting it from shell.config.json.
This had been done earlier but we went back to reset the decomposition: which is now done.
The integration involve placing Main.loginAnonUser() in Main.run() to set:
this.consumerProfile and this.userProfile.
We then use the data to resolve the configuration via ConfigService.resolveShellConfig()
Below are some references.

// current working state of Main.run() and Main.loginAnonUser()
```ts
export class Main{
  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    await this.showSplash(); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load shell config
    //---------------------------------------
    const shellConfig: IShellConfig = await this.svConfig.loadShellConfig();
    if (shellConfig.logLevel) this.logger.setLevel(shellConfig.logLevel);

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.bootstrapUiSystemAndTheme();

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.prepareMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.renderSidebar(preparedMenu, shellConfig);

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.loadDefaultController(preparedMenu, defaultModule);

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    this.setupMobileUx();

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.appReady = true;
    this.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

  // ===================================================================
  // LOGIN
  // ===================================================================
  private async loginAnonUser(): Promise<void> {
    this.logger.debug("[Main.loginAnonUser] Performing anon login");

    const consumerGuid = this.svSysCache.getConsumerGuid();
    this.logger.debug("[Main.loginAnonUser] consumerGuid", consumerGuid);

    if (!consumerGuid) {
      this.logger.warn(
        "[Main.loginAnonUser] No consumerGuid → skipping anon login"
      );
      return;
    }

    const anonUser: UserModel = {
      userName: "anon",
      password: "-",
    };

    const resp = await this.svUser.login(anonUser, consumerGuid);

    if (!resp) {
      this.logger.warn(
        "[Main.loginAnonUser] anon login failed → continuing with static shell config"
      );
      return;
    }

    this.logger.debug("[Main.loginAnonUser] anon login success");

    this.consumerProfile = resp.data.consumer.consumerProfile || null;
    this.userProfile = resp.data.userData.userProfile || null;
  }
}

```
// current state of resolveShellConfig()
```ts
export class ConfigService{
  async resolveShellConfig(
    consumerProfile?: IConsumerProfile | null,
    userProfile?: IUserProfile | null
  ): Promise<IUserShellConfig> {
    const base = await this.loadConfig();

    // 1. Apply consumer defaults
    const withConsumer = this.applyConsumerShellConfig(
      base,
      consumerProfile?.shellConfig
    );

    // 2. Apply user overrides (if allowed)
    const final = this.applyUserShellConfigWithPolicy(
      withConsumer,
      userProfile?.shellConfig,
      consumerProfile?.shellConfig
    );

    return final;
  }
}
```

////////////////////////////////////////
Having decomposed the Main.run(), I moved all the methods to respective associated classes.
It is now as clean as expected with only init() and run().
We now move to assessing how configurations work and whether they are conforming to the laid policy.
```ts
import "reflect-metadata"; // MUST BE FIRST IMPORT
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { diag_css } from "./CdShell/sys/utils/diagnosis";
import { IConsumerProfile } from "./CdShell/sys/moduleman/models/consumer.model";
import {
  IUserProfile,
  IUserShellConfig,
} from "./CdShell/sys/cd-user/models/user.model";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";

export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  private logger = new LoggerService();

  // private splashAnimDone = false;
  // private appReady = false;

  private svUser = new UserService();
  private consumerProfile?: IConsumerProfile;
  private userProfile?: IUserProfile;

  private resolvedShellConfig?: IUserShellConfig;

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svModule = new ModuleService();
    this.svMenu = new MenuService();
    this.svController = new ControllerService();
    this.svTheme = new ThemeService();

    // ✅ Load shell config and apply log level
    const shellConfig = await this.svConfig.loadConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    await this.svUiSystemLoader.showSplash(this.svConfig); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

    console.log("[Main.run()] baseShellConfig:", baseShellConfig);
    if (baseShellConfig.logLevel) {
      this.logger.setLevel(baseShellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 0.5: Anonymous login (ACL context)
    //---------------------------------------
    const resp = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );
    if (!resp) {
      this.logger.warn(
        "[Main] Anonymous login failed → continuing with static shell config"
      );
    } else {
      this.logger.debug("[Main] Anonymous login success");
      this.consumerProfile = resp.data.consumer.consumerProfile || null;
      this.userProfile = resp.data.userData.userProfile || null;
    }

    //---------------------------------------
    // STEP 0.6: Resolve ACL-based shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.resolveShellConfig(
      this.consumerProfile,
      this.userProfile
    );

    this.logger.debug("[Main] Shell config resolved", this.resolvedShellConfig);

    const shellConfig = this.resolvedShellConfig;

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.svUiSystemLoader.bootstrapUiSystemAndTheme(this.svSysCache);

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(this.svMenu, preparedMenu, shellConfig);

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(this.svMenu, preparedMenu, defaultModule);

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    this.svUiSystemLoader.setupMobileUx();

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.svUiSystemLoader.appReady = true;
    this.svUiSystemLoader.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

}

```

////////////////////////

All consumers who are invoking find() on sysCache.get() are encountering:
Property 'find' does not exist on type 'unknown'.ts(2339)
any

Example
```ts
getSystemById(id: string): UiSystemDescriptor | undefined {
    const available = this.sysCache.get("uiSystems") || [];
    return available.find((s: any) => s.id === id);
  }
```

////////////////////////////////////////
I have shared the set() method before and after recent type correction.
We may need to adjust the new one to conform to older requirements.
Otherwise, all the previous consumers are complaining.
Before
```ts
public set<T>(
    key: CacheKey | string,
    value: T,
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
```
After
```ts
public set<K extends CacheKey>(key: K, value: SysCacheMap[K], ): void {
    this.cache.set(key, value);
  }
```

/////////////////////////////////////////////
From the recommendations you have made, you can take a look at the current state of the SysCacheService and refactor in a way that it does not breaking changes.
We need to be able to run the system after the changes without make changes to the consumers then we can recruit subscribers pole pole with increamental process.
The system should be able to account for subscribers at any time.

```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";

export class SysCacheService {
  private static instance: SysCacheService;
  private cache = new Map<string, any>();
  private _uiSystemLoader!: UiSystemLoaderService;
  private _uiThemeLoader!: UiThemeLoaderService;

  constructor(private configService: ConfigService) {}

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

  /**
   * Loads:
   * - envConfig (NEW)
   * - uiConfig
   * - uiSystems
   * - uiSystemDescriptors
   * - themes
   * - formVariants
   * - themeDescriptors
   */
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }
    if (this.cache.size > 0) return; // already loaded

    console.log("[SysCacheService] 01: Starting Eager Load");

    // -------------------------------------------------------------------
    // 1. LOAD SHELL CONFIG
    // -------------------------------------------------------------------
    const shellConfig = await this.configService.loadConfig();

    // Extract the new envConfig block (replacing license/environment)
    const envConfig = shellConfig.envConfig || {};

    // Cache it
    this.cache.set("envConfig", envConfig);

    // Preserve uiConfig loading
    const uiConfig = shellConfig.uiConfig;
    this.cache.set("uiConfig", uiConfig);

    // -------------------------------------------------------------------
    // 2. UI SYSTEMS & THEMES
    // -------------------------------------------------------------------
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

    const fullDescriptors = uiSystemsData.map((sys: any) => ({
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

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

    const themes = (uiThemesData.themes || []).map((t: any) => ({
      id: t.id,
      name: t.name,
    }));

    const variants = (uiThemesData.variants || []).map((v: any) => ({
      id: v.id,
      name: v.name,
    }));

    const descriptors = uiThemesData.descriptors || [];

    // Cache everything
    this.cache.set("uiSystems", simpleSystems);
    this.cache.set("uiSystemDescriptors", fullDescriptors);
    this.cache.set("themes", themes);
    this.cache.set("formVariants", variants);
    this.cache.set("themeDescriptors", descriptors);
    this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

    console.log("[SysCacheService] Load complete.");
  }

  // -------------------------------------------------------------
  // BASIC GETTERS
  // -------------------------------------------------------------
  public get(key: string): any {
    return this.cache.get(key);
  }

  public getUiSystems(): any[] {
    return this.cache.get("uiSystems") || [];
  }

  public getUiSystemDescriptors(): any[] {
    return this.cache.get("uiSystemDescriptors") || [];
  }

  public getThemes(): any[] {
    return this.cache.get("themes") || [];
  }

  public getFormVariants(): any[] {
    return this.cache.get("formVariants") || [];
  }

  public getThemeDescriptors(): any[] {
    return this.cache.get("themeDescriptors") || [];
  }

  public getConfig(): any {
    return this.cache.get("uiConfigNormalized") || {};
  }

  // -------------------------------------------------------------
  // NEW: ENV CONFIG HELPERS
  // -------------------------------------------------------------
  public getEnvConfig(): any {
    return this.cache.get("envConfig") || {};
  }

  /** POC: direct access to consumerGuid (tenant identifier) */
  public getConsumerGuid(): string | undefined {
    const env = this.getEnvConfig();
    return env?.consumerGuid || env?.clientContext?.consumerToken || undefined;
  }

  /** POC: convenience wrapper for apiEndpoint */
  public getApiEndpoint(): string | undefined {
    return this.getEnvConfig()?.apiEndpoint;
  }

  public async ensureReady(): Promise<void> {
    if (this.cache.size === 0) await this.loadAndCacheAll();
  }
}

```

/////////////////////////////////////////////
In the sys-cache.service.ts, I am able to comment either the previous or latest codes to test either.
When the latest codes are running, we have the following error. I have also shared the logs.
The stylesheet http://localhost:5173/assets/ui-systems/material-design/material-design.min.css was not loaded because its MIME type, “text/html”, is not “text/css”.
But the failure is graceful, the page is rendered well, one can just notice that it is not material-design as expected. But we still need to address the issue.
Assist me to identify where the issue could be.
Note that:
I was able to settle issue after doing away with CacheKey.
I was also thinking its design is not scalable.
The strings used to define may change in definition and variety.
Instead I just used string.
Lets assume that is what it is now. All definitions are now compatible with legacy consumers


Loaded with new SysCacheService codes
```log
[SysCacheService] Eager load starting index-C6BpMTLj.js:48:3948
[UiSystemLoaderService] Registered UI Systems: 
Array(3) [ "bootstrap-502", "bootstrap-538", "material-design" ]
index-C6BpMTLj.js:52:13339
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-502/descriptor.json index-C6BpMTLj.js:52:13471
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-C6BpMTLj.js:52:13471
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-C6BpMTLj.js:52:13471
[UiThemeLoaderService][fetchAvailableThemes] start 
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-C6BpMTLj.js:52:10648
[SysCacheService] Load complete index-C6BpMTLj.js:48:4552
[CSS-DIAG] Cache loaded 
Object {  }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] start 
Object { systemId: "material-design", themeId: "dark" }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "material-design" }
index-C6BpMTLj.js:31:3158
[UiSystemLoaderService.activate] descriptorFromCache: undefined index-C6BpMTLj.js:52:14576
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/material-design/material-design.min.css", jsPath: "/assets/ui-systems/material-design/material-design.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/material-design.min.css", id: "material-design" }
index-C6BpMTLj.js:31:3158
The stylesheet http://localhost:5173/assets/ui-systems/material-design/material-design.min.css was not loaded because its MIME type, “text/html”, is not “text/css”. localhost:5173
[CSS-DIAG] [UiSystemLoaderService.loadCSS] ERROR 
Object { path: "/assets/ui-systems/material-design/material-design.min.css", id: "material-design", ev: error }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOAD FAILED 
Object { cssPath: "/assets/ui-systems/material-design/material-design.min.css", err: Error }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-C6BpMTLj.js:31:3158
Loading failed for the <script> with source “http://localhost:5173/assets/ui-systems/material-design/material-design.min.js”. localhost:5173:1:1
[UiSystemLoaderService.activate] script load failed 
error { target: script, isTrusted: true, srcElement: script
, eventPhase: 0, bubbles: false, cancelable: false, returnValue: true, defaultPrevented: false, composed: false, timeStamp: 936.1, … }
index-C6BpMTLj.js:52:16119
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOAD FAILED 
Object { jsPath: "/assets/ui-systems/material-design/material-design.min.js", err: error }
index-C6BpMTLj.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() START 
Object { id: "material-design" }
```
// loaded with previous SysCacheService
```log
[SHELL] [DEBUG] [Main] Shell config resolved 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-BWJpqntj.js:48:1803
[SysCacheService] 01: Starting Eager Load index-BWJpqntj.js:48:3321
[UiSystemLoaderService] Registered UI Systems: 
Array(3) [ "bootstrap-502", "bootstrap-538", "material-design" ]
index-BWJpqntj.js:52:13339
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-502/descriptor.json index-BWJpqntj.js:52:13471
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-BWJpqntj.js:52:13471
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-BWJpqntj.js:52:13471
[UiThemeLoaderService][fetchAvailableThemes] start 
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-BWJpqntj.js:52:10648
[SysCacheService] Load complete. index-BWJpqntj.js:48:4642
[CSS-DIAG] Cache loaded 
Object {  }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] start 
Object { systemId: "material-design", themeId: "dark" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "material-design" }
index-BWJpqntj.js:31:3158
[UiSystemLoaderService.activate] descriptorFromCache: 
Object { id: "material-design", name: "Material Components Web", version: "1.0.0", description: "Material Components Web (MDC) UI System for Corpdesk. Provides mdc classes and theme support.", cssUrl: "/assets/ui-systems/material-design/material-components-web.min.css", jsUrl: "/assets/ui-systems/material-design/material-components-web.min.js", assetPath: "/assets/ui-systems/material-design", stylesheets: (1) […], scripts: (1) […], themesAvailable: (2) […], … }
index-BWJpqntj.js:52:14576
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css", jsPath: "/assets/ui-systems/material-design/material-components-web.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design", resolved: "http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css", order: (2) […] }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED 
Object { jsPath: "/assets/ui-systems/material-design/material-components-web.min.js" }
index-BWJpqntj.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() START 
Object { id: "material-design" }
index-BWJpqntj.js:31:3158
[MaterialDesignAdapter] Loaded conceptMappings: 
Object { button: {…}, card: {…}, input: {…}, formGroup: {…} }
```

```ts
/////////////////////////////////////////
// PREVIOUS CODES
/////////////////////////////////////////
// import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
// import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
// import { ConfigService } from "./config.service";

// export class SysCacheService {
//   private static instance: SysCacheService;
//   private cache = new Map<string, any>();
//   private _uiSystemLoader!: UiSystemLoaderService;
//   private _uiThemeLoader!: UiThemeLoaderService;

//   constructor(private configService: ConfigService) {}

//   public static getInstance(configService?: ConfigService): SysCacheService {
//     if (!SysCacheService.instance) {
//       if (!configService) {
//         throw new Error(
//           "SysCacheService must be initialized with ConfigService on first instantiation."
//         );
//       }
//       SysCacheService.instance = new SysCacheService(configService);
//     }
//     return SysCacheService.instance;
//   }

//   public setLoaders(
//     systemLoader: UiSystemLoaderService,
//     themeLoader: UiThemeLoaderService
//   ): void {
//     this._uiSystemLoader = systemLoader;
//     this._uiThemeLoader = themeLoader;
//   }

//   /**
//    * Loads:
//    * - envConfig (NEW)
//    * - uiConfig
//    * - uiSystems
//    * - uiSystemDescriptors
//    * - themes
//    * - formVariants
//    * - themeDescriptors
//    */
//   public async loadAndCacheAll(): Promise<void> {
//     if (!this._uiSystemLoader || !this._uiThemeLoader) {
//       throw new Error("SysCacheService: loaders must be set before load.");
//     }
//     if (this.cache.size > 0) return; // already loaded

//     console.log("[SysCacheService] 01: Starting Eager Load");

//     // -------------------------------------------------------------------
//     // 1. LOAD SHELL CONFIG
//     // -------------------------------------------------------------------
//     const shellConfig = await this.configService.loadConfig();

//     // Extract the new envConfig block (replacing license/environment)
//     const envConfig = shellConfig.envConfig || {};

//     // Cache it
//     this.cache.set("envConfig", envConfig);

//     // Preserve uiConfig loading
//     const uiConfig = shellConfig.uiConfig;
//     this.cache.set("uiConfig", uiConfig);

//     // -------------------------------------------------------------------
//     // 2. UI SYSTEMS & THEMES
//     // -------------------------------------------------------------------
//     const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(uiConfig);

//     const fullDescriptors = uiSystemsData.map((sys: any) => ({
//       id: sys.id,
//       name: sys.name,
//       version: sys.version,
//       description: sys.description,

//       cssUrl: sys.cssUrl,
//       jsUrl: sys.jsUrl,
//       assetPath: sys.assetPath,
//       stylesheets: sys.stylesheets || [],
//       scripts: sys.scripts || [],

//       themesAvailable: sys.themesAvailable || [],
//       themeActive: sys.themeActive || null,

//       conceptMappings: sys.conceptMappings || {},
//       directiveMap: sys.directiveMap || {},

//       tokenMap: sys.tokenMap || {},
//       containers: sys.containers || [],
//       components: sys.components || [],
//       renderRules: sys.renderRules || {},

//       metadata: sys.metadata || {},
//       extensions: sys.extensions || {},
//       author: sys.author,
//       license: sys.license,
//       repository: sys.repository,

//       displayName: sys.displayName || sys.name,
//     }));

//     const simpleSystems = fullDescriptors.map((sys) => ({
//       id: sys.id,
//       name: sys.name,
//       displayName: sys.displayName,
//       themesAvailable: sys.themesAvailable,
//     }));

//     const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(uiConfig);

//     const themes = (uiThemesData.themes || []).map((t: any) => ({
//       id: t.id,
//       name: t.name,
//     }));

//     const variants = (uiThemesData.variants || []).map((v: any) => ({
//       id: v.id,
//       name: v.name,
//     }));

//     const descriptors = uiThemesData.descriptors || [];

//     // Cache everything
//     this.cache.set("uiSystems", simpleSystems);
//     this.cache.set("uiSystemDescriptors", fullDescriptors);
//     this.cache.set("themes", themes);
//     this.cache.set("formVariants", variants);
//     this.cache.set("themeDescriptors", descriptors);
//     this.cache.set("uiConfigNormalized", uiThemesData.uiConfig || uiConfig);

//     console.log("[SysCacheService] Load complete.");
//   }

//   // -------------------------------------------------------------
//   // BASIC GETTERS
//   // -------------------------------------------------------------
//   public get(key: string): any {
//     return this.cache.get(key);
//   }

//   public getUiSystems(): any[] {
//     return this.cache.get("uiSystems") || [];
//   }

//   public getUiSystemDescriptors(): any[] {
//     return this.cache.get("uiSystemDescriptors") || [];
//   }

//   public getThemes(): any[] {
//     return this.cache.get("themes") || [];
//   }

//   public getFormVariants(): any[] {
//     return this.cache.get("formVariants") || [];
//   }

//   public getThemeDescriptors(): any[] {
//     return this.cache.get("themeDescriptors") || [];
//   }

//   public getConfig(): any {
//     return this.cache.get("uiConfigNormalized") || {};
//   }

//   // -------------------------------------------------------------
//   // NEW: ENV CONFIG HELPERS
//   // -------------------------------------------------------------
//   public getEnvConfig(): any {
//     return this.cache.get("envConfig") || {};
//   }

//   /** POC: direct access to consumerGuid (tenant identifier) */
//   public getConsumerGuid(): string | undefined {
//     const env = this.getEnvConfig();
//     return env?.consumerGuid || env?.clientContext?.consumerToken || undefined;
//   }

//   /** POC: convenience wrapper for apiEndpoint */
//   public getApiEndpoint(): string | undefined {
//     return this.getEnvConfig()?.apiEndpoint;
//   }

//   public async ensureReady(): Promise<void> {
//     if (this.cache.size === 0) await this.loadAndCacheAll();
//   }
// }

/////////////////////////////////////////
// LATEST CODES
/////////////////////////////////////////

import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  // CacheKey,
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";

export class SysCacheService {
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map< string, Set<CacheListener<any>>>();

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
  public set<T>(
    key: string,
    value: T,
    source?: CacheMeta["source"]
  ): void;

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
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    const shellConfig = await this.configService.loadConfig();

    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", shellConfig.uiConfig || {}, "static");

    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

    this.set("uiSystems", uiSystemsData, "static");

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      shellConfig.uiConfig
    );

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set(
      "uiConfigNormalized",
      uiThemesData.uiConfig || shellConfig.uiConfig,
      "static"
    );

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
}
```

//////////////////////////////////////////////
I was able to settle issue after doing away with CacheKey.
I was also thinking its design is not scalable.
The strings used to define may change in definition and variety.
Instead I just used string.
Lets assume that is what it is now. All definitions are now compatible with legacy consumers
```ts
import { UiSystemLoaderService } from "../../cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "../../cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./config.service";
import {
  CacheListener,
  CacheMeta,
  SysCacheMap,
} from "../models/sys-cache.model";

export class SysCacheService {
  private static instance: SysCacheService;

  /** Core cache store */
  // private cache = new Map<CacheKey | string, CacheEntry>();
  private cache = new Map<string, any>();

  /** Reactive listeners */
  private listeners = new Map< string, Set<CacheListener<any>>>();

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
  public set<T>(
    key: string,
    value: T,
    source?: CacheMeta["source"]
  ): void;

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
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    const shellConfig = await this.configService.loadConfig();

    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", shellConfig.uiConfig || {}, "static");

    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

    this.set("uiSystems", uiSystemsData, "static");

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      shellConfig.uiConfig
    );

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set(
      "uiConfigNormalized",
      uiThemesData.uiConfig || shellConfig.uiConfig,
      "static"
    );

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
}
```

```ts
import "reflect-metadata"; // MUST BE FIRST IMPORT
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { diag_css } from "./CdShell/sys/utils/diagnosis";
import { IConsumerProfile } from "./CdShell/sys/moduleman/models/consumer.model";
import {
  IUserProfile,
  IUserShellConfig,
} from "./CdShell/sys/cd-user/models/user.model";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";

export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  private logger = new LoggerService();

  // private splashAnimDone = false;
  // private appReady = false;

  private svUser = new UserService();
  private consumerProfile?: IConsumerProfile;
  private userProfile?: IUserProfile;

  private resolvedShellConfig?: IUserShellConfig;

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svModule = new ModuleService();
    this.svMenu = new MenuService();
    this.svController = new ControllerService();
    this.svTheme = new ThemeService();

    // ✅ Load shell config and apply log level
    const shellConfig = await this.svConfig.loadConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    await this.svUiSystemLoader.showSplash(this.svConfig); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

    console.log("[Main.run()] baseShellConfig:", baseShellConfig);
    if (baseShellConfig.logLevel) {
      this.logger.setLevel(baseShellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 0.5: Anonymous login (ACL context)
    //---------------------------------------
    const resp = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );
    if (!resp) {
      this.logger.warn(
        "[Main] Anonymous login failed → continuing with static shell config"
      );
    } else {
      this.logger.debug("[Main] Anonymous login success");
      this.consumerProfile = resp.data.consumer.consumerProfile || null;
      this.userProfile = resp.data.userData.userProfile || null;
    }

    //---------------------------------------
    // STEP 0.6: Resolve ACL-based shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.resolveShellConfig(
      this.consumerProfile,
      this.userProfile
    );

    this.logger.debug("[Main] Shell config resolved", this.resolvedShellConfig);

    const shellConfig = this.resolvedShellConfig;

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.svUiSystemLoader.bootstrapUiSystemAndTheme(this.svSysCache);

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(this.svMenu, preparedMenu, shellConfig);

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(this.svMenu, preparedMenu, defaultModule);

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    this.svUiSystemLoader.setupMobileUx();

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.svUiSystemLoader.appReady = true;
    this.svUiSystemLoader.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

}

```

///////////////////////////////////////////////

Great. That worked. Now we are going to the meat: How we can pole pole migrate consumers from old to new subscribable cache system. I had shared the latest decomposed Main.run(). 
Take a look at it and give me a plan how step by step, we can test and confirm how the subscriber system is working. 
I suggest we focus first on how from step 0, we get the first config from the shell.config.json because the initial data must be found here before anon login. This include consumerGuid or consumerToken used to do the initial anon login.
At this stage there are some components that can access this initial config data but will later auto update to data from backend after anon login.
Also anon login is implicit but the user is eventually to login and get inclusive of personal configurations after succesfuly loging in.
The design will later includ a design where SysCacheService can use indexedDb or sqlite to persist its data for personalization via edge technology principles. But we approach there pole pole.
For now we focus on increamental design implemetations of Main.run process with the associated dependancies.

```ts
//---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();
```

```ts
import "reflect-metadata"; // MUST BE FIRST IMPORT
import { MenuService } from "./CdShell/sys/moduleman/services/menu.service";
import { LoggerService } from "./CdShell/utils/logger.service";
import { ThemeService } from "./CdShell/sys/theme/services/theme.service";
import { ModuleService } from "./CdShell/sys/moduleman/services/module.service";
import { ControllerService } from "./CdShell/sys/moduleman/services/controller.service";
import { SysCacheService } from "./CdShell/sys/moduleman/services/sys-cache.service";
import { UiSystemLoaderService } from "./CdShell/sys/cd-guig/services/ui-system-loader.service";
import { UiThemeLoaderService } from "./CdShell/sys/cd-guig/services/ui-theme-loader.service";
import { ConfigService } from "./CdShell/sys/moduleman/services/config.service";
import { diag_css } from "./CdShell/sys/utils/diagnosis";
import { IConsumerProfile } from "./CdShell/sys/moduleman/models/consumer.model";
import {
  IUserProfile,
  IUserShellConfig,
} from "./CdShell/sys/cd-user/models/user.model";
import { UserService } from "./CdShell/sys/cd-user/services/user.service";

export class Main {
  private svSysCache!: SysCacheService;
  private svUiSystemLoader!: UiSystemLoaderService;
  private svConfig: ConfigService;
  private svModule!: ModuleService;
  private svMenu!: MenuService;
  private svController!: ControllerService;
  private svUiThemeLoader!: UiThemeLoaderService;
  private svTheme!: ThemeService;
  private logger = new LoggerService();

  // private splashAnimDone = false;
  // private appReady = false;

  private svUser = new UserService();
  private consumerProfile?: IConsumerProfile;
  private userProfile?: IUserProfile;

  private resolvedShellConfig?: IUserShellConfig;

  constructor() {
    // intentionally empty — setup moved to init()
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
  }

  /**
   * Unified initializer: sets up services and shell config.
   * Backward-compatible: replaces initialize() + init().
   */
  async init() {
    this.logger.debug("[Main] init(): starting");

    // ✅ Ensure ModuleService is properly initialized
    if (typeof window === "undefined") {
      this.logger.debug(
        "[Main] Running in Node → awaiting ensureInitialized()"
      );
      await ModuleService.ensureInitialized();
    } else {
      this.logger.debug(
        "[Main] Running in browser → skipping ensureInitialized()"
      );
    }

    // ✅ Instantiate services
    this.svConfig = new ConfigService();
    this.svSysCache = new SysCacheService(this.svConfig);
    this.svModule = new ModuleService();
    this.svMenu = new MenuService();
    this.svController = new ControllerService();
    this.svTheme = new ThemeService();

    // ✅ Load shell config and apply log level
    const shellConfig = await this.svConfig.loadConfig();
    if (shellConfig.logLevel) {
      this.logger.setLevel(shellConfig.logLevel);
    }

    this.logger.debug("[Main] init(): completed");
  }

  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    await this.svUiSystemLoader.showSplash(this.svConfig); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

    console.log("[Main.run()] baseShellConfig:", baseShellConfig);
    if (baseShellConfig.logLevel) {
      this.logger.setLevel(baseShellConfig.logLevel);
    }

    //---------------------------------------
    // STEP 0.5: Anonymous login (ACL context)
    //---------------------------------------
    const resp = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );
    if (!resp) {
      this.logger.warn(
        "[Main] Anonymous login failed → continuing with static shell config"
      );
    } else {
      this.logger.debug("[Main] Anonymous login success");
      this.consumerProfile = resp.data.consumer.consumerProfile || null;
      this.userProfile = resp.data.userData.userProfile || null;
    }

    //---------------------------------------
    // STEP 0.6: Resolve ACL-based shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.resolveShellConfig(
      this.consumerProfile,
      this.userProfile
    );

    this.logger.debug("[Main] Shell config resolved", this.resolvedShellConfig);

    const shellConfig = this.resolvedShellConfig;

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.svUiSystemLoader.bootstrapUiSystemAndTheme(this.svSysCache);

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(this.svMenu, preparedMenu, shellConfig);

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(this.svMenu, preparedMenu, defaultModule);

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    this.svUiSystemLoader.setupMobileUx();

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.svUiSystemLoader.appReady = true;
    this.svUiSystemLoader.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }

}

```

///////////////////////////////////////

Assuming:
1. The first phase replaces:
//---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

    console.log("[Main.run()] baseShellConfig:", baseShellConfig);
    if (baseShellConfig.logLevel) {
      this.logger.setLevel(baseShellConfig.logLevel);
    }
2. We are already at a stage where Main.run() is considered 'decomposed'
I am suggesting:
1. The new interventions need to be packaged in helper methods and housed in respective classes.
For example, the following can be contained in a method in ConfigService class :
I am just suggesting some concept. You can work in that trajectory.
```ts
//---------------------------------------
// PHASE 1: Seed static shell config into cache
//---------------------------------------
this.svSysCache.set(
  "shellConfig",
  baseShellConfig,
  "static"
);

this.svSysCache.set(
  "envConfig",
  baseShellConfig.envConfig || {},
  "static"
);

this.svSysCache.set(
  "uiConfig",
  baseShellConfig.uiConfig || {},
  "static"
);


```

////////////////////////////////////////////////
We have an issue similare to what we dealt with a short while ago. 
The result is also the same. Graceful launch but what is rendered is not material but some fallback gracious view.
Where we are having:
[UiSystemLoaderService.activate] descriptorFromCache: undefined
Below is partial but more elaborate logs of problematic areas.

```ts
[UiSystemAdapterRegistry] register: bootstrap-502 
Object {  }
index-FyWUHGkE.js:48:6084
[Bootstrap538AdapterService] constructor() index-FyWUHGkE.js:48:7201
[UiSystemAdapterRegistry] register: bootstrap-538 
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-FyWUHGkE.js:48:6084
[MaterialDesignAdapter] constructor() index-FyWUHGkE.js:48:11478
[UiSystemAdapterRegistry] register: material-design 
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet [], mdcInitQueued: false, mdcInstances: Set [] }
index-FyWUHGkE.js:48:6084
[Bootstrap538AdapterService] constructor() index-FyWUHGkE.js:48:7201
[MaterialDesignAdapter] constructor() index-FyWUHGkE.js:48:11478
start 1 index-FyWUHGkE.js:57:14268
[SHELL] [DEBUG] [Main] init(): starting index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-FyWUHGkE.js:48:1803
[ModuleService][constructor]: starting index-FyWUHGkE.js:31:5044
[ModuleService] Running under Vite (browser). index-FyWUHGkE.js:31:5117
[ModuleService][constructor]: starting index-FyWUHGkE.js:31:5044
[ModuleService] Running under Vite (browser). index-FyWUHGkE.js:31:5117
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-FyWUHGkE.js:52:8421
[SHELL] [DEBUG] [Main] init(): completed index-FyWUHGkE.js:48:1803
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-FyWUHGkE.js:52:8421
[SHELL] [DEBUG] [Splash] loading 
Object { path: "/splashscreens/corpdesk-default.html", minDuration: 3400 }
index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] starting bootstrapShell() index-FyWUHGkE.js:48:1803
[CSS-DIAG] Main.run() started 
Object {  }
index-FyWUHGkE.js:31:3158
[PHASE 1][ConfigService] Loading static shell config index-FyWUHGkE.js:52:10349
[PHASE 1][ConfigService] Seeding static config into SysCache index-FyWUHGkE.js:52:10496
[PHASE 1][ConfigService] Static shell config seeded 
Object { hasEnv: true, hasUi: true }
index-FyWUHGkE.js:52:10708
[PHASE 1][Subscriber] shellConfig update 
Object { source: "static", version: 1 }
index-FyWUHGkE.js:57:12677
[SHELL] [DEBUG] [UserService.loginAnonUser] Performing anon login index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [UserService.loginAnonUser] consumerGuid B0B3DA99-1859-A499-90F6-1E3F69575DCD index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [UserService.login] attempting login 
Object { user: "anon", consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD" }
index-FyWUHGkE.js:48:1803
[HttpService] proc() → profile: cdApiLocal, endpoint: http://localhost:3001/api index-FyWUHGkE.js:57:8531
[HttpService] Initialized Axios instance [cdApiLocal] → http://localhost:3001/api index-FyWUHGkE.js:57:7301
[HttpService] Request Config: 
Object { method: "POST", url: "http://localhost:3001/api", data: {…} }
index-FyWUHGkE.js:57:7301
[SHELL] [DEBUG] [UserService.login] res: 
Object { res: {…} }
index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [UserService.loginAnonUser] anon login success index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [Main] Anonymous login success index-FyWUHGkE.js:48:1803
[SHELL] [DEBUG] [Main] Shell config resolved 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-FyWUHGkE.js:48:1803
[CSS-DIAG] Cache loaded 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] start 
Object { systemId: "material-design", themeId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "material-design" }
index-FyWUHGkE.js:31:3158
[UiSystemLoaderService.activate] descriptorFromCache: undefined index-FyWUHGkE.js:52:15095
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/material-design/material-design.min.css", jsPath: "/assets/ui-systems/material-design/material-design.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/material-design.min.css", id: "material-design" }
index-FyWUHGkE.js:31:3158
The stylesheet http://localhost:5173/assets/ui-systems/material-design/material-design.min.css was not loaded because its MIME type, “text/html”, is not “text/css”. localhost:5173
[CSS-DIAG] [UiSystemLoaderService.loadCSS] ERROR 
Object { path: "/assets/ui-systems/material-design/material-design.min.css", id: "material-design", ev: error }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOAD FAILED 
Object { cssPath: "/assets/ui-systems/material-design/material-design.min.css", err: Error }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-FyWUHGkE.js:31:3158
Loading failed for the <script> with source “http://localhost:5173/assets/ui-systems/material-design/material-design.min.js”. localhost:5173:1:1
[UiSystemLoaderService.activate] script load failed 
error { target: script, isTrusted: true, srcElement: script, eventPhase: 0, bubbles: false, cancelable: false, returnValue: true, defaultPrevented: false, composed: false, timeStamp: 1751.12, … }
index-FyWUHGkE.js:52:16638
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOAD FAILED 
Object { jsPath: "/assets/ui-systems/material-design/material-design.min.js", err: error }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() START 
Object { id: "material-design" }
index-FyWUHGkE.js:31:3158
[MaterialDesignAdapter] Loaded conceptMappings: 
Object {  }
index-FyWUHGkE.js:48:11686
[MaterialDesignAdapter] mapAll() — START index-FyWUHGkE.js:52:7168
[MaterialDesignAdapter] getMapping('button') = undefined index-FyWUHGkE.js:48:13028
[MaterialDesignAdapter] getMapping('input') = undefined index-FyWUHGkE.js:48:13028
[MaterialDesignAdapter] getMapping('formGroup') = undefined index-FyWUHGkE.js:48:13028
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: [] }
index-FyWUHGkE.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-FyWUHGkE.js:52:7438
[CSS-DIAG] [MaterialDesignAdapter] MutationObserver ATTACH 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() COMPLETE 
Object { active: "material-design" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER ACTIVATED 
Object { id: "material-design" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE 
Object { activeSystem: "material-design" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] ui-system activated 
Object { systemId: "material-design" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/themes/common/base.css", id: "shell-base" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/themes/common/base.css", id: "shell-base", resolved: "http://localhost:5173/themes/common/base.css", order: (4) […] }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/css/index.css", id: "shell-index" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/css/index.css", id: "shell-index", resolved: "http://localhost:5173/assets/css/index.css", order: (5) […] }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] shell CSS loaded 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start 
Object { themeId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] descriptor not found 
Object { themeId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] theme css injected 
Object { themeId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.applyTheme] start 
Object { systemId: "material-design", themeId: "dark" }
index-FyWUHGkE.js:31:3158
[UiSystemLoaderService.applyTheme] adapter received: 
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet [], mdcInitQueued: false, mdcInstances: Set [] }
index-FyWUHGkE.js:52:17434
[UiSystemLoaderService][applyTheme] descriptors: 
Array []
index-FyWUHGkE.js:52:17633
[UiSystemLoaderService][applyTheme] descriptors: undefined index-FyWUHGkE.js:52:17727
[CSS-DIAG] [MaterialDesignAdapter] applyTheme() 
Object { themeDescriptorOrId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] applied Material theme 
Object { mode: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.applyTheme] done 
Object { systemId: "material-design", themeId: "dark" }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] system applyTheme complete 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] done 
Object {  }
index-FyWUHGkE.js:31:3158
[CSS-DIAG] UI-System + Theme applied 
```

/////////////////////////////////////////
In your recomendation, we are to:
Apply it in loadAndCacheAll()
Replace this ❌:
```ts
this.set("uiSystems", uiSystemsData, "static");
```
With this ✅:
```ts
this.cacheUiSystems(uiSystemsData, "static");
```
But not from its current state that we had earlier replaced the same line with:
```ts
const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

const { simple, full } = this.normalizeUiSystemDescriptors(uiSystemsData);
```

So, below is the current state of loadAndCacheAll() and the earlier introduced normalizeUiSystemDescriptors().

Based on the above, how do we call the new method: this.cacheUiSystems(uiSystemsData, "static");

```ts
public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    const shellConfig = await this.configService.loadConfig();

    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", shellConfig.uiConfig || {}, "static");

    // const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
    //   shellConfig.uiConfig
    // );

    // this.set("uiSystems", uiSystemsData, "static");
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

    const { simple, full } = this.normalizeUiSystemDescriptors(uiSystemsData);

    // 🔁 Restore legacy expectations
    this.set("uiSystems", simple, "static");
    this.set("uiSystemDescriptors", full, "static");

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      shellConfig.uiConfig
    );

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set(
      "uiConfigNormalized",
      uiThemesData.uiConfig || shellConfig.uiConfig,
      "static"
    );

    console.log("[SysCacheService] Load complete");
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
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
```

//////////////////////////////////////////////////
The new recommendations have not worked.
So I have gotten it back to last working state: shown below.
That means the working version is legacy.
You can give recommendations with full Main.run() and SysCacheService.loadAndCacheAll().
If there is any change on any helper, you can give it in full.
Note below that the section "PHASE 1" in Main.run() is commented. Its associte recommendations in SysCacheService.loadAndCacheAll() as also implemented and remove when it did not work.
Once you have a recommendation, I will post for you the logs for scrutiny.
```ts
export class Main{
  async run() {
    //---------------------------------------
    // SPLASH: Show immediately
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    await this.svUiSystemLoader.showSplash(this.svConfig); // your animated SVG starts here

    this.logger.setLevel("debug");
    this.logger.debug("starting bootstrapShell()");
    diag_css("Main.run() started");

    //---------------------------------------
    // STEP 0: Load base shell config
    //---------------------------------------
    const baseShellConfig: IUserShellConfig =
      await this.svConfig.loadShellConfig();

    console.log("[Main.run()] baseShellConfig:", baseShellConfig);
    if (baseShellConfig.logLevel) {
      this.logger.setLevel(baseShellConfig.logLevel);
    }

    // //---------------------------------------
    // // PHASE 1: Seed static shell config: Replaces legacy STEP 0
    // //---------------------------------------
    // const baseShellConfig = await this.svConfig.seedStaticShellConfig(
    //   this.svSysCache
    // );

    // if (baseShellConfig.logLevel) {
    //   this.logger.setLevel(baseShellConfig.logLevel);
    // }

    // Optional Phase 1 Diagnostic Subscriber (Proof)
    this.svSysCache.subscribe("shellConfig", (value, meta) => {
      console.log(
        "%c[PHASE 1][Subscriber] shellConfig update",
        "color:#2196F3",
        { source: meta.source, version: meta.version }
      );
    });

    //---------------------------------------
    // STEP 0.5: Anonymous login (ACL context)
    //---------------------------------------
    const resp = await this.svUser.loginAnonUser(
      baseShellConfig.envConfig.clientContext.consumerToken
    );
    if (!resp) {
      this.logger.warn(
        "[Main] Anonymous login failed → continuing with static shell config"
      );
    } else {
      this.logger.debug("[Main] Anonymous login success");
      this.consumerProfile = resp.data.consumer.consumerProfile || null;
      this.userProfile = resp.data.userData.userProfile || null;
    }

    //---------------------------------------
    // STEP 0.6: Resolve ACL-based shell config
    //---------------------------------------
    this.resolvedShellConfig = await this.svConfig.resolveShellConfig(
      this.consumerProfile,
      this.userProfile
    );

    this.logger.debug("[Main] Shell config resolved", this.resolvedShellConfig);

    const shellConfig = this.resolvedShellConfig;

    //---------------------------------------
    // STEP 1: Core service instantiation
    //---------------------------------------
    this.svUiSystemLoader = UiSystemLoaderService.getInstance(this.svSysCache);
    this.svUiThemeLoader = UiThemeLoaderService.getInstance(this.svSysCache);
    this.svSysCache.setLoaders(this.svUiSystemLoader, this.svUiThemeLoader);

    //---------------------------------------
    // STEP 2: Load cached metadata
    //---------------------------------------
    await this.svSysCache.loadAndCacheAll();
    diag_css("Cache loaded");

    //---------------------------------------
    // STEP 3: Apply UI-System + Theme pipeline
    //---------------------------------------
    await this.svUiSystemLoader.bootstrapUiSystemAndTheme(this.svSysCache);

    //---------------------------------------
    // STEP 4: Theme config (logo + title)
    //---------------------------------------
    const themeConfig = await this.svTheme.loadThemeConfig();
    diag_css("ThemeConfig loaded", themeConfig);

    document.title =
      shellConfig.appName || shellConfig.fallbackTitle || "Corpdesk";

    const logoEl = document.getElementById("cd-logo") as HTMLImageElement;
    if (logoEl && themeConfig.logo) logoEl.src = themeConfig.logo;

    //---------------------------------------
    // STEP 5: Prepare menu
    //---------------------------------------
    const { preparedMenu, defaultModule } = await this.svMenu.structMenu();

    //---------------------------------------
    // STEP 6: Sidebar render
    //---------------------------------------
    await this.svUiSystemLoader.renderSidebar(
      this.svMenu,
      preparedMenu,
      shellConfig
    );

    //---------------------------------------
    // STEP 7: Auto-load default controller
    //---------------------------------------
    await this.svController.loadDefaultController(
      this.svMenu,
      preparedMenu,
      defaultModule
    );

    //---------------------------------------
    // STEP 8: Mobile UX config
    //---------------------------------------
    this.svUiSystemLoader.setupMobileUx();

    //---------------------------------------
    // APP READY
    //---------------------------------------
    this.logger.debug("[Main] app fully bootstrapped");
    this.svUiSystemLoader.appReady = true;
    this.svUiSystemLoader.tryHideSplash();

    this.logger.debug("bootstrapShell(): run() complete");
    diag_css("Main.run() complete");
  }
}
```

```ts
export class SysCacheService{
  // ------------------------------------------------------------------
  // EXISTING LOAD PIPELINE (UNCHANGED BEHAVIOR)
  // ------------------------------------------------------------------
  public async loadAndCacheAll(): Promise<void> {
    if (!this._uiSystemLoader || !this._uiThemeLoader) {
      throw new Error("SysCacheService: loaders must be set before load.");
    }

    if (this.cache.size > 0) return;

    console.log("[SysCacheService] Eager load starting");

    const shellConfig = await this.configService.loadConfig();

    this.set("shellConfig", shellConfig, "static");
    this.set("envConfig", shellConfig.envConfig || {}, "static");
    this.set("uiConfig", shellConfig.uiConfig || {}, "static");

    // const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
    //   shellConfig.uiConfig
    // );

    // this.set("uiSystems", uiSystemsData, "static");
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      shellConfig.uiConfig
    );

    const { simple, full } = this.normalizeUiSystemDescriptors(uiSystemsData);

    // 🔁 Restore legacy expectations
    this.set("uiSystems", simple, "static");
    this.set("uiSystemDescriptors", full, "static");

    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      shellConfig.uiConfig
    );

    this.set("themes", uiThemesData.themes || [], "static");
    this.set("formVariants", uiThemesData.variants || [], "static");
    this.set("themeDescriptors", uiThemesData.descriptors || [], "static");
    this.set(
      "uiConfigNormalized",
      uiThemesData.uiConfig || shellConfig.uiConfig,
      "static"
    );

    console.log("[SysCacheService] Load complete");
  }

  /**
   * Normalizes UI system descriptors to legacy-compatible shape
   * Required by UiSystemLoaderService.activate()
   */
  private normalizeUiSystemDescriptors(rawSystems: any[]): {
    simple: any[];
    full: any[];
  } {
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
}
```

////////////////////////////////////////////////////
There was no visible issue except at the end, there was a logged message: "Error: Promised response from onMessage listener went out of scope"
```log
[UiSystemAdapterRegistry] register: bootstrap-502 
Object {  }
index-C5uXBrf-.js:48:6389
[Bootstrap538AdapterService] constructor() index-C5uXBrf-.js:48:7506
[UiSystemAdapterRegistry] register: bootstrap-538 
Object { descriptor: null, observer: null, appliedSet: WeakSet [] }
index-C5uXBrf-.js:48:6389
[MaterialDesignAdapter] constructor() index-C5uXBrf-.js:48:11783
[UiSystemAdapterRegistry] register: material-design 
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet(3), mdcInitQueued: false, mdcInstances: Set(2) }
index-C5uXBrf-.js:48:6389
[Bootstrap538AdapterService] constructor() index-C5uXBrf-.js:48:7506
[MaterialDesignAdapter] constructor() index-C5uXBrf-.js:48:11783
start 1 index-C5uXBrf-.js:57:14289
[SHELL] [DEBUG] [Main] init(): starting index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [Main] Running in browser → skipping ensureInitialized() index-C5uXBrf-.js:48:1803
[ModuleService][constructor]: starting index-C5uXBrf-.js:31:5044
[ModuleService] Running under Vite (browser). index-C5uXBrf-.js:31:5117
[ModuleService][constructor]: starting index-C5uXBrf-.js:31:5044
[ModuleService] Running under Vite (browser). index-C5uXBrf-.js:31:5117
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-C5uXBrf-.js:52:8421
[SHELL] [DEBUG] [Main] init(): completed index-C5uXBrf-.js:48:1803
[ConfigService] loaded config: 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-C5uXBrf-.js:52:8421
[SHELL] [DEBUG] [Splash] loading 
Object { path: "/splashscreens/corpdesk-default.html", minDuration: 3400 }
index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] starting bootstrapShell() index-C5uXBrf-.js:48:1803
[CSS-DIAG] Main.run() started 
Object {  }
index-C5uXBrf-.js:31:3158
[SHELL] [DEBUG] [UserService.loginAnonUser] Performing anon login index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [UserService.loginAnonUser] consumerGuid B0B3DA99-1859-A499-90F6-1E3F69575DCD index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [UserService.login] attempting login 
Object { user: "anon", consumerGuid: "B0B3DA99-1859-A499-90F6-1E3F69575DCD" }
index-C5uXBrf-.js:48:1803
[HttpService] proc() → profile: cdApiLocal, endpoint: http://localhost:3001/api index-C5uXBrf-.js:57:8531
[HttpService] Initialized Axios instance [cdApiLocal] → http://localhost:3001/api index-C5uXBrf-.js:57:7301
[HttpService] Request Config: 
Object { method: "POST", url: "http://localhost:3001/api", data: {…} }
index-C5uXBrf-.js:57:7301
[SHELL] [DEBUG] [UserService.login] res: 
Object { res: {…} }
index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [UserService.loginAnonUser] anon login success index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [Main] Anonymous login success index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [Main] Shell config resolved 
Object { appName: "Corpdesk PWA", fallbackTitle: "Corpdesk PWA", appVersion: "1.0.0", appDescription: "Corpdesk PWA", themeConfig: {…}, defaultModulePath: "sys/cd-user", logLevel: "debug", uiConfig: {…}, splash: {…}, envConfig: {…} }
index-C5uXBrf-.js:48:1803
[SysCacheService] Eager load starting index-C5uXBrf-.js:48:3948
[PHASE 1][Cache Observe] shellConfig 
Object { source: "static", version: 1, timestamp: "2025-12-22T05:23:51.429Z" }
index-C5uXBrf-.js:57:12656
[UiSystemLoaderService] Registered UI Systems: 
Array(3) [ "bootstrap-502", "bootstrap-538", "material-design" ]
index-C5uXBrf-.js:52:13858
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-502/descriptor.json index-C5uXBrf-.js:52:13990
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/bootstrap-538/descriptor.json index-C5uXBrf-.js:52:13990
[UiSystemLoaderService] Loading descriptor: /assets/ui-systems/material-design/descriptor.json index-C5uXBrf-.js:52:13990
[UiThemeLoaderService][fetchAvailableThemes] start 
Object { defaultUiSystemId: "material-design", defaultThemeId: "dark", defaultFormVariant: "standard", uiSystemBasePath: "/assets/ui-systems/" }
index-C5uXBrf-.js:52:11167
[SysCacheService] Load complete index-C5uXBrf-.js:48:4650
[CSS-DIAG] Cache loaded 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] start 
Object { systemId: "material-design", themeId: "dark" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] START 
Object { id: "material-design" }
index-C5uXBrf-.js:31:3158
[UiSystemLoaderService.activate] descriptorFromCache: 
Object { id: "material-design", name: "Material Components Web", version: "1.0.0", description: "Material Components Web (MDC) UI System for Corpdesk. Provides mdc classes and theme support.", cssUrl: "/assets/ui-systems/material-design/material-components-web.min.css", jsUrl: "/assets/ui-systems/material-design/material-components-web.min.js", assetPath: "/assets/ui-systems/material-design", stylesheets: (1) […], scripts: (1) […], themesAvailable: (2) […], … }
index-C5uXBrf-.js:52:15095
[CSS-DIAG] [UiSystemLoaderService.activate] REMOVED OLD SYSTEM ASSETS 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] RESOLVED PATHS 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css", jsPath: "/assets/ui-systems/material-design/material-components-web.min.js", bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/material-components-web.min.css", id: "material-design", resolved: "http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css", order: (2) […] }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] CSS LOADED 
Object { cssPath: "/assets/ui-systems/material-design/material-components-web.min.css" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/ui-systems/material-design/bridge.css", id: "material-design-bridge", resolved: "http://localhost:5173/assets/ui-systems/material-design/bridge.css", order: (3) […] }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] BRIDGE CSS LOADED 
Object { bridgeCssPath: "/assets/ui-systems/material-design/bridge.css" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] SCRIPT LOADED 
Object { jsPath: "/assets/ui-systems/material-design/material-components-web.min.js" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() START 
Object { id: "material-design" }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] Loaded conceptMappings: 
Object { button: {…}, card: {…}, input: {…}, formGroup: {…} }
index-C5uXBrf-.js:48:11991
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[CSS-DIAG] [MaterialDesignAdapter] MutationObserver ATTACH 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] activate() COMPLETE 
Object { active: "material-design" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] ADAPTER ACTIVATED 
Object { id: "material-design" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.activate] COMPLETE 
Object { activeSystem: "material-design" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] ui-system activated 
Object { systemId: "material-design" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/themes/common/base.css", id: "shell-base" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/themes/common/base.css", id: "shell-base", resolved: "http://localhost:5173/themes/common/base.css", order: (4) […] }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] REQUEST 
Object { path: "/assets/css/index.css", id: "shell-index" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.loadCSS] LOADED 
Object { path: "/assets/css/index.css", id: "shell-index", resolved: "http://localhost:5173/assets/css/index.css", order: (5) […] }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] shell CSS loaded 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] start 
Object { themeId: "dark" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiThemeLoaderService.loadThemeById] loaded 
Object { themeId: "dark", cssPath: "/themes/dark/theme.css" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] theme css injected 
Object { themeId: "dark" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.applyTheme] start 
Object { systemId: "material-design", themeId: "dark" }
index-C5uXBrf-.js:31:3158
[UiSystemLoaderService.applyTheme] adapter received: 
Object { descriptor: {…}, observer: MutationObserver, appliedSet: WeakSet(3), mdcInitQueued: false, mdcInstances: Set(2) }
index-C5uXBrf-.js:52:17434
[UiSystemLoaderService][applyTheme] descriptors: 
Array [ {…}, {…} ]
index-C5uXBrf-.js:52:17633
[UiSystemLoaderService][applyTheme] descriptors: 
Object { name: "Dark Theme", id: "dark", logo: "/themes/default/logo.png", css: "/themes/dark/theme.css", mode: "dark", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-C5uXBrf-.js:52:17727
[CSS-DIAG] [MaterialDesignAdapter] applyTheme() 
Object { themeDescriptorOrId: {…} }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] applied Material theme 
Object { mode: "dark" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [UiSystemLoaderService.applyTheme] done 
Object { systemId: "material-design", themeId: "dark" }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] system applyTheme complete 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MAIN.applyStartupUiSettings] done 
Object {  }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] UI-System + Theme applied 
Object {  }
index-C5uXBrf-.js:31:3158
ThemeService::loadThemeConfig(default) index-C5uXBrf-.js:48:2268
[CSS-DIAG] ThemeConfig loaded 
Object { name: "Default Theme", id: "default", logo: "/themes/default/logo.png", css: "/themes/default/theme.css", mode: "light", font: "Arial, sans-serif", colors: {…}, layout: {…} }
index-C5uXBrf-.js:31:3158
[ModuleService][constructor]: starting index-C5uXBrf-.js:31:5044
[ModuleService] Running under Vite (browser). index-C5uXBrf-.js:31:5117
[Preload] Loading dev-sync index-C5uXBrf-.js:31:7387
ModuleService::loadModule()/01: index-C5uXBrf-.js:31:8025
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-C5uXBrf-.js:31:8189
[ModuleService] 1 index-C5uXBrf-.js:31:8249
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-C5uXBrf-.js:31:8526
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-C5uXBrf-.js:31:8685
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-C5uXBrf-.js:31:8744
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-C5uXBrf-.js:31:8896
[ModuleService] Loaded 'dev-sync' (Vite mode) at 22/12/2025, 08:23:51 index-C5uXBrf-.js:31:8984
[Preload] Controller component 'IdeAgentService' not found in module dev-sync. index-C5uXBrf-.js:31:7683
[Preload] Completed IdeAgentService index-C5uXBrf-.js:31:7782
[Preload] Loading dev-sync index-C5uXBrf-.js:31:7387
ModuleService::loadModule()/01: index-C5uXBrf-.js:31:8025
[ModuleService] expectedPathFragment: src/CdShell/sys/dev-sync/view/index.js index-C5uXBrf-.js:31:8189
[ModuleService] 1 index-C5uXBrf-.js:31:8249
[ModuleService][loadModule] pathKey: /src/CdShell/sys/dev-sync/view/index.js index-C5uXBrf-.js:31:8526
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", moduleId: "cd-push", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (1) […], menu: [] }
index-C5uXBrf-.js:31:8685
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-C5uXBrf-.js:31:8744
[ModuleService] Loaded module metadata passively: dev-sync. Setup skipped. index-C5uXBrf-.js:31:8896
[ModuleService] Loaded 'dev-sync' (Vite mode) at 22/12/2025, 08:23:51 index-C5uXBrf-.js:31:8984
[Preload] Controller component 'IdeAgentClientService' not found in module dev-sync. index-C5uXBrf-.js:31:7683
[Preload] Completed IdeAgentClientService index-C5uXBrf-.js:31:7782
ModuleService::loadModule()/01: index-C5uXBrf-.js:31:8025
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-user/view/index.js index-C5uXBrf-.js:31:8189
[ModuleService] 1 index-C5uXBrf-.js:31:8249
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-user/view/index.js index-C5uXBrf-.js:31:8526
[ModuleService][loadModule] moduleInfo: 
Object { ctx: "sys", isDefault: true, moduleId: "cd-user", moduleName: "Auto-Generated Module", moduleGuid: "auto-guid", controllers: (2) […], menu: (1) […] }
index-C5uXBrf-.js:31:8685
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…}, {…} ]
index-C5uXBrf-.js:31:8744
[ModuleService] Loaded 'cd-user' (Vite mode) at 22/12/2025, 08:23:51 index-C5uXBrf-.js:31:8984
ModuleService::loadModule()/01: index-C5uXBrf-.js:31:8025
[ModuleService] expectedPathFragment: src/CdShell/sys/cd-admin/view/index.js index-C5uXBrf-.js:31:8189
[ModuleService] 1 index-C5uXBrf-.js:31:8249
[ModuleService][loadModule] pathKey: /src/CdShell/sys/cd-admin/view/index.js index-C5uXBrf-.js:31:8526
[ModuleService][loadModule] moduleInfo: ...trancated...
index-C5uXBrf-.js:31:8685
[ModuleService][loadModule] moduleInfo.controllers: 
Array [ {…} ]
index-C5uXBrf-.js:31:8744
[ModuleService] Loaded module metadata passively: cd-admin. Setup skipped. index-C5uXBrf-.js:31:8896
[ModuleService] Loaded 'cd-admin' (Vite mode) at 22/12/2025, 08:23:51 index-C5uXBrf-.js:31:8984
[CSS-DIAG] Modules Loaded 
Object { allowedModules: (2) […] }
index-C5uXBrf-.js:31:3158
[ControllerService][findControllerInfoByRoute] controllerName: sign-in index-C5uXBrf-.js:31:9990
[ControllerService][findControllerInfoByRoute] mod: ...tracated... index-C5uXBrf-.js:31:10070
[ControllerService][findControllerInfoByRoute] controllerName: sign-up index-C5uXBrf-.js:31:9990
[ControllerService][findControllerInfoByRoute] mod: ...trancated... index-C5uXBrf-.js:31:10070
[ControllerService][findControllerInfoByRoute] controllerName: settings index-C5uXBrf-.js:31:9990
[ControllerService][findControllerInfoByRoute] mod: ...trancated.... index-C5uXBrf-.js:31:10070
[CSS-DIAG] Menu prepared 
Array [ {…}, {…} ]
index-C5uXBrf-.js:31:3158
Starting renderMenuWithSystem() index-C5uXBrf-.js:31:10702
renderMenuWithSystem()/01 index-C5uXBrf-.js:31:10751
MenuService::renderPlainMenu()/menu: 
        trancated...
      index-C5uXBrf-.js:31:11363
renderMenuWithSystem()/adapter: {"instance":null} index-C5uXBrf-.js:31:10973
renderMenuWithSystem()/03 index-C5uXBrf-.js:31:11161
renderMenuWithSystem()/04 index-C5uXBrf-.js:31:11248
[CSS-DIAG] Sidebar rendered 
Object {  }
index-C5uXBrf-.js:31:3158
[SIDEBAR-DIAG] Sidebar State: index-C5uXBrf-.js:31:3364
display: flex index-C5uXBrf-.js:31:3453
position: relative index-C5uXBrf-.js:31:3487
width: 260px index-C5uXBrf-.js:31:3523
flex-direction: column index-C5uXBrf-.js:31:3553
css file winning: 
<aside id="cd-sidebar">
index-C5uXBrf-.js:31:3600
MenuService::loadResource()/start... index-C5uXBrf-.js:31:13210
[MenuService][loadResource] options: 
Object { item: {…} }
index-C5uXBrf-.js:31:13262
[ControllerCacheService][getInstance] start... index-C5uXBrf-.js:22:6771
MenuService::loadResource()/02: Retrieving controller via cache service index-C5uXBrf-.js:31:13728
[ControllerCacheService][getOrInitializeController] start... index-C5uXBrf-.js:22:6919
[ControllerCacheService] Creating new instance for: sys/cd-user/sign-in index-C5uXBrf-.js:22:7103
CdFormGroup::_constructor()/01 cd-directive-binder.service-DGbLY5eG.js:1:46
CdDirectiveBinderService::constructor()/start cd-directive-binder.service-DGbLY5eG.js:1:1416
[Binder] UI-System set to: material-design (via window.CD_ACTIVE_UISYSTEM) cd-directive-binder.service-DGbLY5eG.js:1:1622
[ControllerCacheService] Cached instance for sys/cd-user/sign-in index-C5uXBrf-.js:22:7762
[MenuService] Waiting for controller services to initialize... attempt 1 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 2 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 3 index-C5uXBrf-.js:31:14051
[SHELL] [DEBUG] [Splash] animation completed index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [Splash] waiting 
Object { splashAnimDone: true, appReady: false }
index-C5uXBrf-.js:48:1803
[MenuService] Waiting for controller services to initialize... attempt 4 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 5 index-C5uXBrf-.js:31:14051
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[MenuService] Waiting for controller services to initialize... attempt 6 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 7 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 8 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 9 index-C5uXBrf-.js:31:14051
[MenuService] Waiting for controller services to initialize... attempt 10 index-C5uXBrf-.js:31:14051
MenuService::loadResource()/03: Injecting template into DOM index-C5uXBrf-.js:31:14194
MenuService::loadResource()/04: Executing __activate() index-C5uXBrf-.js:31:14449
[ctlSignIn][__activate] 01 index-BEx0eJtE.js:28:584
[CdDirectiveBinderService][bindToDom] start cd-directive-binder.service-DGbLY5eG.js:1:1735
[Binder] Fired event: cd:form:bound cd-directive-binder.service-DGbLY5eG.js:1:3255
MenuService::loadResource()/end index-C5uXBrf-.js:31:14694
[CSS-DIAG] Default controller loaded 
Object {  }
index-C5uXBrf-.js:31:3158
[SHELL] [DEBUG] [Main] app fully bootstrapped index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] [Splash] conditions met → hiding splash index-C5uXBrf-.js:48:1803
[SHELL] [DEBUG] bootstrapShell(): run() complete index-C5uXBrf-.js:48:1803
[CSS-DIAG] Main.run() complete 
Object {  }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] Applying mapping to element: 
Object { tag: "BUTTON", mapping: {…} }
index-C5uXBrf-.js:48:13550
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 2 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapInputs: FIELD #0 
Object { field: div.cd-form-field }
index-C5uXBrf-.js:52:5904
[MaterialDesignAdapter] MDCTextField constructed 
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded, inst: {…} }
index-C5uXBrf-.js:52:2187
[MaterialDesignAdapter] mapInputs: transformed wrapper  
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded }
index-C5uXBrf-.js:52:6362
[MaterialDesignAdapter] mapInputs: FIELD #1 
Object { field: div.cd-form-field }
index-C5uXBrf-.js:52:5904
[MaterialDesignAdapter] MDCTextField constructed 
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded, inst: {…} }
index-C5uXBrf-.js:52:2187
[MaterialDesignAdapter] mapInputs: transformed wrapper  
Object { wrapper: label.mdc-text-field.mdc-text-field--filled.cd-md-text-field.mdc-ripple-upgraded }
index-C5uXBrf-.js:52:6362
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
[SHELL] [DEBUG] [Splash] removed, app revealed index-C5uXBrf-.js:48:1803
[MaterialDesignAdapter] mapAll() — START index-C5uXBrf-.js:52:7168
[MaterialDesignAdapter] getMapping('button') = 
Object { class: "mdc-button mdc-button--raised" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapButtons() 
Object { count: 1 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('input') = 
Object { class: "mdc-text-field__input", attrs: {} }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapInputs() 
Object { candidates: 0 }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] getMapping('formGroup') = 
Object { class: "mdc-form-field" }
index-C5uXBrf-.js:48:13333
[CSS-DIAG] [MaterialDesignAdapter] mapFormGroups() 
Object { count: 0 }
index-C5uXBrf-.js:31:3158
[CSS-DIAG] [MaterialDesignAdapter] mapOtherConcepts() 
Object { concepts: (1) […] }
index-C5uXBrf-.js:31:3158
[MaterialDesignAdapter] mapAll() — END index-C5uXBrf-.js:52:7438
Error: Promised response from onMessage listener went out of scope 2 index.js:4716:38
Source map error: Error: JSON.parse: unexpected character at line 1 column 1 of the JSON data
Stack in the worker:parseSourceMapInput@resource://devtools/client/shared/vendor/source-map/lib/util.js:163:15
_factory@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:1069:22
SourceMapConsumer@resource://devtools/client/shared/vendor/source-map/lib/source-map-consumer.js:26:12
_fetch@resource://devtools/client/shared/source-map-loader/utils/fetchSourceMap.js:83:19

Resource URL: http://localhost:5173/assets/ui-systems/material-design/material-components-web.min.css
Source Map URL: material-components-web.min.css.map
```



//////////////////////////////////////////////////////////////////

## Completed:

- Module Loader:module/services/module.service.ts → How modules are discovered and loaded.
  - build via 'npm run build'
    - process compilation to dist-ts
    - vite compiles to dist
    - execute post-build.js
  - index.html calls app.ts
  - app.ts calls main.ts
  - main.ts calls module loader
  - run 'npm run preview

- porting compliant codes for PWA environment
  - create environment.ts
  - modify node/cli restricted codes using shims.
  - selected imports to be done conditionally based on environment
  - cyclic codes in PWA/browser resolved using BaseService.get \_svSess() with dynamic import.

- Developing compiled code with support to integrate:
  - Reactive corpdesk forms
    - CdFormGroup
    - CdFormControl
    - CdValidators
    - CdDirectiveBinder
    - Model

---

- test setting of default theme via shell.config.json
- STATIC_UI_SYSTEM_REGISTRY to merge with shell.config.json so that configs are not hard coded
- test changing of theme during runtime
- How to install/uninstall/upgrade ui-system, theme, form variants

Change the design for lifecycle of dev-controllers to runtime-controller
Goal:

- raising the bar for live interactions with dev browser
- borrow from cd-cli code in terms of saving dev-code as objects
- is it possible to make use of git state in a given file to manage auto updates
- how can we implement watcher that can update browser during development
- use of descriptors
- goal: when codes are being changed, the browser can be configured to respond simultenously - capacity to make changes vie (manaual, cd-cli or ai) - capacity to run visual tests of functions for a given module which displays browser or device.
  Implementation:
- proof of concept (convert dev-controller to runtime-controller)
- implementation plan
- integration of cd-cli

PWA Technologies and Documentation:

- Menu System:
  - menu/services/menuRenderer.ts → How the raw menu config is turned into HTML/DOM.

- Theme Loader:
  - theme/services/theme-loader.ts → How CSS and JSON configs are applied dynamically.

- Config Files:
  - config/shell.config.ts
  - config/themeConfig.ts → Default settings, structure, and developer extension points.
  - environment and cross-environment code reuse

- Logger:
  - Utility:utils/logger.ts → For developers to know how to debug and integrate logs in their modules.

- Directives
- Forms:
  - Emulate angular form groups
  - Use the initial codes for form processing to do POC
  - mould the codes to work as Angulare corpdesk login process.
- cd-push:
  - sharing cd-push codes
  - define cd-push, cd-sio, cd-wss

- tesing controller loading
  - optional websocket node is working
  - forms working similar to Angular reactive forms
  - compile controller to view

Classing the codes:

- convert the codes from function to classes (Done)
- Make sure the process can compile all the codes into dist-ts

- update of documentation for
  - module loading (doc0005)
  - directives (doc0007)

- development of corpdesk-rfc-0005 for lifecycle of controller using **activate(), **deactivate() and ControllerCacheService
- implementation of corpdesk-rfc-0005
- implementation of (change) directive for dropdown controls

- UUD development
  - isDefault should not be property of ICdModule. This is an admin or user setting concern and should be Isolated in that area
  - menu module item are replicating the root
  - menu to load via element content replacement instead of browser routing
  - ui settings dropdowns, linked to configs and not manually set
  - race conditions to be resolved via MenuService.loadResource()
    - modify MenuService.loadResource()
    - modify ModuleService.loadModule() so that there is only one central controller loading point (MenuService.loadResource())
      - this can be done at the main using prepared menu via default module.
    - investigate why data is not loading on dropdown
    - modify controllers to match the controller loading policy

  - Each theme to have set of thematic colours

Milestone (26 Nov 2025)

- POC with bootstrap
- Switch between dark and default mode.
- stabilize css for:
  - themes
  - menu
  - header
  - reponsiveness

Git update:

- mitigate FOUC (Flash Of Unformatted Content)
- add envConfig: EnvConfig to shell config
- set configurable splash screen feature
---
- mitigate FOUC (Flash Of Unformatted Content)
- add envConfig: EnvConfig to shell config
- confirm if splashscreen is running
- confirm the system can fetch and use config from backend
- implement new subscribable SysCacheService
  - test subscibers (phase 1)

--- 

Next Milestone:

- switch ui-system between bootstrap and material-design
- Switch between dark and default mode.

////////////////////////////////

---

### implementing UUD

- Some interfaces repeat what is already in UiDescriptorBase. Why dont we extend?
  - in the src/CdShell/sys/dev-descriptor/models/ui-concept-descriptor.model.ts, most of interfaces need to extend UiDescriptorBase
  - UiSystemAdaptorService.render()
    Error:
    Conversion of type 'UiDescriptorBase' to type 'UiLayoutDescriptor' may be a mistake because neither type sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
    Property 'layoutType' is missing in type 'UiDescriptorBase' but required in type 'UiLayoutDescriptor'.ts(2352)
    - ui-concept-descriptor.model.ts(37, 3): 'layoutType' is declared here.

- UiSystemAdaptor changed to UiSystemAdaptorService
- MaterialUiTranslator changed to UiTranslatorMaterial
- Exampe below is given but not implementation for uiTranslationRegistry is not yet given.
  uiTranslationRegistry.register({
  id: 'material-design',
  label: 'Angular Material Design',
  translator: new MaterialUiTranslator(),
  version: '1.0.0',
  });

RawUiComponentMeta not yet implemented-

///////////////////////////////////////

## ToDo:

- Assigining thematic colours to sections:
  - header background
  - header vector pattern
  - navigation background
  - body background
  - Themes to be designed in a way that they can be packaged and commercialized
  Design SysCacheService data sync mechanims
    - upgrade SysCacheService to 'subscibable' and 'syncable'

///////////////////////////////////////

## In Progress

////////////////////////////////////////////////////////////

Now that you have a good understanding how the api works, we are going to be figuring how to do the following from the following step by step. It is not a strict plan but general trajectory.

- avoid unwanted rendering of a page before css is loaded
- manually set ui-system/themes setting in consumer-profile
- manually set ui-system/themes setting in user-profile
- manually set ui-system/themes setting in indexedDb
- manually set ui-system/themes setting in sqlite
- load theme via login
- implement animated svg during launch/login
- sustain a session + ui-systm/theme settings via indexedDb
  So first:
  Currently when loading the page, we have the page render 'badly' for a brief moment before css is loaded.
  I notice this does not happen in most modern applications but a long time a ago this was a normal occurence.
  How can we only show the page after every page has rendered properly.

---

- mitigate FOUC (Flash Of Unformatted Content)

---

- add envConfig: EnvConfig to shell config

---

- confirm if splashscreen is running

---

- confirm the system can fetch and use config from backend

---

- enable/diable https

---

- design SysCacheService data sync mechanims
  - upgrade SysCacheService to 'subscibable' and 'syncable'
  - test subscibers (phase 1)
  - test subscibers (phase 2)

---

- track and confirm config is working as expected

---

- test switching of ui-system and theme when system is already running
  Config Sources
  - consumer profile
    - replicate user-profile crud for consumer-profile
  - user profile
  - shell.config.json

---

Notes for improvement of rfc:

Note from both login process and dev-sync example:

- The communication can work as inter and intra application
- The communication can work as inter component communication
- Application users can also setup communication between individuals and groups communications.
  Base on the above, intra communication expects the launching process to publish appId.
  This publication should be available to other recources that are candidates for cd-sio communication.
  For example in module federtion, the cd-shell/SidbarComponent represent the whole application to initiate and save the appId in LocalStorage.
  Thereafter all remote modules are able to acdess the appId.
  Note that each component however have their own resourceGuid and resourceName in the CdObjId.

The life cycle need to show that:

- The consumer imports and initialize svSio: SioClientService,
  - it is this import that manageds the detail of socket.io-client details including
    - connection()
    - event listening
    - actual sending of messages
- initialize() hosts setAppId() and initSioClient()
  At this stage, details for setAppId() and initSioClient() can be given
- Note how, the component just calls listening in very simple sytax
- but also notice there is one main listen(event) in the class that does all the donkey work based on corpdesk cd-sio implementation details. And this is on top of socket.io-client as an import in form of svSioClient.
  It is worth noting that in the future corpdesk listen() method will be shared and not coded in each consumer.

## DEMO TARGET

- two consumers/tenants users accessing front-end and seeing different ui-systems and themes
- end user chenging themes
- scrol menu to showcase different types of applications in the pwa
  - inteRact
  - cd-memo
  - eShirika
  - cd-hrm
  - cd-accts
  - [ai-assisted scientific-research]
    - self-recursive development
- demo Application consuming embeded technologies
  - blockchain
  - barcode/qr-code utility for applications
- demo Application ai capacity
  - learn user preferences
  - scientific research capacity via recursive self development
- develop module via cli then send to registry
- download and install module from registry
- Create a consumer and set ui-system/themes preferences
  - demonstrate change of ui-system
  - demo change of theme
  - demo change of variant forms and othe widgets
  - set logo
  - set theme colours
  - configure menu options
- demo integration with cli
- Demo recursive ai development
  - develop an application via chat thread
  - self development of a given application

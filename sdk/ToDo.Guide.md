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
export class Main{
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
  name: 'module',
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: 'module_id',
  })
  moduleId?: number;

  @Column({
    name: 'module_guid',
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column('varchar', {
    name: 'module_name',
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column('varchar', {
    name: 'module_description',
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: 'doc_id',
    nullable: true,
  })
  docId?: number;

  @Column({
    name: 'module_is_public',
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: 'is_sys_module',
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: 'module_enabled',
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column('datetime', {
    name: 'last_modification_date',
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: 'group_guid',
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: 'module_type_id',
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: 'order',
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'Create',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
          isSysModule: false,
        },
        cdObj: {
          cdObjName: '',
          cdObjTypeGuid: '809a6e31-9fb1-4874-b61a-38cf2708a3bb',
          parentModuleGuid: '04060dfa-fc94-4e3a-98bc-9fbd739deb87',
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'PurgeModule',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
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
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
import { MenuItem } from "./menu.model";
import { IControllerInfo } from "./controller.model";
import { ICdRequest } from "../../base";

@Entity({
  name: 'module',
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: 'module_id',
  })
  moduleId?: number;

  @Column({
    name: 'module_guid',
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column('varchar', {
    name: 'module_name',
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column('varchar', {
    name: 'module_description',
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: 'doc_id',
    nullable: true,
  })
  docId?: number;

  @Column({
    name: 'module_is_public',
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: 'is_sys_module',
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: 'module_enabled',
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column('datetime', {
    name: 'last_modification_date',
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: 'group_guid',
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: 'module_type_id',
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: 'order',
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'Create',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
          isSysModule: false,
        },
        cdObj: {
          cdObjName: '',
          cdObjTypeGuid: '809a6e31-9fb1-4874-b61a-38cf2708a3bb',
          parentModuleGuid: '04060dfa-fc94-4e3a-98bc-9fbd739deb87',
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'PurgeModule',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
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
  cdToken = '';

  constructor() {}


  setCdToken(token: string): this {
    EnvCreate.dat.token = token;
    EnvPurge.dat.token = token;
    this.b.logWithContext(this, `setCdToken:token`, token, 'debug');
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

  async registerModuleInCdInstance(moduleData: CdModuleDescriptor): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:start`,
        {
          module: moduleData.name,
        },
        'debug',
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
        'debug',
      );

      // 2️⃣ send request to cd-api
      const response = await this.http.proc(EnvCreate, 'cdApiLocal');

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:responseRaw`,
        inspect(response, { depth: 4 }),
        'debug',
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        this.b.logWithContext(this, `registerModuleInCdInstance:networkError`, { msg }, 'error');
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
          cdResp.app_state.info?.messages?.join('; ') ||
          'Unknown error during module registration';

        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:failed`,
          {
            module: moduleData.name,
            appMsg,
          },
          'error',
        );

        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' registration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg || `Module '${moduleData.name}' registered successfully.`;

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:success`,
        {
          module: moduleData.name,
          msg: successMsg,
        },
        'debug',
      );

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to register module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(this, `registerModuleInCdInstance:exception`, { error: e }, 'error');
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }

  async deRegisterModuleFromCdInstance(moduleData: CdModuleDescriptor): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:start`,
        { module: moduleData.name },
        'debug',
      );

      // await this.init();

      this.setCdToken(this.cdToken).setModuleName(moduleData.name).setRequestCtx(CdCtx.Sys).build();

      const response = await this.http.proc(EnvPurge, 'cdApiLocal');
      this.b.logWithContext(this, `deRegisterModuleFromCdInstance:responseRaw`, response, 'debug');

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
          cdResp.app_state.info?.messages?.join('; ') ||
          'Unknown error during module deregistration';

        // 🔎 Detect the idempotency case
        if (/not found/i.test(appMsg)) {
          const skipMsg = `Module '${moduleData.name}' already absent, skipping purge.`;
          this.b.logWithContext(
            this,
            `deRegisterModuleFromCdInstance:notFound`,
            { appMsg },
            'warn',
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
          'error',
        );
        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' deregistration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg || `Module '${moduleData.name}' deregistered successfully.`;

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
        'error',
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
import type { ICdRequest } from '../../base/i-base.js';
import { DEFAULT_ARGS, DEFAULT_DAT, SYS_CTX } from '../../base/i-base.js';
import { BaseService } from '../../base/base.service.js';
import { UserController } from '../controllers/user.controller.js';
// import { Entity, Column, PrimaryGeneratedColumn } from '../../utils/orm-shim.js';
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "../../../sys/utils/orm-shim";

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
  userName: '',
  password: '',
} as IUserModel;

export const DEFAULT_ENVELOPE_LOGIN: ICdRequest = {
  ctx: SYS_CTX,
  m: 'User',
  c: 'User',
  a: 'Login',
  dat: DEFAULT_DAT,
  args: DEFAULT_ARGS,
};

@Entity({
  name: 'user',
  synchronize: false,
})
export class UserModel {
  @PrimaryGeneratedColumn({
    name: 'user_id',
  })
  userId?: number;

  @Column({
    name: 'user_guid',
    length: 36,
  })
  userGuid?: string;

  @Column('varchar', {
    name: 'user_name',
    length: 50,
    nullable: true,
  })
  userName!: string;

  @Column('char', {
    name: 'password',
    length: 60,
    default: null,
  })
  password?: string;

  @Column('varchar', {
    length: 60,
    unique: true,
    nullable: true,
  })
  email?: string; // REMOVED DUPLICATE @Column() decorator

  @Column({
    name: 'company_id',
    default: null,
  })
  companyId?: number;

  @Column({
    name: 'doc_id',
    default: null,
  })
  docId?: number;

  @Column({
    name: 'mobile',
    default: null,
  })
  mobile?: string;

  @Column({
    name: 'gender',
    default: null,
  })
  gender?: number;

  @Column({
    name: 'birth_date',
    default: null,
  })
  birthDate?: Date;

  @Column({
    name: 'postal_addr',
    default: null,
  })
  postalAddr?: string;

  @Column({
    name: 'f_name',
    default: null,
  })
  fName?: string;

  @Column({
    name: 'm_name',
    default: null,
  })
  mName?: string;

  @Column({
    name: 'l_name',
    default: null,
  })
  lName?: string;

  @Column({
    name: 'national_id',
    default: null,
  })
  nationalId?: number;

  @Column({
    name: 'passport_id',
    default: null,
  })
  passportId?: number;

  @Column({
    name: 'user_enabled',
    default: null,
  })
  userEnabled?: boolean;

  @Column('char', {
    name: 'zip_code',
    length: 5,
    default: null,
  })
  zipCode?: string;

  @Column({
    name: 'activation_key',
    length: 36,
  })
  activationKey?: string;

  @Column({
    name: 'user_type_id',
    default: null,
  })
  userTypeId?: number;

  @Column({
    name: 'user_profile',
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
    path: ['fieldPermissions', 'userPermissions', ['userName']],
    value: {
      userId: 1000,
      field: 'userName',
      hidden: false,
      read: true,
      write: false,
      execute: false,
    },
  },
  {
    path: ['fieldPermissions', 'groupPermissions', ['userName']],
    value: {
      groupId: 0,
      field: 'userName',
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
        field: 'userName',
        hidden: false,
        read: true,
        write: false,
        execute: false,
      },
    ],
    groupPermissions: [
      {
        groupId: 0,
        field: 'userName',
        hidden: false,
        read: true,
        write: false,
        execute: false,
      },
    ],
  },
  userData: {
    userName: '',
    fName: '',
    lName: '',
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

const API_HOST = "https://asdap.africa"
const API_ROUTE = '/api'
const API_PORT = '3001'
const SIO_PORT = '3002'
const PUSH_HOST = API_HOST
const SIO_ROUTE = '/sio'

// https://asdap.africa:3001/api
export const environment: EnvConfig = {
  // logLevel: NgxLoggerLevel.DEBUG,
  appId: '',
  production: false,
  apiEndpoint: `${API_HOST}:${API_PORT}${API_ROUTE}`,
  sioEndpoint: `${PUSH_HOST}:${SIO_PORT}`,
  wsEndpoint: 'ws://asdap.africa:3000',
  wsMode: 'sio',
  pushConfig: {
    sio: {
      enabled: true,
    },
    wss: {
      enabled: false,
    },
    pusher: {
      enabled: true,
      apiKey: 'DtVRY9V5j41KwS******VcqwBH5wb96no',
      options: {
        cluster: 'ap2',
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
        authEndpoint: 'https://asdap.africa:3002/pusher/auth',
      }
    }
  },
  CD_PORT: 3001,
  consumerToken: 'B0B3DA99-18******F69575DCD',// current company consumer
  USER_RESOURCES: 'http://routed-93/user-resources',
  apiHost: 'https://asdap.africa',
  sioHost: 'https://asdap.africa',
  shellHost: 'https://asdap.africa',
  consumer: '',
  clientAppGuid: 'ca0fe39f-92b******4fc462a2',
  clientContext: {
    entity: "ASDAP", // context of client eg company, project or proramme eg ASDAP, MPEPZ...OR company name
    clientAppId: 2, // this client application identifies itself to the server with this id
    consumerToken: 'B0B3DA99-18******-1E3F69575DCD',// current company consumer
  },
  clientAppId: 2, // this client application identifies itself to the server with this id: to depricate in favour of clientContex
  SOCKET_IO_PORT: 3002, // push server port
  defaultauth: 'cd-auth', // fckService | cd-auth | firebase
  initialPage: 'dashboard', // the default page, on successful login
  mfManifestPath: '/assets/mf.manifest.json',
  apiOptions: {
    headers: { 'Content-Type': 'application/json' }
  },
  // this.socket = io(`${this.env.sioEndpoint}`,this.env.sioOptions);
  sioOptions: {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    secure: true
  },
  firebaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: '',
    measurementId: ''
  }
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
  "themeConfig":  {"currentThemePath": "/themes/default/theme.json","accessibleThemes":["default", "dark", "contrast"]},
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
    const uiSystemsData = await this._uiSystemLoader.fetchAvailableSystems(
      uiConfig
    );

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
    const uiThemesData = await this._uiThemeLoader.fetchAvailableThemes(
      uiConfig
    );

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
import { ICdRequest, ICdResponse, EnvelopFValItem } from '../../base/i-base';
import { HttpService } from '../../base/http.service';
import { UserModel } from '../models/user.model.js';
import { SysCacheService } from '../../moduleman/services/sys-cache.service';
import { LoggerService } from '../../../utils/logger.service';

export class UserService {
  private http: HttpService;
  private cache: SysCacheService;
  private logger = new LoggerService();

  private cd_token: string | undefined = '';
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
      ctx: 'Sys',
      m: 'User',
      c: 'User',
      a: 'Login',
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
      const response = await this.http.post<ICdResponse>('/api', request);
      if (response.app_state.success) {
        this.cd_token = response.app_state.sess?.cd_token;
      }
      return response;
    } catch (err: any) {
      this.logger.error('UserService.login error:', err);
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
      ctx: 'Sys',
      m: 'User',
      c: 'User',
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
      const response = await this.http.post<ICdResponse>('/api', request);
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
    return this.executeAction('Register', f_vals);
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
    return this.executeAction('ActivateUser', f_vals);
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
    return this.executeAction('GetUserProfile', f_vals);
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
      ctx: 'Sys',
      m: 'User',
      c: 'User',
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
import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn, Unique } from "../../../sys/utils/orm-shim";
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';
import { MenuItem } from "./menu.model";
import { IControllerInfo } from "./controller.model";
import { ICdRequest } from "../../base";

@Entity({
  name: 'module',
  synchronize: false,
})
export class ModuleModel {
  @PrimaryGeneratedColumn({
    name: 'module_id',
  })
  moduleId?: number;

  @Column({
    name: 'module_guid',
    length: 36,
    default: uuidv4(),
  })
  moduleGuid?: string;

  @Column('varchar', {
    name: 'module_name',
    length: 50,
    nullable: true,
  })
  moduleName?: string;

  @Column('varchar', {
    name: 'module_description',
    length: 50,
    nullable: true,
  })
  moduleDescription?: string;

  @Column({
    name: 'doc_id',
    nullable: true,
  })
  docId?: number;

  @Column({
    name: 'module_is_public',
    nullable: true,
  })
  moduleIsPublic?: boolean;

  @Column({
    name: 'is_sys_module',
    nullable: true,
  })
  isSysModule?: boolean;

  @Column({
    name: 'module_enabled',
    nullable: true,
  })
  moduleEnabled?: boolean;

  @Column('datetime', {
    name: 'last_modification_date',
    nullable: true,
  })
  lastModificationDate?: string;

  @Column({
    name: 'group_guid',
    length: 36,
    default: null,
  })
  groupGuid?: string;

  @Column({
    name: 'module_type_id',
    nullable: true,
  })
  moduleTypeId?: number;

  @Column({
    name: 'order',
    nullable: true,
  })
  order?: number;
}

export const EnvCreate: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'Create',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
          isSysModule: false,
        },
        cdObj: {
          cdObjName: '',
          cdObjTypeGuid: '809a6e31-9fb1-4874-b61a-38cf2708a3bb',
          parentModuleGuid: '04060dfa-fc94-4e3a-98bc-9fbd739deb87',
        },
      },
    ],
  },
  args: null,
};

export const EnvPurge: ICdRequest = {
  ctx: 'Sys',
  m: 'Moduleman',
  c: 'Module',
  a: 'PurgeModule',
  dat: {
    token: '',
    f_vals: [
      {
        data: {
          moduleName: '',
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
import { CdFxReturn, CdFxStateLevel, ICdRequest, ICdResponse } from '../../../sys/base/i-base.js';
import { CdCtx, CdModuleDescriptor } from '../../../sys/dev-descriptor/index.js';
import config from '../../../../config.js';
import CdLog from '../../cd-comm/controllers/cd-logger.controller.js';
import { BaseService } from '../../base/base.service.js';
import { HttpService } from '../../base/http.service.js';
import { EnvCreate, EnvPurge } from '../models/module.model.js';
import { inspect } from 'node:util';
import { SessonController } from '../../cd-user/controllers/session.controller.js';

export class ModuleRegisterService {
  b = new BaseService();
  http = new HttpService();
  cdToken = '';

  constructor() {}


  setCdToken(token: string): this {
    EnvCreate.dat.token = token;
    EnvPurge.dat.token = token;
    this.b.logWithContext(this, `setCdToken:token`, token, 'debug');
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

  async registerModuleInCdInstance(moduleData: CdModuleDescriptor): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:start`,
        {
          module: moduleData.name,
        },
        'debug',
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
        'debug',
      );

      // 2️⃣ send request to cd-api
      const response = await this.http.proc(EnvCreate, 'cdApiLocal');

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:responseRaw`,
        inspect(response, { depth: 4 }),
        'debug',
      );

      if (!response.state || !response.data) {
        const msg = `Failed to contact cd-api for module '${moduleData.name}'`;
        this.b.logWithContext(this, `registerModuleInCdInstance:networkError`, { msg }, 'error');
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
          cdResp.app_state.info?.messages?.join('; ') ||
          'Unknown error during module registration';

        this.b.logWithContext(
          this,
          `registerModuleInCdInstance:failed`,
          {
            module: moduleData.name,
            appMsg,
          },
          'error',
        );

        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' registration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg || `Module '${moduleData.name}' registered successfully.`;

      this.b.logWithContext(
        this,
        `registerModuleInCdInstance:success`,
        {
          module: moduleData.name,
          msg: successMsg,
        },
        'debug',
      );

      return {
        state: CdFxStateLevel.Success,
        data: null,
        message: successMsg,
      };
    } catch (e: any) {
      const msg = `Failed to register module '${moduleData.name}': ${e.message || e}`;
      this.b.logWithContext(this, `registerModuleInCdInstance:exception`, { error: e }, 'error');
      return {
        state: CdFxStateLevel.SystemError,
        data: null,
        message: msg,
      };
    }
  }

  async deRegisterModuleFromCdInstance(moduleData: CdModuleDescriptor): Promise<CdFxReturn<null>> {
    try {
      this.b.logWithContext(
        this,
        `deRegisterModuleFromCdInstance:start`,
        { module: moduleData.name },
        'debug',
      );

      // await this.init();

      this.setCdToken(this.cdToken).setModuleName(moduleData.name).setRequestCtx(CdCtx.Sys).build();

      const response = await this.http.proc(EnvPurge, 'cdApiLocal');
      this.b.logWithContext(this, `deRegisterModuleFromCdInstance:responseRaw`, response, 'debug');

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
          cdResp.app_state.info?.messages?.join('; ') ||
          'Unknown error during module deregistration';

        // 🔎 Detect the idempotency case
        if (/not found/i.test(appMsg)) {
          const skipMsg = `Module '${moduleData.name}' already absent, skipping purge.`;
          this.b.logWithContext(
            this,
            `deRegisterModuleFromCdInstance:notFound`,
            { appMsg },
            'warn',
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
          'error',
        );
        return {
          state: CdFxStateLevel.Error,
          data: null,
          message: `Module '${moduleData.name}' deregistration failed: ${appMsg}`,
        };
      }

      // 4️⃣ If successful
      const successMsg =
        cdResp.app_state.info?.app_msg || `Module '${moduleData.name}' deregistered successfully.`;

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
        'error',
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
  html, body {
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
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.8" result="blur1"/>
        <feColorMatrix in="blur1" type="matrix"
            values="1 0 0 0 0
                    0 1 0 0 0
                    0 0 1 0 0
                    0 0 0 1 0" result="glow"/>
        <feBlend in="SourceGraphic" in2="glow" mode="screen"/>
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
    <circle id="outerCircle" cx="25.57" cy="24.85" r="20.83" 
      transform="matrix(0.03, -1, 1, 0.03, -4.65, 45.76)"
      fill="#f04d23" opacity="0">

      <!-- Reveal animation -->
      <animate attributeName="opacity" from="0" to="1"
               begin="3s" dur="0.8s" fill="freeze"/>
    </circle>

    <!-- THE BLACK SEGMENT -->
    <path id="segment"
          d="M25.57,38.5a13.51,13.51,0,0,0,0-27Z"
          transform="translate(-4.74 -4.02)"
          fill="#231f20" opacity="0">
      <animate attributeName="opacity" from="0" to="1"
               begin="3s" dur="0.8s" fill="freeze"/>
    </path>

    <!-- OUTLINE -->
    <path id="outline"
          d="M34.54,12.72a15,15,0,1,1-18.06.08"
          transform="translate(-4.74 -4.02)"
          class="outline"
          fill="none" stroke="#fff" stroke-width="3.6"
          filter="url(#soft-glow)">

      <!-- Step 1: Draw outline -->
      <animate attributeName="stroke-dashoffset"
               from="200" to="0"
               dur="1.4s" begin="0.1s" fill="freeze" />

      <!-- Step 2: Glow pulse -->
      <animate attributeName="opacity"
               values="1;0.4;1"
               dur="1.2s"
               begin="1.5s"
               repeatCount="2"/>

      <!-- Step 3: Fade outline for final reveal -->
      <animate attributeName="opacity"
               from="1" to="0"
               begin="3s" dur="0.6s" fill="freeze" />

    </path>

    <!-- CLOCK HAND (line) -->
    <line id="hand"
          x1="21.15" y1="23" x2="21.15" y2="4.14"
          stroke="#fff" stroke-width="3.6"
          stroke-linecap="round"
          opacity="1">

      <!-- Step 1: Rotate around center -->
      <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 21.15 23"
          to="360 21.15 23"
          dur="2.6s"
          begin="0.6s"
          fill="freeze"/>

      <!-- Step 2: Fade out at reveal -->
      <animate attributeName="opacity"
               from="1" to="0"
               begin="3s" dur="0.5s" fill="freeze"/>
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

-----------------
- mitigate FOUC (Flash Of Unformatted Content)
-----------------
- add envConfig: EnvConfig to shell config
-----------------
- confirm if splashscreen is running
-----------------
- confirm the system can fetch and use config from backend
-----------------
- test switching of ui-system and theme when system is already running
  Config Sources
  - consumer profile
  - user profile
  - shell.config.json
---------
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

- scrol menu to show case different types of applications in the pwa
- develop module via cli then send to registry
- download and install module from registry
- demonstrate change of ui-system
- demo change of theme
- demo change of variant forms and othe widgets
- set logo
- set theme colours
- configure menu options
- demo integration with cli
- demo integration with ai

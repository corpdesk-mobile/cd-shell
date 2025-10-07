/* eslint-disable style/brace-style */
/* eslint-disable antfu/if-newline */
export function isCdFxReturnPipeline(obj) {
    return (obj &&
        typeof obj === 'object' &&
        'state' in obj &&
        'message' in obj &&
        'data' in obj &&
        obj.data &&
        typeof obj.data === 'object' &&
        Array.isArray(obj.data.stages));
}
// /////////////////////////////////////////////////////////////////////////////////////////
// ─── Environment Service ────────────────────────────────────
// export const methodRegistry = {
//   async installDependencies(
//     this: EnvironmentService,
//     input?: EnvironmentDescriptor
//   ): Promise<CdFxReturn<null>> {
//     if (input?.workstation) {
//       return this.installDependencies(input.workstation);
//     } else {
//       CdLog.warning("Skipping installDependencies: workstation is undefined.");
//       return { state: false, data: null };
//     }
//   },
//   async cloneRepositories(
//     this: EnvironmentService,
//     input?: EnvironmentDescriptor
//   ): Promise<CdFxReturn<null>> {
//     if (input) {
//       return this.cloneRepositories(input);
//     } else {
//       CdLog.warning("Skipping cloneRepositories: input is undefined.");
//       return { state: false, data: null };
//     }
//   },
//   async configureServices(
//     this: EnvironmentService,
//     input?: EnvironmentDescriptor
//   ): Promise<CdFxReturn<null>> {
//     if (input) {
//       return this.configureServices(input);
//     } else {
//       CdLog.warning("Skipping configureServices: input is undefined.");
//       return { state: false, data: null };
//     }
//   },
//   async startServices(
//     this: EnvironmentService,
//     input?: EnvironmentDescriptor
//   ): Promise<CdFxReturn<null>> {
//     if (input) {
//       return this.startServices(input);
//     } else {
//       CdLog.warning("Skipping startServices: input is undefined.");
//       return { state: false, data: null };
//     }
//   },
// };
// export const CdApiSetupTasks: CICdTask<EnvironmentDescriptor>[] = [
//   {
//     name: "installDependencies",
//     type: "script-inline",
//     executor: "bash",
//     status: "pending",
//     methodName: "installDependencies",
//   },
//   {
//     name: "cloneRepositories",
//     type: "script-inline",
//     executor: "bash",
//     status: "pending",
//     methodName: "cloneRepositories",
//   },
//   {
//     name: "configureServices",
//     type: "script-inline",
//     executor: "bash",
//     status: "pending",
//     methodName: "configureServices",
//   },
//   {
//     name: "startServices",
//     type: "script-inline",
//     executor: "bash",
//     status: "pending",
//     methodName: "startServices",
//   },
// ];
// Function to execute a task given its method name and input
// export async function executeTask(
//   task: CICdTask<EnvironmentDescriptor>,
//   input: EnvironmentDescriptor
// ) {
//   if (task.methodName && methodRegistry[task.methodName]) {
//     // Dynamically call the method from the registry
//     const result = await methodRegistry[task.methodName].call(
//       new EnvironmentService(),
//       input
//     );
//     return result;
//   } else {
//     throw new Error(`Method ${task.methodName} not found in the registry.`);
//   }
// }
// export const knownCiCds: CiCdDescriptor[] = [
//   {
//     cICdPipeline: {
//       name: "cd-api-ubuntu",
//       type: "dev-env-setup",
//       stages: [
//         {
//           name: "User Setup",
//           tasks: [
//             {
//               name: "Create devops user",
//               type: "script-inline",
//               executor: "bash",
//               script:
//                 'if ! id "devops" &>/dev/null; then sudo useradd -m -s /bin/bash devops; echo "devops:#cdVault[\'devopsPassword\']" | sudo chpasswd; fi',
//               status: "pending",
//               cdVault: [
//                 {
//                   name: "devopsPassword",
//                   description: "DevOps user password",
//                   isEncrypted: true,
//                   value: null, // The plain value is not stored for security
//                   encryptedValue: null, // Encrypted representation of the password
//                   encryptionMeta: {
//                     name: "default", // Identifier for the encryption configuration
//                     algorithm: "aes-256-cbc", // Encryption algorithm used
//                     encoding: "hex", // Encoding format used for storing the encrypted data
//                     ivLength: 16, // Length of the initialization vector (IV)
//                     iv: "a1b2c3d4e5f6g7h8", // The IV used during encryption
//                     keyDerivationMethod: "PBKDF2", // Optional: Method used to derive the key
//                     keySalt: "s0m3s4ltv4lu3", // Optional: Salt used for key derivation
//                     encryptedAt: "2025-03-03T12:00:00Z", // Timestamp of encryption
//                   },
//                 },
//               ],
//             },
//             {
//               name: "Set up home directory",
//               type: "script-inline",
//               executor: "bash",
//               script:
//                 "sudo cp -r /etc/skel/. /home/devops/ && sudo chown -R devops:devops /home/devops/",
//               status: "pending",
//             },
//             {
//               name: "Grant sudo access",
//               type: "script-file",
//               executor: "bash",
//               scriptFile: "/src/devops-scripts/cd-api/grant_sudo_access.sh",
//               status: "pending",
//             },
//           ],
//         },
//         {
//           name: "System Dependencies",
//           tasks: [
//             {
//               name: "Update system",
//               type: "script-inline",
//               executor: "bash",
//               script: "sudo apt update && sudo apt upgrade -y",
//               status: "pending",
//             },
//             {
//               name: "Install required packages",
//               type: "script-inline",
//               executor: "bash",
//               script: "sudo apt install -y net-tools nodejs npm redis-server",
//               status: "pending",
//             },
//           ],
//         },
//         {
//           name: "Node.js & TypeScript",
//           tasks: [
//             {
//               name: "Install TypeScript globally",
//               type: "method",
//               executor: "cd-cli",
//               className: "CdCliUtils",
//               methodName: "exec",
//               input: {
//                 cmds: ["npm install -g typescript"],
//                 options: { mode: "sync" },
//               },
//               status: "pending",
//             },
//           ],
//         },
//         {
//           name: "Clone & Setup cd-api",
//           tasks: [
//             {
//               name: "Clone cd-api repository",
//               type: "script-inline",
//               executor: "bash",
//               script:
//                 "git clone https://github.com/corpdesk/cd-api.git /home/devops/cd-api",
//               status: "pending",
//             },
//             {
//               name: "Install cd-api dependencies",
//               type: "script-inline",
//               executor: "bash",
//               script: "cd /home/devops/cd-api && npm install",
//               status: "pending",
//             },
//           ],
//         },
//         {
//           name: "Start Services",
//           tasks: [
//             {
//               name: "Start Redis Server",
//               type: "script-inline",
//               executor: "bash",
//               script: "sudo systemctl start redis-server",
//               status: "pending",
//             },
//             {
//               name: "Start cd-api",
//               type: "script-inline",
//               executor: "bash",
//               script: "cd /home/devops/cd-api && npm run dev",
//               status: "pending",
//             },
//           ],
//         },
//       ],
//     },
//     cICdTriggers: {
//       type: "push",
//       branchFilters: ["main"],
//       conditions: { includeTags: true },
//     },
//     cICdEnvironment: {
//       name: "production",
//       url: "https://corpdesk.com",
//       type: "production",
//       deploymentStrategy: "rolling",
//     },
//   },
//   {
//     cICdPipeline: {
//       name: "Corpdesk CI/CD - Bash Deployment",
//       type: "deployment",
//       stages: [
//         {
//           name: "Deployment",
//           description: "Deploy Corpdesk using Bash scripts",
//           tasks: [
//             {
//               name: "Stop existing services",
//               type: "script-inline",
//               executor: "bash",
//               status: "pending",
//             },
//             {
//               name: "Pull latest code",
//               type: "script-inline",
//               executor: "bash",
//               status: "pending",
//             },
//             {
//               name: "Start services",
//               type: "script-inline",
//               executor: "bash",
//               status: "pending",
//             },
//           ],
//         },
//       ],
//     },
//     cICdTriggers: {
//       type: "push",
//       branchFilters: ["main"],
//       conditions: { includeTags: true },
//     },
//     cICdEnvironment: {
//       name: "production",
//       url: "https://corpdesk.com",
//       type: "production",
//       deploymentStrategy: "rolling",
//     },
//   },
// ];
// export const defaultCiCd: CiCdDescriptor = {
//   cICdPipeline: {
//     name: "Default CI/CD Pipeline",
//     type: "integration",
//     stages: [
//       {
//         name: "Build",
//         description: "Default build stage",
//         tasks: [
//           {
//             name: "Default Build Task",
//             type: "script-inline",
//             executor: "bash",
//             status: "pending",
//           },
//         ],
//       },
//     ],
//   },
//   cICdTriggers: {
//     type: "manual",
//     conditions: { includeTags: false },
//   },
//   cICdEnvironment: {
//     name: "Default Environment",
//     url: "http://localhost",
//     type: "testing",
//     deploymentStrategy: "recreate",
//   },
// };
// /**
//  * The source should eventually be from databse (preferably redis)
//  * For experiments, the data will be set at the model files.
//  * @param names
//  * @param cIcDs
//  * @returns
//  */
// export function getCiCdByName(
//   names: string[],
//   cIcDs: CiCdDescriptor[]
// ): CiCdDescriptor {
//   for (const name of names) {
//     const found = cIcDs.find((ciCd) => ciCd.cICdPipeline?.name === name);
//     if (found) return found;
//   }
//   return defaultCiCd;
// }

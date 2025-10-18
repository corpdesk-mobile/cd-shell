
// Shim for TypeORM decorators to allow code to run in both Node.js and browser/PWA environments
// In browser/PWA, decorators are no-ops to avoid runtime errors
// In Node.js, attempt to load TypeORM dynamically

// import { getEnvironment } from "../../../environment";

// const env = getEnvironment();
// const isBrowser = env === "browser" || env === "pwa";

// // No-op decorators for browser environment
// const noop =
//   (..._args: any[]) =>
//   (target?: any, _key?: any) => {
//     // If used as a class decorator (Entity, ViewEntity), return the class itself.
//     // If used as a property decorator (Column, ViewColumn), return nothing.
//     return target;
//   };

// // --- Shimmed Types and Interfaces ---

// // 1. Shim for ObjectLiteral (TypeORM utility type)
// export type ObjectLiteral = { [key: string]: any };

// // 2. Shim for QueryDeepPartialEntity (TypeORM utility type)
// // This type alias allows using the type in a browser without TypeORM being loaded.
// // It is defined as a simple generic type for compilation safety.
// export type QueryDeepPartialEntity<T> = Partial<T>;

// // --- Decorator/Function Shim Logic ---

// let decorators: Record<string, any> = {};

// if (isBrowser) {
//   // Browser environment - immediately use no-op decorators
//   decorators = {
//     Entity: noop,
//     Column: noop,
//     PrimaryGeneratedColumn: noop,
//     PrimaryColumn: noop,
//     ManyToOne: noop,
//     OneToMany: noop,
//     JoinColumn: noop,
//     JoinTable: noop,
//     CreateDateColumn: noop,
//     UpdateDateColumn: noop,
//     VersionColumn: noop,
//     Index: noop,
//     Unique: noop,
//     // ✅ ADDED ViewEntity
//     ViewEntity: noop,
//     // ✅ ADDED ViewColumn
//     ViewColumn: noop,
//   };
// } else {
//   // Node.js environment - try to load TypeORM but with safe fallbacks
//   decorators = {
//     Entity: noop,
//     Column: noop,
//     PrimaryGeneratedColumn: noop,
//     PrimaryColumn: noop,
//     ManyToOne: noop,
//     OneToMany: noop,
//     JoinColumn: noop,
//     JoinTable: noop,
//     CreateDateColumn: noop,
//     UpdateDateColumn: noop,
//     VersionColumn: noop,
//     Index: noop,
//     Unique: noop,
//     // ✅ ADDED ViewEntity
//     ViewEntity: noop,
//     // ✅ ADDED ViewColumn
//     ViewColumn: noop,
//   };

//   // Async load for Node.js (non-blocking)
//   (async () => {
//     try {
//       // Use dynamic import to safely load TypeORM
//       const TypeORM = await import("typeorm");
//       if (TypeORM) {
//         decorators.Entity = TypeORM.Entity ?? noop;
//         decorators.Column = TypeORM.Column ?? noop;
//         decorators.PrimaryGeneratedColumn = TypeORM.PrimaryGeneratedColumn ?? noop;
//         decorators.PrimaryColumn = TypeORM.PrimaryColumn ?? noop;
//         decorators.ManyToOne = TypeORM.ManyToOne ?? noop;
//         decorators.OneToMany = TypeORM.OneToMany ?? noop;
//         decorators.JoinColumn = TypeORM.JoinColumn ?? noop;
//         decorators.JoinTable = TypeORM.JoinTable ?? noop;
//         decorators.CreateDateColumn = TypeORM.CreateDateColumn ?? noop;
//         decorators.UpdateDateColumn = TypeORM.UpdateDateColumn ?? noop;
//         decorators.VersionColumn = TypeORM.VersionColumn ?? noop;
//         decorators.Index = TypeORM.Index ?? noop;
//         decorators.Unique = TypeORM.Unique ?? noop;
//         // ✅ ADDED ViewEntity
//         decorators.ViewEntity = TypeORM.ViewEntity ?? noop;
//         // ✅ ADDED ViewColumn
//         decorators.ViewColumn = TypeORM.ViewColumn ?? noop;
//         console.log("[ORM SHIM] TypeORM loaded successfully");
//       }
//     } catch (error) {
//       console.warn(
//         "[ORM SHIM] TypeORM not available - using no-op decorators and shimmed types:",
//         error
//       );
//     }
//   })();
// }

// // Export decorators - always available immediately
// export const Entity = decorators.Entity;
// export const Column = decorators.Column;
// export const PrimaryGeneratedColumn = decorators.PrimaryGeneratedColumn;
// export const PrimaryColumn = decorators.PrimaryColumn;
// export const ManyToOne = decorators.ManyToOne;
// export const OneToMany = decorators.OneToMany;
// export const JoinColumn = decorators.JoinColumn;
// export const JoinTable = decorators.JoinTable;
// export const CreateDateColumn = decorators.CreateDateColumn;
// export const UpdateDateColumn = decorators.UpdateDateColumn;
// export const VersionColumn = decorators.VersionColumn;
// export const Index = decorators.Index;
// export const Unique = decorators.Unique;

// // ✅ EXPORTED NEW DECORATORS
// export const ViewEntity = decorators.ViewEntity;
// export const ViewColumn = decorators.ViewColumn;

// // Helper to check if we're using real TypeORM
// export const isTypeORMAvailable = () => !isBrowser;

// NOTE on ObjectLiteral and QueryDeepPartialEntity:
// We defined them at the top as type aliases/interfaces.
// Since they are only types and not runtime values/functions,
// they can be safely exported as-is for all environments.
// If TypeORM is available, the consumer will use the real TypeORM types.
// If TypeORM is unavailable, the consumer will use the shimmed local types.

////////////////////////////////////////////////

// Shim for TypeORM decorators to allow code to run in both Node.js and browser/PWA environments
// In browser/PWA, decorators are no-ops to avoid runtime errors
// In Node.js, attempt to load TypeORM dynamically

import { getEnvironment } from "../../../environment";

const env = getEnvironment();
const isBrowser = env === "browser" || env === "pwa";

// No-op decorators for browser environment
const noop =
  (..._args: any[]) =>
  (target?: any, _key?: any) => {
    // If used as a class decorator (Entity, ViewEntity), return the class itself.
    // If used as a property decorator (Column, ViewColumn), return nothing.
    return target;
  };

// --- Shimmed Types and Interfaces ---

// 1. Shim for ObjectLiteral (TypeORM utility type)
// ✅ ADDED ObjectLiteral (Already present)
export type ObjectLiteral = { [key: string]: any };

// 2. Shim for QueryDeepPartialEntity (TypeORM utility type)
export type QueryDeepPartialEntity<T> = Partial<T>;

// 3. Shim for DataSource (TypeORM class/type for connection management)
// We shim it as a minimal, empty class for consumers that use it as a type.
// Actual instantiation should be conditional in application code.
// ✅ ADDED DataSource
export class DataSource {}

// 4. Shim for DeleteResult (TypeORM class/type)
// We shim it as a minimal, empty class/interface for compilation safety.
// ✅ ADDED DeleteResult
export class DeleteResult {
  raw: any;
  affected?: number | null;
}

// 5. Shim for UpdateResult (TypeORM class/type)
// We shim it as a minimal, empty class/interface for compilation safety.
// ✅ ADDED UpdateResult
export class UpdateResult {
  raw: any;
  affected?: number | null;
  generatedMaps: ObjectLiteral[];
}

// 6. Shim for FindOptionsWhere (TypeORM utility type)
// This is a complex TypeORM type, so we use a safe recursive partial structure for shim.
// ✅ ADDED FindOptionsWhere
export type FindOptionsWhere<Entity> = {
  [P in keyof Entity]?: Entity[P] | FindOptionsWhere<Entity> | FindOptionsWhere<Entity>[];
} | ObjectLiteral;


// --- Decorator/Function Shim Logic ---

let decorators: Record<string, any> = {};

if (isBrowser) {
  // Browser environment - immediately use no-op decorators
  decorators = {
    Entity: noop,
    Column: noop,
    PrimaryGeneratedColumn: noop,
    PrimaryColumn: noop,
    ManyToOne: noop,
    OneToMany: noop,
    JoinColumn: noop,
    JoinTable: noop,
    CreateDateColumn: noop,
    UpdateDateColumn: noop,
    VersionColumn: noop,
    Index: noop,
    Unique: noop,
    ViewEntity: noop,
    ViewColumn: noop,
  };
} else {
  // Node.js environment - try to load TypeORM but with safe fallbacks
  decorators = {
    Entity: noop,
    Column: noop,
    PrimaryGeneratedColumn: noop,
    PrimaryColumn: noop,
    ManyToOne: noop,
    OneToMany: noop,
    JoinColumn: noop,
    JoinTable: noop,
    CreateDateColumn: noop,
    UpdateDateColumn: noop,
    VersionColumn: noop,
    Index: noop,
    Unique: noop,
    ViewEntity: noop,
    ViewColumn: noop,
  };

  // Async load for Node.js (non-blocking)
  (async () => {
    try {
      // Use dynamic import to safely load TypeORM
      const TypeORM = await import("typeorm");
      if (TypeORM) {
        decorators.Entity = TypeORM.Entity ?? noop;
        decorators.Column = TypeORM.Column ?? noop;
        decorators.PrimaryGeneratedColumn = TypeORM.PrimaryGeneratedColumn ?? noop;
        decorators.PrimaryColumn = TypeORM.PrimaryColumn ?? noop;
        decorators.ManyToOne = TypeORM.ManyToOne ?? noop;
        decorators.OneToMany = TypeORM.OneToMany ?? noop;
        decorators.JoinColumn = TypeORM.JoinColumn ?? noop;
        decorators.JoinTable = TypeORM.JoinTable ?? noop;
        decorators.CreateDateColumn = TypeORM.CreateDateColumn ?? noop;
        decorators.UpdateDateColumn = TypeORM.UpdateDateColumn ?? noop;
        decorators.VersionColumn = TypeORM.VersionColumn ?? noop;
        decorators.Index = TypeORM.Index ?? noop;
        decorators.Unique = TypeORM.Unique ?? noop;
        decorators.ViewEntity = TypeORM.ViewEntity ?? noop;
        decorators.ViewColumn = TypeORM.ViewColumn ?? noop;
        console.log("[ORM SHIM] TypeORM loaded successfully");
      }
    } catch (error) {
      console.warn(
        "[ORM SHIM] TypeORM not available - using no-op decorators and shimmed types:",
        error
      );
    }
  })();
}

// Export decorators - always available immediately
export const Entity = decorators.Entity;
export const Column = decorators.Column;
export const PrimaryGeneratedColumn = decorators.PrimaryGeneratedColumn;
export const PrimaryColumn = decorators.PrimaryColumn;
export const ManyToOne = decorators.ManyToOne;
export const OneToMany = decorators.OneToMany;
export const JoinColumn = decorators.JoinColumn;
export const JoinTable = decorators.JoinTable;
export const CreateDateColumn = decorators.CreateDateColumn;
export const UpdateDateColumn = decorators.UpdateDateColumn;
export const VersionColumn = decorators.VersionColumn;
export const Index = decorators.Index;
export const Unique = decorators.Unique;
export const ViewEntity = decorators.ViewEntity;
export const ViewColumn = decorators.ViewColumn;

// Helper to check if we're using real TypeORM
export const isTypeORMAvailable = () => !isBrowser;

// NOTE: DataSource, DeleteResult, UpdateResult, and FindOptionsWhere are
// exported directly as shimmed types/classes from the top section.

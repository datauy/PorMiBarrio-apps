export declare function loadGulp(): Promise<typeof import('gulp')>;
export declare function hasTask(name: string): Promise<boolean>;
export declare function runTask(name: string): Promise<void>;

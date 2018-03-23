// TODO: use `Return<T>` when at TS 2.8.
export default function buildErrorHandler(label: string, callback: (reason: any) => any): (reason: any) => any;

export function squelchErrorHandlerFor(label: string): void;
export function unsquelchAllErrorHandlers(): void;

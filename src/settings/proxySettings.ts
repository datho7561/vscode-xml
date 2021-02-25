import { workspace } from "vscode";

/**
 *
 * @returns The prefix to append to URLs
 */
export function getProxyPrefix(): string {
  const proxy : string = workspace.getConfiguration('http').get('proxy', undefined);
  const proxyAuthorization : string = workspace.getConfiguration('http').get('proxyAuthorization', undefined);
  if (!proxy || !proxyAuthorization) {
    return '';
  }

}
import * as http from 'http';
import { workspace } from "vscode";

export namespace ProxySettings {

  /**
   * Returns the address of the proxy
   *
   * @returns the address of the proxy
   */
  function getProxyAddress(): string {
    return workspace.getConfiguration('http').get('proxy', undefined);
  }

  /**
   * Returns the Proxy-Authorization to use to access the proxy
   *
   * @returns The Proxy-Authorization to use to access the proxy
   */
  function getProxyAuthorization(): string {
    return workspace.getConfiguration('http').get('proxyAuthorization', undefined);
  }

  /**
   * Returns the http get options for the configured proxy, or undefined if no proxy is set up
   *
   * @returns the http get options for the configured proxy, or undefined if no proxy is set up
   */
  export function getHttpGetOptionsForProxy(): http.RequestOptions {
    const proxyAddress: string = getProxyAddress();
    if (!proxyAddress) {
      return undefined;
    }
    const portSplitResult: string[] = proxyAddress.split(":");
    const proxyHost: string = portSplitResult[0];
    const proxyPort: string = portSplitResult[1];
    if (!proxyHost || !proxyPort) {
      return undefined;
    }
    let proxyAuth: string = getProxyAuthorization();
    proxyAuth = !proxyAuth ? undefined : proxyAuth;

    return {
      headers: {
        'Proxy-Authorization': proxyAuth
      },
      host: proxyHost,
      port: proxyPort
    }
  }

}

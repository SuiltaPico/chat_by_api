import { CreateChatCompletionRequest } from "openai";
import { OpenAIRequestConfig } from "../interface/ChatRecord";

export interface ConfigurationParameters {
  apiKey?:
    | string
    | Promise<string>
    | ((name: string) => string)
    | ((name: string) => Promise<string>);
  organization?: string;
  username?: string;
  password?: string;
  accessToken?:
    | string
    | Promise<string>
    | ((name?: string, scopes?: string[]) => string)
    | ((name?: string, scopes?: string[]) => Promise<string>);
  basePath: string;
  baseOptions: Record<string, any>;
  formDataCtor?: new () => any;
}

export class Configuration {
  /**
   * parameter for apiKey security
   * @param name security name
   * @memberof Configuration
   */
  apiKey?:
    | string
    | Promise<string>
    | ((name: string) => string)
    | ((name: string) => Promise<string>);
  /**
   * OpenAI organization id
   *
   * @type {string}
   * @memberof Configuration
   */
  organization?: string;
  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  username?: string;
  /**
   * parameter for basic security
   *
   * @type {string}
   * @memberof Configuration
   */
  password?: string;
  /**
   * parameter for oauth2 security
   * @param name security name
   * @param scopes oauth2 scope
   * @memberof Configuration
   */
  accessToken?:
    | string
    | Promise<string>
    | ((name?: string, scopes?: string[]) => string)
    | ((name?: string, scopes?: string[]) => Promise<string>);
  /**
   * override base path
   *
   * @type {string}
   * @memberof Configuration
   */
  basePath?: string;
  /**
   * base options for axios calls
   *
   * @type {any}
   * @memberof Configuration
   */
  baseOptions: Record<string, any>;
  /**
   * The FormData constructor that will be used to create multipart form data
   * requests. You can inject this here so that execution environments that
   * do not support the FormData class can still run the generated client.
   *
   * @type {new () => FormData}
   */
  formDataCtor?: new () => any;

  constructor(param: ConfigurationParameters) {
    this.apiKey = param.apiKey;
    this.organization = param.organization;
    this.username = param.username;
    this.password = param.password;
    this.accessToken = param.accessToken;
    this.basePath = param.basePath;
    this.baseOptions = param.baseOptions;
    this.formDataCtor = param.formDataCtor;

    if (!this.baseOptions) {
      this.baseOptions = {};
    }
    this.baseOptions.headers = {
      "User-Agent": `OpenAI/NodeJS/3.2.1`,
      Authorization: `Bearer ${this.apiKey}`,
      ...this.baseOptions.headers,
    };
    if (this.organization) {
      this.baseOptions.headers["OpenAI-Organization"] = this.organization;
    }
  }

  /**
   * Check if the given MIME is a JSON MIME.
   * JSON MIME examples:
   *   application/json
   *   application/json; charset=UTF8
   *   APPLICATION/JSON
   *   application/vnd.company+json
   * @param mime - MIME (Multipurpose Internet Mail Extensions)
   * @return True if the given MIME is JSON, false otherwise.
   */
  public isJsonMime(mime: string): boolean {
    const jsonMime: RegExp = new RegExp(
      "^(application/json|[^;/ \t]+/[^;/ \t]+[+]json)[ \t]*(;.*)?$",
      "i"
    );
    return (
      mime !== null &&
      (jsonMime.test(mime) ||
        mime.toLowerCase() === "application/json-patch+json")
    );
  }
}

class BaseAPI {
  configuration: Configuration;

  constructor(configuration: Configuration) {
    this.configuration = configuration;
  }
}

const openai_base = "https://api.openai.com/v1";

export class OpenAIApi extends BaseAPI {
  async createChatCompletion(options: {
    /** @default `/chat/completions` */
    path?: string;
    params?: Record<string, string | undefined>;
    request: CreateChatCompletionRequest;
  }) {
    const { path: _path, params, request } = options;
    const path = _path ?? "/chat/completions";

    const headers = {
      ...this.configuration.baseOptions.headers,
      "Content-Type": "application/json",
    };

    console.log((this.configuration.basePath ?? openai_base) + path);

    const final_url = new URL(
      (this.configuration.basePath ?? openai_base) + path
    );
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          final_url.searchParams.append(key, value);
        }
      }
    }

    return fetch(final_url, {
      method: "POST",
      headers,
      body: JSON.stringify({ ...request }),
    });
  }
}

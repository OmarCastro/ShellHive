export interface setUserName extends CsrfRequest {
    name: string,
    color?: string,
}

export interface UserConfigRequest extends CsrfRequest {
    name: string,
    color?: string,
}
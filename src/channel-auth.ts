import request from "./util/request";

import { EventSourceConnection } from "./EventSourceConnection";

export interface AuthRequest {
    after: (callback: Function) => any;
    response: Promise<void>;
}

export function authRequest(channel: string, connection: EventSourceConnection, authEndpoint = '/broadcasting/auth'): AuthRequest {
    let authorized = false;
    let afterAuthCallbacks: Function[] = [];

    function after(callback: Function) {
        if (authorized) {
            callback();

            return;
        }

        afterAuthCallbacks.push(callback);

        return this;
    }

    const response = request(connection).post(authEndpoint, { channel_name: channel }).then(() => {
        authorized = true;

        afterAuthCallbacks.forEach((callback) => callback());

        afterAuthCallbacks = [];
    });

    return {
        after,
        response,
    }
}

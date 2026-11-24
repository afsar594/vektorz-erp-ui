  export class EntityResponse<T>
    {
        // returnObject?: T;
        // result?: T;
        // isSuccess: boolean;
        // status?: boolean;
        // message?: string;
        result?: T;
        valid?: boolean;
        error?: boolean;
        message?: string;
        exception?: string;
    }

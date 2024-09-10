import axios, { AxiosError, AxiosHeaders, AxiosInstance } from 'axios';

export interface ApiConfig {
    baseUrl: string; //  https://localhost:7044/
    headers: AxiosHeaders; // header üzerinden değer göndermek için açtık
}

export interface IHttpClient {
    post<TRequest, TResponse>(
        endpoint: string, // api/tasks
        param: TRequest, // {description:'task-1'}
        headers?: any
    ): Promise<TResponse>; // status 200 {id:1,description:'task-1'}

    patch<TRequest, TResponse>(endpoint: string, param: TRequest, headers?: any): Promise<TResponse>;

    put<TRequest, TResponse>(endpoint: string, param: TRequest, headers?: any): Promise<TResponse>;

    delete<TResponse>(endpoint: string): Promise<TResponse>;

    get<TResponse>(endpoint: string, headers?: any): Promise<TResponse>;
}

export default class HttpClient implements IHttpClient {
    private axios!: AxiosInstance;

    protected createAxiosClient(apiConfig: ApiConfig): AxiosInstance {
        // httpClient Factory
        return axios.create({
            baseURL: apiConfig.baseUrl,
            responseType: 'json',
            headers: apiConfig.headers, // header değerinden isteklerde bir veri header üzerinden gönderilebilir [FromHeader]
            timeout: 5000, // 5 saniye sonuç alamazsak istek timeout düşsün
            timeoutErrorMessage: 'Request Timeout'
        });
    }

    constructor(apiConfig: ApiConfig) {
        this.axios = this.createAxiosClient(apiConfig);
        this.UseIntecptors();
    }

    private UseIntecptors(): void {
        this.axios.interceptors.request.use(
            (response) => {
                // request atarken header accessToken değerine göre güncelleyeceğiz.

                // token varsa otomatik olarak accessToken header'a tüm isteklerde gömdük.

                return response;
            },
            (err) => {
                // request esnasında bir hata alırsak buraya düşücez
                console.log('err', err);
            }
        );

        this.axios.interceptors.response.use(
            (response) => {
                return response;
            },
            (error: any) => {
                return Promise.reject(error);
            }
        );
    }

    async post<TRequest, TResponse>(endpoint: string, param: TRequest, headers?: any): Promise<TResponse> {
        try {
            return (
                await this.axios.post<TResponse>(endpoint, param, {
                    headers: headers
                })
            ).data;
        } catch (error) {
            console.log('error', error);
            return Promise.reject(error);
        }
    }

    async patch<TRequest, TResponse>(endpoint: string, param: TRequest, headers?: any): Promise<TResponse> {
        try {
            return (
                await this.axios.patch<TResponse>(endpoint, param, {
                    headers: headers
                })
            ).data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async put<TRequest, TResponse>(endpoint: string, param: TRequest, headers?: any): Promise<any> {
        try {
            return (
                await this.axios.put<TResponse>(endpoint, param, {
                    headers: headers
                })
            ).data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async delete<TResponse>(endpoint: string): Promise<TResponse> {
        try {
            return (await this.axios.delete(endpoint)).data;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async get<TResponse>(endpoint: string, headers?: any): Promise<TResponse> {
        try {
            return (await this.axios.get<TResponse>(endpoint, { headers: headers })).data;
        } catch (error: any) {
            return Promise.reject(error);
        }
    }
}

import HttpClient from './httpClient';
import { AxiosHeaders } from 'axios';

export class UserService {
	httpClient!: HttpClient;
	private endpoint: string = 'http://localhost:3000/user';

	constructor() {
		this.httpClient = new HttpClient({
			baseUrl: 'http://localhost:3000',
			headers: new AxiosHeaders().set('Content-Type', 'application/json'),
		});
	}

	getUserPrograms = async (persId: string): Promise<any> => {
		try {
			const response = await this.httpClient.get(
				`${this.endpoint}/${persId}`
			);
			return response;
		} catch (error) {
			console.error('Error fetching user programs:', error);
			throw error;
		}
	};
}

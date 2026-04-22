import api from './axios';

export interface IPFSResponse {
    cid: string;
    url: string;
    warning?: string;
}

export const uploadToIPFS = async (file: File): Promise<IPFSResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<IPFSResponse>('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return response.data;
};

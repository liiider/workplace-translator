/**
 * Dify Workflow API Service
 */

const DIFY_API_BASE = import.meta.env.PROD ? '/dify-api' : 'http://dify.acesohealthy.com/v1';
const DIFY_APP_KEY = 'app-F2rY2mmKq9CyiBTdJSctF3Qh';

/**
 * 获取或创建一个持续的匿名用户ID，确保上传文件和运行工作流的用户一致
 */
export const getUserId = () => {
    let id = localStorage.getItem('dify_user_id');
    if (!id) {
        id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('dify_user_id', id);
    }
    return id;
};

/**
 * Runs the Dify workflow with the provided inputs.
 * @param {Object} inputs - The input variables for the workflow.
 * @param {Array} files - The files for the workflow.
 * @param {string} userIdentifier - Unique identifier for the user (optional).
 * @returns {Promise<Object>} - The workflow result.
 */
export const runDifyWorkflow = async (inputs, files = [], userIdentifier = getUserId()) => {
    try {
        const response = await fetch(`${DIFY_API_BASE}/workflows/run`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_APP_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: inputs,
                files: files,
                response_mode: 'blocking', // Use blocking for simpler integration in this MVP
                user: userIdentifier,
            }),
        });

        console.log(`[Dify SDK] Workflow run with user: ${userIdentifier}`, { inputs, files });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Dify API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error in runDifyWorkflow:', error);
        throw error;
    }
};
/**
 * Uploads a file to Dify.
 * @param {File} file - The file to upload.
 * @param {string} userIdentifier - Unique identifier for the user.
 * @returns {Promise<Object>} - The upload result containing the file ID.
 */
export const uploadFile = async (file, userIdentifier = getUserId()) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('user', userIdentifier);

        console.log('Dify Uploading File:', { fileName: file.name, user: userIdentifier });

        const response = await fetch(`${DIFY_API_BASE}/files/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${DIFY_APP_KEY}`,
            },
            body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('[Dify SDK] Upload failed:', result);
            throw new Error(result.message || `Dify Upload error: ${response.status}`);
        }

        console.log('[Dify SDK] Upload success:', result);
        return result;
    } catch (error) {
        console.error('Error in uploadFile:', error);
        throw error;
    }
};

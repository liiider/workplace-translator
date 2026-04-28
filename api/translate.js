import { handleTranslateRequest } from '../server/glm-service.js';

export default async function handler(req, res) {
    await handleTranslateRequest(req, res);
}

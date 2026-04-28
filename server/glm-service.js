const DEFAULT_API_BASE = 'https://open.bigmodel.cn/api/paas/v4';
const DEFAULT_TEXT_MODEL = 'glm-5.1';
const DEFAULT_VISION_MODEL = 'glm-4.6v';
const MAX_TEXT_LENGTH = 6000;
const MAX_DATA_URL_LENGTH = 8 * 1024 * 1024;

const personaLabels = {
    boss: '暴躁老板',
    colleague: '甩锅同事',
    client: '刁钻甲方',
};

const clampFireLevel = (value) => {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) return 2;
    return Math.min(3, Math.max(1, parsed));
};

const sanitizeText = (value) => {
    if (typeof value !== 'string') return '';
    return value.trim().slice(0, MAX_TEXT_LENGTH);
};

const isValidDataUrl = (value) => {
    if (typeof value !== 'string') return false;
    if (value.length > MAX_DATA_URL_LENGTH) return false;
    return /^data:image\/(png|jpe?g|webp);base64,[a-z0-9+/=]+$/i.test(value);
};

const stripDataUrlPrefix = (value) => value.replace(/^data:image\/(png|jpe?g|webp);base64,/i, '');

const readJsonBody = async (req) => {
    if (req.body && typeof req.body === 'object') {
        return req.body;
    }

    if (typeof req.body === 'string') {
        return JSON.parse(req.body);
    }

    const chunks = [];
    for await (const chunk of req) {
        chunks.push(Buffer.from(chunk));
    }

    if (chunks.length === 0) {
        return {};
    }

    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
};

const buildPrompt = ({ inputText, persona, fireLevel, hasImage }) => {
    const personaLabel = personaLabels[persona] || personaLabels.boss;
    const fireDescriptions = {
        1: '低火力：语气克制、礼貌、保守，优先降低冲突。',
        2: '中火力：不卑不亢，明确边界，保留职业分寸。',
        3: '高火力：正面、坚定、有压迫感，但仍保持职场可发送。',
    };

    return [
        '你是一个中文职场沟通翻译助手，任务是帮助用户理解职场话术里的真实意图，并生成可直接发送的回复。',
        '',
        '请严格返回 JSON，不要返回 Markdown，不要包裹代码块。JSON 格式如下：',
        '{"subtext":"一句或一段潜台词分析","actions":["行动建议1","行动建议2","行动建议3"],"response":"一段建议回复"}',
        '',
        '要求：',
        '- subtext 要解释对方可能的真实诉求、风险和情绪。',
        '- actions 给 2 到 4 条具体行动建议。',
        '- response 必须是中文，可直接复制发送。',
        '- 不要编造不存在的上下文；不确定时明确说明。',
        '- 不要输出攻击、辱骂、威胁、歧视或违法建议。',
        '',
        `对方身份：${personaLabel}`,
        `回复强度：${fireDescriptions[fireLevel]}`,
        hasImage ? '用户提供了一张图片，请结合图片内容分析。' : '',
        inputText ? `用户输入：${inputText}` : '用户没有输入文字，请主要根据图片分析。',
    ].filter(Boolean).join('\n');
};

const parseModelJson = (content) => {
    if (typeof content !== 'string' || !content.trim()) {
        throw new Error('GLM returned an empty response.');
    }

    const trimmed = content.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();
    const match = trimmed.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(match ? match[0] : trimmed);

    return {
        subtext: sanitizeText(parsed.subtext),
        actions: Array.isArray(parsed.actions)
            ? parsed.actions.map((item) => sanitizeText(item)).filter(Boolean).slice(0, 4)
            : [],
        response: sanitizeText(parsed.response),
    };
};

const createGlmMessages = ({ inputText, persona, fireLevel, imageDataUrl }) => {
    const hasImage = Boolean(imageDataUrl);
    const prompt = buildPrompt({ inputText, persona, fireLevel, hasImage });

    if (!hasImage) {
        return [{ role: 'user', content: prompt }];
    }

    return [{
        role: 'user',
        content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: stripDataUrlPrefix(imageDataUrl) } },
        ],
    }];
};

const callGlm = async ({ messages, hasImage, env }) => {
    const apiKey = env.GLM_API_KEY;
    if (!apiKey) {
        const error = new Error('GLM_API_KEY is not configured.');
        error.statusCode = 500;
        throw error;
    }

    const apiBase = env.GLM_API_BASE || DEFAULT_API_BASE;
    const model = hasImage
        ? env.GLM_VISION_MODEL || DEFAULT_VISION_MODEL
        : env.GLM_TEXT_MODEL || DEFAULT_TEXT_MODEL;

    const requestBody = {
        model,
        messages,
        thinking: { type: 'disabled' },
        max_tokens: 1200,
        temperature: 0.4,
    };

    if (!hasImage) {
        requestBody.response_format = { type: 'json_object' };
    }

    const response = await fetch(`${apiBase.replace(/\/$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(payload.error?.message || payload.message || `GLM API error: ${response.status}`);
        error.statusCode = response.status;
        throw error;
    }

    const content = payload.choices?.[0]?.message?.content;
    return parseModelJson(content);
};

export const translateWithGlm = async (body, env = process.env) => {
    const inputText = sanitizeText(body.inputText);
    const persona = typeof body.persona === 'string' ? body.persona : 'boss';
    const fireLevel = clampFireLevel(body.fireLevel);
    const imageDataUrl = isValidDataUrl(body.imageDataUrl) ? body.imageDataUrl : '';

    if (!inputText && !imageDataUrl) {
        const error = new Error('Text or image input is required.');
        error.statusCode = 400;
        throw error;
    }

    const messages = createGlmMessages({ inputText, persona, fireLevel, imageDataUrl });
    return callGlm({ messages, hasImage: Boolean(imageDataUrl), env });
};

export const handleTranslateRequest = async (req, res, env = process.env) => {
    if (req.method !== 'POST') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Method not allowed.' }));
        return;
    }

    try {
        const body = await readJsonBody(req);
        const result = await translateWithGlm(body, env);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(result));
    } catch (error) {
        const statusCode = error.statusCode || 500;
        res.statusCode = statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
            error: statusCode >= 500 ? 'Translation service is unavailable.' : error.message,
        }));
    }
};

// src/services/playgroundApi.ts

const OPENAI_API_KEY = "#";
const BASE_URL = "https://api.openai.com/v1";

/**
 * Inyecta manualmente TTS/Whisper/DALL-E si no existen ya en la lista,
 * para evitar keys duplicadas en el <select>.
 */
function injectMockModels(data: any) {
    const list = data.data as Array<{ id: string; object: string }>;
    const checkAndPush = (id: string) => {
        if (!list.some(m => m.id === id)) {
            list.push({ id, object: "model" });
        }
    };
    checkAndPush("tts-1");
    checkAndPush("tts-1-hd");
    checkAndPush("image-dalle");
    checkAndPush("whisper-1");
    return data;
}

/**
 * Retorna la lista de modelos de OpenAI,
 * e inyecta manualmente algunos "mock" para TTS, DALL-E, etc. si no existen.
 */
export async function listModels() {
    try {
        const resp = await fetch(`${BASE_URL}/models`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
        });
        if (!resp.ok) {
            throw new Error(`Error al listar modelos: ${resp.status} ${resp.statusText}`);
        }
        const data = await resp.json();
        injectMockModels(data);
        return data; // data: { data: [...] }
    } catch (err) {
        console.error("Error en listModels:", err);
        throw err;
    }
}

/**
 * Interfaz de un mensaje para las chat completions, que incluye la posibilidad de role: "function".
 * name es opcional, sólo se usa si role === "function".
 */
export interface ChatMessage {
    role: 'function' | 'assistant' | 'system' | 'user';
    content: string;
    name?: string;
}

/** Interfaz de la respuesta al crear chat completions */
interface ChatCompletionResponse {
    id: string;
    object: string;
    created: number;
    model: string;
    choices: {
        index: number;
        finish_reason: string;
        message: {
            // Como la API actual no define “function” en la respuesta, pero en la preview de function calling
            // podría llegar a usarse, la incluimos para evitar más problemas de tipado:
            role: 'user' | 'assistant' | 'system' | 'function';
            content: string;
            name?: string;
        };
    }[];
    usage?: {
        prompt_tokens: number;
        completion_tokens: number;
        total_tokens: number;
    };
}

interface CreateChatCompletionOptions {
    model: string;
    // Aqui cambiamos la firma: messages: ChatMessage[]
    messages: ChatMessage[];
    temperature?: number;
    max_tokens?: number;       // Solo algunos modelos lo aceptan
    top_p?: number;
    frequency_penalty?: number;
    presence_penalty?: number;
}

/**
 * Ejemplo de helper para decidir qué nombre de param usar para la longitud máxima:
 * - Algunos modelos aceptan "max_tokens"
 * - Otros exigen "max_completion_tokens" (o no lo aceptan del todo).
 */
function getMaxTokensParam(model: string, maxTokens?: number) {
    if (maxTokens == null) {
        return {};
    }
    // Por ejemplo, si el modelo incluye "gpt-3.5" o "gpt-4", usar "max_tokens"
    // Caso contrario, usar "max_completion_tokens"
    if (model.includes("gpt-3.5") || model.includes("gpt-4")) {
        return { max_tokens: maxTokens };
    } else {
        // p.ej. "max_completion_tokens"
        return { max_completion_tokens: maxTokens };
    }
}

/**
 * Llama a POST /chat/completions y maneja errores de red / HTTP.
 * Maneja la distinción de 'max_tokens' vs 'max_completion_tokens' según el modelo.
 */
export async function createChatCompletion(opts: CreateChatCompletionOptions) {
    const url = `${BASE_URL}/chat/completions`;

    // Obtenemos la parte que define el límite de tokens con el nombre correcto:
    const maxTokensParam = getMaxTokensParam(opts.model, opts.max_tokens);

    // Armamos el body
    const body = {
        model: opts.model,
        messages: opts.messages,
        temperature: opts.temperature ?? 1.0,
        ...maxTokensParam, // max_tokens o max_completion_tokens, según el modelo
        top_p: opts.top_p ?? 1.0,
        frequency_penalty: opts.frequency_penalty ?? 0,
        presence_penalty: opts.presence_penalty ?? 0,
    };

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (netErr) {
        console.error("Network error en createChatCompletion:", netErr);
        throw new Error(`Error de red o CORS: ${String(netErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createChatCompletion: ${resp.status} ${resp.statusText}`);
    }
    const t1 = Date.now();

    const data = await resp.json() as ChatCompletionResponse;
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** TTS (Audio speech) => createSpeech */
interface CreateSpeechOptions {
    model: "tts-1" | "tts-1-hd";
    input: string;
    voice: string; // “en_us”, “es_mx”, etc.
    response_format?: string;
    speed?: number;
}

export async function createSpeech(opts: CreateSpeechOptions) {
    const url = `${BASE_URL}/audio/speech`;
    const body = {
        model: opts.model,
        input: opts.input,
        voice: opts.voice,
        response_format: opts.response_format ?? "url",
        speed: opts.speed ?? 1.0,
    };

    const t0 = Date.now();
    let resp: Response;

    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        console.error("Network error en createSpeech:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createSpeech: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const result = await resp.json();
    const timeMs = t1 - t0;

    return { data: result, timeMs };
}

/** createTranscription => whisper */
interface CreateTranscriptionOptions {
    file: File;
    model: string; // “whisper-1”
    prompt?: string;
    language?: string;
    response_format?: "json"|"text"|"srt"|"verbose_json"|"vtt";
    temperature?: number;
}

export async function createTranscription(opts: CreateTranscriptionOptions) {
    const url = `${BASE_URL}/audio/transcriptions`;
    const formData = new FormData();
    formData.append("file", opts.file);
    formData.append("model", opts.model);
    if (opts.prompt) formData.append("prompt", opts.prompt);
    if (opts.language) formData.append("language", opts.language);
    if (opts.response_format) formData.append("response_format", opts.response_format);
    if (typeof opts.temperature === "number") {
        formData.append("temperature", String(opts.temperature));
    }

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });
    } catch (networkErr) {
        console.error("Network error en createTranscription:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createTranscription: ${resp.status} ${resp.statusText}`);
    }
    const t1 = Date.now();

    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createTranslation => whisper “translation” */
interface CreateTranslationOptions {
    file: File;
    model: string; // “whisper-1”
    prompt?: string;
    response_format?: "json"|"text"|"srt"|"verbose_json"|"vtt";
    temperature?: number;
}

export async function createTranslation(opts: CreateTranslationOptions) {
    const url = `${BASE_URL}/audio/translations`;
    const formData = new FormData();
    formData.append("file", opts.file);
    formData.append("model", opts.model);
    if (opts.prompt) formData.append("prompt", opts.prompt);
    if (opts.response_format) formData.append("response_format", opts.response_format);
    if (typeof opts.temperature === "number") {
        formData.append("temperature", String(opts.temperature));
    }

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });
    } catch (networkErr) {
        console.error("Network error en createTranslation:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createTranslation: ${resp.status} ${resp.statusText}`);
    }
    const t1 = Date.now();

    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createImage => DALL-E generation */
interface CreateImageOptions {
    prompt: string;
    n?: number;
    size?: "256x256"|"512x512"|"1024x1024";
    response_format?: "url"|"b64_json";
}

export async function createImage(opts: CreateImageOptions) {
    const url = `${BASE_URL}/images/generations`;
    const body = {
        prompt: opts.prompt,
        n: opts.n ?? 1,
        size: opts.size ?? "512x512",
        response_format: opts.response_format ?? "url",
    };

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        console.error("Network error en createImage:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createImage: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createImageEdit => /images/edits */
interface CreateImageEditOptions {
    image: File;
    prompt: string;
    mask?: File;
    n?: number;
    size?: "256x256"|"512x512"|"1024x1024";
    response_format?: "url"|"b64_json";
}

export async function createImageEdit(opts: CreateImageEditOptions) {
    const url = `${BASE_URL}/images/edits`;
    const formData = new FormData();
    formData.append("image", opts.image);
    formData.append("prompt", opts.prompt);
    if (opts.mask) formData.append("mask", opts.mask);
    formData.append("n", String(opts.n ?? 1));
    formData.append("size", opts.size ?? "512x512");
    formData.append("response_format", opts.response_format ?? "url");

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });
    } catch (networkErr) {
        console.error("Network error en createImageEdit:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createImageEdit: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createImageVariation => /images/variations */
interface CreateImageVariationOptions {
    image: File;
    n?: number;
    size?: "256x256"|"512x512"|"1024x1024";
    response_format?: "url"|"b64_json";
}

export async function createImageVariation(opts: CreateImageVariationOptions) {
    const url = `${BASE_URL}/images/variations`;
    const formData = new FormData();
    formData.append("image", opts.image);
    formData.append("n", String(opts.n ?? 1));
    formData.append("size", opts.size ?? "512x512");
    formData.append("response_format", opts.response_format ?? "url");

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: formData,
        });
    } catch (networkErr) {
        console.error("Network error en createImageVariation:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createImageVariation: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createModeration => /moderations */
export async function createModeration(inputText: string) {
    const t0 = Date.now();
    const url = `${BASE_URL}/moderations`;
    const body = { input: inputText };
    let resp: Response;

    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        console.error("Network error en createModeration:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createModeration: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}

/** createEmbedding => /embeddings */
interface CreateEmbeddingOptions {
    model: string;
    input: string | string[];
    user?: string;
}

export async function createEmbedding(opts: CreateEmbeddingOptions) {
    const url = `${BASE_URL}/embeddings`;
    const body: any = {
        model: opts.model,
        input: opts.input,
    };
    if (opts.user) {
        body.user = opts.user;
    }

    const t0 = Date.now();
    let resp: Response;
    try {
        resp = await fetch(url, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });
    } catch (networkErr) {
        console.error("Network error en createEmbedding:", networkErr);
        throw new Error(`Error de red o CORS: ${String(networkErr)}`);
    }

    if (!resp.ok) {
        throw new Error(`Error en createEmbedding: ${resp.status} ${resp.statusText}`);
    }

    const t1 = Date.now();
    const data = await resp.json();
    const timeMs = t1 - t0;

    return { data, timeMs };
}
